import { Badge } from '@/components/ui/badge'
import { PricingTable } from '@clerk/nextjs'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const PricingPage = () => {
    return (
        <div className='container mx-auto py-12 px-4'>
            <div className="flex justify-start mb-2">
                <Link className='flex items-center text-muted-foreground hover:text-white transition-colors' href={"/"}>
                    <ArrowLeft className='h-4 w-4 mr-2' /> Back to Home
                </Link>
            </div>

            <div className="max-w-full mx-auto mb-12 text-center">
                <Badge variant={"outline"} className="bg-emerald-900/30 border-emerald-700/30 px-4 py-2 mb-2 text-emerald-400 text-sm font-medium">
                    Affordable Healthcare
                </Badge>

                <h1 className="text-4xl md:text-5xl font-bold  mb-4">Simple, Transparent Pricing</h1>

                <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                    Choose the plan that fits your needs. No hidden fees, no surprises. Our pricing is designed to be straightforward and affordable for everyone.
                </p>
            </div>

            <PricingTable />

            <div className="max-w-3xl mx-auto mt-16 text-center">
                <h2 className='text-muted-foreground mb-4'>Questions? We're here to Help</h2>
                <p className='text-muted-foreground mb-4'>Contact our support team at <span className='text-white '>support@medimeet.com</span></p>
            </div>
        </div>
    )
}

export default PricingPage