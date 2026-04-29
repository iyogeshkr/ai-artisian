import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, TrendingDown, Zap, Globe, DollarSign, Users, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const problems = [
  {
    icon: <Globe className="h-10 w-10 text-destructive" />,
    title: "Outdated Design",
    description: "Hard to match modern design with custom  demand.",
    delay: 0.1
  },
  {
    icon: <Palette className="h-10 w-10 text-destructive" />,
    title: "Low income & Middlemen",
    description: "Artisans earn less than ₹8,000/month, Middlemen taking most of the profit.",
    delay: 0.2
  },
  {
    icon: <DollarSign className="h-10 w-10 text-destructive" />,
    title: "High Setup Costs",
    description: "Expensive e-commerce setup and limited resources.",
    delay: 0.3
  },
];

const ProblemFaced = () => {
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
    <section id="problems" className="py-20 bg-destructive/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-4"
          >
            Problems <span className="text-destructive">Indian Artisans Face</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground"
          >
            The Talent Exists. The Opportunity Doesn’t.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {problems.map((problem, index) => (
            <motion.div key={index} variants={itemVariants} custom={index}>
              <Card className="feature-card h-full border-destructive/20 hover:border-destructive/50">
                <CardHeader>
                  <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10">
                    {problem.icon}
                  </div>
                  <CardTitle>{problem.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{problem.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemFaced;
