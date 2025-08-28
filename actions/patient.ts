"use server"

import { db } from "@/lib/prisma";
import { Appointment } from "@/types/appointment";
import { auth } from "@clerk/nextjs/server";


export async function getPatientAppointments(): Promise<{ appointments?: Appointment[]; error?: string }> {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not authenticated");
    }

    try {
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
                role: "PATIENT"
            },
            select: {
                id: true
            }
        });

        if (!user) {
            throw new Error("User not found");
        }

        const appointments = await db.appointment.findMany({
            where: {
                patientId: user.id
            },
            include: {
                doctor: true,
                patient: true
            },
            orderBy: {
                startTime: "asc"
            }
        });

        return { appointments };
    } catch (error) {
        return { error: "Failed to fetch patient appointments" };
    }
}
