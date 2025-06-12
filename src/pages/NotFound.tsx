
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Heart, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/3 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      
      <div className="relative z-10 animate-fade-in">
        <Card className="p-8 text-center bg-white/95 backdrop-blur-sm border-0 shadow-2xl transform transition-all duration-500 hover:scale-105">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8 animate-scale-in">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkinnyAI
              </span>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="animate-bounce">
              <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                404
              </h1>
            </div>
            
            <div className="space-y-2 transform transition-all duration-300 hover:translate-y-1">
              <h2 className="text-2xl font-bold text-gray-900">
                Oops! Page not found
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                onClick={() => window.history.back()}
                variant="outline" 
                className="flex items-center space-x-2 transform transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </Button>
              
              <a href="/">
                <Button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <Home className="w-4 h-4" />
                  <span>Return to Home</span>
                </Button>
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
