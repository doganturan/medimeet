"use client";

import { generateVideoToken } from '@/actions/appointments'
import { addAppointmentNotes, cancelAppointment, markAppointmentCompleted } from '@/actions/doctor'
import { useFetch } from '@/hooks/use-fetch'
import { Ban, Calendar, Check, Clock, Edit, Loader2, Stethoscope, User, Video } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from './ui/card'
import { format, set } from 'date-fns'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import ConfirmDialog from './confirm-dialog'
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from './ui/separator';
import { useRouter } from 'next/navigation';
import { Textarea } from './ui/textarea';
import { Appointment } from '@/types/appointment';

type Action = 'cancel' | 'notes' | 'video' | 'complete'

const AppointmentCard = ({ appointment, userRole }: { appointment: Appointment, userRole: string }) => {
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false)
    const [detailsOpen, setDetailsOpen] = useState<boolean>(false)
    const [action, setAction] = useState<Action | null>(null)
    const [notes, setNotes] = useState<string>(appointment.notes || '')
    const router = useRouter();

    const { loading: cancelLoading, fn: submitCancel, data: cancelData } = useFetch(cancelAppointment);
    const { loading: notesLoading, fn: submitNotes, data: notesData } = useFetch(addAppointmentNotes);
    const { loading: tokenLoading, fn: submitTokenRequest, data: tokenData } = useFetch(generateVideoToken);
    const { loading: completeLoading, fn: submitMarkCompleted, data: completeData } = useFetch(markAppointmentCompleted);

    const otherPartyLabel = userRole === "DOCTOR" ? appointment.patient : appointment.doctor
    const otherPartyIcon = userRole === "DOCTOR" ? <User /> : <Stethoscope />

    const formatDateTime = (dateString: Date): string => {
        try {
            return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a")
        } catch (error) {
            return "Invalid date"
        }
    }

    const canMarkCompleted = () => {
        if (userRole !== "DOCTOR" || appointment.status !== "SCHEDULED") {
            return false
        }
        const now = new Date()
        const appointmentEndTime = new Date(appointment.endTime)
        return now >= appointmentEndTime
    }

    const handleMarkComplete = async () => {
        if (completeLoading) return
        const formData = new FormData()
        formData.append("appointmentId", appointment.id)
        await submitMarkCompleted(formData)
        setConfirmOpen(false)
    }

    const isAppointmentActive = (): boolean => {
        const now = new Date()
        const appointmentTime = new Date(appointment.startTime)
        const appointmentEndTime = new Date(appointment.endTime)

        // Con join 30 minutes before start until end time
        return (
            (appointmentTime.getTime() - now.getTime() <= 30 * 60 * 1000 && now < appointmentTime) || (now >= appointmentTime && now <= appointmentEndTime)
        )
    }

    const handleJoinVideoCall = async () => {
        if (tokenLoading) return;
        setAction("video");

        const formData = new FormData();
        formData.append("appointmentId", appointment.id);
        await submitTokenRequest(formData);
    }

    const handleSaveNotes = async () => {
        if (notesLoading || userRole !== "DOCTOR") return;

        const formData = new FormData();
        formData.append("appointmentId", appointment.id);
        formData.append("notes", notes);
        await submitNotes(formData);
    }

    const handleCancelAppointment = async () => {
        if (cancelLoading) return
        const formData = new FormData()
        formData.append("appointmentId", appointment.id)
        await submitCancel(formData)
        setConfirmOpen(false)
    }

    // Use Effects ****

    useEffect(() => {
        if (cancelData?.success) {
            toast.success("Appointment cancelled successfully.")
            setConfirmOpen(false)
        }
    }, [cancelData])

    useEffect(() => {
        if (completeData?.success) {
            toast.success("Appointment marked as completed.")
            setConfirmOpen(false)
        }
    }, [completeData])

    useEffect(() => {
        if (tokenData?.token) {
            router.push(`/video-call?sessionId=${tokenData.videoSessionId}&token=${tokenData.token}&appointmentId=${appointment.id}`)
        }
    }, [tokenData, appointment.id])

    useEffect(() => {
        if (notesData?.success) {
            toast.success("Notes saved successfully.");
            setAction(null);
        }
    }, [notesData])

    return (
        <>
            <Card className='border-gray-600 hover:border-gray-700 transition-all'>
                <CardContent className='p-4'>
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div className="flex items-center gap-3">

                            <div className=" p-2 mt-1 flex flex-col items-center gap-3">

                                {otherPartyIcon}
                                <Badge
                                    variant={'outline'}
                                    className={
                                        appointment.status === "COMPLETED"
                                            ? "bg-emerald-900/20 border-emerald-900/30 text-emerald-400 self-start"
                                            : appointment.status === "CANCELLED"
                                                ? "bg-red-900/20 border-red-900/30 text-red-400 self-start"
                                                : "bg-amber-900/20 border-amber-900/30 text-amber-400 self-start"
                                    }
                                >
                                    {appointment.status}
                                </Badge>
                            </div>

                            <div>
                                <h3 className='font-medium text-white'>
                                    {userRole === "DOCTOR" ? otherPartyLabel.name : `Dr.${otherPartyLabel.name}`}
                                </h3>
                                {userRole === "DOCTOR" && (
                                    <p className="text-sm text-muted-foreground">{otherPartyLabel.email}</p>
                                )}
                                {userRole === "PATIENT" && (
                                    <p className="text-sm text-muted-foreground">{otherPartyLabel.speciality}</p>
                                )}

                                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                                    <Calendar className='h-4 w-4 mr-2' />
                                    <span>{formatDateTime(appointment.startTime).split("at")[0]}</span>
                                </div>

                                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                    <Clock className='h-4 w-4 mr-2' />
                                    <span>
                                        {formatDateTime(appointment.startTime).split("at")[1]} -{" "}
                                        {formatDateTime(appointment.endTime).split("at")[1]}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                            {canMarkCompleted() && (
                                <Button
                                    className='bg-emerald-600 hover:bg-emerald-700 text-white'
                                    size={'sm'}
                                    onClick={() => {
                                        setAction("complete")
                                        setConfirmOpen(true)
                                    }}
                                    disabled={completeLoading}
                                >
                                    <Check className='h-4 w-4' />
                                    Complete
                                </Button>
                            )}

                            <Button
                                size={'sm'}
                                variant={'outline'}
                                className='border-emerald-900/30'
                                onClick={() => setDetailsOpen(true)} // ✅ details için ayrı
                            >
                                View Details
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ✅ Confirm Dialog */}
            <ConfirmDialog
                open={confirmOpen && action === "complete"}
                onOpenChange={setConfirmOpen}
                title="Mark as Completed?"
                description="Are you sure you want to mark this appointment as completed?"
                confirmText="Yes, complete"
                cancelText="Cancel"
                onConfirm={handleMarkComplete}
                onCancel={() => setConfirmOpen(false)}
                loading={completeLoading}
            />

            <ConfirmDialog
                open={confirmOpen && action === "cancel"}
                onOpenChange={setConfirmOpen}
                title="Cancel Appointment?"
                description="Are you sure you want to cancel this appointment?"
                confirmText="Yes, cancel"
                cancelText="No, keep it"
                onConfirm={handleCancelAppointment}
                onCancel={() => setConfirmOpen(false)}
                loading={cancelLoading}
            />

            {/* ✅ Appointment Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='text-xl font-bold text-white'>Appointment Details</DialogTitle>
                        <DialogDescription>
                            {appointment.status === "SCHEDULED" ? "Manage your upcoming appointment" : "View appointment information"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <h4 className="text-sm text-muted-foreground">{otherPartyLabel.role === "DOCTOR" ? "Doctor" : "Patient"}</h4>
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 text-emerald-400 mr-2">
                                {otherPartyIcon}
                            </div>
                            <div className="">
                                <p className='text-white font-medium'>
                                    {userRole === "DOCTOR" ? otherPartyLabel.name : `Dr.${otherPartyLabel.name} - ${otherPartyLabel.speciality}`}
                                </p>
                                {userRole === "DOCTOR" && (
                                    <p className="text-sm text-muted-foreground">{otherPartyLabel.email}</p>
                                )}
                                {userRole === "PATIENT" && (
                                    <p className="text-sm text-muted-foreground">{otherPartyLabel.speciality}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h4 className="text-sm text-muted-foreground">Scheduled Time</h4>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center">
                                <Calendar className="h-5 w-5 text-emerald-400 mr-2" />
                                <p className="text-white">{formatDateTime(appointment.startTime).split("at")[0]}</p>
                            </div>
                            <div className="flex items-center">
                                <Clock className="h-5 w-5 text-emerald-400 mr-2" />
                                <p className="text-white">{formatDateTime(appointment.endTime).split("at")[1]}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h4 className="text-sm text-muted-foreground">Status</h4>
                        <Badge
                            variant={'outline'}
                            className={
                                appointment.status === "COMPLETED"
                                    ? "bg-emerald-900/20 border-emerald-900/30 text-emerald-400"
                                    : appointment.status === "CANCELLED"
                                        ? "bg-red-900/20 border-red-900/30 text-red-400"
                                        : "bg-amber-900/20 border-amber-900/30 text-amber-400"
                            }>
                            {appointment.status}
                        </Badge>
                    </div>

                    {appointment.patientDescription && (
                        <div className="space-y-2">
                            <h4 className='text-sm font-medium text-muted-foreground'>{userRole === "DOCTOR" ? "Patient Description" : "Your Notes"}</h4>
                            <div className="p-3 rounded-md bg-muted/20 border border-emerald-900/20">
                                <p className="text-white whitespace-pre-line">{appointment.patientDescription}</p>
                            </div>
                        </div>
                    )}

                    {appointment.status === "SCHEDULED" && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Video Consultation</h4>
                            <Button className='w-full bg-emerald-600 hover:bg-emerald-700 text-white' disabled={!isAppointmentActive() || action === "video" || tokenLoading} onClick={handleJoinVideoCall}>
                                {tokenLoading || action === "video" ? (
                                    <>
                                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                        Preparing Video Call...
                                    </>
                                ) : (
                                    <>
                                        <Video className='h-4 w-4 mr-2' />
                                        {isAppointmentActive() ? "Join Video Call" : "Video call will be available 30 minutes before the appointment."}
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-muted-foreground">Doctor Notes</h4>
                            {userRole === "DOCTOR" && action !== "notes" && appointment.status !== "CANCELLED" && <Button variant={'ghost'} size={'sm'} onClick={() => setAction("notes")} disabled={notesLoading} className='h-7 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20'>
                                {notesLoading ? (
                                    <>
                                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Edit className='h-4 w-4 mr-1' />
                                        {appointment.notes ? "Edit" : "Add"} Notes
                                    </>
                                )}
                            </Button>
                            }
                        </div>

                        {userRole === "DOCTOR" && action === "notes" ?
                            <div className="space-y-3">
                                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder='Enter your clinical notes here...' className='bg-background border-gray-700 min-h-[100px]' />
                                <div className="flex justify-end space-y-2 gap-2">
                                    <Button type='button' variant={'outline'} size={'sm'} onClick={() => {
                                        setAction(null)
                                        setNotes(appointment.notes || "")
                                    }} disabled={notesLoading} className='border-emerald-900/30'>Cancel</Button>

                                    <Button size={'sm'} onClick={() => {
                                        setAction(null)
                                        setNotes(appointment.notes || "")
                                        handleSaveNotes()
                                    }} disabled={notesLoading} className='bg-emerald-600 hover:bg-emerald-700 text-white'>
                                        {notesLoading ?
                                            <>
                                                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                                Saving...
                                            </>
                                            : "Save Notes"
                                        }
                                    </Button>
                                </div>
                            </div>
                            :
                            <div className="p-3 rounded-md bg-muted/20 border border-emerald-900/20 min-h-[80px]">
                                {appointment.notes ? (
                                    <p className='text-white whitespace-pre-line'>{appointment.notes}</p>
                                ) : (
                                    <p className='italic text-muted-foreground'>No notes added yet</p>
                                )}
                            </div>
                        }
                    </div>

                    <DialogFooter className='flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2'>
                        {appointment.status === "SCHEDULED" && (
                            <Button
                                className='bg-red-600 hover:bg-red-700 text-white'
                                size={'sm'}
                                onClick={() => {
                                    setAction("cancel")
                                    setConfirmOpen(true)
                                }}
                                disabled={cancelLoading}
                            >
                                <Ban className='h-4 w-4' />
                                Cancel Appointment
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default AppointmentCard
