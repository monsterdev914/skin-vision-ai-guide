import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, TrendingUp, Brain, Heart, Shield, FileText, Activity, Trash2, Save } from "lucide-react";
import { AnalysisHistoryItem, historyService } from "@/lib/api";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getServerBaseUrl } from "@/lib/utils";
import ImageWithOverlays from "@/components/ImageWithOverlays";

interface AnalysisDetailDialogProps {
  analysis: AnalysisHistoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnalysisDeleted?: () => void;
}

const AnalysisDetailDialog = ({ analysis, open, onOpenChange, onAnalysisDeleted }: AnalysisDetailDialogProps) => {
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  // Debug logging for analysis data
  useEffect(() => {
    if (analysis && open) {
      console.log('Analysis data in detailed modal:', {
        analysis,
        detectedFeatures: (analysis as any).detectedFeatures,
        imageMetadata: (analysis as any).imageMetadata,
        analysisType: analysis.analysisType
      });
    }
  }, [analysis, open]);

  if (!analysis) return null;

  const handleSaveNotes = async () => {
    try {
      setSaving(true);
      const response = await historyService.addNotes(analysis._id, notes);
      if (response.success) {
        toast({
          title: "Success",
          description: "Notes saved successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnalysis = async () => {
    if (!confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await historyService.deleteAnalysis(analysis._id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Analysis deleted successfully",
        });
        onOpenChange(false);
        onAnalysisDeleted?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete analysis",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'mild': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImageUrl = (analysis: AnalysisHistoryItem) => {
    console.log('getImageUrl analysis:', analysis);
    // First check if backend provided imageUrl
    if ((analysis as any).imageUrl) {
      const baseUrl = getServerBaseUrl();
      console.log('getImageUrl imageUrl:', `${baseUrl}${(analysis as any).imageUrl}`);
      return `${baseUrl}${(analysis as any).imageUrl}`;
    }
    // Fallback to constructing from imagePath
    if (!analysis.imagePath) return null;
    
    const baseUrl = getServerBaseUrl();
    
    // Handle relative paths properly
    const cleanPath = analysis.imagePath.startsWith('/') ? analysis.imagePath.slice(1) : analysis.imagePath;
    return `${baseUrl}/uploads/${cleanPath}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-7xl h-[95vh] sm:h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4 border-b bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <span className="truncate">Analysis Details</span>
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base mt-1 hidden sm:block">
                Detailed view of your skin analysis results and treatment recommendations
              </DialogDescription>
              <div className="text-xs sm:text-sm text-gray-500 mt-1 sm:hidden">
                {formatDate(analysis.createdAt)}
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAnalysis}
              disabled={deleting}
              className="flex-shrink-0 text-xs sm:text-sm "
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
          <div className="hidden sm:block text-sm text-gray-500 mt-2">
            {formatDate(analysis.createdAt)}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 pt-4">
            {/* Analysis Summary */}
            <div className="space-y-4 sm:space-y-6">
              {/* Analysis Image with Coordinates */}
              {getImageUrl(analysis) && (
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-none">
                    <ImageWithOverlays
                      imageUrl={getImageUrl(analysis)!}
                      detectedFeatures={(analysis as any).detectedFeatures}
                      imageMetadata={(analysis as any).imageMetadata}
                      className="w-full h-auto"
                      isProfessional={analysis.analysisType === 'professional_skin_analyze_pro'}
                    />
                  </div>
                </div>
              )}

              <Card className="shadow-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                    <Activity className="w-4 h-4 flex-shrink-0" />
                    <span>Analysis Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-sm sm:text-base text-gray-600">Condition:</span>
                    <Badge variant="outline" className="text-xs sm:text-sm w-fit">{analysis.topPrediction.condition}</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-sm sm:text-base text-gray-600">Confidence:</span>
                    <span className="text-sm sm:text-base font-medium">{Math.round(analysis.topPrediction.confidence * 100)}%</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-sm sm:text-base text-gray-600">Severity:</span>
                    <Badge className={`${getSeverityColor(analysis.treatmentRecommendation?.severity)} text-xs sm:text-sm w-fit`}>
                      {analysis.treatmentRecommendation?.severity || 'Not specified'}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-sm sm:text-base text-gray-600">Analysis Type:</span>
                    <span className="text-sm sm:text-base font-medium capitalize">{analysis.analysisType || 'comprehensive'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-sm sm:text-base text-gray-600">AI Model:</span>
                    <span className="text-sm sm:text-base font-medium">{analysis.aiModel}</span>
                  </div>
                  {analysis.skinType && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                      <span className="text-sm sm:text-base text-gray-600">Skin Type:</span>
                      <span className="text-sm sm:text-base font-medium">{analysis.skinType}</span>
                    </div>
                  )}
                  {analysis.userAge && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                      <span className="text-sm sm:text-base text-gray-600">Age:</span>
                      <span className="text-sm sm:text-base font-medium">{analysis.userAge} years</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* All Predictions */}
              {analysis.predictions && Object.keys(analysis.predictions).length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>All Predictions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 sm:space-y-3">
                      {Object.entries(analysis.predictions)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([condition, confidence]) => (
                          <div key={condition} className="flex justify-between items-center gap-2">
                            <span className="text-xs sm:text-sm flex-1 truncate">{condition}</span>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-xs sm:text-sm font-medium w-8 sm:w-12 text-right">
                                {Math.round(confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* User Notes */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span>Notes</span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Add your personal observations or notes about this analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{analysis.notes}</p>
                    </div>
                  )}
                  <Textarea
                    placeholder="Add your notes here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="resize-none text-sm"
                  />
                  <Button 
                    onClick={handleSaveNotes} 
                    disabled={saving || !notes.trim()}
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {saving ? 'Saving...' : 'Save Notes'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Treatment Information */}
            <div className="space-y-4 sm:space-y-6">
              {analysis.treatmentRecommendation && (
                <>
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span>Treatment Overview</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-4">
                        {analysis.treatmentRecommendation.overview}
                      </p>
                      {analysis.treatmentRecommendation.expectedResults && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Expected Results:</h4>
                          <p className="text-sm text-blue-800">
                            {analysis.treatmentRecommendation.expectedResults}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>Treatment Steps</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 sm:space-y-6">
                        {analysis.treatmentRecommendation.steps?.map((step, index) => (
                          <div key={index} className="border-l-4 border-blue-200 pl-3 sm:pl-4">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                              Step {step.step}: {step.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {step.description}
                            </p>
                            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-1 sm:gap-0 text-xs text-gray-500">
                              <span>Frequency: {step.frequency}</span>
                              <span>Duration: {step.duration}</span>
                            </div>
                            {step.products && step.products.length > 0 && (
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-1">
                                  {step.products.map((product, productIndex) => (
                                    <Badge key={productIndex} variant="secondary" className="text-xs">
                                      {product}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {step.tips && step.tips.length > 0 && (
                              <div className="mt-2">
                                <h5 className="text-xs sm:text-sm text-gray-700 font-medium mb-1">Tips:</h5>
                                <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                                  {step.tips.map((tip, tipIndex) => (
                                    <li key={tipIndex} className="flex items-start space-x-1">
                                      <span className="flex-shrink-0">•</span>
                                      <span>{tip}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Treatment Timeline */}
                  {analysis.treatmentTimeline && (
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3 sm:pb-4">
                        <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <span>Treatment Timeline</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-sm">
                            <span className="text-gray-600">Total Duration:</span>
                            <span className="font-medium">{analysis.treatmentTimeline.totalDuration}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {analysis.treatmentTimeline.phases?.map((phase, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                                Phase {phase.phase}: {phase.title}
                              </h4>
                              <div className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Timeframe:</span> {phase.timeframe}
                              </div>
                              <p className="text-sm text-gray-700 mb-3">
                                {phase.description}
                              </p>
                              
                              {phase.expectedChanges && phase.expectedChanges.length > 0 && (
                                <div className="mb-3">
                                  <h5 className="text-sm font-medium text-green-800 mb-1">Expected Changes:</h5>
                                  <ul className="text-sm text-green-700 space-y-1">
                                    {phase.expectedChanges.map((change, changeIndex) => (
                                      <li key={changeIndex} className="flex items-start space-x-2">
                                        <span className="text-green-600 flex-shrink-0">✓</span>
                                        <span>{change}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {phase.skinCareAdjustments && phase.skinCareAdjustments.length > 0 && (
                                <div className="mb-3">
                                  <h5 className="text-sm font-medium text-blue-800 mb-1">Skincare Adjustments:</h5>
                                  <ul className="text-sm text-blue-700 space-y-1">
                                    {phase.skinCareAdjustments.map((adjustment, adjIndex) => (
                                      <li key={adjIndex} className="flex items-start space-x-2">
                                        <span className="text-blue-600 flex-shrink-0">→</span>
                                        <span>{adjustment}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {phase.milestones && phase.milestones.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-purple-800 mb-1">Milestones:</h5>
                                  <ul className="text-sm text-purple-700 space-y-1">
                                    {phase.milestones.map((milestone, milestoneIndex) => (
                                      <li key={milestoneIndex} className="flex items-start space-x-2">
                                        <span className="text-purple-600 flex-shrink-0">🎯</span>
                                        <span>{milestone}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Maintenance Phase */}
                        {analysis.treatmentTimeline.maintenancePhase && (
                          <div className="mt-4 border border-amber-200 rounded-lg p-3 sm:p-4 bg-amber-50">
                            <h4 className="font-medium text-amber-900 mb-2 text-sm sm:text-base">
                              {analysis.treatmentTimeline.maintenancePhase.title}
                            </h4>
                            <p className="text-sm text-amber-800 mb-3">
                              {analysis.treatmentTimeline.maintenancePhase.description}
                            </p>
                            {analysis.treatmentTimeline.maintenancePhase.ongoingCare && (
                              <div>
                                <h5 className="text-sm font-medium text-amber-900 mb-1">Ongoing Care:</h5>
                                <ul className="text-sm text-amber-800 space-y-1">
                                  {analysis.treatmentTimeline.maintenancePhase.ongoingCare.map((care, careIndex) => (
                                    <li key={careIndex} className="flex items-start space-x-2">
                                      <span className="text-amber-600 flex-shrink-0">⚡</span>
                                      <span>{care}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Checkup Schedule */}
                        {analysis.treatmentTimeline.checkupSchedule && analysis.treatmentTimeline.checkupSchedule.length > 0 && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Checkup Schedule:</h5>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {analysis.treatmentTimeline.checkupSchedule.map((checkup, checkupIndex) => (
                                <li key={checkupIndex} className="flex items-start space-x-2">
                                  <span className="text-gray-500 flex-shrink-0">📅</span>
                                  <span>{checkup}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {analysis.treatmentRecommendation.warnings && 
                   analysis.treatmentRecommendation.warnings.length > 0 && (
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3 sm:pb-4">
                        <CardTitle className="text-base sm:text-lg text-orange-700">
                          ⚠️ Important Warnings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.treatmentRecommendation.warnings.map((warning, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <Shield className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-orange-800">{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Professional Advice */}
                  {analysis.treatmentRecommendation.professionalAdvice && (
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3 sm:pb-4">
                        <CardTitle className="text-base sm:text-lg text-blue-700">
                          👨‍⚕️ Professional Advice
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-blue-800">
                          {analysis.treatmentRecommendation.professionalAdvice}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* Personalized Notes */}
              {(analysis.personalizedNotes || analysis.treatmentRecommendation?.personalizedNotes) && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">AI Personalized Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Handle both array and string formats
                      const notes = analysis.personalizedNotes || analysis.treatmentRecommendation?.personalizedNotes;
                      if (Array.isArray(notes)) {
                        return (
                          <ul className="space-y-2">
                            {notes.map((note, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <Brain className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{note}</span>
                              </li>
                            ))}
                          </ul>
                        );
                      } else if (typeof notes === 'string') {
                        return (
                          <div className="flex items-start space-x-2">
                            <Brain className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{notes}</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Current Products */}
              {analysis.currentProducts && analysis.currentProducts.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Current Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.currentProducts.map((product, index) => (
                        <Badge key={index} variant="outline" className="text-xs sm:text-sm">
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisDetailDialog;
