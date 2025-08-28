import { getDoctorsBySpeciality } from '@/actions/doctors-listing';
import DoctorCard from '@/components/doctor-card';
import PageHeader from '@/components/page-header';
import { AppUser } from '@/types/user';
import { redirect } from 'next/navigation';
import React from 'react'

const SpecialityPage = async ({ params }: { params: { speciality: string } }) => {

    const { speciality } =  params;

    if (!speciality) {
        redirect('/doctors');
    }

    const { doctors, error }: { doctors?: AppUser[]; error?: string } = await getDoctorsBySpeciality(speciality);

    if (error) {
        console.error("Error fetching doctors by speciality:", error);
        redirect('/doctors');
    }

    return (
        <div className='space-y-5'>
            <PageHeader title={speciality.split("%20").join(" ")} backlink='/doctors' backLabel='All Specialities' />

            {doctors && doctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {doctors.map((doctor) => (
                        <DoctorCard key={doctor.id} doctor={doctor} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <h3 className='text-xl font-medium text-white mb-2'>No doctors found for this speciality</h3>
                    <p className='text-muted-foreground'>There are currently no verified doctors available for this speciality please check back later.</p>
                </div>
            )}
        </div>
    )
}

export default SpecialityPage