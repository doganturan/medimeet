"use client"

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AvailableDays, Slot } from '@/types/availability';
import { AppUser } from '@/types/user'
import { AlertCircle, Calendar, ChevronDown, ChevronUp, Clock, FileText, Medal, User } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react'
import SlotPicker from './slot-picker';
import AppointmentForm from './appointment-form';
import { useRouter } from 'next/navigation';


const DoctorProfile = ({ doctor, availableDays }: { doctor: AppUser, availableDays: AvailableDays | [] }) => {
    const [showBooking, setShowBooking] = useState<boolean>(false);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const router = useRouter();

    const handleSlotSelect = (slot: Slot) => {
        setSelectedSlot(slot);
        setShowBooking(true);
    }

    const toggleBooking = () => {
        setShowBooking(!showBooking);

        if (!showBooking) {
            setTimeout(() => {
                document.getElementById("booking-section")?.scrollIntoView({
                    behavior: 'smooth',
                })
            }, 100)
        }
    }

    const handleBookingComplete = () => {
        router.push("/appointments");
    }

    const totalSlots = Object.values(availableDays).reduce((total: number, day: any) => total + day.slots.length, 0);

    return (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className="md:col-span-1">
                <div className="md:sticky md:top-24">
                    <Card className='border-emerald-900/20'>
                        <CardContent className='pt-6'>
                            <div className="flex flex-col items-center text-center">
                                <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 bg-emerald-900/20">
                                    {doctor.imageUrl ? (
                                        <Image
                                            src={doctor.imageUrl}
                                            alt={`${doctor.name}'s profile picture`}
                                            fill
                                            className='object-cover'
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-16 h-16 text-emerald-400" />
                                        </div>
                                    )}
                                </div>

                                <h2 className='text-xl font-bold text-white mb-1'>
                                    Dr. {doctor.name}
                                </h2>

                                <Badge variant={'outline'} className='bg-emerald-900/20 text-emerald-400 mb-4'>
                                    {doctor.speciality}
                                </Badge>

                                <div className="flex items-center justify-center mb-2">
                                    <Medal className='w-4 h-4 text-emerald-400 mr-2' />
                                    <span className='text-muted-foreground'>
                                        {doctor.experience} years of experience
                                    </span>
                                </div>
                                <Button onClick={toggleBooking} className='w-full bg-emerald-600 hover:bg-emerald-700 mt-4 text-white'>
                                    {showBooking ? (
                                        <>
                                            Hide Booking
                                            <ChevronUp className='w-4 h-4 ml-2' />
                                        </>
                                    ) : (
                                        <>
                                            Book Appointment
                                            <ChevronDown className='w-4 h-4 ml-2' />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className='text-xl font-bold text-white'>
                            About {doctor.name}
                        </CardTitle>
                        <CardDescription>
                            Proffessional background and expertise - {doctor.speciality}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className='space-y-4'>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <FileText className='w-5 h-5 text-emerald-400' />
                                <h3 className='text-white font-medium'>Description</h3>
                            </div>
                            <p className='text-muted-foreground whitespace-pre-line'>{doctor.description}</p>
                        </div>

                        <Separator className='bg-emerald-900/20' />

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Clock className='w-5 h-5 text-emerald-400' />
                                <h3 className='text-white font-medium'>Availability</h3>
                            </div>

                            {totalSlots > 0 ?
                                <div className="flex items-center">
                                    {/* <Calendar className='w-5 h-5 text-emerald-400 mr-2' /> */}
                                    <p className="text-muted-foreground">{totalSlots} time slots available for booking over the next 4 days</p>
                                </div>
                                :
                                <Alert className=''>
                                    <AlertCircle className='w-4 h-4 text-red-500' />
                                    <AlertDescription>
                                        No available slots for the next 4 days. Please check back later.
                                    </AlertDescription>
                                </Alert>
                            }
                        </div>
                    </CardContent>
                </Card>

                {showBooking && (
                    <div id='booking-section' className="">
                        <Card className='border-emerald-900/20'>
                            <CardHeader>
                                <CardTitle className='text-xl font-bold text-white'>Book Appointment</CardTitle>
                                <CardDescription>Select a date and time for your appointment and provide details for your consultation</CardDescription>
                            </CardHeader>

                            <CardContent>
                                {totalSlots > 0 ? (
                                    <>
                                        {!selectedSlot && <SlotPicker days={availableDays} onSelectSlot={handleSlotSelect} />}

                                        {selectedSlot && <AppointmentForm doctorId={doctor.id} slot={selectedSlot} onBack={() => setSelectedSlot(null)} onComplete={handleBookingComplete} />}
                                    </>
                                ) : (
                                    <div className="text-center py-6">
                                        <Calendar className='h-12 w-12 mx-auto text-muted-foreground mb-3' />
                                        <h3 className='text-xl font-medium text-white mb-2'>
                                            No available slots
                                        </h3>

                                        <p className="text-muted-foreground">
                                            This doctor has no available slots for the next 4 days. Please check back later.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DoctorProfile