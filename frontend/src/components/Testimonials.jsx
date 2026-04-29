import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Rajesh Kumar",
    location: "Jaipur, Rajasthan",
    craft: "Blue Pottery",
    quote: "AI Artisan helped me blend traditional blue pottery techniques with modern designs. My sales have increased by 40% since I started using the platform.",
    rating: 5,
    initials: "RK"
  },
  {
    name: "Meena Devi",
    location: "Kutch, Gujarat",
    craft: "Embroidery",
    quote: "The multilingual support made it easy for me to use the platform in Gujarati. I can now sell my embroidery work to customers around the world.",
    rating: 5,
    initials: "MD"
  },
  {
    name: "Anand Sharma",
    location: "Moradabad, UP",
    craft: "Brass Work",
    quote: "The eco-friendly guidance helped me switch to sustainable materials without compromising on quality. My customers appreciate the environmental consciousness.",
    rating: 4,
    initials: "AS"
  },
  {
    name: "Lakshmi Rao",
    location: "Pochampally, Telangana",
    craft: "Ikat Weaving",
    quote: "The AI design assistant gave me fresh ideas for my Ikat patterns while preserving the traditional techniques. It's the perfect blend of innovation and tradition.",
    rating: 5,
    initials: "LR"
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">
            Trusted by <span className="gradient-text">Artisans</span> Across India
          </h2>
          <p className="text-muted-foreground">
            Hear from artisans who have transformed their craft businesses using AI Artisan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-muted-foreground mb-6 italic">&quot;{testimonial.quote}&quot;</p>
              
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.craft} • {testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;