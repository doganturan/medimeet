import React from 'react'
import { features } from '@/lib/data.js'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const Features = () => {
    return (
        <section className='py-20 bg-muted/40'>
            <div className="container mx-auto px-14">
                <div className="text-center mb-16">
                    <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>How it works</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Our platform connects patients with healthcare professionals seamlessly, ensuring you get the care you need when you need it.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card className='border-emerald-900/20 hover:border-emerald-800/40 transition-all duration-300' key={index}>
                            <CardHeader className='pb-2'>
                                <div className="bg-emerald-700/20 p-3 rounded-lg w-fit mb-4"> {feature.icon} </div>
                                <CardTitle className='text-xl font-semibold text-white'>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-muted-foreground'>{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Features