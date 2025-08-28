import {
    Calendar,
    Video,
    CreditCard,
    User,
    FileText,
    ShieldCheck,
} from "lucide-react";

export const features = [
    {
        title: "Create Your Profile",
        description: "Sign up and complete your profile to get personalized healthcare recommendations and services.",
        icon: <User />
    },
    {
        title: "Book Appointments",
        description: "Browse doctor profiles, check availability, and book appointments that fit your schedule.",
        icon: <Calendar />
    },
    {
        title: "Video Consultation",
        description: "Connect with doctors through secure, high-quality video consultations from the comfort of your home.",
        icon: <Video />
    },
    {
        title: "Consultation Credits",
        description: "Purchase credit packages that fit your healthcare needs with our simple subscription model.",
        icon: <CreditCard />
    },
    {
        title: "Verified Doctors",
        description: "All healthcare providers are carefully vetted and verified to ensure quality care.",
        icon: <ShieldCheck />
    },
    {
        title: "Medical Documentation",
        description: "Access and manage your appointment history, doctor's notes, and medical recommendations.",
        icon: <FileText />
    }
];


export const testimonials = [
    {
        initials: "JD",
        name: "John Doe",
        role: "Software Engineer",
        quote: "MediMeet has transformed the way I access healthcare. The video consultations are seamless and the doctors are very professional."
    },
    {
        initials: "AS",
        name: "Alice Smith",
        role: "Graphic Designer",
        quote: "I love how easy it is to book appointments. The interface is user-friendly and the service is top-notch."
    },
    {
        initials: "MK",
        name: "Michael King",
        role: "Product Manager",
        quote: "The consultation credits system is fantastic. It makes managing healthcare costs so much easier."
    }
];


export const creditBenefits = [
    "Each consultation costs <strong class='text-emerald-400'>1 credit</strong>, making it easy to manage your healthcare expenses.",
    "Credits <strong class='text-emerald-400'>never expire</strong>, so you can use them whenever you need a consultation.",
    "Monthly subscription plans offer <strong class='text-emerald-400'>flexibility</strong> and <strong class='text-emerald-400'>savings</strong> on your healthcare costs.",
    "Purchase credits in <strong class='text-emerald-400'>various packages</strong> to suit your healthcare needs, from single consultations to bulk packages."
];