import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Heart, ShoppingCart, Calendar, Clock } from "lucide-react";
import { aiService, ComprehensiveAnalysisResult } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalysisResultsProps {
  imageUrl: string;
  imageFile?: File;
  onAnalysisComplete?: () => void;
}

const AnalysisResults = ({ imageUrl, imageFile, onAnalysisComplete }: AnalysisResultsProps) => {
  const [analysisData, setAnalysisData] = useState<ComprehensiveAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performAnalysis = async () => {
      if (!imageFile) {
        setError("No image file provided for analysis");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get comprehensive analysis (analysis + treatment recommendations)
        const response = await aiService.getComprehensiveAnalysis(imageFile, {
          userAge: 25, // You can get this from user profile
          skinType: "combination", // You can get this from user profile
          currentProducts: ["cleanser", "moisturizer"] // You can get this from user profile
        });

        if (response.success && response.data) {
          setAnalysisData(response.data);
          // Call the completion callback if provided
          onAnalysisComplete?.();
        } else {
          setError(response.message || "Analysis failed");
        }
      } catch (err) {
        console.error("Analysis error:", err);
        setError(err instanceof Error ? err.message : "Analysis failed");
      } finally {
        setIsLoading(false);
      }
    };

    performAnalysis();
  }, [imageFile]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600 animate-spin" />
            <span>Analyzing Your Skin...</span>
          </CardTitle>
          <CardDescription>
            Our AI is processing your image and generating personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={75} className="w-full" />
          <p className="text-sm text-gray-600 text-center mt-2">
            This may take a few moments...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>Analysis Failed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
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

  const { analysis, treatment } = analysisData;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Analysis Complete</span>
          </CardTitle>
          <CardDescription>
            AI-powered analysis with personalized treatment plan
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Confidence Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Confidence Score</span>
              <span className="text-sm text-gray-600">
                {Math.round(analysis.topPrediction.confidence * 100)}%
              </span>
            </div>
            <Progress value={analysis.topPrediction.confidence * 100} className="w-full" />
          </div>

          {/* Detected Condition */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Detected Condition</h4>
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium capitalize">
                {analysis.topPrediction.condition.replace('_', ' ')}
              </span>
              <Badge variant={
                treatment.recommendation.severity === "mild" ? "secondary" : 
                treatment.recommendation.severity === "moderate" ? "default" : "destructive"
              }>
                {treatment.recommendation.severity}
              </Badge>
            </div>
          </div>

          {/* Treatment Overview */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Treatment Overview</h4>
            <p className="text-green-800 text-sm">{treatment.recommendation.overview}</p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Treatment Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span>Your Treatment Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="steps" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="steps">Treatment Steps</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="warnings">Important Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="steps" className="space-y-4 mt-4">
              {treatment.recommendation.steps.map((step, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold">Step {step.step}: {step.title}</h5>
                    <Badge variant="outline">{step.frequency}</Badge>
                  </div>
                  <p className="text-gray-700 text-sm mb-3">{step.description}</p>
                  
                  {step.products && step.products.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-2">Recommended Products:</p>
                      <div className="space-y-1">
                        {step.products.map((product, pidx) => (
                          <div key={pidx} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                            <span className="text-sm">{product}</span>
                            <Button size="sm" variant="outline">
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              Shop
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {step.tips && step.tips.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Tips:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {step.tips.map((tip, tidx) => (
                          <li key={tidx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-4 mt-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-semibold">Total Duration</h5>
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                    {treatment.timeline.totalDuration}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {treatment.timeline.phases.map((phase, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h6 className="font-medium">{phase.title}</h6>
                        <span className="text-sm text-gray-600">{phase.timeframe}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{phase.description}</p>
                      
                      {phase.expectedChanges.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-green-700">Expected Changes:</p>
                          <ul className="text-sm text-green-600 list-disc list-inside">
                            {phase.expectedChanges.map((change, cidx) => (
                              <li key={cidx}>{change}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {phase.milestones.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-blue-700">Milestones:</p>
                          <ul className="text-sm text-blue-600 list-disc list-inside">
                            {phase.milestones.map((milestone, midx) => (
                              <li key={midx}>{milestone}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="warnings" className="space-y-4 mt-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-amber-900">Important Warnings</h5>
                    <ul className="text-sm text-amber-800 mt-2 space-y-1">
                      {treatment.recommendation.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-red-900">Professional Advice</h5>
                    <p className="text-sm text-red-800 mt-1">
                      {treatment.recommendation.professionalAdvice}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          Save Analysis
        </Button>
        <Button variant="outline" className="flex-1">
          Share Results
        </Button>
      </div>
    </div>
  );
};

export default AnalysisResults;
