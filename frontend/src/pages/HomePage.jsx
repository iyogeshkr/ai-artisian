import React from "react";
import Hero from "@/components/Hero";
import ProblemFaced from "@/components/ProblemFaced";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import AIAssistant from "@/components/AIAssistant";
import DiscoverHandmadeProducts from "@/components/DiscoverHandmadeProducts";
import EcommerceSection from "@/components/EcommerceSection";
// import EcoFriendly from "@/components/EcoFriendly";
import Testimonials from "@/components/Testimonials";
import CallToAction from "@/components/CallToAction";

const HomePage = () => {
    return (
        <>
            <Hero />
            <ProblemFaced />
            <Features />
            <AIAssistant />
            <HowItWorks />
            <DiscoverHandmadeProducts />
            <EcommerceSection />
            {/* <EcoFriendly /> */}
            <Testimonials />
            <CallToAction />
        </>
    );
};

export default HomePage;
