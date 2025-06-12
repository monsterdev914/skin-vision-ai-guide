
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, Zap, Users, Camera, Heart } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "Advanced AI Analysis",
      description: "Our neural network is trained on millions of dermatological images for accurate condition identification.",
      badge: "95% Accuracy"
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "HIPAA-compliant platform ensures your medical data is encrypted and securely stored.",
      badge: "HIPAA Compliant"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get comprehensive skin analysis and treatment recommendations in under 30 seconds.",
      badge: "< 30 seconds"
    },
    {
      icon: Users,
      title: "Expert Backed",
      description: "Recommendations reviewed by certified dermatologists and based on clinical research.",
      badge: "MD Reviewed"
    },
    {
      icon: Camera,
      title: "Progress Tracking",
      description: "Monitor your skin health journey with before/after comparisons and improvement analytics.",
      badge: "Track Progress"
    },
    {
      icon: Heart,
      title: "Personalized Care",
      description: "Tailored treatment plans based on your skin type, lifestyle, and medical history.",
      badge: "Custom Plans"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-gray-100 text-gray-700">
            Powerful Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Revolutionary Skin Care Technology
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of dermatology with our cutting-edge AI platform designed for accuracy, speed, and personalized care.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
