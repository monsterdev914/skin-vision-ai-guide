import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, History, Settings, Heart, Brain, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import ImageUploadCard from "@/components/ImageUploadCard";
import AnalysisResults from "@/components/AnalysisResults";
import HistorySection from "@/components/HistorySection";
import DashboardNavbar from "@/components/DashboardNavbar";
import { historyService, DashboardAnalytics } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analyticsData, setAnalyticsData] = useState<DashboardAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const { toast } = useToast();

  const fetchDashboardAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const response = await historyService.getDashboardAnalytics();
      if (response.success && response.data) {
        setAnalyticsData(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      // Don't show toast for analytics errors - not critical
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleImageUpload = (imageUrl: string, imageFile?: File) => {
    setSelectedImage(imageUrl);
    setSelectedImageFile(imageFile || null);
    setAnalysisComplete(false);
    
    // Start analysis immediately - the AnalysisResults component will handle the API call
    setAnalysisComplete(true);
  };

  useEffect(() => {
    fetchDashboardAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Skin Analysis Dashboard
          </h1>
          <p className="text-gray-600">
            Upload your skin image to get instant AI-powered analysis and personalized treatment recommendations
          </p>
        </div>

        {/* KPI Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Analyses This Month */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Analyses This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingAnalytics ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      analyticsData?.thisMonth || 0
                    )}
                  </p>
                  {analyticsData && !loadingAnalytics && (
                    <div className="flex items-center mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        (analyticsData.thisMonth || 0) > (analyticsData.lastMonth || 0) 
                          ? 'bg-green-100 text-green-800' 
                          : (analyticsData.thisMonth || 0) < (analyticsData.lastMonth || 0)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {(analyticsData.thisMonth || 0) > (analyticsData.lastMonth || 0) && '↑ '}
                        {(analyticsData.thisMonth || 0) < (analyticsData.lastMonth || 0) && '↓ '}
                        {(analyticsData.thisMonth || 0) === (analyticsData.lastMonth || 0) && '→ '}
                        vs last month
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Average Confidence */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Average Confidence</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingAnalytics ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      `${Math.round((analyticsData?.averageConfidence || 0) * 100)}%`
                    )}
                  </p>
                  {analyticsData && !loadingAnalytics && (
                    <div className="mt-2">
                      <Progress 
                        value={analyticsData.averageConfidence || 0} 
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Improvement Rate */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Improvement Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingAnalytics ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      `${Math.round(analyticsData?.improvementRate || 0)}%`
                    )}
                  </p>
                  {analyticsData && !loadingAnalytics && (
                    <div className="flex items-center mt-1">
                      <Badge variant={
                        (analyticsData.improvementRate || 0) >= 75 ? "default" :
                        (analyticsData.improvementRate || 0) >= 50 ? "secondary" :
                        "destructive"
                      } className="text-xs">
                        {(analyticsData.improvementRate || 0) >= 75 ? "Excellent" :
                         (analyticsData.improvementRate || 0) >= 50 ? "Good" :
                         (analyticsData.improvementRate || 0) >= 25 ? "Fair" : "Needs Attention"}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <Heart className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Total Analyses */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingAnalytics ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      analyticsData?.totalAnalyses || 0
                    )}
                  </p>
                  {analyticsData && !loadingAnalytics && (
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {analyticsData.mostCommonCondition || "No data"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <AlertCircle className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional KPI Overview */}
        {analyticsData && !loadingAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Analysis Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Analysis Trend</CardTitle>
                <CardDescription>
                  Your analysis activity over the past weeks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.weeklyAnalyses && analyticsData.weeklyAnalyses.length > 0 ? (
                    analyticsData.weeklyAnalyses.map((week, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{week.week}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${Math.min(100, (week.count / Math.max(...analyticsData.weeklyAnalyses.map(w => w.count))) * 100)}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8">{week.count}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No analysis data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Most Common Condition */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analysis Summary</CardTitle>
                <CardDescription>
                  Your skin analysis overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Most Common Condition</span>
                    <Badge variant="outline" className="font-normal">
                      {analyticsData.mostCommonCondition || "None"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Analysis Accuracy</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={analyticsData.averageConfidence || 0} 
                        className="w-16 h-2"
                      />
                      <span className="text-sm font-medium">
                        {Math.round((analyticsData.averageConfidence || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Progress Status</span>
                    <Badge variant={
                      (analyticsData.improvementRate || 0) >= 75 ? "default" :
                      (analyticsData.improvementRate || 0) >= 50 ? "secondary" :
                      "destructive"
                    }>
                      {(analyticsData.improvementRate || 0) >= 75 ? "On Track" :
                       (analyticsData.improvementRate || 0) >= 50 ? "Improving" :
                       "Needs Focus"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>New Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Upload */}
              <ImageUploadCard onImageUpload={handleImageUpload} />
              
              {/* Analysis Results */}
              <div className="space-y-6">
                {selectedImage && selectedImageFile && analysisComplete && (
                  <AnalysisResults 
                    imageUrl={selectedImage} 
                    imageFile={selectedImageFile}
                    onAnalysisComplete={() => {
                      // Refresh analytics and history when analysis is complete
                      console.log("Analysis completed - refreshing dashboard data");
                      fetchDashboardAnalytics();
                      setHistoryRefreshKey(prev => prev + 1);
                    }}
                  />
                )}
                
                {!selectedImage && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-gray-400 mb-4">
                        <Camera className="w-16 h-16 mx-auto mb-4" />
                        <p>Upload an image to start your skin analysis</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <HistorySection key={historyRefreshKey} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
