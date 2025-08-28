"use client"

import { setAvailabilitySlots } from '@/actions/doctor'
import { useFetch } from '@/hooks/use-fetch'
import { Availability } from '@/lib/generated/prisma'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertCircle, Clock, Clock1, Loader2, Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { format } from 'date-fns'

const AvailabilitySettings = ({ slots }: { slots: Availability[] }) => {

  const [showForm, setShowForm] = useState(false);

  const { loading, fn: submitSlots, data } = useFetch(setAvailabilitySlots)


  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      startTime: '',
      endTime: ''
    }
  })

  function createLocalDateFromTime(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );
    return date;
  }

  const onSubmit = async (data: any) => {
    if (loading) return;

    const formData = new FormData();
    const startDate = createLocalDateFromTime(data.startTime);
    const endDate = createLocalDateFromTime(data.endTime);

    if (startDate >= endDate) {
      toast("End time must be after start time");
      return;
    }

    formData.append('startTime', startDate.toISOString());
    formData.append('endTime', endDate.toISOString());

    await submitSlots(formData);
  }

  useEffect(() => {
    if (data && data?.success) {
      setShowForm(false);
      toast.success("Availability slot set successfully");
    }
  }, [data])

  function formatTimeString(dateString: Date): string {
    try {
      return format(new Date(dateString), 'hh:mm a');
    } catch (error) {
      return "Invalid time";
    }
  }


  return (
    <Card className='border-emerald-900/20'>
      <CardHeader>
        <CardTitle className='text-xl font-bold text-white flex items-center'>
          <Clock className='mr-2 h-5 w-5 text-emerald-400' />
          Availability Settings
        </CardTitle>
        <CardDescription>
          Set your daily availability for patient appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showForm ? (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">Current Availability</h3>

              {slots.length === 0 ? (
                <p className="text-muted-foreground">No availability slots yet. Add your availability to start accepting appointments.</p>
              ) : (
                <div className="">
                  {slots.map((slot) => (
                    <div key={slot.id} className="flex items-center bg-muted/20 p-3 rounded-md mb-2 border border-emerald-900/20">
                      <div className="bg-emerald-900/20 p-2 rounded-full mr-3">
                        <Clock1 className="h-4 w-4 text-emerald-400" />
                      </div>

                      <div className="">
                        <p className='text-white font-medium'>
                          {formatTimeString(slot.startTime)} - {formatTimeString(slot.endTime)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={() => setShowForm(true)} className='w-full bg-emerald-600 hover:bg-emerald-700 text-white'>
              <Plus className='mr-2 h-4 w-4' />
              Set Availability
            </Button>
          </>
        ) : (
          <form className='space-y-4 border border-emerald-900/20 rounded-md p-4' onSubmit={handleSubmit(onSubmit)}>
            <h3 className='text-lg font-medium text-white mb-2 flex gap-2 items-center pb-4'>
              <Settings className='h-4 w-4 text-emerald-400' /> Set Daily Availability</h3>

            <div className="grid gird-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor='startTime'>Start Time</Label>
                <Input className='bg-background border-emerald-900/20' type='time' id='startTime' {...register('startTime', { required: "Start time is required" })} />
                {errors.startTime && <p className='text-red-500 text-sm'>{errors.startTime.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor='endTime'>End Time</Label>
                <Input className='bg-background border-emerald-900/20' type='time' id='endTime' {...register('endTime', { required: "End time is required" })} />
                {errors.endTime && <p className='text-red-500 text-sm'>{errors.endTime.message}</p>}
              </div>
            </div>

            <div className="flex justify-between space-x-3 pt-2">
              <Button className='border-emerald-900/30' type='button' variant={'outline'} onClick={() => setShowForm(false)} disabled={loading}>Cancel</Button>
              <Button className='bg-emerald-600 hover:bg-emerald-700 text-white' type='submit' disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...</>
                ) : (
                  "Save Availabity"
                )}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 bg-muted/10 border border-emerald-900/10 rounded-md">
          <h4 className='font-medium text-white mb-2 flex items-center'>
            <AlertCircle className='h-4 w-4 mr-2 text-emerald-400' />
            How Availability Works
          </h4>

          <p className='text-muted-foreground text-sm'>
            Settings your daily availability allows patients to book appointments during those hours.
            The same availability applies to all days. You can update your availability at any time,
            but existing booked appointments will not be affected.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default AvailabilitySettings