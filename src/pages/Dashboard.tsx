
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, History, User, Settings, Heart, Brain, CheckCircle, AlertCircle } from "lucide-react";
import ImageUploadCard from "@/components/ImageUploadCard";
import AnalysisResults from "@/components/AnalysisResults";
import HistorySection from "@/components/HistorySection";
import DashboardNavbar from "@/components/DashboardNavbar";

const Dashboard = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const handleImageUpload = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setAnalysisComplete(false);
    
    // Simulate analysis progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setAnalysisProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setAnalysisComplete(true);
        }, 500);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            AI Skin Analysis Dashboard
          </h1>
          <p className="text-muted-foreground">
            Upload your skin image to get instant AI-powered analysis and personalized recommendations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Analyses This Month</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                </div>
                <Brain className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Accuracy Rate</p>
                  <p className="text-2xl font-bold text-foreground">95%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Improvement</p>
                  <p className="text-2xl font-bold text-foreground">+23%</p>
                </div>
                <Heart className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plan</p>
                  <p className="text-2xl font-bold text-foreground">Premium</p>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>New Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Upload */}
              <ImageUploadCard onImageUpload={handleImageUpload} />
              
              {/* Analysis Results */}
              <div className="space-y-6">
                {selectedImage && !analysisComplete && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Brain className="w-5 h-5 text-blue-600" />
                        <span>Analyzing Image...</span>
                      </CardTitle>
                      <CardDescription>
                        Our AI is processing your image to provide accurate analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Progress value={analysisProgress} className="w-full" />
                        <p className="text-sm text-gray-600 text-center">
                          {analysisProgress < 30 && "Preprocessing image..."}
                          {analysisProgress >= 30 && analysisProgress < 60 && "Detecting skin conditions..."}
                          {analysisProgress >= 60 && analysisProgress < 90 && "Analyzing patterns..."}
                          {analysisProgress >= 90 && "Generating recommendations..."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {selectedImage && analysisComplete && (
                  <AnalysisResults imageUrl={selectedImage} />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <HistorySection />
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your account and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Profile settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
