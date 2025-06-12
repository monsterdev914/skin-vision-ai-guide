
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-900 to-gray-700">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
          Ready to Transform Your Skin Health?
        </h2>
        <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
          Join thousands of users who have discovered the power of AI-driven skin analysis. 
          Start your journey to healthier skin today.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/dashboard">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3">
              <Camera className="mr-2 h-5 w-5" />
              Start Free Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline" className="border-white hover:bg-white px-8 py-3 text-gray-900">
              View Pricing
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-white mb-2">50K+</div>
            <div className="text-blue-100">Analyses Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">95%</div>
            <div className="text-blue-100">Accuracy Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">4.9★</div>
            <div className="text-blue-100">User Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
