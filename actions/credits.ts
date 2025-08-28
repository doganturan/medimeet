"use server";

import { db } from "@/lib/prisma";
import { AppUser } from "@/types/user";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

const PLAN_CREDITS = {
    free_user: 0,
    standart: 10,
    premium: 24
}

const APPOINTMENT_CREDIT_COST = 2;

export async function checkAndAllocateCredits(user: AppUser): Promise<AppUser | null> {
    try {

        if (user.role !== "PATIENT") {
            return user;
        }

        const { has } = await auth();

        const hasBasic = has({ plan: "free_user" });
        const hasStandard = has({ plan: "standart" });
        const hasPremium = has({ plan: "premium" });

        let currentPlan = null;
        let creditsToAllocate = 0;

        if (hasPremium) {
            currentPlan = "premium";
            creditsToAllocate = PLAN_CREDITS.premium;
        }
        else if (hasStandard) {
            currentPlan = "standart";
            creditsToAllocate = PLAN_CREDITS.standart;
        }
        else if (hasBasic) {
            currentPlan = "free_user";
            creditsToAllocate = PLAN_CREDITS.free_user;
        }

        if (!currentPlan) {
            return user;
        }

        const currentMonth = format(new Date(), "yyyy-MM");

        if (user.transactions.length > 0) {
            const latestTransaction = user.transactions[0];
            const transactionMonth = format(new Date(latestTransaction.createdAt), "yyyy-MM");
            const transactionPlan = latestTransaction.packageId;


            if (transactionMonth === currentMonth && transactionPlan === currentPlan) {
                return user; // Already allocated for this month
            }
        }
        const updatedUser = await db.$transaction(async (tx) => {
            await tx.creditTransaction.create({
                data: {
                    userId: user.id,
                    amount: creditsToAllocate,
                    type: "CREDIT_PURCHASE",
                    packageId: currentPlan,
                }
            });

            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: {
                    credits: {
                        increment: creditsToAllocate
                    }
                },
                include: {
                    transactions: true,
                    patientAppointments: true,
                    doctorAppointments: true,
                    availabilities: true
                }
            });

            return updatedUser;
        });

        revalidatePath("/doctors");
        // revalidatePath("/appointments");

        return updatedUser;
    } catch (error) {
        console.error("Error allocating credits:", error);
        return null; // Handle error gracefully
    }
}

export async function deductCreditsForAppointment(userId: string, doctorId: string) {
    try {
        const user = await db.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.role !== "PATIENT") {
            throw new Error("User not found or not a patient");
        }

        const doctor = await db.user.findUnique({
            where: {
                id: doctorId,
                role: "DOCTOR",
                verificationStatus: "VERIFIED"
            }
        });

        if (!doctor) {
            throw new Error("Doctor not found or not verified");
        }

        if (user.credits < APPOINTMENT_CREDIT_COST) {
            throw new Error("Insufficient credits to book an appointment");
        }

        const result = await db.$transaction(async (tx) => {
            await tx.creditTransaction.create({
                data: {
                    userId: user.id,
                    amount: -APPOINTMENT_CREDIT_COST,
                    type: "APPOINTMENT_DEDUCTION"
                }
            })

            await tx.creditTransaction.create({
                data: {
                    userId: doctor.id,
                    amount: APPOINTMENT_CREDIT_COST,
                    type: "APPOINTMENT_DEDUCTION"
                }
            })

            // Update patient's credit balance (decrement)
            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: {
                    credits: {
                        decrement: APPOINTMENT_CREDIT_COST
                    }
                }
            });


            // Update doctor's credit balance (increment)
            await tx.user.update({
                where: {
                    id: doctor.id
                },
                data: {
                    credits: {
                        increment: APPOINTMENT_CREDIT_COST
                    }
                }
            });

            return updatedUser;
        });

        return { success: true, user: result };
    } catch (error) {
        return { success: false, error: error || "Failed to deduct credits" };
    }
}