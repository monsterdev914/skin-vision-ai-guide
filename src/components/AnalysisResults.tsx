import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiService } from "@/lib/api";

interface AnalysisResultsProps {
  imageUrl: string;
  imageFile?: File;
  onAnalysisComplete?: () => void;
}

const AnalysisResults = ({ imageUrl, imageFile, onAnalysisComplete }: AnalysisResultsProps) => {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false); // Prevent repeated analysis

  // Reset analysis flag when image changes
  useEffect(() => {
    setHasAnalyzed(false);
    setAnalysisData(null);
    setError(null);
  }, [imageFile]);

  useEffect(() => {
    const performAnalysis = async () => {
      if (!imageFile) {
        setError("No image file provided for analysis");
        return;
      }

      // Prevent repeated analysis of the same image
      if (hasAnalyzed || loading) {
        return;
      }

      setLoading(true);
      setError(null);
      setHasAnalyzed(true); // Mark as analyzed

      try {
        console.log("Starting comprehensive analysis...");
        
        // Call comprehensive analysis without hardcoded age - let AI detect it
        const response = await aiService.getComprehensiveAnalysis(imageFile, {
          // Remove hardcoded userAge - let AI detect age from image
          skinType: 'normal', // Could get this from user profile
          currentProducts: [] // Could get this from user profile
        });

        if (response.success && response.data) {
          console.log("Analysis successful:", response.data);
          setAnalysisData(response.data);
          if (onAnalysisComplete) {
            onAnalysisComplete();
          }
        } else {
          setError(response.message || "Analysis failed");
        }
      } catch (err) {
        console.error("Analysis error:", err);
        setError(err instanceof Error ? err.message : "Analysis failed");
      } finally {
        setLoading(false);
      }
    };

    performAnalysis();
  }, [imageFile]); // Remove onAnalysisComplete from dependencies to prevent loops

  if (loading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analyzing Your Image</h3>
          <p className="text-gray-600 text-center">
            Our AI is processing your image and generating personalized recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl border-red-200">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Analysis Failed</h3>
          <p className="text-red-600 text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysisData) {
    return null;
  }

  const { analysis, treatment, ageDetection } = analysisData;
  const topCondition = analysis.topPrediction;

  const getSeverityColor = (confidence: number) => {
    if (confidence > 0.7) return "bg-red-500";
    if (confidence > 0.4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getSeverityText = (confidence: number) => {
    if (confidence > 0.7) return "High";
    if (confidence > 0.4) return "Moderate";
    return "Low";
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Analysis Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Condition */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Primary Condition Detected</h3>
              <p className="text-gray-600 capitalize">
                {topCondition.condition.replace(/_/g, ' ')}
              </p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className={`${getSeverityColor(topCondition.confidence)} text-white`}>
                {getSeverityText(topCondition.confidence)} Confidence
              </Badge>
              <p className="text-sm text-gray-500 mt-1">
                {Math.round(topCondition.confidence * 100)}% match
              </p>
            </div>
          </div>

          {/* Confidence Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Confidence Level</span>
              <span>{Math.round(topCondition.confidence * 100)}%</span>
            </div>
            <Progress value={topCondition.confidence * 100} className="h-2" />
          </div>

          {/* All Predictions */}
          <div>
            <h4 className="font-medium mb-3">All Detected Conditions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysis.allPredictions.map((prediction: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="capitalize text-sm">
                    {prediction.condition.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{prediction.percentage}</span>
                    <Progress value={prediction.confidence * 100} className="w-16 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Recommendations */}
      {treatment?.recommendation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Personalized Treatment Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-900 font-medium mb-2">Treatment Overview</p>
              <p className="text-blue-800 text-sm">{treatment.recommendation.overview}</p>
            </div>

            <div>
              <h4 className="font-medium mb-3">Recommended Steps</h4>
              <div className="space-y-3">
                {treatment.recommendation.steps.map((step: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium mb-1">{step.title}</h5>
                        <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                        
                        {step.products && step.products.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">Recommended Products:</p>
                            <div className="flex flex-wrap gap-1">
                              {step.products.map((product: string, pIndex: number) => (
                                <Badge key={pIndex} variant="secondary" className="text-xs">
                                  {product}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Frequency: {step.frequency}</span>
                          <span>Duration: {step.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {treatment.recommendation.warnings && treatment.recommendation.warnings.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h5 className="font-medium text-amber-800 mb-2">Important Warnings</h5>
                <ul className="text-sm text-amber-700 space-y-1">
                  {treatment.recommendation.warnings.map((warning: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {treatment.recommendation.professionalAdvice && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h5 className="font-medium text-green-800 mb-2">Professional Advice</h5>
                <p className="text-sm text-green-700">{treatment.recommendation.professionalAdvice}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisResults;
