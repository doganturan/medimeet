import { getDoctorAppointments, getDoctorAvailability } from '@/actions/doctor';
import { getCurrentUser } from '@/actions/onboarding'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock } from 'lucide-react';
import { redirect } from 'next/navigation';
import React from 'react'
import AvailabilitySettings from './_components/availability-settings';
import DoctorAppointmentList from './_components/appointment-list';

const DoctorDashboard = async () => {

    const user = await getCurrentUser();

    if (user?.role !== 'DOCTOR') {
        redirect("/onboarding");
    }

    let appointmentsData: any = { appointments: [] };
    let availabilityData: any = { slots: [] };

    try {
        [appointmentsData, availabilityData] = await Promise.all([
            getDoctorAppointments(),
            getDoctorAvailability()
        ]);
    } catch {
        appointmentsData = { appointments: [] };
        availabilityData = { slots: [] };
    }

    if (user?.verificationStatus !== 'VERIFIED') {
        redirect("/doctor/verification");
    }

    return (
        <Tabs defaultValue="appointments" className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <TabsList className='md:col-span-1 bg-muted/30 border h-14 md:h-28 flex sm:flex-row md:flex-col w-full p-2 md:p-1 rounded-md md:space-y-2 sm:space-x-2 md:space-x-0'>
                <TabsTrigger className='flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full cursor-pointer' value="appointments">
                    <Calendar className="mr-2 h-4 w-4 hidden md:inline" />
                    <span>Appointments</span>
                </TabsTrigger>
                <TabsTrigger className='flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full cursor-pointer' value="availability">
                    <Clock className="mr-2 h-4 w-4 hidden md:inline" />
                    <span>Availability</span>
                </TabsTrigger>
            </TabsList>

            <div className="md:col-span-3">
                <TabsContent value='appointments' className='border-none p-0'>
                    <DoctorAppointmentList appointments={appointmentsData.appointments || []} />
                </TabsContent>

                <TabsContent value='availability' className='border-none p-0'>
                    <AvailabilitySettings slots={availabilityData.slots || []} />
                </TabsContent>
            </div>
        </Tabs>
    )
}

export default DoctorDashboard