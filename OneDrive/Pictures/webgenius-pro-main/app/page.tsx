import Header from '@/app/components/sections/Header';
import Hero from '@/app/components/sections/Hero';
import Services from '@/app/components/sections/Services';
import Deals from '@/app/components/sections/Deals';
import SuccessStories from '@/app/components/sections/SuccessStories';
import Pricing from '@/app/components/sections/Pricing';
import Team from '@/app/components/sections/Team';
import Process from '@/app/components/sections/Process';
import Testimonials from '@/app/components/sections/Testimonials';
import OrderForm from '@/app/components/sections/OrderForm';
import Contact from '@/app/components/sections/Contact';
import Footer from '@/app/components/sections/Footer';

export default function Home() {
    return (
        <>
            <Header />
            <main className="min-h-screen">
                <Hero />
                <Services />
                <Deals />
                <Team />
                <Pricing />
                <Process />
                <Testimonials />
                <SuccessStories />
                <OrderForm />
                <Contact />
            </main>
            <Footer />
        </>
    );
}
