import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Eye, Loader2, RefreshCw, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import AnalysisDetailDialog from "./AnalysisDetailDialog";
import { historyService, AnalysisHistoryItem, AnalysisHistoryResponse, ProgressSummary } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { getServerBaseUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Ripple from "@/components/ui/ripple";

const HistorySection = () => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistoryItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyData, setHistoryData] = useState<AnalysisHistoryResponse | null>(null);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchHistoryData = async (page: number = 1, showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const [historyResponse, summaryResponse] = await Promise.all([
        historyService.getHistory({ page, limit: 10 }),
        historyService.getProgressSummary()
      ]);

      if (historyResponse.success && historyResponse.data) {
        console.log('History data received:', historyResponse.data);
        console.log('First analysis item:', historyResponse.data.history[0]);
        setHistoryData(historyResponse.data);
      }

      if (summaryResponse.success && summaryResponse.data) {
        setProgressSummary(summaryResponse.data);
      }
    } catch (error: any) {
      console.error('Error fetching history data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load analysis history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHistoryData(currentPage, false);
  };

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);
    await fetchHistoryData(newPage);
  };

  const handleViewAnalysis = async (analysisId: string) => {
    try {
      const response = await historyService.getById(analysisId);
      if (response.success && response.data) {
        setSelectedAnalysis(response.data);
        setDialogOpen(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load analysis details",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getImageUrl = (analysis: AnalysisHistoryItem) => {
    // Get the server base URL (without /api suffix for uploads)

    // First check if backend provided imageUrl
    if ((analysis as any).imageUrl) {
      const baseUrl = getServerBaseUrl();
      return `${baseUrl}${(analysis as any).imageUrl}`;
    }
    
    // Fallback to constructing from imagePath
    if (!analysis.imagePath) {
      console.log('No imagePath provided:', analysis.imagePath);
      return null;
    }
    
    const baseUrl = getServerBaseUrl();
    
    // Handle relative paths properly
    const cleanPath = analysis.imagePath.startsWith('/') ? analysis.imagePath.slice(1) : analysis.imagePath;
    const fullUrl = `${baseUrl}/uploads/${cleanPath}`;
    console.log('Generated image URL:', fullUrl, 'from path:', analysis.imagePath);
    return fullUrl;
  };

  const getImprovementBadge = (condition: string, recentAnalyses: any[]) => {
    // Find previous analysis with same condition
    const conditionAnalyses = recentAnalyses.filter(a => a.condition === condition);
    
    if (conditionAnalyses.length < 2) {
      return <Badge variant="secondary" className="text-xs">Baseline</Badge>;
    }

    // Compare latest confidence with previous
    const latest = conditionAnalyses[0];
    const previous = conditionAnalyses[1];
    
    if (latest.confidence > previous.confidence) {
      const improvement = ((latest.confidence - previous.confidence) / previous.confidence * 100).toFixed(0);
      return <Badge className="bg-green-100 text-green-800 text-xs">+{improvement}%</Badge>;
    } else if (latest.confidence < previous.confidence) {
      const decline = ((previous.confidence - latest.confidence) / previous.confidence * 100).toFixed(0);
      return <Badge className="bg-red-100 text-red-800 text-xs">-{decline}%</Badge>;
    } else {
      return <Badge variant="secondary" className="text-xs">Stable</Badge>;
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, []);

  if (loading) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-8 sm:py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
        </motion.div>
        <motion.span 
          className="ml-2 text-sm sm:text-base text-gray-600 mt-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Loading your analysis history...
        </motion.span>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-4 sm:space-y-6 p-4 sm:p-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, staggerChildren: 0.1 }}
    >
      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                </motion.div>
                <CardTitle className="text-base sm:text-lg bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-bold">
                  Progress Overview
                </CardTitle>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </motion.div>
              </div>
              <Ripple color="rgba(59, 130, 246, 0.2)" className="rounded-lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="self-start sm:self-auto text-xs sm:text-sm border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                >
                  <motion.div
                    animate={refreshing ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
                  >
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  </motion.div>
                  Refresh
                </Button>
              </Ripple>
            </div>
            <CardDescription className="text-sm">
              Track your skin health journey over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {progressSummary ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Average Confidence */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="relative text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200"
                >
                  <motion.div 
                    className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {(() => {
                      if (progressSummary.conditionSummary.length === 0) return '0%';
                      const confidence = progressSummary.conditionSummary[0].averageConfidence;
                      if (confidence === null || confidence === undefined || isNaN(confidence)) return '0%';
                      return `${Math.round(confidence * 100)}%`;
                    })()}
                  </motion.div>
                  <div className="text-xs sm:text-sm text-gray-700 font-medium">Analysis Accuracy</div>
                  <div className="text-xs text-green-600 font-medium mt-1">AI Confidence Score</div>
                  <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </motion.div>

                {/* Total Analyses */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="relative text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200"
                >
                  <motion.div 
                    className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {progressSummary.totalAnalyses}
                  </motion.div>
                  <div className="text-xs sm:text-sm text-gray-700 font-medium">Total Scans</div>
                  <div className="text-xs text-blue-600 font-medium mt-1">Lifetime Progress</div>
                  <div className="absolute top-2 right-2 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                </motion.div>

                {/* Days Tracked */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="relative text-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 via-purple-100 to-indigo-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200"
                >
                  <motion.div 
                    className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {progressSummary.dateRange.firstAnalysis && progressSummary.dateRange.lastAnalysis
                      ? Math.ceil((new Date(progressSummary.dateRange.lastAnalysis).getTime() - 
                           new Date(progressSummary.dateRange.firstAnalysis).getTime()) / 
                           (1000 * 60 * 60 * 24))
                      : 0
                    }
                  </motion.div>
                  <div className="text-xs sm:text-sm text-gray-700 font-medium">Journey Days</div>
                  <div className="text-xs text-purple-600 font-medium mt-1">Tracking Period</div>
                  <div className="absolute top-2 right-2 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                </motion.div>

                {/* Most Common Condition */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="relative text-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-100 to-yellow-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-200"
                >
                  <motion.div 
                    className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {(() => {
                      if (progressSummary.conditionSummary.length === 0) return 'No Data';
                      const mostCommon = progressSummary.conditionSummary.reduce((prev, current) => 
                        (current.count > prev.count) ? current : prev
                      );
                      return mostCommon.condition || 'Unknown';
                    })()}
                  </motion.div>
                  <div className="text-xs sm:text-sm text-gray-700 font-medium">Primary Focus</div>
                  <div className="text-xs text-orange-600 font-medium mt-1">Most Tracked</div>
                  <div className="absolute top-2 right-2 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                </motion.div>
              </div>
            ) : (
              <motion.div 
                className="text-center text-gray-500 py-8 sm:py-12"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* Empty State Metrics */}
                  <motion.div className="text-center p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl border border-gray-200">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-400 mb-2">0%</div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium">Analysis Accuracy</div>
                    <div className="text-xs text-gray-400 mt-1">Start tracking</div>
                  </motion.div>
                  <motion.div className="text-center p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl border border-gray-200">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-400 mb-2">0</div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium">Total Scans</div>
                    <div className="text-xs text-gray-400 mt-1">Begin journey</div>
                  </motion.div>
                  <motion.div className="text-center p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl border border-gray-200">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-400 mb-2">0</div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium">Journey Days</div>
                    <div className="text-xs text-gray-400 mt-1">Get started</div>
                  </motion.div>
                  <motion.div className="text-center p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl border border-gray-200">
                    <div className="text-lg sm:text-xl font-bold text-gray-400 mb-2">No Data</div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium">Primary Focus</div>
                    <div className="text-xs text-gray-400 mt-1">Upload first scan</div>
                  </motion.div>
                </div>
                <div className="mt-6">
                  <p className="text-base sm:text-lg font-medium text-gray-500">Ready to start your skin health journey?</p>
                  <p className="text-sm mt-2 text-gray-400">
                    Upload your first image in the Analysis tab to begin tracking your progress with AI-powered insights.
                  </p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Analysis History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              </motion.div>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                Analysis History
              </span>
            </CardTitle>
            <CardDescription className="text-sm">
              View all your previous skin analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyData && historyData.history.length > 0 ? (
              <>
                <div className="space-y-3 sm:space-y-4">
                  <AnimatePresence>
                    {historyData.history.map((analysis, index) => (
                      <motion.div
                        key={analysis._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        {/* Image and Title Section */}
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center flex-shrink-0">
                            {getImageUrl(analysis) ? (
                              <img
                                src={getImageUrl(analysis)!}
                                alt={`Analysis for ${analysis.topPrediction.condition}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to icon if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = '<div class="text-lg sm:text-2xl">🔬</div>';
                                }}
                              />
                            ) : (
                              <div className="text-lg sm:text-2xl">🔬</div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
                              <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate">
                                {analysis.topPrediction.condition}
                              </h3>
                              <div className="flex-shrink-0">
                                {progressSummary && getImprovementBadge(
                                  analysis.topPrediction.condition, 
                                  progressSummary.recentAnalyses
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                              <span>{formatDate(analysis.createdAt)}</span>
                              <span className="hidden sm:inline">•</span>
                              <span>{Math.round(analysis.topPrediction.confidence * 100)}% confidence</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="capitalize">{analysis.analysisType || 'comprehensive'}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <div className="flex justify-end sm:justify-start sm:flex-shrink-0">
                          <Ripple color="rgba(59, 130, 246, 0.2)" className="rounded-lg">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleViewAnalysis(analysis._id)}
                              className="text-xs sm:text-sm w-full sm:w-auto border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              View Details
                            </Button>
                          </Ripple>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {historyData.pagination.totalPages > 1 && (
                  <motion.div 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mt-6 pt-4 border-t border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                      Showing {((currentPage - 1) * historyData.pagination.limit + 1)} to{' '}
                      {Math.min(currentPage * historyData.pagination.limit, historyData.pagination.total)} of{' '}
                      {historyData.pagination.total} analyses
                    </div>
                    <div className="flex items-center justify-center sm:justify-end space-x-2">
                      <Ripple color="rgba(59, 130, 246, 0.2)" className="rounded-lg">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!historyData.pagination.hasPrevPage}
                          className="text-xs sm:text-sm px-2 sm:px-3 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                        >
                          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Previous</span>
                        </Button>
                      </Ripple>
                      <div className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 min-w-[80px] sm:min-w-[120px] text-center font-medium">
                        Page {currentPage} of {historyData.pagination.totalPages}
                      </div>
                      <Ripple color="rgba(59, 130, 246, 0.2)" className="rounded-lg">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!historyData.pagination.hasNextPage}
                          className="text-xs sm:text-sm px-2 sm:px-3 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 sm:ml-1" />
                        </Button>
                      </Ripple>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div 
                className="text-center py-8 sm:py-12"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-gray-400 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" />
                  </motion.div>
                  <p className="text-base sm:text-lg font-medium">No analysis history yet</p>
                  <p className="text-sm mt-2 px-4 sm:px-0">
                    Start by uploading an image in the "New Analysis" tab to begin tracking your skin health journey.
                  </p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <AnalysisDetailDialog
        analysis={selectedAnalysis}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAnalysisDeleted={() => {
          fetchHistoryData(currentPage, false);
          setSelectedAnalysis(null);
        }}
      />
    </motion.div>
  );
};

export default HistorySection;
