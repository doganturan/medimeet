"use server"

import { db } from "@/lib/prisma";
import { AppUser } from "@/types/user";
import { auth } from "@clerk/nextjs/server";
import { addDays, addMinutes, endOfDay, format, isBefore } from "date-fns";
import { deductCreditsForAppointment } from "./credits";
import { revalidatePath } from "next/cache";
import { Appointment } from "@/types/appointment";
import { Auth } from "@vonage/auth";
import { Vonage } from "@vonage/server-sdk";
import { MediaMode } from "@vonage/video";
import { AvailableDays } from "@/types/availability";

const credentials = new Auth({
    applicationId: process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID,
    privateKey: process.env.NEXT_PUBLIC_VONAGE_PRIVATE_KEY,
})

const vonage = new Vonage(credentials, {

})

export async function getDoctorById(doctorId: string): Promise<{ doctor: AppUser }> {
    try {
        const doctor = await db.user.findUnique({
            where: {
                id: doctorId,
                role: "DOCTOR",
                verificationStatus: "VERIFIED"
            },
            include: {
                availabilities: true,
                doctorAppointments: true,
                transactions: true,
                patientAppointments: true
            }
        });

        if (!doctor) {
            throw new Error("Doctor not found or not verified");
        }

        return { doctor };
    } catch (error) {
        throw new Error("Failed to fetch doctor");
    }
}

export async function getAvailableTimeSlots(doctorId: string): Promise<{ days: AvailableDays | null }> {
    try {
        // Validate doctor existence and verification
        const doctor = await db.user.findUnique({
            where: {
                id: doctorId,
                role: "DOCTOR",
                verificationStatus: "VERIFIED",
            },
        });

        if (!doctor) {
            throw new Error("Doctor not found or not verified");
        }

        // Fetch a single availability record
        const availability = await db.availability.findFirst({
            where: {
                doctorId: doctor.id,
                status: "AVAILABLE",
            },
        });

        if (!availability) {
            return { days: null };
        }

        // Get the next 4 days
        const now = new Date();
        const days = [now, addDays(now, 1), addDays(now, 2), addDays(now, 3)];

        // Fetch existing appointments for the doctor over the next 4 days
        const lastDay = endOfDay(days[3]);
        const existingAppointments = await db.appointment.findMany({
            where: {
                doctorId: doctor.id,
                status: "SCHEDULED",
                startTime: {
                    lte: lastDay,
                },
            },
        });

        const availableSlotsByDay: Record<string, Array<{ startTime: string; endTime: string; formatted: string; day: string }>> = {};

        // For each of the next 4 days, generate available slots
        for (const day of days) {
            const dayString = format(day, "yyyy-MM-dd");
            availableSlotsByDay[dayString] = [];

            // Create a copy of the availability start/end times for this day
            const availabilityStart = new Date(availability.startTime);
            const availabilityEnd = new Date(availability.endTime);

            // Set the day to the current day we're processing
            availabilityStart.setFullYear(
                day.getFullYear(),
                day.getMonth(),
                day.getDate()
            );
            availabilityEnd.setFullYear(
                day.getFullYear(),
                day.getMonth(),
                day.getDate()
            );

            let current = new Date(availabilityStart);
            const end = new Date(availabilityEnd);

            while (
                isBefore(addMinutes(current, 30), end) ||
                +addMinutes(current, 30) === +end
            ) {
                const next = addMinutes(current, 30);

                // Skip past slots
                if (isBefore(current, now)) {
                    current = next;
                    continue;
                }

                const overlaps = existingAppointments.some((appointment) => {
                    const aStart = new Date(appointment.startTime);
                    const aEnd = new Date(appointment.endTime);

                    return (
                        (current >= aStart && current < aEnd) ||
                        (next > aStart && next <= aEnd) ||
                        (current <= aStart && next >= aEnd)
                    );
                });

                if (!overlaps) {
                    availableSlotsByDay[dayString].push({
                        startTime: current.toISOString(),
                        endTime: next.toISOString(),
                        formatted: `${format(current, "h:mm a")} - ${format(
                            next,
                            "h:mm a"
                        )}`,
                        day: format(current, "EEEE, MMMM d"),
                    });
                }

                current = next;
            }
        }

        // Convert to array of slots grouped by day for easier consumption by the UI
        const result = Object.entries(availableSlotsByDay).map(([date, slots]) => ({
            date,
            displayDate:
                slots.length > 0
                    ? slots[0].day
                    : format(new Date(date), "EEEE, MMMM d"),
            slots,
        }));

        return { days: result };
    } catch (error) {
        console.error("Failed to fetch available slots:", error);
        throw new Error("Failed to fetch available time slots: " + error);
    }
}

