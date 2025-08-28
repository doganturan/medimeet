import CallToAction from "@/components/call-to-action";
import Features from "@/components/features";
import Hero from "@/components/hero";
import Pricing from "@/components/pricing";
import Testimonials from "@/components/testimonials";
import { checkUser } from "@/lib/checkUser";

export default async function Home() {
  const user = await checkUser();

  return (
    <div className="bg-background">
      <Hero />
      <Features />
      {user?.role !== "DOCTOR" && <Pricing />}
      <Testimonials />
      <CallToAction />
    </div>
  );
}