"use client"

import { bookAppointment } from '@/actions/appointments';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFetch } from '@/hooks/use-fetch';
import { Slot } from '@/types/availability';
import { format } from 'date-fns';
import { Calendar, ArrowLeft, Clock, CreditCard, Loader2, Check } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const AppointmentForm = ({ doctorId, slot, onBack, onComplete }: { doctorId: string, slot: Slot, onBack: () => void, onComplete: () => void }) => {

    const [description, setDescription] = useState<string>("");
    const { loading, data, fn: submitBooking } = useFetch(bookAppointment)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData();
        formData.append("doctorId", doctorId);
        formData.append("startTime", slot.startTime);
        formData.append("endTime", slot.endTime);
        formData.append("description", description);
        await submitBooking(formData);
    }

    useEffect(() => {
        if (data) {
            toast.success("Appointment booked successfully!");
            onComplete();
        }
    }, [data])

    return (
        <form className='space-y-6' onSubmit={handleSubmit}>
            <div className="bg-muted/20 p-4 rounded-lg border border-emerald-900/20 space-y-3">
                {/* Tarih */}
                <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-emerald-400 mr-2" />
                    <span className="text-white font-medium">
                        {format(new Date(slot.startTime), "EEEE, MMMM d, yyyy")}
                    </span>
                </div>

                {/* Saat */}
                <div className="flex items-center">
                    <Clock className="h-5 w-5 text-emerald-400 mr-2" />
                    <span className="text-white">
                        {slot.formatted}
                    </span>
                </div>

                {/* Ücret */}
                <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-emerald-400 mr-2" />
                    <span className="text-white">
                        Cost:{" "}
                        <span className=" font-medium text-muted-foreground">
                            2 credits
                        </span>
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor='description'>
                    Describe your medical concern (optional)
                </Label>

                <Textarea className='bg-background border-emerald-900/20 h-32' id='description' value={description} onChange={(e) => setDescription(e.target.value)} />
                <p className="text-sm text-muted-foreground">
                    This information will be shared with your doctor before your appointment.
                </p>
            </div>

            <div className="flex justify-between pt-2">
                <Button type='button' variant={'outline'} onClick={onBack} disabled={loading} className='border-emerald-900/30'>
                    <ArrowLeft className='h-5 w-5 text-white-400 inline-block' />
                    Change Time Slot
                </Button>

                <Button type='submit' disabled={loading} className='bg-emerald-600 hover:bg-emerald-700 text-white'>
                    {loading ?
                        <>
                            <Loader2 className='h-5 w-5 animate-spin' />
                            Booking...
                        </>
                        :
                        <>
                            <Check className='h-5 w-5' />
                            Book Appointment
                        </>
                    }
                </Button>
            </div>
        </form>
    )
}

export default AppointmentForm