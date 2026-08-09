import React from "react";
import { Mail, Phone, MapPin, Twitter, Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer id="about" className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <span className="text-2xl font-bold gradient-text">AI Artisan</span>
            <p className="mt-4 text-muted-foreground">
              Empowering Indian artisans with AI-driven design ideas, e-commerce integration, and eco-friendly guidance.
            </p>
            <div className="mt-4 flex items-center space-x-3">
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <p className="font-medium mb-4">Quick Links</p>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/#ai-assistant" className="text-muted-foreground hover:text-primary transition-colors">AI Design Assistant</Link>
              </li>
              <li>
                <Link to="/e-commerce" className="text-muted-foreground hover:text-primary transition-colors">E-commerce Integration</Link>
              </li>
              <li>
                <Link to="/#eco-friendly" className="text-muted-foreground hover:text-primary transition-colors">Eco-Friendly Guidance</Link>
              </li>
              <li>
                <Link to="/#about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <p className="font-medium mb-4">Resources</p>
            <ul className="space-y-2">
              <li>
                <Link to="/e-commerce" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link>
              </li>
              <li>
                <Link to="/learn" className="text-muted-foreground hover:text-primary transition-colors">Tutorials</Link>
              </li>
              <li>
                <Link to="/learn" className="text-muted-foreground hover:text-primary transition-colors">Success Stories</Link>
              </li>
              <li>
                <Link to="/learn" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/learn" className="text-muted-foreground hover:text-primary transition-colors">Support</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <p className="font-medium mb-4">Contact Us</p>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">123 Craft Street, Bangalore, Karnataka, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href="mailto:orders@aiartisan.com" className="text-muted-foreground hover:text-primary transition-colors">orders@aiartisan.com</a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">+91 987xxxxx</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2026 AI Artisan. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
