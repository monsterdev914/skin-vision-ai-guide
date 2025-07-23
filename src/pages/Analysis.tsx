import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RotateCcw, Sparkles, Zap, Brain, Target } from "lucide-react";
import ImageUploadCard from "@/components/ImageUploadCard";
import AnalysisResults from "@/components/AnalysisResults";
import DashboardNavbar from "@/components/DashboardNavbar";
import { historyService } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Ripple from "@/components/ui/ripple";

const Analysis = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const [analysisKey, setAnalysisKey] = useState(0);

  const handleImageUpload = (imageUrl: string, imageFile?: File) => {
    setSelectedImage(imageUrl);
    setSelectedImageFile(imageFile || null);
    setAnalysisComplete(false);
    
    // Increment analysis key to force AnalysisResults to remount with fresh state
    setAnalysisKey(prev => prev + 1);
    
    // Start analysis immediately - the AnalysisResults component will handle the API call
    setAnalysisComplete(true);
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setSelectedImageFile(null);
    setAnalysisComplete(false);
    setUploadKey(prev => prev + 1); // Force ImageUploadCard to remount and reset its state
    setAnalysisKey(prev => prev + 1); // Force AnalysisResults to remount with fresh state
    console.log("Analysis state reset - ready for new analysis");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <DashboardNavbar />
      
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-1"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Brain className="w-8 h-8 text-yellow-300" />
                  </motion.div>
                  <h1 className="text-4xl font-bold text-white">
                    AI Skin Analysis
                  </h1>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  >
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                  </motion.div>
                </div>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Upload your skin image to get instant AI-powered analysis with personalized treatment recommendations
                </p>
                
                {/* Feature Highlights */}
                <motion.div 
                  className="flex flex-wrap gap-4 mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span className="text-white text-sm font-medium">Instant Results</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <Target className="w-4 h-4 text-green-300" />
                    <span className="text-white text-sm font-medium">95% Accuracy</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <Brain className="w-4 h-4 text-purple-300" />
                    <span className="text-white text-sm font-medium">AI-Powered</span>
                  </div>
                </motion.div>
              </motion.div>
              
              <AnimatePresence>
                {(selectedImage || selectedImageFile) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <Ripple color="rgba(255, 255, 255, 0.3)" className="rounded-lg">
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={resetAnalysis}
                        className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300"
                      >
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 0.5 }}
                        >
                          <RotateCcw className="w-5 h-5" />
                        </motion.div>
                        <span className="font-medium">New Analysis</span>
                      </Button>
                    </Ripple>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-400/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
          </div>
        </motion.div>

        {/* Analysis Content */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Image Upload */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-xl blur opacity-20"></div>
            <div className="relative">
              <ImageUploadCard key={uploadKey} onImageUpload={handleImageUpload} />
            </div>
          </motion.div>
          
          {/* Analysis Results */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <AnimatePresence mode="wait">
              {selectedImage && selectedImageFile && analysisComplete && (
                <motion.div
                  key="analysis-results"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-xl blur opacity-20"></div>
                  <div className="relative">
                    <AnalysisResults 
                      key={analysisKey}
                      imageUrl={selectedImage} 
                      imageFile={selectedImageFile}
                      onAnalysisComplete={() => {
                        console.log("Analysis completed");
                      }}
                    />
                  </div>
                </motion.div>
              )}
              
              {!selectedImage && (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-gray-300 via-slate-300 to-gray-400 rounded-xl blur opacity-30"></div>
                  <Card className="relative border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                    <CardContent className="p-8 text-center">
                      <div className="mb-6">
                        <motion.div
                          animate={{ 
                            y: [0, -15, 0],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            repeatDelay: 2,
                            ease: "easeInOut"
                          }}
                          className="relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-30"></div>
                          <Camera className="w-20 h-20 mx-auto text-gray-400 relative z-10" />
                        </motion.div>
                      </div>
                      
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="space-y-4"
                      >
                        <h3 className="text-xl font-bold text-gray-700">Ready for Analysis</h3>
                        <p className="text-gray-500 text-lg">
                          Upload an image to discover your skin's unique characteristics
                        </p>
                        
                        {/* Quick Tips */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                          <motion.div 
                            className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-sm text-blue-700 font-medium">Good lighting</span>
                          </motion.div>
                          <motion.div 
                            className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm text-green-700 font-medium">Clear image</span>
                          </motion.div>
                          <motion.div 
                            className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span className="text-sm text-purple-700 font-medium">Close-up shot</span>
                          </motion.div>
                          <motion.div 
                            className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <span className="text-sm text-orange-700 font-medium">Clean skin</span>
                          </motion.div>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Analysis; 