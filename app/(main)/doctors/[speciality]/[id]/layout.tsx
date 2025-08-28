import { getDoctorById } from '@/actions/appointments';
import PageHeader from '@/components/page-header';
import { redirect } from 'next/navigation';
import React from 'react'

interface DoctorProfileLayoutProps {
    params: {
        id: string;
    };
    children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
    const { id } = params;
    const { doctor } = await getDoctorById(id);

    return {
        title: `Dr. ${doctor.name} - MediMeet`,
        description: `Book an appointment with Dr. ${doctor.name}, a verified specialist in ${doctor.speciality}.`
    }
}

export default async function Layout({ params, children }: DoctorProfileLayoutProps) {
    const { id } = params;
    const { doctor } = await getDoctorById(id);

    if (!doctor) {
        redirect("/doctors");
    }

    return (
        <div className='container mx-auto'>
            <PageHeader title={`${doctor.name}`} backlink={`/doctors/${doctor.speciality}`} backLabel={`Back to ${doctor.speciality} Doctors`} />
            {children}
        </div>
    );
}