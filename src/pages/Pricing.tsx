
import DashboardNavbar from "@/components/DashboardNavbar";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Crown, Sparkles, Zap, Target, Star } from "lucide-react";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <DashboardNavbar />
      
      <motion.div 
        className="pt-24 pb-16 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Hero Section */}
        <motion.div 
          className="max-w-6xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-12 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            
            <div className="relative text-center">
              <motion.div 
                className="flex justify-center items-center space-x-4 mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Crown className="w-8 h-8 text-yellow-300" />
                </motion.div>
                
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-lg px-4 py-2">
                  <Sparkles className="w-5 h-5 mr-2 text-yellow-300" />
                  Premium AI Skin Analysis
                </Badge>
                
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Star className="w-8 h-8 text-yellow-300" />
                </motion.div>
              </motion.div>

              <motion.h1 
                className="text-5xl sm:text-6xl font-bold text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Choose Your <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Perfect Plan
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-blue-100 max-w-3xl mx-auto mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Start with our free tier and unlock the full power of AI-driven skin analysis. 
                <br />
                <span className="text-yellow-200 font-medium">No hidden fees, cancel anytime.</span>
              </motion.p>

              {/* Feature Highlights */}
              <motion.div 
                className="flex flex-wrap justify-center gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.div 
                  className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="text-white font-medium">Instant Analysis</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Target className="w-5 h-5 text-green-300" />
                  <span className="text-white font-medium">95% Accuracy</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Crown className="w-5 h-5 text-purple-300" />
                  <span className="text-white font-medium">Premium Support</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Star className="w-5 h-5 text-orange-300" />
                  <span className="text-white font-medium">Expert Insights</span>
                </motion.div>
              </motion.div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-yellow-400/20 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full translate-y-16 -translate-x-16"></div>
            <div className="absolute top-1/2 left-1/4 w-6 h-6 bg-white/20 rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-yellow-300/30 rounded-full animate-pulse delay-700"></div>
            <div className="absolute bottom-1/3 right-1/4 w-8 h-8 bg-purple-300/20 rounded-full animate-pulse delay-1000"></div>
          </div>
        </motion.div>

        {/* Value Proposition Cards */}
        <motion.div 
          className="max-w-6xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Get detailed skin analysis results in under 30 seconds</p>
            </motion.div>

            <motion.div 
              className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Clinically Accurate</h3>
              <p className="text-gray-600">AI trained on thousands of dermatological cases</p>
            </motion.div>

            <motion.div 
              className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Experience</h3>
              <p className="text-gray-600">Personalized recommendations and tracking</p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <PricingSection />
      </motion.div>
      
      <Footer />
    </div>
  );
};

export default Pricing;
