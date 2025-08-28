import PageHeader from '@/components/page-header'
import { Stethoscope } from 'lucide-react'
import React from 'react'

const metadata = {
    title: 'Doctor Dashboard - MediMeet',
    description: 'Manage your patients and appointments efficiently',
}

const DoctorDashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader icon={Stethoscope} title={"Doctor Dashboard"} />
            {children}
        </div>
    )
}

export default DoctorDashboardLayout