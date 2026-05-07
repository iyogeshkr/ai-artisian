import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

const CallToAction = () => {
  const { user } = useAuth();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-primary/90 via-secondary/90 to-accent/90 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Craft Business?</h2>
            <p className="text-white/80 text-lg mb-8">
              Join thousands of Indian artisans who are using AI Artisan to create modern designs, reach global markets, and adopt sustainable practices.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {user ? (
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 group" asChild>
                  <Link to="/artisan/onboarding">
                    Start Selling <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 group" asChild>
                  <Link to="/signup?role=artisan">
                    Get Started for Free <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              )}
              <Button size="lg" className="border-2 border-white bg-white/20 text-white hover:bg-white/30 font-semibold" asChild>
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

