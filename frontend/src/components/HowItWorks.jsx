import React from "react";
import { motion } from "framer-motion";
import { Upload, Wand2, Store, ChevronRight } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Upload / Describe Product",
      description: "Share your handmade product details or upload a photo",
      icon: <Upload className="h-8 w-8" />,
    },
    {
      number: 2,
      title: "AI creates Design & Listing",
      description: "Our AI creates modern designs and product listings instantly",
      icon: <Wand2 className="h-8 w-8" />,
    },
    {
      number: 3,
      title: "Launch Store & Start Selling",
      description: "Go live with your online store and reach global customers",
      icon: <Store className="h-8 w-8" />,
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get your products online in just 3 simple steps
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <div key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Step Card */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow h-full">
                  {/* Step Number Badge */}
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white font-bold text-lg mb-4">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="text-primary mb-4">{step.icon}</div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-base">{step.description}</p>
                </div>
              </motion.div>

              {/* Arrow Connector (hidden on mobile, shown on md+) */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  className="hidden md:flex justify-center items-center"
                >
                  <div className="absolute -right-14 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary">
                    <ChevronRight className="h-5 w-5 text-white" />
                  </div>
                </motion.div>
              )}

              {/* Mobile Arrow (shown on mobile, hidden on md+) */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  className="md:hidden flex justify-center py-4"
                >
                  <ChevronRight className="h-6 w-6 text-primary rotate-90" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
