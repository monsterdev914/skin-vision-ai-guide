import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, TrendingUp, Brain, Heart, Shield, FileText, Activity, Trash2, Save } from "lucide-react";
import { AnalysisHistoryItem, historyService } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
    // First check if backend provided imageUrl
    if ((analysis as any).imageUrl) {
      const baseUrl = import.meta.env.MODE === 'production' 
        ? (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3457')
        : 'http://localhost:3457';
      return `${baseUrl}${(analysis as any).imageUrl}`;
    }
    
    // Fallback to constructing from imagePath
    if (!analysis.imagePath) return null;
    
    const baseUrl = import.meta.env.MODE === 'production' 
      ? (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3457')
      : 'http://localhost:3457';
    
    // Handle relative paths properly
    const cleanPath = analysis.imagePath.startsWith('/') ? analysis.imagePath.slice(1) : analysis.imagePath;
    return `${baseUrl}/uploads/${cleanPath}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <span>Analysis Details - {formatDate(analysis.createdAt)}</span>
              </DialogTitle>
              <DialogDescription>
                Detailed view of your skin analysis results and treatment recommendations
              </DialogDescription>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAnalysis}
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analysis Summary */}
          <div className="space-y-4">
            {/* Analysis Image */}
            {getImageUrl(analysis) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Analysis Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={getImageUrl(analysis)!}
                    alt={`Analysis for ${analysis.topPrediction.condition}`}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      // Hide image if it fails to load
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Analysis Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Condition:</span>
                  <Badge variant="outline">{analysis.topPrediction.condition}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confidence:</span>
                  <span className="font-medium">{Math.round(analysis.topPrediction.confidence)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Severity:</span>
                  <Badge className={getSeverityColor(analysis.treatmentRecommendation?.severity)}>
                    {analysis.treatmentRecommendation?.severity || 'Not specified'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Analysis Type:</span>
                  <span className="font-medium capitalize">{analysis.analysisType || 'comprehensive'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AI Model:</span>
                  <span className="font-medium">{analysis.aiModel}</span>
                </div>
                {analysis.skinType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Skin Type:</span>
                    <span className="font-medium">{analysis.skinType}</span>
                  </div>
                )}
                {analysis.userAge && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{analysis.userAge} years</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Predictions */}
            {analysis.predictions && Object.keys(analysis.predictions).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>All Predictions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(analysis.predictions)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([condition, confidence]) => (
                        <div key={condition} className="flex justify-between items-center">
                          <span className="text-sm">{condition}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Notes</span>
                </CardTitle>
                <CardDescription>
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
                />
                <Button 
                  onClick={handleSaveNotes} 
                  disabled={saving || !notes.trim()}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Notes'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Treatment Information */}
          <div className="space-y-4">
            {analysis.treatmentRecommendation && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-600" />
                      <span>Treatment Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-4">
                      {analysis.treatmentRecommendation.overview}
                    </p>
                    {analysis.treatmentRecommendation.expectedResults && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Expected Results:</h4>
                        <p className="text-sm text-blue-800">
                          {analysis.treatmentRecommendation.expectedResults}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span>Treatment Steps</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.treatmentRecommendation.steps?.map((step, index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-4">
                          <h4 className="font-medium text-gray-900">
                            Step {step.step}: {step.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {step.description}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
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
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {analysis.treatmentRecommendation.warnings && 
                 analysis.treatmentRecommendation.warnings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-orange-700">
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
              </>
            )}

            {/* Personalized Notes */}
            {analysis.personalizedNotes && analysis.personalizedNotes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Personalized Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.personalizedNotes.map((note, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Brain className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{note}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Current Products */}
            {analysis.currentProducts && analysis.currentProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.currentProducts.map((product, index) => (
                      <Badge key={index} variant="outline">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisDetailDialog;
