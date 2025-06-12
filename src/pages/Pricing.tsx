
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";
import { Badge } from "@/components/ui/badge";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge variant="secondary" className="mb-6">
            💰 Simple & Transparent Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Choose Your <span className="text-primary">
              Perfect Plan
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with our free tier and upgrade as your skin care needs grow. 
            No hidden fees, cancel anytime.
          </p>
        </div>
      </div>
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Pricing;
