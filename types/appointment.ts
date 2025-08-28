import { Prisma } from "@/lib/generated/prisma";

export type Appointment = Prisma.AppointmentGetPayload<{
    include: {
        patient: true;
        doctor: true;
    };
}>;