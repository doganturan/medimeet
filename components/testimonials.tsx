import React from 'react'
import { Badge } from './ui/badge'
import { testimonials } from '@/lib/data'
import { Card, CardContent } from './ui/card'

const Testimonials = () => {
    return (
        <section className='py-20'>
            <div className="container mx-auto px-14">
                <div className="text-center mb-16">
                    <Badge variant={"outline"} className="bg-emerald-900/30 border-emerald-700/30 px-4 py-2 text-emerald-400 text-sm font-medium mb-4"> Success Stories </Badge>
                    <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>What Our Users Say</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Hear from our satisfied users who have experienced the convenience and quality of our healthcare services.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {
                        testimonials.map((testimonial, index) => (
                            <Card className='border-emerald-900/20 hover:border-emerald-800/40 transition-all duration-300' key={index}>
                                <CardContent className=''>
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 rounded-full bg-emerald-900/50 flex items-center justify-center mr-4">
                                            <span className='text-emerald-400 font-bold'>{testimonial.initials}</span>
                                        </div>
                                        <div className="">
                                            <h4 className='font-semibold text-white'>{testimonial.name}</h4>
                                            <p className='text-sm text-muted-foreground'>{testimonial.role}</p>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground"> &quot;{testimonial.quote}&quot; </p>
                                </CardContent>
                            </Card>
                        ))
                    }
                </div>
            </div>
        </section>
    )
}

export default Testimonials