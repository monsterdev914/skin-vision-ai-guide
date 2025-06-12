
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Heart, ShoppingCart, Calendar } from "lucide-react";

interface AnalysisResultsProps {
  imageUrl: string;
}

const AnalysisResults = ({ imageUrl }: AnalysisResultsProps) => {
  const mockResults = {
    condition: "Mild Acne (Comedonal)",
    confidence: 92,
    severity: "Mild",
    recommendations: [
      "Salicylic Acid Cleanser (2%)",
      "Benzoyl Peroxide Spot Treatment",
      "Non-comedogenic Moisturizer",
      "Broad Spectrum SPF 30+"
    ],
    timeline: "Expected improvement in 4-6 weeks",
    followUp: "Monitor progress weekly"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span>Analysis Complete</span>
        </CardTitle>
        <CardDescription>
          AI-powered analysis with personalized recommendations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Confidence Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Confidence Score</span>
            <span className="text-sm text-gray-600">{mockResults.confidence}%</span>
          </div>
          <Progress value={mockResults.confidence} className="w-full" />
        </div>

        {/* Condition */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Detected Condition</h4>
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">{mockResults.condition}</span>
            <Badge variant={mockResults.severity === "Mild" ? "secondary" : "destructive"}>
              {mockResults.severity}
            </Badge>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Heart className="w-4 h-4 mr-2 text-red-500" />
            Treatment Recommendations
          </h4>
          <div className="space-y-2">
            {mockResults.recommendations.map((rec, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <span className="text-gray-800">{rec}</span>
                <Button size="sm" variant="outline">
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Shop
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Expected Timeline
          </h4>
          <p className="text-green-800">{mockResults.timeline}</p>
          <p className="text-sm text-green-700 mt-1">{mockResults.followUp}</p>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800">
                <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only 
                and should not replace professional medical advice. Consult a dermatologist for severe 
                or persistent conditions.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            Save Analysis
          </Button>
          <Button variant="outline" className="flex-1">
            Share Results
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;
