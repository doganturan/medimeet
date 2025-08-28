import { getAvailableTimeSlots, getDoctorById } from '@/actions/appointments';
// import { redirect } from 'next/navigation';
import React from 'react'
import DoctorProfile from './_components/doctor-profile';

const DoctorProfilePage = async ({ params }: { params: { id: string } }) => {
    const { id } = await params;

    try {
        const [doctorData, slotsData] = await Promise.all([
            getDoctorById(id),
            getAvailableTimeSlots(id)
        ]);

        return (
            <DoctorProfile doctor={doctorData.doctor} availableDays={slotsData.days || []} />
        )
    } catch (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] bg-gray-900 rounded-lg shadow-md p-6 mt-8">
                <svg
                    className="w-12 h-12 text-red-500 mb-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                </svg>
                <h2 className="text-2xl font-semibold text-red-400 mb-2">Oops! Something went wrong</h2>
                <p className="text-gray-300 text-center mb-4">
                    We couldn't fetch the doctor's profile at this time.<br />
                    Please try again later.
                </p>
            </div>
        )
    }
}

export default DoctorProfilePage