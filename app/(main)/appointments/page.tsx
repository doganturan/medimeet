import { getCurrentUser } from '@/actions/onboarding'
import { getPatientAppointments } from '@/actions/patient';
import PageHeader from '@/components/page-header';
import { redirect } from 'next/navigation';
import React from 'react'
import { Calendar, MessageCircleWarningIcon } from 'lucide-react';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import AppointmentCard from '@/components/appointment-card';

const PatientAppointmentsPage = async () => {
    const user = await getCurrentUser();

    if (!user || user.role !== "PATIENT") {
        redirect("/onboarding");
    }

    const { appointments, error } = await getPatientAppointments();

    return (
        <div className='container mx-auto px-4 py-8'>
            <PageHeader icon={Calendar} title='My Appointments' backLabel='Find Doctors' backlink='/doctors' />

            <Card className='p-4 border-emerald-900/20'>

                {error ?
                    <div className='text-center py-8'>
                        <p className='text-red-500'>{error}</p>
                    </div>
                    : appointments && appointments?.length > 0 ? (
                        <>
                            {appointments.reverse().map((appointment) => {
                                return <AppointmentCard key={appointment.id} appointment={appointment} userRole='PATIENT' />
                            })}
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <MessageCircleWarningIcon className="mx-auto mb-4 h-6 w-6 text-gray-400" />
                            <h3 className='text-xl font-medium text-white mb-2'>No Appointments Scheduled</h3>
                            <p className='text-muted-foreground'>
                                You have no appointments scheduled. Browse our doctors and book your first consultation today!
                            </p>
                        </div>
                    )
                }

            </Card>
        </div>
    )
}

export default PatientAppointmentsPage