import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, AlertCircle, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiService } from "@/lib/api";
import ImageWithOverlays from "@/components/ImageWithOverlays";

interface AnalysisResultsProps {
  imageUrl: string;
  imageFile?: File;
  onAnalysisComplete?: () => void;
}

const AnalysisResults = ({ imageUrl, imageFile, onAnalysisComplete }: AnalysisResultsProps) => {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Reset analysis flag when image changes
  useEffect(() => {
    setHasAnalyzed(false);
    setAnalysisData(null);
    setError(null);
  }, [imageFile]);

  const performProfessionalAnalysis = async () => {
    if (!imageFile) {
      setError("No image file provided for analysis");
      return;
    }

    setLoading(true);
    setError(null);
    setHasAnalyzed(true);

    try {
      console.log("Starting professional skin analysis with Skin Analyze Pro API...");
      
      const response = await aiService.getProfessionalSkinAnalysis(
        imageFile,
        25, // Default age, could get from user profile
        'normal', // Default skin type, could get from user profile
        [] // Default products, could get from user profile
      );

      if (response.success && response.data) {
        console.log("Professional analysis successful:", response.data);
        console.log("Treatment data structure:", response.data.treatment);
        console.log("Treatment recommendation:", response.data.treatment?.recommendation);
        setAnalysisData(response.data);
        
        if (onAnalysisComplete) {
          console.log("Calling onAnalysisComplete to refresh history");
          onAnalysisComplete();
        }
      } else {
        setError(response.message || "Professional analysis failed");
      }
    } catch (err) {
      console.error("Professional analysis error:", err);
      setError(err instanceof Error ? err.message : "Professional analysis failed");
    } finally {
      setLoading(false);
    }
  };

  // Auto-start professional analysis when image is provided
  useEffect(() => {
    if (imageFile && !hasAnalyzed && !loading) {
      performProfessionalAnalysis();
    }
  }, [imageFile, hasAnalyzed, loading]);

  // Show loading state while analysis is starting or if no analysis has been started
  if (!hasAnalyzed && !loading) {
    return (
      <div className="w-full max-w-4xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              Professional Skin Analysis
              <Badge className="bg-purple-600 text-white text-xs">AI-POWERED</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
            <p className="text-lg font-medium mb-2">Preparing analysis...</p>
            <p className="text-sm text-gray-600">Setting up medical-grade AI technology</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Performing Professional Analysis</h3>
          <p className="text-gray-600 text-center">
            Using medical-grade AI to detect skin conditions with precise location mapping...
          </p>
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-700 text-center">
              Professional analysis provides precise bounding boxes for each detected condition
            </p>
          </div>
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
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={() => {
              setError(null);
              setHasAnalyzed(false);
            }}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analysisData) {
    return null;
  }

  const { analysis, treatment, ageDetection } = analysisData;
  
  // Ensure treatment has the expected structure
  const safeeTreatment = treatment && typeof treatment === 'object' ? {
    recommendation: treatment.recommendation || {},
    timeline: treatment.timeline || null,
    ...treatment
  } : null;
  
  console.log("Safe treatment structure:", safeeTreatment);
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
            <Star className="h-5 w-5 text-purple-500" />
            Professional Analysis Complete
            <Badge className="bg-purple-600 text-white">Medical Grade</Badge>
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

          {/* Professional Metrics */}
          {analysis.professionalMetrics && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-3">Professional Skin Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Skin Tone</p>
                  <p className="font-medium">{analysis.professionalMetrics.skinTone || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Skin Type</p>
                  <p className="font-medium capitalize">{analysis.professionalMetrics.skinType || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Skin Age</p>
                  <p className="font-medium">{analysis.professionalMetrics.skinAge || 'N/A'} years</p>
                </div>
                <div>
                  <p className="text-gray-600">Quality Score</p>
                  <p className="font-medium">{analysis.professionalMetrics.qualityScore || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Age Detection */}
          {ageDetection && (
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Estimated Age</p>
                <p className="text-sm text-gray-600">
                  {ageDetection.estimatedAge} years 
                  ({Math.round(ageDetection.confidence * 100)}% confidence)
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image with Overlays */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-500" />
            Detected Conditions
            <Badge className="bg-purple-100 text-purple-800">Medical Grade Detection</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageWithOverlays
            imageUrl={imageUrl}
            detectedFeatures={analysis.detectedFeatures || []}
            imageMetadata={analysis.imageMetadata}
            isProfessional={true}
          />
        </CardContent>
      </Card>

      {/* All Detected Conditions */}
      {analysis.allPredictions && Object.keys(analysis.allPredictions).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-500" />
              All Detected Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analysis.allPredictions)
                .filter(([_, confidence]) => (confidence as number) > 0.1)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([condition, confidence]) => (
                  <div key={condition} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="capitalize font-medium">
                      {condition.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(confidence as number) * 100} 
                        className="w-20 h-2"
                      />
                      <Badge variant="outline" className={getSeverityColor(confidence as number)}>
                        {Math.round((confidence as number) * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Treatment Recommendations */}
      {safeeTreatment && safeeTreatment.recommendation && Object.keys(safeeTreatment.recommendation).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-500" />
              Professional Treatment Plan
              <Badge className="bg-purple-100 text-purple-800">Personalized</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Treatment Overview */}
            {safeeTreatment.recommendation.overview && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Treatment Overview</h4>
                <p className="text-purple-700">{safeeTreatment.recommendation.overview}</p>
              </div>
            )}

            {/* Treatment Steps */}
            {safeeTreatment.recommendation.steps && safeeTreatment.recommendation.steps.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4">Treatment Steps</h4>
                <div className="space-y-4">
                  {safeeTreatment.recommendation.steps.map((step: any, index: number) => (
                  <div key={index} className="flex gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold mb-1">{step.title}</h5>
                      <p className="text-gray-600 mb-2">{step.description}</p>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Frequency:</span> {step.frequency} • 
                        <span className="font-medium ml-1">Duration:</span> {step.duration}
                      </div>
                      {step.products && step.products.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-700">Recommended products:</span>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {step.products.map((product: string, idx: number) => (
                              <li key={idx}>{product}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {safeeTreatment.timeline && safeeTreatment.timeline.phases && safeeTreatment.timeline.phases.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4">Treatment Timeline</h4>
                <div className="space-y-3">
                  {safeeTreatment.timeline.phases.map((phase: any, index: number) => (
                    <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {phase.phase}
                      </div>
                      <div>
                        <h5 className="font-medium">{phase.title}</h5>
                        <p className="text-sm text-gray-600">{phase.timeframe}</p>
                        <p className="text-sm text-gray-700 mt-1">{phase.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expected Results */}
            {safeeTreatment.recommendation.expectedResults && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Expected Results</h4>
                <p className="text-green-700">{safeeTreatment.recommendation.expectedResults}</p>
              </div>
            )}

            {/* Warnings */}
            {safeeTreatment.recommendation.warnings && safeeTreatment.recommendation.warnings.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-2">Important Warnings</h4>
                <ul className="text-amber-700 space-y-1">
                  {safeeTreatment.recommendation.warnings.map((warning: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Professional Advice */}
            {safeeTreatment.recommendation.professionalAdvice && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Professional Advice</h4>
                <p className="text-blue-700">{safeeTreatment.recommendation.professionalAdvice}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisResults; 