import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Show, SignUpButton } from "@clerk/react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 via-secondary/90 to-accent/90 p-8 text-white md:p-12"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          </div>
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">Ready to Transform Your Craft Business?</h2>
            <p className="mb-8 text-lg text-white/80">
              Join thousands of Indian artisans who are using AI Artisan to create modern designs, reach global markets, and adopt sustainable practices.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Show when="signed-in">
                <Button size="lg" className="group bg-white text-primary hover:bg-white/90" asChild>
                  <Link to="/artisan/onboarding">
                    Start Selling <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </Show>
              <Show when="signed-out">
                <SignUpButton mode="modal" forceRedirectUrl="/artisan/onboarding">
                  <Button size="lg" className="group bg-white text-primary hover:bg-white/90">
                    Get Started for Free <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </SignUpButton>
              </Show>
              <Button size="lg" className="border-2 border-white bg-white/20 font-semibold text-white hover:bg-white/30" asChild>
                <Link to="/e-commerce">Browse Products</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
