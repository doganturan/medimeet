import { AppUser } from '@/types/user'
import React from 'react'
import { Card, CardContent } from './ui/card'
import { Calendar, Star, Stethoscope, User } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import Link from 'next/link'
import { Separator } from './ui/separator'

const DoctorCard = ({ doctor }: { doctor: AppUser }) => {
    return (
        <Card className='border-emerald-900/20 hover:border-emerald-700/40 transition-all'>
            <CardContent className=''>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                        {doctor.imageUrl ? (
                            <img src={doctor.imageUrl} alt={doctor.name || "Doctor Image"} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                            <User className="w-6 h-6 text-emerald-400" />
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ">
                            <h3 className='font-medium text-white text-xl'>{doctor.name}</h3>
                            <Badge variant={"outline"} className='bg-emerald-900/20 border-emerald-900/30 text-emerald-400 flex items-start'>
                                <Star className='!w-3 !h-3 ' />
                                Verified
                            </Badge>
                        </div>


                        <p className="text-sm text-muted-foreground my-1 ">
                            {doctor.speciality} - {doctor.experience} years of experience
                        </p>

                        <Separator className='my-2' />

                        <div className="mt-4 line-clamp-2 text-sm text-muted-foreground mb-4 flex items-center ">
                            <Stethoscope className="w-4 h-4 mr-1"/>
                            {doctor.description}
                        </div>

                        <Button asChild className='w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-2'>
                            <Link href={`/doctors/${doctor.speciality}/${doctor.id}`}>
                                <Calendar className='w-4 h-4 mr-2' />
                                View Profile & Book
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default DoctorCard