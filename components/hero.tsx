import Image from 'next/image'
import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import { Badge } from './ui/badge'
import { ArrowRight } from 'lucide-react'
import Banner from "@/public/banner.png"

const Hero = () => {
    return (
        <section className="relative overflow-hidden py-32">
            <div className="container mx-auto px-14">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <Badge variant={"outline"} className="bg-emerald-900/30 border-emerald-700/30 px-4 py-2 text-emerald-400 text-sm font-medium">
                            Healthcare made simple
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">Connect with doctors <br /> <span className="gradient-title">anytime, anywhere</span></h1>
                        <p className="text-lg md:text-xl max-w-md text-muted-foreground"> Book appointments with top doctors easily and securely.</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button asChild size={"lg"} className="bg-emerald-600 text-white hover:bg-emerald-700">
                                <Link href="/onboarding">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Link>
                            </Button>
                            <Button asChild size={"lg"} className="border-emerald-700/30 hover:bg-gray-300">
                                <Link href="/doctors">Find Doctors <ArrowRight className="ml-1 h-4 w-4" /></Link>
                            </Button>
                        </div>
                    </div>
                    <div className="relative h-[400px] lg:h-[500px] w-full rounded-xl overflow-hidden">
                        <Image
                            src={Banner}
                            alt="Hero Image"
                            fill
                            priority
                            className="object-cover rounded-xl"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero