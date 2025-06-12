
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, Brain, Heart, Shield } from "lucide-react";

interface AnalysisData {
  id: number;
  date: string;
  condition: string;
  confidence: number;
  improvement: string;
  image: string;
}

interface AnalysisDetailDialogProps {
  analysis: AnalysisData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AnalysisDetailDialog = ({ analysis, open, onOpenChange }: AnalysisDetailDialogProps) => {
  if (!analysis) return null;

  const mockDetails = {
    severity: analysis.condition.includes("Mild") ? "Mild" : "Moderate",
    affectedAreas: ["Forehead", "Cheeks", "Chin"],
    recommendations: [
      "Use gentle, non-comedogenic cleanser twice daily",
      "Apply salicylic acid treatment 2-3 times per week",
      "Use oil-free moisturizer morning and evening",
      "Apply broad-spectrum SPF 30+ sunscreen daily"
    ],
    skinType: "Combination",
    notes: "Improvement noted in overall texture and reduced inflammation compared to previous analysis."
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <span>Analysis Details - {analysis.date}</span>
          </DialogTitle>
          <DialogDescription>
            Detailed view of your skin analysis results and recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image and Basic Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analysis Image</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={analysis.image}
                  alt="Skin analysis"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Analysis Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Condition:</span>
                  <Badge variant="outline">{analysis.condition}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confidence:</span>
                  <span className="font-medium">{analysis.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Improvement:</span>
                  <Badge variant={analysis.improvement === "Baseline" ? "secondary" : "default"}>
                    {analysis.improvement}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Severity:</span>
                  <span className="font-medium">{mockDetails.severity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Skin Type:</span>
                  <span className="font-medium">{mockDetails.skinType}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span>Affected Areas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mockDetails.affectedAreas.map((area) => (
                    <Badge key={area} variant="outline">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-600" />
                  <span>Recommendations</span>
                </CardTitle>
                <CardDescription>
                  Personalized skincare recommendations based on your analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mockDetails.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analysis Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{mockDetails.notes}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisDetailDialog;