export async function bookAppointment(formData: FormData): Promise<{ success: boolean; appointment: Appointment }> {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not authenticated");
    }

    try {
        const patient = await db.user.findUnique({
            where: {
                clerkUserId: userId,
                role: "PATIENT"
            }
        })

        if (!patient) {
            throw new Error("Patient not found or not authorized");
        }

        // Parse form data
        const doctorId = formData.get("doctorId") as string;
        const startTime = new Date(formData.get("startTime") as string);
        const endTime = new Date(formData.get("endTime") as string);
        const patientDescription = formData.get("description") as string;

        if (!doctorId || !startTime || !endTime) {
            throw new Error("Missing required fields");
        }

        const doctor = await db.user.findUnique({
            where: {
                id: doctorId,
                role: "DOCTOR",
                verificationStatus: "VERIFIED"
            }
        })

        if (!doctor) {
            throw new Error("Doctor not found or not verified");
        }

        if (patient.credits < 2) {
            throw new Error("Insufficient credits to book appointment");
        }

        // findFirst or findUnique to check for overlapping appointments
        const overlappingAppointment = await db.appointment.findFirst({
            where: {
                doctorId: doctorId,
                status: "SCHEDULED",
                OR: [
                    {
                        startTime: {
                            lte: endTime
                        },
                        endTime: {
                            gte: startTime
                        }
                    },
                    {
                        startTime: {
                            gte: startTime
                        },
                        endTime: {
                            lte: startTime
                        }
                    }
                ]
            }
        })

        if (overlappingAppointment) {
            throw new Error("Appointment time conflicts with an existing appointment");
        }


        const sessionId = await createVideoSession();

        const { success, error } = await deductCreditsForAppointment(patient.id, doctor.id);

        if (!success) {
            throw new Error("Failed to deduct credits");
        }

        const appointment = await db.appointment.create({
            data: {
                patientId: patient.id,
                doctorId: doctor.id,
                startTime: startTime,
                endTime: endTime,
                patientDescription: patientDescription,
                status: "SCHEDULED",
                videoSessionId: sessionId // Storage the vonage session ID
            },
            include: {
                patient: true,
                doctor: true
            }
        })

        revalidatePath("/appointments");
        return { success: true, appointment: appointment };

    } catch (error) {
        throw new Error("Failed to book appointment: " + error);
    }
}

async function createVideoSession(): Promise<string> {
    try {
        const session = await vonage.video.createSession({ mediaMode: MediaMode.ROUTED });
        return session.sessionId;
    } catch (error) {
        throw new Error("Failed to create video session: " + error);
    }
}

export async function generateVideoToken(formData: FormData): Promise<{ success: boolean; token: string; videoSessionId: string }> {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not authenticated");
    }

    try {
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        })

        if (!user) {
            throw new Error("User not found");
        }

        const appointmentId = formData.get("appointmentId") as string;

        const appointment = await db.appointment.findUnique({
            where: {
                id: appointmentId
            }
        });

        if (!appointment) {
            throw new Error("Appointment not found");
        }

        if (appointment.status !== "SCHEDULED") {
            throw new Error("Appointment is not scheduled");
        }

        // Ensure the user is either the patient or the doctor for this appointment
        if (appointment.patientId !== user.id && appointment.doctorId !== user.id) {
            throw new Error("User not authorized for this appointment");
        }

        if (!appointment.videoSessionId) {
            throw new Error("No video session associated with this appointment");
        }

        const now = new Date();
        const appointmentTime = new Date(appointment.startTime);
        const timeDifference = (appointmentTime.getTime() - now.getTime()) / (1000 * 60);

        if (timeDifference > 30) {
            throw new Error("The call will be available 30 minutes before the scheduled time");
        }

        const appointmentEndTime = new Date(appointment.endTime);
        const expirationTime = Math.floor(appointmentEndTime.getTime() / 1000) + (60 * 60); // 1 hour from now

        const connectionData = JSON.stringify({
            name: user.name,
            role: user.role,
            userId: user.id
        });

        const token = vonage.video.generateClientToken(appointment.videoSessionId, {
            role: "publisher",
            expireTime: expirationTime,
            data: connectionData
        })

        await db.appointment.update({
            where: {
                id: appointmentId
            },
            data: {
                videoSessionToken: token
            }
        });

        return {
            success: true,
            token: token,
            videoSessionId: appointment.videoSessionId
        }

    } catch (error) {
        throw new Error("Failed to generate video token: " + error);
    }
}