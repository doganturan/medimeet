import { getDoctorById } from '@/actions/appointments';
import PageHeader from '@/components/page-header';
import { redirect } from 'next/navigation';
import React from 'react';

interface LayoutProps {
  params: { speciality: string; id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: { speciality: string; id: string } }) {
  const { id } = params; // ❌ await yok
  const { doctor } = await getDoctorById(id);

  return {
    title: `${doctor.name} - MediMeet`,
    description: `Book an appointment with Dr. ${doctor.name}, a verified specialist in ${doctor.speciality}.`
  };
}

const DoctorProfileLayout = async ({ params, children }: LayoutProps) => {
  const { id } = params; // ❌ await yok
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
