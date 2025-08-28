"use server"

import { VerificationStatus } from "@/lib/generated/prisma";
import { db } from "@/lib/prisma";
import { AppUser } from "@/types/user";
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

export async function verifyAdmin(): Promise<boolean> {
    const { userId } = await auth();

    if (!userId) {
        return false
    }

    try {
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        });

        return user?.role === 'ADMIN';
    } catch (error) {
        console.log("Failed to verify admin:", error);
        return false;
    }
}

export async function getPendingDoctors(): Promise<{ doctors: AppUser[] }> {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
        throw new Error("Unauthorized access");
    }

    try {
        const pendingDoctors = await db.user.findMany({
            where: {
                role: 'DOCTOR',
                verificationStatus: "PENDING"
            },
            include: {
                availabilities: true,
                doctorAppointments: true,
                patientAppointments: true,
                transactions: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return { doctors: pendingDoctors };
    } catch (error) {
        throw new Error("Failed to fetch pending doctors: ");
    }
}

export async function getVerifiedDoctors(): Promise<{ doctors: AppUser[] }> {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
        throw new Error("Unauthorized access");
    }

    try {
        const verifiedDoctors = await db.user.findMany({
            where: {
                role: 'DOCTOR',
                verificationStatus: "VERIFIED"
            },
            include: {
                availabilities: true,
                doctorAppointments: true,
                patientAppointments: true,
                transactions: true,
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        return { doctors: verifiedDoctors };
    } catch (error) {
        throw new Error("Failed to fetch verified doctors: ");
    }
}

export async function updateDoctorStatus(formData: FormData): Promise<{ success: boolean }> {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
        throw new Error("Unauthorized access");
    }

    const doctorId = formData.get("doctorId") as string;
    const status = formData.get("status") as VerificationStatus;

    if (!doctorId || !["VERIFIED", "REJECTED"].includes(status)) {
        throw new Error("Invalid doctor ID or status");
    }

    try {
        await db.user.update({
            where: { id: doctorId },
            data: { verificationStatus: status }
        });

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error(`Failed to update doctor status: ${error}`);
        return { success: false };
    }
}

export async function updateDoctorActiveStatus(formData: FormData): Promise<{ success: boolean }> {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
        throw new Error("Unauthorized access");
    }

    const doctorId = formData.get("doctorId") as string;
    const suspend = formData.get("suspend") === "true";

    if (!doctorId) {
        throw new Error("Doctor ID is required");
    }

    try {
        const status = suspend ? "PENDING" : "VERIFIED";
        await db.user.update({
            where: { id: doctorId },
            data: { verificationStatus: status }
        });
        revalidatePath("/admin");
        return { success: true };

    } catch (error) {
        throw new Error(`Failed to update doctor active status: ${error}`);
    }
}