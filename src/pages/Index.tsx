
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, Card as CardComponent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Shield, Zap, Users, CheckCircle, Star, ArrowRight, Upload, Brain, Heart } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <div id="testimonials">
        <TestimonialsSection />
      </div>
      <PricingSection />
      <ContactSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
