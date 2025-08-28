"use server"

import { db } from "@/lib/prisma";
import { AppUser } from "@/types/user";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function setUserRole(formData: FormData): Promise<{ success: boolean; message?: string, redirect?: string }> {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not authenticated");
    }

    // Find user in DB
    const user = await db.user.findUnique({
        where: { clerkUserId: userId }
    })

    if (!user) {
        throw new Error("User not found");
    }

    const role = formData.get("role");

    if (!role || !["PATIENT", "DOCTOR"].includes(role as string)) {
        throw new Error("Invalid role");
    }

    try {
        if (role === "PATIENT") {
            await db.user.update({
                where: { clerkUserId: userId },
                data: { role: "PATIENT" }
            });

            revalidatePath("/");
            return { success: true, message: "Role set to PATIENT", redirect: "/doctors" };
        }

        if (role === "DOCTOR") {
            const speciality = formData.get("speciality") as string;
            const experience = parseInt(formData.get("experience") as string, 10);
            const credentialUrl = formData.get("credentialUrl") as string;
            const description = formData.get("description") as string;

            if (!speciality || !experience || !credentialUrl || !description) {
                throw new Error("Missing required fields for DOCTOR role");
            }

            await db.user.update({
                where: { clerkUserId: userId },
                data: { role: "DOCTOR", speciality, experience, credentialUrl, description, verificationStatus: "PENDING" }
            });

            revalidatePath("/");
            return { success: true, message: "Role set to DOCTOR", redirect: "/doctor/verification" };
        }

        throw new Error("Invalid role");

    } catch (error) {
        throw new Error(`Failed to update user : ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

export async function getCurrentUser(): Promise<AppUser | null> {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not authenticated");
    }

    try {
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
            include: {
                transactions: true,
                patientAppointments: true,
                doctorAppointments: true,
                availabilities: true
            }
        })

        return user;
    } catch (error) {
        throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}