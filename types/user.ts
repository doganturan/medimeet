// types/user.ts
import { Prisma } from "@/lib/generated/prisma";

export type AppUser = Prisma.UserGetPayload<{
    include: {
        transactions: true;
        patientAppointments: true;
        doctorAppointments: true;
        availabilities: true;
    }
}>;
