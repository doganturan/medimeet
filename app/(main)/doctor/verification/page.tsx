import { getCurrentUser } from '@/actions/onboarding'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Check, CheckCheck, ClipboardCheck, XCircle } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'

const DoctorVerificationPage = async () => {

  const user = await getCurrentUser();

  if (user?.verificationStatus === "VERIFIED") {
    redirect('/doctor');
  }

  const isRejected = user?.verificationStatus === "REJECTED";

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Card className='border-emerald-900/20'>
          <CardHeader className='text-center'>
            <div className={`mx-auto p-4 ${isRejected ? 'bg-red-900/20' : 'bg-amber-900/20'} rounded-full mb-4 w-fit`}>
              {isRejected ? (
                <XCircle className='h-8 w-8 text-red-400' />
              ) : (
                <ClipboardCheck className='h-8 w-8 text-amber-400' />
              )}
            </div>

            <CardTitle className='text-2xl font-bold text-white'>
              {isRejected ? 'Verification Declined' : 'Verification in Progress'}
            </CardTitle>

            <CardDescription>
              {isRejected ? (
                'Your verification has been declined. Please check your email for more details.'
              ) : (
                'Thank you for submitting your information.'
              )}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isRejected ? (
              <div className="bg-red-900/10 border border-red-900/20 rounded-lg p-4 mb-6 flex items-start">
                <AlertCircle className='h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0' />
                <div className="text-muted-foreground text-left">
                  <p className="mb-2">
                    Our administrative team has reviewed your application and found that it does not meet our current requirements. Common reasons for rejection include:
                  </p>

                  <ul className='list-disc pl-5 space-y-1 mb-3'>
                    <li>Incomplete or missing documentation</li>
                    <li>Inaccurate information provided</li>
                    <li>Failure to meet professional standards</li>
                    <li>Issues with your medical license or credentials</li>
                  </ul>

                  <p>You can update your application with more documentation or information to support your case.</p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-900/10 border border-amber-900/20 rounded-lg p-4 mb-6 flex items-start">
                <AlertCircle className='h-5 w-5 mt-0.5 text-amber-400 mr-3 flex-shrink-0' />
                <p className='text-muted-foreground text-left'>Your profile is currently under review by our administrative team. This process typically takes 3-5 business days. You will receive an email notification once the review is complete.</p>
              </div>
            )}

            <div className="bg-blue-900/10 border border-blue-900/20 rounded-lg p-4 mb-6 flex items-start">
              <CheckCheck className='h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0' />
              <p className="text-muted-foreground mb-6">
                {isRejected ? "You can update your profile and resubmit for verification." : `While you wait, you can familiarize yourself with our platform or reach out to our support team if you have any questions.`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className='bg-emerald-900 hover:bg-emerald-800 text-white border-emerald-900/30'>
                <Link href={"/"}>Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DoctorVerificationPage