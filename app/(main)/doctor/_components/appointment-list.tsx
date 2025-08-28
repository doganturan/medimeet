
import React from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Calendar } from 'lucide-react'
import AppointmentCard from '@/components/appointment-card'
import { Appointment } from '@/types/appointment'

const DoctorAppointmentList = ({ appointments }: { appointments: Appointment[] | [] }) => {

    return (
        <Card className='border-emerald-900/20'>
            <CardHeader>
                <CardTitle className='text-xl font-bold text-white flex items-center'>
                    <Calendar className='h-6 w-6 mr-2 text-emerald-400' />
                    Upcoming Appointments
                </CardTitle>
            </CardHeader>
            <CardContent>
                {appointments.length > 0 ?
                    <div className="space-y-4">
                        {appointments.map((appointment) => (
                            <AppointmentCard key={appointment.id} appointment={appointment} userRole="DOCTOR" />
                        ))}
                    </div>
                    :
                    <div className="text-center py-8">
                        <Calendar className='mx-auto mb-3 h-12 w-12 text-muted-foreground' />
                        <h3 className="text-xl font-medium text-white mb-2">No upcoming appointments</h3>
                        <p className="text-muted-foreground">
                            You have no scheduled appointments at this time. Make sure you have set your availability to allow patients to book appointments.
                        </p>
                    </div>
                }
            </CardContent>
        </Card>
    )
}

export default DoctorAppointmentList