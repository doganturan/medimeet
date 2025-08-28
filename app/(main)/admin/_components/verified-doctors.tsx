"use client"

import { updateDoctorActiveStatus } from '@/actions/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useFetch } from '@/hooks/use-fetch'
import { AppUser } from '@/types/user'
import { Ban, Loader2, Search, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

const VerifiedDoctors = ({ doctors }: { doctors: AppUser[] }) => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [targetDoctor, setTargetDoctor] = useState<AppUser | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<AppUser | null>(null)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const { loading, data, fn: submitStatusUpdate } = useFetch(updateDoctorActiveStatus)

  const filteredDoctors = doctors.filter((doctor: AppUser) => {
    const query = searchTerm.toLowerCase()
    return (
      doctor.name?.toLowerCase().includes(query) ||
      doctor.speciality?.toLowerCase().includes(query) ||
      doctor.email?.toLowerCase().includes(query)
    )
  })

  const handleStatusChange = (doctor: AppUser) => {
    setSelectedDoctor(doctor)
    setOpenConfirmDialog(true)
  }

  const onConfirmSuspend = async () => {
    if (!selectedDoctor || loading) return

    const formData = new FormData()
    formData.append('doctorId', selectedDoctor.id)
    formData.append('suspend', "true")

    setTargetDoctor(selectedDoctor)
    await submitStatusUpdate(formData)
    setOpenConfirmDialog(false)
  }

  useEffect(() => {
    if (data && targetDoctor) {
      toast.success(`Doctor ${targetDoctor.name} suspended successfully!`, {
        duration: 3000
      })
      setTargetDoctor(null)
    }
  }, [data, targetDoctor])

  return (
    <div>
      <Card className='bg-muted/20'>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle className='text-xl font-bold text-white'>Manage Doctors</CardTitle>
              <CardDescription>View and manage all verified doctors</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder='Search doctors...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-8 bg-background border-emerald-900/20'
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No doctors match your search criteria." : "No verified doctors found."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDoctors.map(doctor => (
                <Card key={doctor.id} className='bg-background border-emerald-900/20 hover:border-emerald-700/30 py-2 transition-all'>
                  <CardContent className='p-4'>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted/20 rounded-full p-2">
                          <User className='w-5 h-5 text-emerald-400' />
                        </div>

                        <div>
                          <h3 className='font-medium text-white'>{doctor.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {doctor.speciality} · {doctor.experience} years experience
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <Badge variant="outline" className='bg-emerald-900/20 border-emerald-900/30 text-emerald-400'>Active</Badge>
                        <Button
                          onClick={() => handleStatusChange(doctor)}
                          size="sm"
                          variant="outline"
                          className='border-red-900/30 hover:bg-red-900/10'
                        >
                          <Ban className='h-4 w-4 mr-1' />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ Confirm Suspension Dialog */}
      <Dialog open={openConfirmDialog} onOpenChange={setOpenConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Suspension</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend <strong>Dr. {selectedDoctor?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={() => setOpenConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmSuspend}
              disabled={loading}
            >
              {loading && targetDoctor?.id === selectedDoctor?.id ? (
                <Loader2 className='w-4 h-4 animate-spin mr-2' />
              ) : (
                <Ban className='w-4 h-4 mr-2' />
              )}
              Suspend
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VerifiedDoctors
