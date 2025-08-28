"use server"

import { Appointment, Availability } from "@/lib/generated/prisma";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

export async function setAvailabilitySlots(formData: FormData): Promise<{ success: boolean, slot: Availability }> {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not authenticated");
    }

    try {
        const doctor = await db.user.findUnique({
            where: {
                clerkUserId: userId,
                role: 'DOCTOR',
                verificationStatus: 'VERIFIED'
            }
        })

        if (!doctor) {
            throw new Error("Doctor not found or not verified");
        }

        // Getting form data
        const startTime = formData.get('startTime') as string;
        const endTime = formData.get('endTime') as string;

        if (!startTime || !endTime) {
            throw new Error("Start time and end time are required");
        }

        if (startTime >= endTime) {
            throw new Error("Start time must be before end time");
        }

        const existingSlots = await db.availability.findMany({
            where: {
                doctorId: doctor.id,
            }
        })

        if (existingSlots.length > 0) {
            const slotsWithNoAppointments = existingSlots.filter((slot) => slot.status === "AVAILABLE")

            if (slotsWithNoAppointments.length > 0) {
                await db.availability.deleteMany({
                    where: {
                        id: {
                            in: slotsWithNoAppointments.map(slot => slot.id)
                        }
                    }
                })
            }
        }

        // Create new availability slot
        const newSlot = await db.availability.create({
            data: {
                doctorId: doctor.id,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                status: 'AVAILABLE'
            }
        });

        revalidatePath("/doctor");
        return { success: true, slot: newSlot };
    } catch (error) {
        throw new Error("Failed to set availability" + error);
    }
}

export async function getDoctorAvailability(): Promise<{ slots: Availability[] }> {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    try {
        const doctor = await db.user.findUnique({
            where: {
                clerkUserId: userId,
                role: "DOCTOR",
            },
        });

        if (!doctor) {
            throw new Error("Doctor not found");
        }

        const availabilitySlots = await db.availability.findMany({
            where: {
                doctorId: doctor.id,
            },
            orderBy: {
                startTime: "asc",
            },
        });

        return { slots: availabilitySlots };
    } catch (error) {
        throw new Error("Failed to fetch availability slots " + error);
    }
}

export async function getDoctorAppointments(): Promise<{ appointments: Appointment[] }> {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    try {
        const doctor = await db.user.findUnique({
            where: {
                clerkUserId: userId,
                role: "DOCTOR",
                verificationStatus: "VERIFIED"
            }
        });

        if (!doctor) {
            throw new Error("Doctor not found or not verified");
        }

        const appointments = await db.appointment.findMany({
            where: {
                doctorId: doctor.id,
                status: {
                    in: ["SCHEDULED"]
                }
            },
            include: {
                patient: true,
                doctor: true,
            },
            orderBy: {
                startTime: "asc"
            }
        })

        return { appointments }

    } catch (error) {
        throw new Error("Failed to fetch appointments " + error);
    }
}

export async function cancelAppointment(formData: FormData): Promise<{ success: boolean }> {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    try {
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            }
        });

        if (!user) {
            throw new Error("User not found");
        }

        const appointmentId = formData.get("appointmentId") as string;

        if (!appointmentId) {
            throw new Error("Appointment ID is required");
        }

        const appointment = await db.appointment.findUnique({
            where: {
                id: appointmentId,
            },
            include: {
                doctor: true,
                patient: true,
            }
        });

        if (!appointment) {
            throw new Error("Appointment not found");
        }

        if (appointment.doctorId !== user.id && appointment.patientId !== user.id) {
            throw new Error("You are not authorized to cancel this appointment");
        }

        await db.$transaction(async (tx) => {
            await tx.appointment.update({
                where: {
                    id: appointmentId
                },
                data: {
                    status: "CANCELLED"
                }
            });

            await tx.creditTransaction.create({
                data: {
                    userId: appointment.patientId,
                    amount: 2,
                    type: "APPOINTMENT_DEDUCTION",
                }
            });

            await tx.creditTransaction.create({
                data: {
                    userId: appointment.doctorId,
                    amount: -2,
                    type: "APPOINTMENT_DEDUCTION",
                }
            });

            // Update doctor's credit balance (increment)
            await tx.user.update({
                where: {
                    id: appointment.patientId
                },
                data: {
                    credits: {
                        increment: 2
                    }
                }
            });

            // Update doctor's credit balance (decrement)
            await tx.user.update({
                where: {
                    id: appointment.doctorId
                },
                data: {
                    credits: {
                        decrement: 2
                    }
                }
            });
        });

        if (user.role === "DOCTOR") {
            revalidatePath("/doctor");
        } else if (user.role === "PATIENT") {
            revalidatePath("/appointments");
        }

        return { success: true };
    } catch (error) {
        throw new Error("Failed to cancel appointment " + error);
    }
}

export async function addAppointmentNotes(formData: FormData): Promise<{ success: boolean, appointment: Appointment }> {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    try {
        const doctor = await db.user.findUnique({
            where: {
                clerkUserId: userId,
                role: "DOCTOR",
                verificationStatus: "VERIFIED"
            }
        });

        if (!doctor) {
            throw new Error("Doctor not found or not verified");
        }

        const appointmentId = formData.get("appointmentId") as string;
        const notes = formData.get("notes") as string;

        const appointment = await db.appointment.findUnique({
            where: {
                id: appointmentId,
                doctorId: doctor.id
            }
        });

        if (!appointment) {
            throw new Error("Appointment not found");
        }

        const updatedAppointment = await db.appointment.update({
            where: {
                id: appointmentId
            },
            data: {
                notes: notes
            }
        });

        revalidatePath("/doctor");
        return { success: true, appointment: updatedAppointment };

    } catch (error) {
        throw new Error("Failed to fetch appointments " + error);
    }
}

export async function markAppointmentCompleted(formData: FormData): Promise<{ success: boolean, appointment: Appointment }> {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    try {
        const doctor = await db.user.findUnique({
            where: {
                clerkUserId: userId,
                role: "DOCTOR",
                verificationStatus: "VERIFIED"
            }
        });

        if (!doctor) {
            throw new Error("Doctor not found or not verified");
        }

        const appointmentId = formData.get("appointmentId") as string;

        if (!appointmentId) {
            throw new Error("Appointment ID is required");
        }

        const appointment = await db.appointment.findUnique({
            where: {
                id: appointmentId,
                doctorId: doctor.id
            },
            include: {
                patient: true
            }
        });

        if (!appointment) {
            throw new Error("Appointment not found");
        }

        if (appointment.status !== "SCHEDULED") {
            throw new Error("Only scheduled appointments can be marked as completed");
        }

        const now = new Date();
        const appointmentEndTime = new Date(appointment.endTime);

        if (now < appointmentEndTime) {
            throw new Error("Appointment cannot be marked as completed before it ends");
        }

        const updatedAppointment = await db.appointment.update({
            where: {
                id: appointmentId
            },
            data: {
                status: "COMPLETED"
            }
        });

        revalidatePath("/doctor");
        return { success: true, appointment: updatedAppointment };

    } catch (error) {
        throw new Error("Failed to fetch appointments " + error);
    }
}