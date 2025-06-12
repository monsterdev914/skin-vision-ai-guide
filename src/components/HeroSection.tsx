
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Sparkles, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <Badge variant="secondary" className="mb-6">
            🚀 AI-Powered Skin Analysis
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Your <span className="text-primary">
              Personal AI
            </span>
            <br />
            Dermatologist
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Upload a photo of your skin condition and get instant AI-powered analysis with 
            personalized treatment recommendations from certified dermatological databases.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Link to="/dashboard">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3">
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
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="SkinnyAI Demo Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Upload Image</h3>
              <p className="text-muted-foreground">Simply take a photo or upload an existing image of your skin concern</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">AI Analysis</h3>
              <p className="text-muted-foreground">Our advanced AI analyzes your skin condition with 95% accuracy</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Get Recommendations</h3>
              <p className="text-muted-foreground">Receive personalized treatment plans and product recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
