import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Sparkles, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
const HeroSection = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  return <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 border-blue-200">
              🚀 AI-Powered Skin Analysis
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Personal AI
              </span>
              <br />
              Dermatologist
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl lg:max-w-none">
              Upload a photo of your skin condition and get instant AI-powered analysis with 
              personalized treatment recommendations from certified dermatological databases.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Link to="/dashboard">
                <Button size="lg" className=" bg-gradient-to-r from-red-600 to-blue-600 text-white hover:opacity-90 px-8 py-3">
                  <Camera className="mr-2 h-5 w-5" />
                  Start Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="px-8 py-3">
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] p-0">
                  <div className="aspect-video">
                    <iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="SkinnyAI Demo Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="rounded-lg"></iframe>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img src="https://optim.tildacdn.net/tild3666-6131-4465-b830-653561383839/-/resize/560x/-/format/webp/2_-_Main_Image.png.webp" alt="AI Skin Analysis Technology" className="w-full max-w-lg h-auto rounded-2xl shadow-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload Image</h3>
            <p className="text-gray-600">Simply take a photo or upload an existing image of your skin concern</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
            <p className="text-gray-600">Our advanced AI analyzes your skin condition with 95% accuracy</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Get Recommendations</h3>
            <p className="text-gray-600">Receive personalized treatment plans and product recommendations</p>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;