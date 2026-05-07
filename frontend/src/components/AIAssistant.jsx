import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImagePreviewPanel from "@/components/ai/ImagePreviewPanel";
import { Link } from "react-router-dom";

const AIAssistant = ({ embedded = false }) => {
  const [activeTab, setActiveTab] = useState("preview");

  return (
    <section id="ai-assistant" className={embedded ? "" : "py-20"}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Design Assistant
            </div>
            <h2 className="mb-6 text-3xl font-bold">
              <span className="gradient-text">Design Better Products with AI</span>
            </h2>
            <p className="mb-8 text-muted-foreground">
              Describe your idea and get ready-to-sell designs instantly.
            </p>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/artisan/dashboard">
                  Try AI Design (Register as artisan)
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ImagePreviewPanel
              activeTab={activeTab}
              generatedDesign={null}
              isGenerating={false}
              onDownload={() => {}}
              onSelect={() => {}}
              onRetry={() => {}}
              onTabChange={setActiveTab}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;

