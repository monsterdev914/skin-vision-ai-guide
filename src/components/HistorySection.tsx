import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Eye, Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import AnalysisDetailDialog from "./AnalysisDetailDialog";
import { historyService, AnalysisHistoryItem, AnalysisHistoryResponse, ProgressSummary } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
    // First check if backend provided imageUrl
    if ((analysis as any).imageUrl) {
      const baseUrl = import.meta.env.MODE === 'production' 
        ? (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3457')
        : 'http://localhost:3457';
      return `${baseUrl}${(analysis as any).imageUrl}`;
    }
    
    // Fallback to constructing from imagePath
    if (!analysis.imagePath) {
      console.log('No imagePath provided:', analysis.imagePath);
      return null;
    }
    
    const baseUrl = import.meta.env.MODE === 'production' 
      ? (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3457')
      : 'http://localhost:3457';
    
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
      return <Badge variant="secondary">Baseline</Badge>;
    }

    // Compare latest confidence with previous
    const latest = conditionAnalyses[0];
    const previous = conditionAnalyses[1];
    
    if (latest.confidence > previous.confidence) {
      const improvement = ((latest.confidence - previous.confidence) / previous.confidence * 100).toFixed(0);
      return <Badge className="bg-green-100 text-green-800">+{improvement}%</Badge>;
    } else if (latest.confidence < previous.confidence) {
      const decline = ((previous.confidence - latest.confidence) / previous.confidence * 100).toFixed(0);
      return <Badge className="bg-red-100 text-red-800">-{decline}%</Badge>;
    } else {
      return <Badge variant="secondary">Stable</Badge>;
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading your analysis history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <CardTitle>Progress Overview</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <CardDescription>
            Track your skin health journey over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {progressSummary ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {(() => {
                    if (progressSummary.conditionSummary.length === 0) return '0%';
                    const confidence = progressSummary.conditionSummary[0].averageConfidence;
                    if (confidence === null || confidence === undefined || isNaN(confidence)) return '0%';
                    return `${Math.round(confidence)}%`;
                  })()}
                </div>
                <div className="text-sm text-gray-600">Average Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {progressSummary.totalAnalyses}
                </div>
                <div className="text-sm text-gray-600">Analyses Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {progressSummary.dateRange.firstAnalysis && progressSummary.dateRange.lastAnalysis
                    ? Math.ceil((new Date(progressSummary.dateRange.lastAnalysis).getTime() - 
                         new Date(progressSummary.dateRange.firstAnalysis).getTime()) / 
                         (1000 * 60 * 60 * 24))
                    : 0
                  }
                </div>
                <div className="text-sm text-gray-600">Days Tracked</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No analysis data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Analysis History</span>
          </CardTitle>
          <CardDescription>
            View all your previous skin analyses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyData && historyData.history.length > 0 ? (
            <>
              <div className="space-y-4">
                {historyData.history.map((analysis) => (
                  <div 
                    key={analysis._id} 
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                      {getImageUrl(analysis) ? (
                        <img
                          src={getImageUrl(analysis)!}
                          alt={`Analysis for ${analysis.topPrediction.condition}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<div class="text-2xl">🔬</div>';
                          }}
                        />
                      ) : (
                        <div className="text-2xl">🔬</div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {analysis.topPrediction.condition}
                        </h3>
                        {progressSummary && getImprovementBadge(
                          analysis.topPrediction.condition, 
                          progressSummary.recentAnalyses
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{formatDate(analysis.createdAt)}</span>
                        <span>•</span>
                        <span>{Math.round(analysis.topPrediction.confidence)}% confidence</span>
                        <span>•</span>
                        <span className="capitalize">{analysis.analysisType || 'comprehensive'}</span>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleViewAnalysis(analysis._id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {historyData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * historyData.pagination.limit + 1)} to{' '}
                    {Math.min(currentPage * historyData.pagination.limit, historyData.pagination.total)} of{' '}
                    {historyData.pagination.total} analyses
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!historyData.pagination.hasPrevPage}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {historyData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!historyData.pagination.hasNextPage}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Calendar className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium">No analysis history yet</p>
                <p className="text-sm mt-2">
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
