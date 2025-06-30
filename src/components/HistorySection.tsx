import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Eye, Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import AnalysisDetailDialog from "./AnalysisDetailDialog";
import { historyService, AnalysisHistoryItem, AnalysisHistoryResponse, ProgressSummary } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { getServerBaseUrl } from "@/lib/utils";

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
      <div className="flex flex-col items-center justify-center py-8 sm:py-12">
        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-sm sm:text-base text-gray-600 mt-2 text-center">Loading your analysis history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Progress Overview */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              <CardTitle className="text-base sm:text-lg">Progress Overview</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="self-start sm:self-auto text-xs sm:text-sm"
            >
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <CardDescription className="text-sm">
            Track your skin health journey over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {progressSummary ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                  {(() => {
                    if (progressSummary.conditionSummary.length === 0) return '0%';
                    const confidence = progressSummary.conditionSummary[0].averageConfidence;
                    if (confidence === null || confidence === undefined || isNaN(confidence)) return '0%';
                    return `${Math.round(confidence * 100)}%`;
                  })()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Average Confidence</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">
                  {progressSummary.totalAnalyses}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Analyses Completed</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">
                  {progressSummary.dateRange.firstAnalysis && progressSummary.dateRange.lastAnalysis
                    ? Math.ceil((new Date(progressSummary.dateRange.lastAnalysis).getTime() - 
                         new Date(progressSummary.dateRange.firstAnalysis).getTime()) / 
                         (1000 * 60 * 60 * 24))
                    : 0
                  }
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Days Tracked</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-6 sm:py-8">
              <div className="text-sm sm:text-base">No analysis data available</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis History */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
            <span>Analysis History</span>
          </CardTitle>
          <CardDescription className="text-sm">
            View all your previous skin analyses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyData && historyData.history.length > 0 ? (
            <>
              <div className="space-y-3 sm:space-y-4">
                {historyData.history.map((analysis) => (
                  <div 
                    key={analysis._id} 
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewAnalysis(analysis._id)}
                        className="text-xs sm:text-sm w-full sm:w-auto"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {historyData.pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mt-4 sm:mt-6 pt-4 border-t">
                  <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                    Showing {((currentPage - 1) * historyData.pagination.limit + 1)} to{' '}
                    {Math.min(currentPage * historyData.pagination.limit, historyData.pagination.total)} of{' '}
                    {historyData.pagination.total} analyses
                  </div>
                  <div className="flex items-center justify-center sm:justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!historyData.pagination.hasPrevPage}
                      className="text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <div className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-gray-600 bg-gray-50 rounded border min-w-[80px] sm:min-w-[120px] text-center">
                      Page {currentPage} of {historyData.pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!historyData.pagination.hasNextPage}
                      className="text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 sm:ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 mb-4">
                <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-medium">No analysis history yet</p>
                <p className="text-sm mt-2 px-4 sm:px-0">
                  Start by uploading an image in the "New Analysis" tab to begin tracking your skin health journey.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AnalysisDetailDialog
        analysis={selectedAnalysis}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAnalysisDeleted={() => {
          fetchHistoryData(currentPage, false);
          setSelectedAnalysis(null);
        }}
      />
    </div>
  );
};

export default HistorySection;
