import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ecommerce/ProductCard";
import { ALL_PRODUCTS, CATEGORIES } from "@/data/products";

const DiscoverHandmadeProducts = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Get unique categories from products and filter to meaningful ones
  const displayCategories = ["All", "Madhubani", "Textiles", "Pottery", "Home Decor", "Fashion", "Jewellery", "Craft"];

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") {
      return ALL_PRODUCTS.slice(0, 12); // show more products for compact grid
    }
    return ALL_PRODUCTS.filter((product) => product.category === selectedCategory).slice(0, 12);
  }, [selectedCategory]);

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
    <section id="discover" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-4"
          >
            Discover <span className="gradient-text">Handmade Products</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground"
          >
            Explore authentic, handcrafted products made by artisans from across India.
          </motion.p>
        </div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="sticky top-16 z-20 bg-white/60 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3">
            <div className="overflow-x-auto no-scrollbar">
              <div className="inline-flex items-center space-x-2">
                {displayCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`inline-block whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Product Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8"
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <motion.div key={product.id} variants={itemVariants} custom={index}>
                <ProductCard product={product} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          )}
        </motion.div>

        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={() => navigate("/e-commerce")}
            className="px-8"
          >
            Browse Full Marketplace
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default DiscoverHandmadeProducts;
