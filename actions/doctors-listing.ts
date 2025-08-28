"use server"

import { db } from "@/lib/prisma";
import { AppUser } from "@/types/user";

export async function getDoctorsBySpeciality(speciality: string): Promise<{ doctors: AppUser[] } | { error: string }> {
    try {
        const doctors = await db.user.findMany({
            where: {
                role: 'DOCTOR',
                verificationStatus: 'VERIFIED',
                speciality: speciality.split("%20").join(" ")
            },
            include: {
                availabilities: true,
                doctorAppointments: true,
                patientAppointments: true,
                transactions: true,
            },
            orderBy: {
                name: 'asc'
            }
        })

        return { doctors };
    } catch (error) {
        console.error("Error fetching doctors by speciality:", error);
        return { error: "Failed to fetch doctors by speciality" };
    }
}