
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";
import { Badge } from "@/components/ui/badge";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 border-blue-200 animate-scale-in hover:scale-110 transition-transform duration-300">
            💰 Simple & Transparent Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 transform transition-all duration-500 hover:scale-105">
            Choose Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto transform transition-all duration-300 hover:translate-y-1">
            Start with our free tier and upgrade as your skin care needs grow. 
            No hidden fees, cancel anytime.
          </p>
        </div>
      </div>
      <div className="animate-fade-in delay-300">
        <PricingSection />
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;
