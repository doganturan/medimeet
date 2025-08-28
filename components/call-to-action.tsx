import React from 'react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import Link from 'next/link'

const CallToAction = () => {
    return (
        <section className='py-20'>
            <div className="container mx-auto px-14">
                <Card className='bg-gradient-to-r from-emerald-900/30 to-emerald-950/20 border-emerald-800/20'>
                    <CardContent className='p-8 md:p-12 lg:p-16 relative overflow-hidden'>
                        <div className="">
                            <h2 className='text-3xl md:text-4xl font-bold text-white mb-6'>
                                Ready to Experience Seamless <span className='text-emerald-500'>Healthcare?</span>
                            </h2>
                            <p className='text-lg text-muted-foreground mb-8'>
                                Join us today and take the first step towards a healthier future with our innovative healthcare solutions. Get started today and discover the convenience of managing your health with ease.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button asChild size={'lg'} className='bg-emerald-600 hover:bg-emerald-700 text-white'>
                                    <Link href="/signup">Get Started</Link>
                                </Button>
                                <Button asChild size={'lg'} className=''>
                                    <Link href="/pricing">View Pricing</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}

export default CallToAction