import React from "react";
import { motion } from "framer-motion";
import { Leaf, Recycle, Droplet, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const EcoFriendly = () => {
  const ecoFeatures = [
    {
      icon: <Recycle className="h-10 w-10 text-accent" />,
      title: "Sustainable Materials",
      description: "Recommendations for eco-friendly materials that maintain quality and reduce environmental impact."
    },
    {
      icon: <Droplet className="h-10 w-10 text-accent" />,
      title: "Water Conservation",
      description: "Techniques to minimize water usage in traditional dyeing and production processes."
    },
    {
      icon: <Sun className="h-10 w-10 text-accent" />,
      title: "Energy Efficiency",
      description: "Guidance on reducing energy consumption in your workshop and production methods."
    }
  ];

  return (
    <section id="eco-friendly" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4"
          >
            <Leaf className="h-4 w-4 mr-2" />
            Eco-Friendly Guidance
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-bold mb-4"
          >
            Craft with <span className="text-accent">Sustainability</span> in Mind
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground"
          >
            Our platform provides guidance on eco-friendly materials and sustainable production methods that help preserve the environment while maintaining the quality and authenticity of your crafts.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 gap-8">
              {ecoFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-accent/10 p-3 rounded-full shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Explore Eco-Friendly Practices
                <Leaf className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative rounded-xl overflow-hidden shadow-xl">
              <img  alt="Artisan using eco-friendly materials and sustainable practices" className="w-full h-auto" src="https://images.unsplash.com/flagged/photo-1567056746593-0f538ff7d065" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-xl font-medium mb-2">Natural Dyes Workshop</h3>
                  <p className="text-sm text-white/80">
                    Learn how to create vibrant colors using plant-based dyes that are environmentally friendly and safe.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="rounded-xl overflow-hidden shadow-md">
                <img  alt="Recycled materials being used in crafts" className="w-full h-auto" src="https://images.unsplash.com/photo-1695157163401-8a5c4f34ecd2" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-md">
                <img  alt="Solar powered workshop for artisans" className="w-full h-auto" src="https://images.unsplash.com/photo-1616672413071-3aecd1513fd6" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EcoFriendly;