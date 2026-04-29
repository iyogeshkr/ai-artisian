import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Globe, TrendingUp, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const EcommerceSection = () => {
  const ecommerceFeatures = [
    {
      icon: <Globe className="h-6 w-6 text-primary" />,
      title: "Global Reach",
      description: "Sell your handmade products to customers worldwide with integrated shipping solutions."
    },
    {
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: "Secure Payments",
      description: "Accept payments in multiple currencies with secure payment processing."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      title: "Market Insights",
      description: "Get data on trending products and customer preferences to boost your sales."
    },
    {
      icon: <ShoppingBag className="h-6 w-6 text-primary" />,
      title: "Inventory Management",
      description: "Easily manage your product inventory and track orders in real-time."
    }
  ];

  return (
    <section id="e-commerce" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="relative rounded-xl overflow-hidden shadow-xl animated-border">
              <img  alt="Indian artisan selling handmade products online" className="w-full h-auto" src="https://images.unsplash.com/photo-1680188700662-5b03bdcf3017" />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-white rounded-full p-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-medium">E-commerce Integration</p>
                    <p className="text-white/80 text-sm">Sell your crafts globally</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              <ShoppingBag className="h-4 w-4 mr-2" />
              E-commerce Integration
            </div>
            
            <h2 className="text-3xl font-bold mb-6">
              Take Your Crafts to the <span className="gradient-text">Global Market</span>
            </h2>
            
            <p className="text-muted-foreground mb-8">
              Our platform helps you list and sell your handmade products to customers worldwide. With integrated payment processing, shipping solutions, and marketing tools, you can focus on what you do best - creating beautiful crafts.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {ecommerceFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="bg-primary/10 p-3 rounded-full shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <Button size="lg" className="group" asChild>
              <Link to="/onboard">Start Selling <ShoppingBag className="ml-2 h-4 w-4" /></Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EcommerceSection;