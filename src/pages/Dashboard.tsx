import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import { Camera, History, ArrowRight, Brain, CheckCircle, Heart, AlertCircle, Loader2, TrendingUp, Calendar, Activity, Target, ChevronLeft, ChevronRight, Eye, Clock } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";
import { historyService, DashboardAnalytics, AnalysisHistoryItem } from "@/lib/api";
import { motion } from "framer-motion";
import Ripple from "@/components/ui/ripple";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getServerBaseUrl } from "@/lib/utils";

const Dashboard = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<DashboardAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [recentHistory, setRecentHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchDashboardAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const response = await historyService.getDashboardAnalytics();
      if (response.success && response.data) {
        setAnalyticsData(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchRecentHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await historyService.getHistory({ page: 1, limit: 5 }); // Get recent 5 items
      console.log('History API response:', response); // Debug log
      if (response.success && response.data) {
        console.log('History data:', response.data); // Debug log
        setRecentHistory(response.data.history?.slice(0, 5) || []);
      } else {
        console.log('No history data found or API error');
      }
    } catch (error: any) {
      console.error('Error fetching recent history:', error);
      
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchDashboardAnalytics();
    fetchRecentHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            Your skin analysis insights and progress at a glance
          </p>
        </motion.div>

        {/* KPI Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Analyses This Month */}
          <motion.div
            whileHover={{ scale: 1.05, y: -10 }}
            transition={{ duration: 0.3 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 h-64">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-blue-600/10"></div>
              <CardContent className="p-8 relative h-full flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-600/80 uppercase tracking-wider mb-2">
                      Analyses This Month
                    </p>
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {loadingAnalytics ? (
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    ) : (
                          <span className="font-mono">
                            {String(analyticsData?.thisMonth || 0).padStart(2, '0')}
                          </span>
                    )}
                  </p>
                    </motion.div>
                  {analyticsData && !loadingAnalytics && (
                      <motion.div 
                        className="flex items-center mt-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm ${
                        (analyticsData.thisMonth || 0) > (analyticsData.lastMonth || 0) 
                            ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200' 
                          : (analyticsData.thisMonth || 0) < (analyticsData.lastMonth || 0)
                            ? 'bg-rose-100/80 text-rose-700 border border-rose-200'
                            : 'bg-amber-100/80 text-amber-700 border border-amber-200'
                      }`}>
                          {(analyticsData.thisMonth || 0) > (analyticsData.lastMonth || 0) && '↗ '}
                          {(analyticsData.thisMonth || 0) < (analyticsData.lastMonth || 0) && '↘ '}
                        {(analyticsData.thisMonth || 0) === (analyticsData.lastMonth || 0) && '→ '}
                        vs last month
                      </span>
                      </motion.div>
                  )}
                </div>
                  <div className="ml-6">
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex items-center justify-center group-hover:shadow-blue-500/25 transition-all duration-300"
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        repeatDelay: 2,
                        ease: "easeInOut"
                      }}
                    >
                      <Brain className="w-8 h-8 text-white drop-shadow-sm" />
                    </motion.div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-600/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            </CardContent>
          </Card>
          </motion.div>
          
          {/* Average Confidence */}
          <motion.div
            whileHover={{ scale: 1.05, y: -10 }}
            transition={{ duration: 0.3 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 h-64">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 via-transparent to-emerald-600/10"></div>
              <CardContent className="p-8 relative h-full flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-600/80 uppercase tracking-wider mb-2">
                      Average Confidence
                    </p>
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <p className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                    {loadingAnalytics ? (
                          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    ) : (
                          <span className="font-mono">
                            {Math.round((analyticsData?.averageConfidence || 0) * 100)}%
                          </span>
                    )}
                  </p>
                    </motion.div>
                  {analyticsData && !loadingAnalytics && (
                      <motion.div 
                        className="mt-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        <div className="relative">
                          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                              className="h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 rounded-full shadow-sm"
                              initial={{ width: 0 }}
                              animate={{ width: `${(analyticsData.averageConfidence || 0) * 100}%` }}
                              transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                            </motion.div>
                          </div>
                          <motion.div
                            className="absolute -top-1 bg-emerald-600 w-2 h-5 rounded-full shadow-lg"
                            initial={{ left: 0 }}
                            animate={{ left: `${Math.max(0, (analyticsData.averageConfidence || 0) * 100 - 1)}%` }}
                            transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                      />
                    </div>
                      </motion.div>
                  )}
                </div>
                  <div className="ml-6">
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg flex items-center justify-center group-hover:shadow-emerald-500/25 transition-all duration-300"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        repeatDelay: 2,
                        ease: "easeInOut"
                      }}
                    >
                      <CheckCircle className="w-8 h-8 text-white drop-shadow-sm" />
                    </motion.div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-600/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            </CardContent>
          </Card>
          </motion.div>
          
          {/* Improvement Rate */}
          <motion.div
            whileHover={{ scale: 1.05, y: -10 }}
            transition={{ duration: 0.3 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-rose-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 h-64">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-600/5 via-transparent to-rose-600/10"></div>
              <CardContent className="p-8 relative h-full flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-sm font-semibold text-rose-600/80 uppercase tracking-wider mb-2">
                      Improvement Rate
                    </p>
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <p className="text-4xl font-black bg-gradient-to-r from-rose-600 to-rose-800 bg-clip-text text-transparent">
                    {loadingAnalytics ? (
                          <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
                    ) : (
                          <span className="font-mono">
                            {Math.round(analyticsData?.improvementRate || 0)}%
                          </span>
                    )}
                  </p>
                    </motion.div>
                  {analyticsData && !loadingAnalytics && (
                      <motion.div 
                        className="flex items-center mt-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      >
                        <motion.div
                          className={`px-4 py-2 rounded-xl backdrop-blur-sm font-bold text-xs shadow-lg ${
                            (analyticsData.improvementRate || 0) >= 75 
                              ? "bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200/50" 
                              : (analyticsData.improvementRate || 0) >= 50 
                              ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200/50"
                              : (analyticsData.improvementRate || 0) >= 25
                              ? "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border border-amber-200/50"
                              : "bg-gradient-to-r from-rose-100 to-rose-50 text-rose-700 border border-rose-200/50"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {(analyticsData.improvementRate || 0) >= 75 ? "✨ Excellent" :
                           (analyticsData.improvementRate || 0) >= 50 ? "🎯 Good" :
                           (analyticsData.improvementRate || 0) >= 25 ? "📈 Fair" : "⚡ Needs Attention"}
                        </motion.div>
                      </motion.div>
                  )}
                </div>
                  <div className="ml-6">
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg flex items-center justify-center group-hover:shadow-rose-500/25 transition-all duration-300"
                      animate={{ 
                        y: [0, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 2.5, 
                        repeat: Infinity, 
                        repeatDelay: 1,
                        ease: "easeInOut"
                      }}
                    >
                      <Heart className="w-8 h-8 text-white drop-shadow-sm" />
                    </motion.div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-600/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            </CardContent>
          </Card>
          </motion.div>
          
          {/* Total Analyses */}
          <motion.div
            whileHover={{ scale: 1.05, y: -10 }}
            transition={{ duration: 0.3 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-violet-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 h-64">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-violet-600/10"></div>
              <CardContent className="p-8 relative h-full flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-sm font-semibold text-violet-600/80 uppercase tracking-wider mb-2">
                      Total Analyses
                    </p>
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <p className="text-4xl font-black bg-gradient-to-r from-violet-600 to-violet-800 bg-clip-text text-transparent">
                    {loadingAnalytics ? (
                          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                    ) : (
                          <span className="font-mono">
                            {String(analyticsData?.totalAnalyses || 0).padStart(3, '0')}
                          </span>
                    )}
                  </p>
                    </motion.div>
                  {analyticsData && !loadingAnalytics && (
                      <motion.div 
                        className="flex items-center mt-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                      >
                        <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-100/80 to-violet-50/80 backdrop-blur-sm border border-violet-200/50">
                          <span className="text-xs font-bold text-violet-700">
                            {analyticsData.mostCommonCondition ? (
                              <>🏆 {analyticsData.mostCommonCondition}</>
                            ) : (
                              "📊 Building insights..."
                            )}
                      </span>
                    </div>
                      </motion.div>
                  )}
                  </div>
                  <div className="ml-6">
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg flex items-center justify-center group-hover:shadow-violet-500/25 transition-all duration-300"
                      animate={{ 
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        repeatDelay: 2,
                        ease: "easeInOut"
                      }}
                    >
                      <AlertCircle className="w-8 h-8 text-white drop-shadow-sm" />
                    </motion.div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-600/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Analyses Carousel */}
        {recentHistory.length > 0 && (
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 via-white to-indigo-50">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3 text-2xl">
                    <motion.div
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <History className="w-5 h-5 text-white" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent font-bold">
                      Recent Analyses
                    </span>
                  </CardTitle>
                  <Ripple color="rgba(99, 102, 241, 0.2)" className="rounded-lg">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/history')}
                      className="border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-700"
                    >
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Ripple>
                </div>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                ) : (
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {recentHistory.map((analysis, index) => (
                        <CarouselItem key={analysis._id || index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="group cursor-pointer"
                            onClick={() => navigate(`/history?id=${analysis._id}`)}
                          >
                            <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg hover:shadow-2xl transition-all duration-500">
                              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-purple-600/5"></div>
                              <CardContent className="p-0 relative">
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden">
                                  <motion.img
                                    src={getServerBaseUrl() + (analysis as any)?.imageUrl || (analysis as any)?.originalImageUrl || "/placeholder.svg"}
                                    alt="Analysis"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    whileHover={{ scale: 1.1 }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                                  
                                  {/* Confidence Badge - Big and Prominent */}
                                  <motion.div
                                    className="absolute top-3 right-3 px-4 py-3 rounded-2xl bg-gradient-to-br from-white via-white to-white/95 backdrop-blur-md shadow-2xl border border-white/50"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    <div className="text-center">
                                      <div className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent leading-none">
                                        {Math.round(((analysis as any)?.confidence || Math.max(...((analysis as any)?.detectedFeatures?.map((feature: any) => feature.confidence) || [0.85]))) * 100)}%
                                      </div>
                                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mt-1">
                                        CONFIDENCE
                                      </div>
                                    </div>
                                  </motion.div>

                                  {/* Analysis Status */}
                                  <motion.div
                                    className="absolute bottom-3 left-3 flex items-center space-x-2"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.3 }}
                                  >
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                    <span className="text-xs font-medium text-white drop-shadow-sm">
                                      Analysis Complete
                                    </span>
                                  </motion.div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.4 }}
                                  >
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
                                      {(analysis as any)?.condition || (analysis as any)?.primaryCondition || "Skin Analysis"}
                                    </h3>
                                    
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                                      <Clock className="w-4 h-4" />
                                      <span>
                                        {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </span>
                                    </div>

                                    {/* Sample Conditions for Demo */}
                                    <div className="flex flex-wrap gap-1 mb-4">
                                      <motion.span
                                        className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full"
                                        whileHover={{ scale: 1.05 }}
                                      >
                                        {(analysis as any)?.condition || "Analyzed"}
                                      </motion.span>
                                      <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full">
                                        AI Processed
                                      </span>
                                    </div>

                                    {/* View Details Button */}
                                    <Ripple color="rgba(99, 102, 241, 0.3)" className="rounded-lg">
                                      <Button 
                                        size="sm" 
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300"
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                        <motion.div
                                          animate={{ x: [0, 3, 0] }}
                                          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                                        >
                                          <ArrowRight className="w-4 h-4 ml-2" />
                                        </motion.div>
                                      </Button>
                                    </Ripple>
                                  </motion.div>
                                </div>

                                {/* Decorative gradient */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-600/10 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex -left-12 bg-white/90 hover:bg-white border-2 border-indigo-200 hover:border-indigo-300 text-indigo-700 shadow-lg" />
                    <CarouselNext className="hidden md:flex -right-12 bg-white/90 hover:bg-white border-2 border-indigo-200 hover:border-indigo-300 text-indigo-700 shadow-lg" />
                  </Carousel>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Dashboard Content */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="group"
                  >
                    <Card 
                      className="relative overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-cyan-50 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer" 
                      onClick={() => navigate('/analysis')}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 via-transparent to-cyan-600/10"></div>
                      <CardContent className="p-8 text-center relative">
                        <motion.div
                          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-xl flex items-center justify-center group-hover:shadow-cyan-500/30 transition-all duration-300"
                          animate={{ 
                            y: [0, -8, 0],
                            rotate: [0, 2, -2, 0]
                          }}
                          transition={{ duration: 3, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
                        >
                          <Camera className="w-10 h-10 text-white drop-shadow-sm" />
                        </motion.div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-700 to-cyan-900 bg-clip-text text-transparent mb-3">
                          New Analysis
                        </h3>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                          Upload a skin image for instant AI-powered analysis and personalized recommendations
                        </p>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Ripple color="rgba(255, 255, 255, 0.4)" className="rounded-lg">
                            <Button className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 w-full">
                              <span className="font-semibold">Start Analysis</span>
                              <motion.div
                                animate={{ x: [0, 3, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                              >
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </motion.div>
                            </Button>
                          </Ripple>
                        </motion.div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-600/10 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="group"
                  >
                    <Card 
                      className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-indigo-50 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer" 
                      onClick={() => navigate('/history')}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-indigo-600/10"></div>
                      <CardContent className="p-8 text-center relative">
                        <motion.div
                          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-xl flex items-center justify-center group-hover:shadow-indigo-500/30 transition-all duration-300"
                          animate={{ 
                            rotate: [0, 8, -8, 0],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                        >
                          <History className="w-10 h-10 text-white drop-shadow-sm" />
                        </motion.div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent mb-3">
                          View History
                        </h3>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                          Review past analyses and track your skin health progress over time
                        </p>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Ripple color="rgba(99, 102, 241, 0.3)" className="rounded-lg">
                            <Button 
                              variant="outline" 
                              className="border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 w-full"
                            >
                              <span className="font-semibold">View History</span>
                              <motion.div
                                animate={{ x: [0, 3, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.5 }}
                              >
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </motion.div>
                            </Button>
                          </Ripple>
                        </motion.div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-600/10 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                      </CardContent>
                    </Card>
                  </motion.div>
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Progress Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-amber-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 via-transparent to-amber-600/10"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center space-x-3">
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg flex items-center justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <TrendingUp className="w-5 h-5 text-white" />
                  </motion.div>
                  <span className="text-xl font-bold bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">Progress Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-amber-700">Analysis Frequency</span>
                    <span className="text-lg font-black bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                      {loadingAnalytics ? "..." : `${analyticsData?.thisMonth || 0}/month`}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-full shadow-sm relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(((analyticsData?.thisMonth || 0) / 10) * 100, 100)}%` }}
                        transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                      </motion.div>
                    </div>
                    <p className="text-xs text-amber-600/80 mt-2 font-medium">🎯 Target: 10 analyses per month</p>
          </div>
                </motion.div>
                
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-amber-700">Skin Health Score</span>
                    <span className="text-lg font-black bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                      {loadingAnalytics ? "..." : `${Math.round((analyticsData?.averageConfidence || 0) * 100)}%`}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-full shadow-sm relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${(analyticsData?.averageConfidence || 0) * 100}%` }}
                        transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="pt-4 border-t border-amber-200/50"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <div className="text-center">
                    <motion.div
                      className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200/50 backdrop-blur-sm shadow-lg mb-2"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-sm font-bold text-amber-700">
                        {analyticsData?.mostCommonCondition ? (
                          `🏆 ${analyticsData.mostCommonCondition}`
                        ) : (
                          "📊 Building insights..."
                        )}
                      </span>
                    </motion.div>
                    <p className="text-xs text-amber-600/80 font-medium">Most common condition</p>
                  </div>
                </motion.div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-600/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Activity & Tips */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {/* Recent Activity */}
                  <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Ripple color="rgba(59, 130, 246, 0.2)" className="rounded-lg">
                  <motion.div 
                    className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Brain className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">AI Analysis Complete</p>
                      <p className="text-xs text-gray-500">Last analysis performed today</p>
                    </div>
                  </motion.div>
                </Ripple>
                <Ripple color="rgba(34, 197, 94, 0.2)" className="rounded-lg">
                  <motion.div 
                    className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">High Confidence Result</p>
                      <p className="text-xs text-gray-500">Recent analysis with 95% confidence</p>
                    </div>
                  </motion.div>
                </Ripple>
                <Ripple color="rgba(147, 51, 234, 0.2)" className="rounded-lg">
                  <motion.div 
                    className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Progress Tracked</p>
                      <p className="text-xs text-gray-500">Skin health improving over time</p>
                    </div>
                  </motion.div>
                </Ripple>
                      </div>
                    </CardContent>
                  </Card>

          {/* Tips & Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Tips & Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Ripple color="rgba(245, 158, 11, 0.2)" className="rounded">
                  <motion.div 
                    className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-sm font-medium text-yellow-800">Daily Skincare</p>
                    <p className="text-xs text-yellow-700">Maintain consistent daily skincare routine for best results</p>
                  </motion.div>
                </Ripple>
                <Ripple color="rgba(59, 130, 246, 0.2)" className="rounded">
                  <motion.div 
                    className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-sm font-medium text-blue-800">Track Progress</p>
                    <p className="text-xs text-blue-700">Take photos weekly in consistent lighting for accurate tracking</p>
                  </motion.div>
                </Ripple>
                <Ripple color="rgba(34, 197, 94, 0.2)" className="rounded">
                  <motion.div 
                    className="p-3 bg-green-50 border-l-4 border-green-400 rounded"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-sm font-medium text-green-800">Hydration</p>
                    <p className="text-xs text-green-700">Keep skin well-hydrated with appropriate moisturizers</p>
                  </motion.div>
                </Ripple>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
