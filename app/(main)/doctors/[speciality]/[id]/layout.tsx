import { getDoctorById } from '@/actions/appointments';
import PageHeader from '@/components/page-header';
import { redirect } from 'next/navigation';
import React from 'react';
import type { Metadata } from 'next';

// LayoutProps interface'ini tanımla
interface LayoutProps {
    params: Promise<{ speciality: string; id: string }>;
    children: React.ReactNode;
}

// generateMetadata için
export async function generateMetadata({
    params,
}: {
    params: Promise<{ speciality: string; id: string }>;
}): Promise<Metadata> {
    // params'ı resolve et
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { doctor } = await getDoctorById(id);

    if (!doctor) {
        return {
            title: 'Doctor Not Found - MediMeet',
            description: 'The requested doctor could not be found.'
        };
    }

    return {
        title: `${doctor.name} - MediMeet`,
        description: `Book an appointment with Dr. ${doctor.name}, a verified specialist in ${doctor.speciality}.`
    };
}

// Layout component için
const DoctorProfileLayout = async ({
    params,
    children,
}: LayoutProps) => {
    // params'ı resolve et
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { doctor } = await getDoctorById(id);

    if (!doctor) {
        redirect('/doctors');
    }

    return (
        <div className="container mx-auto">
            <PageHeader
                title={`${doctor.name}`}
                backlink={`/doctors/${doctor.speciality}`}
                backLabel={`Back to ${doctor.speciality} Doctors`}
            />
            {children}
        </div>
    );
};

export default DoctorProfileLayout;