
import { useAuth } from "@/contexts/AuthContext";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Navbar from "@/components/Navbar";
import DashboardNavbar from "@/components/DashboardNavbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Activity, Clock, TrendingUp, User, Calendar, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

// Welcome section for logged-in users
const WelcomeSection = ({ user }: { user: any }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {getGreeting()}, {user.firstName || user.email}! 👋
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Welcome back to your personalized skin care journey. Ready to analyze your skin or check your progress?
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/dashboard">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">New Analysis</h3>
                <p className="text-sm text-gray-600">Upload a photo for AI skin analysis</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/dashboard">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">View History</h3>
                <p className="text-sm text-gray-600">Check your previous analyses</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/dashboard">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Track Progress</h3>
                <p className="text-sm text-gray-600">Monitor your skin improvements</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/profile">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Profile</h3>
                <p className="text-sm text-gray-600">Update your preferences</p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Latest Tips Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span>Daily Skin Care Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">1</Badge>
                  <p className="text-sm text-gray-600">Apply sunscreen daily, even on cloudy days. UV protection is crucial for preventing premature aging.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">2</Badge>
                  <p className="text-sm text-gray-600">Cleanse your face twice daily with a gentle, pH-balanced cleanser to maintain healthy skin barrier.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">3</Badge>
                  <p className="text-sm text-gray-600">Stay hydrated by drinking at least 8 glasses of water daily for healthy, glowing skin.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span>Your Next Steps</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Take Progress Photo</p>
                    <p className="text-xs text-gray-600">Document your skin improvement journey</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Link to="/dashboard">Start</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Review Treatment Plan</p>
                    <p className="text-xs text-gray-600">Check your personalized recommendations</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Link to="/dashboard">View</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {isAuthenticated ? <DashboardNavbar /> : <Navbar />}
      
      {isAuthenticated ? (
        // Logged-in user view
        <>
          <WelcomeSection user={user} />
          <Footer />
        </>
      ) : (
        // Visitor/Marketing view
        <>
          <HeroSection />
          <FeaturesSection />
          <div id="testimonials">
            <TestimonialsSection />
          </div>
          <PricingSection />
          <ContactSection />
          <CTASection />
          <Footer />
        </>
      )}
    </div>
  );
};

export default Index;
