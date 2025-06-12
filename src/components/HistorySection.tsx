
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Eye } from "lucide-react";

const HistorySection = () => {
  const mockHistory = [
    {
      id: 1,
      date: "2024-01-15",
      condition: "Mild Acne",
      confidence: 92,
      improvement: "+15%",
      image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=100&h=100&fit=crop"
    },
    {
      id: 2,
      date: "2024-01-08",
      condition: "Mild Acne",
      confidence: 89,
      improvement: "+8%",
      image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=100&h=100&fit=crop"
    },
    {
      id: 3,
      date: "2024-01-01",
      condition: "Moderate Acne",
      confidence: 94,
      improvement: "Baseline",
      image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=100&h=100&fit=crop"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>Progress Overview</span>
          </CardTitle>
          <CardDescription>
            Track your skin health journey over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">23%</div>
              <div className="text-sm text-gray-600">Overall Improvement</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
              <div className="text-sm text-gray-600">Analyses Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">45</div>
              <div className="text-sm text-gray-600">Days Tracked</div>
            </div>
          </div>
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
          <div className="space-y-4">
            {mockHistory.map((analysis) => (
              <div key={analysis.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <img
                  src={analysis.image}
                  alt="Analysis"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{analysis.condition}</h3>
                    <Badge variant={analysis.improvement === "Baseline" ? "secondary" : "default"}>
                      {analysis.improvement}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{analysis.date}</span>
                    <span>•</span>
                    <span>{analysis.confidence}% confidence</span>
                  </div>
                </div>
                
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistorySection;
