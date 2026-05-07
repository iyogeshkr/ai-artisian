import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Globe, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: <Sparkles className="h-10 w-10 text-primary" />,
    title: "AI Design Assistant",
    description: "Generate modern design while preserving traditional techniques and culture.",
    delay: 0.1
  },
  {
    icon: <Globe className="h-10 w-10 text-primary" />,
    title: "Instant Setup",
    description: "Launch your online store in minutes—no tech needed.",
    delay: 0.2
  },
  {
    icon: <ShoppingBag className="h-10 w-10 text-primary" />,
    title: "Marketplace & Insights",
    description: "Reach customers worldwide while Knowing what sells and right price.",
    delay: 0.3
  },
];

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-4"
          >
            Powerful Features for <span className="gradient-text">Indian Artisans</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground"
          >
            Create designs, list products, setup store within minutes to sell your products globally.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants} custom={index}>
              <Card className="feature-card h-full">
                <CardHeader>
                  <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;