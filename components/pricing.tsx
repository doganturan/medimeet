import React from 'react'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Check, Stethoscope } from 'lucide-react'
import { creditBenefits } from '@/lib/data'
import { PricingTable } from '@clerk/nextjs'

const Pricing = () => {
    return (

        <section className='py-20'>
            <div className="container mx-auto px-14">
                <div className="text-center mb-16 space-y-12">
                    <Badge variant={"outline"} className="bg-emerald-900/30 border-emerald-700/30 px-4 py-2 text-emerald-400 text-sm font-medium mb-4"> Affordable Healthcare </Badge>
                    <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>Consultation Packages</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Our platform connects patients with healthcare professionals seamlessly, ensuring you get the care you need when you need it.
                    </p>

                    <Card className='border-emerald-900/30 shadow-lg bg-gradient-to-b from-emerald-950/30 to-transparent'>
                        <CardContent className='p-6 md:p-8'>
                            <PricingTable checkoutProps={{
                                appearance: {
                                    elements: {
                                        drawerRoot: {
                                            zIndex: 200
                                        }
                                    }
                                }
                            }}/>
                        </CardContent>
                    </Card>
                </div>
                <div className="">
                    <Card className='mt-12 bg-muted/20 border-emerald-900/30'>
                        <CardHeader>
                            <CardTitle className='text-xl font-semibold text-white flex items-center'>
                                <Stethoscope className="mr-2 h-5 w-5 text-emerald-400" /> How Our Credit System Works
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className='space-y-3'>
                                {creditBenefits.map((benefit, index) => (
                                    <li key={index} className="flex items-center">
                                        <div className="mr-3 mt-1 bg-emerald-900/20 p-1 rounded-full">
                                            <Check className=" h-4 w-4 text-emerald-400" />
                                        </div>
                                        <p className='text-muted-foreground' dangerouslySetInnerHTML={{ __html: benefit }} />
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}

export default Pricing