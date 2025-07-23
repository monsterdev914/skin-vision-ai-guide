import HistorySection from "@/components/HistorySection";
import DashboardNavbar from "@/components/DashboardNavbar";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Brain, CheckCircle, Download, Share, Eye, EyeOff } from "lucide-react";
import { historyService } from "@/lib/api";
import { getServerBaseUrl } from "@/lib/utils";
import Ripple from "@/components/ui/ripple";

const History = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const analysisId = searchParams.get('id');
  const [analysisDetail, setAnalysisDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [hoveredCondition, setHoveredCondition] = useState<number | null>(null);

  useEffect(() => {
    if (analysisId) {
      fetchAnalysisDetail(analysisId);
    }
  }, [analysisId]);

  const fetchAnalysisDetail = async (id: string) => {
    try {
      setLoading(true);
      const response = await historyService.getById(id);
      if (response.success && response.data) {
        console.log('Analysis detail data:', response.data); // Debug log to see real data structure
        console.log('Detected features:', response.data.detectedFeatures); // Debug detected features
        if (response.data.detectedFeatures) {
          response.data.detectedFeatures.forEach((feature: any, index: number) => {
            console.log(`Feature ${index + 1}:`, {
              condition: feature.condition || feature.name,
              confidence: feature.confidence,
              coordinates: {
                bbox: feature.bbox,
                boundingBox: feature.boundingBox,
                coordinates: feature.coordinates,
                x: feature.x,
                y: feature.y,
                width: feature.width,
                height: feature.height
              },
              imageInfo: {
                imageWidth: feature.imageWidth || response.data.imageWidth,
                imageHeight: feature.imageHeight || response.data.imageHeight
              }
            });
          });
        }
        setAnalysisDetail(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching analysis detail:', error);
    } finally {
      setLoading(false);
    }
  };

  // If we have an ID parameter, show detail view
  if (analysisId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <DashboardNavbar />
        
        <motion.div 
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Ripple color="rgba(99, 102, 241, 0.2)" className="rounded-lg inline-block">
              <Button 
                variant="outline" 
                onClick={() => navigate('/history')}
                className="border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to History
              </Button>
            </Ripple>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : analysisDetail ? (
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Image */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-0">
                  {/* Toggle Overlays Button */}
                  {analysisDetail?.detectedFeatures && analysisDetail.detectedFeatures.length > 0 && (
                    <div className="absolute top-3 left-3 z-20">
                      <Ripple color="rgba(59, 130, 246, 0.2)" className="rounded-lg">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowOverlays(!showOverlays)}
                          className="bg-white/90 backdrop-blur-sm border-2 hover:bg-white"
                        >
                          {showOverlays ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                          {showOverlays ? 'Hide' : 'Show'} Points
                        </Button>
                      </Ripple>
                    </div>
                  )}
                  
                  <div className="relative">
                    <img 
                      src={getServerBaseUrl() + analysisDetail.imageUrl || "/placeholder.svg"}
                      alt="Analysis"
                      className="w-full h-96 object-cover rounded-t-lg"
                    />
                    
                    {/* Condition Overlays */}
                    {showOverlays && analysisDetail?.detectedFeatures && analysisDetail.detectedFeatures.map((feature: any, index: number) => {
                      // Use real coordinates from API data - center point only
                      // Handle different coordinate formats: bbox, boundingBox, coordinates, etc.
                      let x, y;
                      
                      if (feature.bbox) {
                        // Format: [x, y, width, height] - use center of bbox
                        const centerX = feature.bbox[0] + (feature.bbox[2] / 2);
                        const centerY = feature.bbox[1] + (feature.bbox[3] / 2);
                        x = (centerX / (feature.imageWidth || 1)) * 100;
                        y = (centerY / (feature.imageHeight || 1)) * 100;
                      } else if (feature.boundingBox) {
                        // Format: {x, y, width, height} - use center of boundingBox
                        const centerX = feature.boundingBox.x + (feature.boundingBox.width / 2);
                        const centerY = feature.boundingBox.y + (feature.boundingBox.height / 2);
                        x = (centerX / (feature.imageWidth || 1)) * 100;
                        y = (centerY / (feature.imageHeight || 1)) * 100;
                      } else if (feature.coordinates) {
                        // Format: {x, y} - direct coordinates
                        x = feature.coordinates.x || 0;
                        y = feature.coordinates.y || 0;
                        
                        // If coordinates are in pixels, convert to percentage
                        if (x > 1 || y > 1) {
                          x = (x / (feature.imageWidth || analysisDetail.imageWidth || 640)) * 100;
                          y = (y / (feature.imageHeight || analysisDetail.imageHeight || 480)) * 100;
                        } else {
                          // Already normalized, convert to percentage
                          x = x * 100;
                          y = y * 100;
                        }
                      } else if (feature.x !== undefined && feature.y !== undefined) {
                        // Direct x, y properties
                        x = feature.x;
                        y = feature.y;
                        
                        // Convert if needed
                        if (x > 1 || y > 1) {
                          x = (x / (feature.imageWidth || analysisDetail.imageWidth || 640)) * 100;
                          y = (y / (feature.imageHeight || analysisDetail.imageHeight || 480)) * 100;
                        } else {
                          x = x * 100;
                          y = y * 100;
                        }
                      } else {
                        // Fallback positions if no coordinates found
                        console.warn('No coordinates found for feature:', feature);
                        x = 20 + (index * 25) % 60;
                        y = 15 + (index * 20) % 50;
                      }
                      
                      // Track if using real coordinates
                      const usingRealCoords = feature.bbox || feature.boundingBox || feature.coordinates || 
                                             (feature.x !== undefined && feature.y !== undefined);
                      
                      // Ensure coordinates are within bounds (with margin for point visibility)
                      x = Math.max(5, Math.min(95, x));
                      y = Math.max(5, Math.min(95, y));
                      
                      // Debug log calculated coordinates
                      console.log(`Point ${index + 1} calculated position:`, {
                        original: feature,
                        calculated: { x, y }
                      });
                      
                      // Color coding based on condition type or confidence
                      const confidence = feature.confidence || 0;
                      const getColorScheme = () => {
                        if (confidence > 0.8) return { border: 'border-red-500', bg: 'bg-red-500/20', label: 'bg-red-500' };
                        if (confidence > 0.6) return { border: 'border-orange-500', bg: 'bg-orange-500/20', label: 'bg-orange-500' };
                        if (confidence > 0.4) return { border: 'border-yellow-500', bg: 'bg-yellow-500/20', label: 'bg-yellow-500' };
                        return { border: 'border-blue-500', bg: 'bg-blue-500/20', label: 'bg-blue-500' };
                      };
                      
                      const colors = getColorScheme();
                      
                      return (
                        <motion.div
                          key={index}
                          className={`group absolute cursor-pointer transition-all duration-200 ${
                            hoveredCondition === index ? 'z-20' : 'z-10'
                          }`}
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            transform: 'translate(-50%, -50%)', // Center the point
                          }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ scale: 1.3 }}
                          onHoverStart={() => setHoveredCondition(index)}
                          onHoverEnd={() => setHoveredCondition(null)}
                          title={`${feature.condition || feature.name || `Condition ${index + 1}`} - ${Math.round(confidence * 100)}% confidence`}
                        >
                          {/* Main Point Indicator */}
                          <motion.div
                            className={`w-3 h-3 ${colors.label} rounded-full shadow-lg border-2 border-white ${
                              hoveredCondition === index ? 'ring-4 ring-yellow-400 ring-opacity-75 scale-150' : ''
                            }`}
                            animate={{ 
                              scale: hoveredCondition === index ? 1.5 : [1, 1.2, 1],
                            }}
                            transition={{ 
                              scale: hoveredCondition === index ? { duration: 0.2 } : { duration: 2, repeat: Infinity, repeatDelay: 1 }
                            }}
                          />
                          
                          {/* Confidence Badge - Show on hover or when highlighted */}
                          <motion.div
                            className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 ${colors.label} text-white text-xs font-bold rounded-md shadow-xl whitespace-nowrap transition-opacity duration-200 ${
                              hoveredCondition === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            {Math.round(confidence * 100)}%
                            {/* Arrow pointing to dot */}
                            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent ${colors.label.replace('bg-', 'border-t-')}`}></div>
                          </motion.div>
                        </motion.div>
                      );
                    })}

                    {/* Confidence Badge */}
                    <div className="absolute top-4 right-4 px-4 py-3 rounded-2xl bg-gradient-to-br from-white via-white to-white/95 backdrop-blur-md shadow-2xl border border-white/50">
                      <div className="text-center">
                        <div className="text-lg font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent leading-none">
                          {analysisDetail?.confidence ? Math.round(analysisDetail.confidence * 100) : 
                           analysisDetail?.detectedFeatures?.length > 0 ? 
                           Math.round(Math.max(...analysisDetail.detectedFeatures.map((f: any) => f.confidence)) * 100) :
                           'N/A'}%
                        </div>
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mt-1">
                          CONFIDENCE
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Detected Conditions List */}
                  {analysisDetail?.detectedFeatures && analysisDetail.detectedFeatures.length > 0 && (
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-gray-800">Detected Conditions</h4>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">{analysisDetail.detectedFeatures.length} found</span>
                      </div>
                      
                      {/* Conditions Grid */}
                      <div className="grid grid-cols-1 gap-3 mb-4">
                        {analysisDetail.detectedFeatures.map((feature: any, index: number) => {
                          const confidence = feature.confidence || 0;
                          const getColorScheme = () => {
                            if (confidence > 0.8) return { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', badge: 'bg-red-500' };
                            if (confidence > 0.6) return { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800', badge: 'bg-orange-500' };
                            if (confidence > 0.4) return { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800', badge: 'bg-yellow-500' };
                            return { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', badge: 'bg-blue-500' };
                          };
                          const colors = getColorScheme();
                          
                          return (
                                                         <motion.div
                               key={index}
                               className={`flex items-center justify-between p-3 ${colors.bg} ${colors.border} border-l-4 rounded-r-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                                 hoveredCondition === index ? 'ring-2 ring-yellow-400 ring-opacity-50 transform scale-105' : ''
                               }`}
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ duration: 0.3, delay: index * 0.1 }}
                               onMouseEnter={() => setHoveredCondition(index)}
                               onMouseLeave={() => setHoveredCondition(null)}
                             >
                              <div className="flex items-center space-x-3">
                                <div className={`w-6 h-6 ${colors.badge} text-white text-xs font-bold rounded-full flex items-center justify-center`}>
                                  {index + 1}
                                </div>
                                <div>
                                  <div className={`text-sm font-semibold ${colors.text}`}>
                                    {feature.condition || feature.name || `Condition ${index + 1}`}
                                  </div>
                                                                     <div className="text-xs text-gray-600">
                                     Point {index + 1} • Hover to highlight
                                   </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-lg font-bold ${colors.text}`}>
                                  {Math.round(confidence * 100)}%
                                </div>
                                <div className="text-xs text-gray-500">
                                  confidence
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Compact Legend */}
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded"></div>
                          <span className="text-gray-600">High</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-orange-500 rounded"></div>
                          <span className="text-gray-600">Medium</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded"></div>
                          <span className="text-gray-600">Low</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded"></div>
                          <span className="text-gray-600">V.Low</span>
                        </div>
                      </div>
                      
                                             <div className="text-xs text-gray-500 text-center mt-3 pt-3 border-t border-gray-200">
                         💡 Hover over conditions below or points above to highlight • Toggle points with button
                       </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {new Date(analysisDetail.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Ripple color="rgba(59, 130, 246, 0.2)" className="rounded-lg">
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </Ripple>
                        <Ripple color="rgba(34, 197, 94, 0.2)" className="rounded-lg">
                          <Button size="sm" variant="outline">
                            <Share className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </Ripple>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              <div className="space-y-6">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-xl">
                      <Brain className="w-6 h-6 text-blue-600" />
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                        Analysis Results
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Primary Condition
                      </h3>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                        {analysisDetail?.condition || 
                         analysisDetail?.primaryCondition || 
                         analysisDetail?.diagnosis ||
                         (analysisDetail?.detectedFeatures?.length > 0 ? 
                          analysisDetail.detectedFeatures[0]?.condition || analysisDetail.detectedFeatures[0]?.name :
                          'No specific condition detected')}
                      </p>
                    </div>
                    
                    {/* Additional Detected Features */}
                    {analysisDetail?.detectedFeatures && analysisDetail.detectedFeatures.length > 1 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Additional Findings
                        </h3>
                        <div className="space-y-2">
                          {analysisDetail.detectedFeatures.slice(1).map((feature: any, index: number) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <span className="text-gray-700">
                                {feature.condition || feature.name || `Feature ${index + 2}`}
                              </span>
                              <span className="text-sm font-semibold text-blue-600">
                                {Math.round((feature.confidence || 0) * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Confidence Score
                      </h3>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${analysisDetail?.confidence ? Math.round(analysisDetail.confidence * 100) : 
                                       analysisDetail?.detectedFeatures?.length > 0 ? 
                                       Math.round(Math.max(...analysisDetail.detectedFeatures.map((f: any) => f.confidence || 0)) * 100) :
                                       0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-gray-700">
                          {analysisDetail?.confidence ? Math.round(analysisDetail.confidence * 100) : 
                           analysisDetail?.detectedFeatures?.length > 0 ? 
                           Math.round(Math.max(...analysisDetail.detectedFeatures.map((f: any) => f.confidence || 0)) * 100) :
                           'N/A'}%
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-700 font-medium">Analysis Complete</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Info */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-700">Analysis Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Analysis ID:</span>
                        <span className="font-mono text-xs">{analysisId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing Time:</span>
                        <span>~2.3 seconds</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">AI Model:</span>
                        <span>SkinnyAI v2.1</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Analysis not found</p>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Default list view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <DashboardNavbar />
      
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Analysis History
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            View your past skin analyses and track your skin health progress over time
          </motion.p>
        </motion.div>

        {/* History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <HistorySection />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default History; 