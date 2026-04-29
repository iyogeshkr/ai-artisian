import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Globe, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../../assets/hero.webp";

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-16 lg:pb-20 hero-pattern">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-6"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Empowering Indian Artisans with AI
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Blending Tradition with <span className="gradient-text">Innovation</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              AI Artisan gives India's 200 million artisans the tools to design for the world, sell without middlemen, and build a business that lasts — without losing what makes their work sacred.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button size="lg" className="group" asChild>
                <Link to="/onboard">
                  Start Selling
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/e-commerce">Explore Marketplace</Link>
              </Button>
            </div>

            <div className="flex items-center space-x-8 pt-6">
              <div className="flex flex-col">
                <span className="text-3xl font-bold">100+</span>
                <span className="text-muted-foreground text-sm">Artisans</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold">50+</span>
                <span className="text-muted-foreground text-sm">Craft Types</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold">3.2X</span>
                <span className="text-muted-foreground text-sm">Income lift</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="animated-border rounded-xl overflow-hidden shadow-xl">
              <img alt="Indian artisan working on traditional craft with modern technology" className="w-full h-auto rounded-xl" src={heroImage} />
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-3 max-w-[200px]">
              <div className="flex items-center space-x-2">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">स्मार्ट डिज़ाइन</span>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-3 max-w-[200px]">
              <div className="flex items-center space-x-2">
                <div className="bg-secondary/20 p-2 rounded-full">
                  <ShoppingBag className="h-5 w-5 text-secondary" />
                </div>
                <span className="font-medium">वैश्विक बिक्री</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
