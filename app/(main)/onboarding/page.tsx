"use client"

import React, { useEffect, useState } from 'react'
import { z } from "zod"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BatteryWarningIcon, Loader, Stethoscope, User } from 'lucide-react';
import { useFetch } from '@/hooks/use-fetch';
import { setUserRole } from '@/actions/onboarding';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SPECIALITIES } from '@/lib/specialities';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const doctorFormSchema = z.object({
    speciality: z.string().min(1, "Speciality is required"),
    experience: z.number().min(1, "Experience must be at least 1 year").max(50, "Experience cannot exceed 50 years"),
    credentialUrl: z.string().url("Invalid URL format").min(1, "Credential URL is required"),
    description: z.string().min(20, "Description must be at least 20 characters long").max(500, "Description cannot exceed 500 characters"),
})

const OnboardingPage = () => {

    const [step, setStep] = useState("choose-role");
    const router = useRouter();

    const { data, fn: submitUserRole, loading } = useFetch(setUserRole)

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        resolver: zodResolver(doctorFormSchema),
        defaultValues: {
            speciality: "",
            experience: undefined,
            credentialUrl: "",
            description: ""
        }
    });

    const specialityValue = watch("speciality");

    const handlePatientSelection = async () => {
        if (loading) return;

        const formData = new FormData();
        formData.append("role", "PATIENT");

        await submitUserRole(formData);
    }

    useEffect(() => {
        if (data && data?.success) {
            toast.success("Profile updated successfully");
            router.push(data.redirect as string || "/");
        }
    }, [data])

    const onDoctorSubmit = async (data: z.infer<typeof doctorFormSchema>) => {
        if (loading) return;

        const formData = new FormData();
        formData.append("role", "DOCTOR");
        formData.append("speciality", data.speciality);
        formData.append("experience", data.experience.toString());
        formData.append("credentialUrl", data.credentialUrl);
        formData.append("description", data.description);

        await submitUserRole(formData);
    }

    if (step === "choose-role") {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className='border-emerald-900/20 hover:border-emerald-700/40 transition-all'>
                    <CardContent className='py-6 flex flex-col items-center text-center'>
                        <div className="p-4 bg-emerald-900/20 rounded-full mb-4">
                            <User className="h-8 w-8 text-emerald-400" />
                        </div>
                        <CardTitle className='text-xl font-semibold text-white mb-2'>Join as a Patient</CardTitle>
                        <CardDescription className='mb-4'>As a patient, you can book appointments and manage your healthcare journey</CardDescription>
                        <Button className='w-full bg-emerald-600 hover:bg-emerald-700 text-white' disabled={loading} onClick={() => !loading && handlePatientSelection()}>
                            {loading ? <><Loader className='mr-2 h-4 w-4 animate-spin' /> Processing</> : "Continue as a Patient"}
                        </Button>
                    </CardContent>
                </Card>

                <Card className='border-emerald-900/20 hover:border-emerald-700/40 transition-all'>
                    <CardContent className='py-6 flex flex-col items-center text-center'>
                        <div className="p-4 bg-emerald-900/20 rounded-full mb-4">
                            <Stethoscope className="h-8 w-8 text-emerald-400" />
                        </div>
                        <CardTitle className='text-xl font-semibold text-white mb-2'>Join as a Doctor   </CardTitle>
                        <CardDescription className='mb-4'> Create your professional profile, set your availability, and provide consultations</CardDescription>
                        <Button className='w-full bg-emerald-600 hover:bg-emerald-700 text-white' disabled={loading} onClick={() => !loading && setStep("doctor-form")}>Continue as a Doctor</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (step === "doctor-form") {
        return (
            <Card className='border-emerald-900/20'>
                <CardContent className='py-6'>
                    <div className="mb-6">
                        <CardTitle className='text-2xl font-bold text-white mb-2'>Complete Your Doctor Profile</CardTitle>
                        <CardDescription> Create your professional profile, set your availability, and provide consultations</CardDescription>
                    </div>

                    <form className='space-y-6 md:space-y-10' onSubmit={handleSubmit(onDoctorSubmit)}>
                        <div className="space-y-2">
                            <Label htmlFor='speciality' className=''>Medical Speciality</Label>
                            <Select value={specialityValue} onValueChange={(value) => setValue("speciality", value)}>
                                <SelectTrigger className='w-full' id='speciality'>
                                    <SelectValue placeholder="Select a speciality" />
                                </SelectTrigger>

                                <SelectContent>
                                    {
                                        SPECIALITIES.map((speciality) => (
                                            <SelectItem key={speciality.name} value={speciality.name}>
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-emerald-400'>{speciality.icon}</span>
                                                    {speciality.name}
                                                </div>
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                            {errors.speciality && <p className='text-red-500 text-sm mt-1 font-medium'>{errors.speciality.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor='experience' className=''>Years of Experience</Label>
                            <Input id='experience' type='number' placeholder='eg. 5' {...register("experience", { valueAsNumber: true })} />
                            {errors.experience && <p className='text-red-500 text-sm mt-1 font-medium'>{errors.experience.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor='credentialUrl' className=''>Credential URL</Label>
                            <Input id='credentialUrl' type='url' placeholder='eg. https://your-credential-url.com' {...register("credentialUrl")} />
                            {errors.credentialUrl && <p className='text-red-500 text-sm mt-1 font-medium'>{errors.credentialUrl.message}</p>}
                            <p className='text-sm text-muted-foreground flex items-center gap-2'><BatteryWarningIcon className='text-muted-foreground h-5 w-5' />  Please provide a link to your medical degree or certification</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor='description' className=''>Description of Your Services</Label>
                            <Textarea id='description' placeholder='Describe your expertise, services and approach to patient care' rows={4} {...register("description")} />
                            {errors.description && <p className='text-red-500 text-sm mt-1 font-medium'>{errors.description.message}</p>}
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <Button className='border-emerald-900/30' disabled={loading} type='button' variant='outline' onClick={() => setStep("choose-role")}>Back</Button>

                            <Button type='submit' disabled={loading} className='bg-emerald-600 hover:bg-emerald-700 text-white ml-4'>
                                {loading ? <><Loader className='mr-2 h-4 w-4 animate-spin' /> Submitting...</> : "Submit for Verification"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        )
    }
}

export default OnboardingPage