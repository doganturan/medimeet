"use client"

import { updateDoctorStatus } from '@/actions/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useFetch } from '@/hooks/use-fetch';
import { VerificationStatus } from '@/lib/generated/prisma';
import { AppUser } from '@/types/user';
import { format } from 'date-fns';
import { Check, ExternalLink, FileText, Medal, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';

const PendingDoctors = ({ doctors }: { doctors: AppUser[] }) => {
    const [selectedDoctor, setSelectedDoctor] = useState<AppUser | null>(null);
    const { loading, data, fn: submitStatusUpdate } = useFetch(updateDoctorStatus)

    const handleUpdateStatus = async (doctorId: string, status: VerificationStatus) => {
        if (loading) return;

        const formData = new FormData();
        formData.append('doctorId', doctorId);
        formData.append('status', status);

        await submitStatusUpdate(formData);

        toast.success(`Doctor application ${status === "VERIFIED" ? 'approved' : 'rejected'} successfully!`, {
            duration: 3000
        });
    }

    useEffect(() => {
        if (data && data?.success) {
            handleCloseDialog();
        }
    }, [data])


    const handleViewDetails = (doctor: AppUser) => {
        setSelectedDoctor(doctor);
    }

    const handleCloseDialog = () => {
        setSelectedDoctor(null);
    }

    return (
        <div>
            <Card className='bg-muted/20 border-emerald-900/20'>
                <CardHeader>
                    <CardTitle className='text-xl font-bold text-white'>Pending Doctor Verifications</CardTitle>
                    <CardDescription>Review and verify pending doctor applications.</CardDescription>
                </CardHeader>
                <CardContent>
                    {doctors.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">No pending doctor applications found.</div>
                    ) : (
                        <div className="space-y-4">
                            {doctors.map(doctor => (
                                <Card key={doctor.id} className='bg-background border-emerald-900/20 hover:border-emerald-700/30 transition-all'>
                                    <CardContent className='p-4'>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="">
                                                <div className="p-2">
                                                    <User className='w-5 h-5 text-emerald-400' />
                                                </div>

                                                <div className="">
                                                    <h3 className='font-medium text-white'>{doctor.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{doctor.speciality} . {doctor.experience} years experience</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end md:self-auto">
                                                <Badge variant={'outline'} className='bg-amber-900/20 border-amber-900/30 text-amber-400'> Pending </Badge>
                                                <Button onClick={() => handleViewDetails(doctor)} size={'sm'} variant={'outline'} className='border-emerald-900/30 hover:bg-muted/80'> View Details </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedDoctor && (
                <Dialog open={!!selectedDoctor} onOpenChange={handleCloseDialog}>
                    <DialogTrigger>Open</DialogTrigger>
                    <DialogContent className='!max-w-3xl'>
                        <DialogHeader>
                            <DialogTitle className='text-xl font-bold text-white'>Doctor Verification Details</DialogTitle>
                            <DialogDescription>
                                Review the details of the selected doctor before proceeding with the verification.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="space-y-1 flex-1">
                                    <h4 className="text-xm font-medium text-muted-foreground text-sm"> Full Name </h4>
                                    <p className="text-base font-medium text-white">{selectedDoctor.name}</p>
                                </div>

                                <div className="space-y-1 flex-1">
                                    <h4 className="text-xm font-medium text-muted-foreground text-sm"> Email </h4>
                                    <p className="text-base font-medium text-white">{selectedDoctor.email}</p>
                                </div>

                                <div className="space-y-1 flex-1">
                                    <h4 className="text-xm font-medium text-muted-foreground text-sm"> Application Date </h4>
                                    <p className="text-base font-medium text-white"> {format(new Date(selectedDoctor.createdAt), 'PPP')} </p>
                                </div>
                            </div>

                            <Separator className='bg-emerald-900/20' />

                            <div className='space-y-4'>
                                <div className="flex items-center gap-2">
                                    <Medal className='w-5 h-5 text-emerald-400' />
                                    <h3 className='text-white font-medium'>Professional Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                                    <div className="space-y-1">
                                        <h4 className='font-medium text-muted-foreground text-sm'>Speciality</h4>
                                        <p className="text-white">{selectedDoctor.speciality}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className='font-medium text-muted-foreground text-sm'>Years of Experience</h4>
                                        <p className="text-white">{selectedDoctor.experience} years</p>
                                    </div>

                                    <div className="space-y-1 col-span-2">
                                        <h4 className="font-medium text-muted-foreground text-sm">Credentials</h4>
                                        <div className="flex items-center">
                                            {selectedDoctor.credentialUrl && (
                                                <a href={selectedDoctor.credentialUrl} target='_blank' rel='noopener noreferrer' className='text-emerald-400 hover:text-emerald-300 flex items-center'>
                                                    View Credentials
                                                    <ExternalLink className='w-4 h-4 ml-1' />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className='bg-emerald-900/20' />

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <FileText className='w-5 h-5 text-emerald-400' />
                                    <h3 className='text-white font-medium'>Service Description</h3>
                                </div>
                                <p className='text-muted-foreground  text-smwhitespace-pre-line'>{selectedDoctor.description}</p>
                            </div>
                        </div>

                        {loading && <BarLoader width={'100%'} color={'#36d7b7'} />}

                        <DialogFooter className='flex sm:justify-between '>
                            <Button onClick={() => handleUpdateStatus(selectedDoctor.id, "REJECTED")} variant={'destructive'} disabled={loading} className='!bg-red-700 !hover:bg-red-800'>
                                <X className='w-4 h-4' />
                                Reject Application
                            </Button>

                            <Button onClick={() => handleUpdateStatus(selectedDoctor.id, "VERIFIED")} className='!bg-emerald-600 !hover:bg-emerald-700 text-white' disabled={loading}>
                                <Check className='w-4 h-4' />
                                Approve Application
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

export default PendingDoctors