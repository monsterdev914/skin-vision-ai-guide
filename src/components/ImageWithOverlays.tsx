import React, { useState, useRef, useEffect } from 'react';
import { DetectedFeature, Coordinate, BoundingBox } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageWithOverlaysProps {
  imageUrl: string;
  detectedFeatures?: DetectedFeature[];
  imageMetadata?: {
    width: number;
    height: number;
    format: string;
    analyzedRegion?: {
      x: number;
      y: number;
      width: number;
      height: number;
      description: string;
    };
  };
  className?: string;
}

const ImageWithOverlays: React.FC<ImageWithOverlaysProps> = ({
  imageUrl,
  detectedFeatures = [],
  imageMetadata,
  className = ''
}) => {
  console.log(imageMetadata )
  const [showOverlays, setShowOverlays] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedFeature, setSelectedFeature] = useState<DetectedFeature | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [actualImageSize, setActualImageSize] = useState({ width: 0, height: 0 });
  const [naturalImageSize, setNaturalImageSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle image load to get actual rendered dimensions
  const handleImageLoad = () => {
    if (imageRef.current) {
      // Get the actual displayed dimensions
      const displayedWidth = imageRef.current.offsetWidth;
      const displayedHeight = imageRef.current.offsetHeight;
      
      // Get the natural dimensions
      const naturalWidth = imageRef.current.naturalWidth;
      const naturalHeight = imageRef.current.naturalHeight;
      
      setActualImageSize({
        width: displayedWidth,
        height: displayedHeight
      });
      
      setNaturalImageSize({
        width: naturalWidth,
        height: naturalHeight
      });
      
      setImageLoaded(true);
      
      console.log('Image loaded:', {
        displayed: { width: displayedWidth, height: displayedHeight },
        natural: { width: naturalWidth, height: naturalHeight }
      });
    }
  };

  // Recalculate dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current && imageLoaded) {
        setActualImageSize({
          width: imageRef.current.offsetWidth,
          height: imageRef.current.offsetHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageLoaded]);

  // Convert normalized coordinates to pixel coordinates
  // If we have an analyzed region, coordinates should be relative to that region
  const normalizedToPixel = (coord: Coordinate): Coordinate => {
    const analyzedRegion = (imageMetadata as any)?.analyzedRegion;
    
    if (analyzedRegion) {
      // Coordinates from AI are relative to the analyzed region, not the full image
      // Transform them to be positioned within the analyzed region
      const regionX = analyzedRegion.x * actualImageSize.width;
      const regionY = analyzedRegion.y * actualImageSize.height;
      const regionWidth = analyzedRegion.width * actualImageSize.width;
      const regionHeight = analyzedRegion.height * actualImageSize.height;
      
      return {
        x: regionX + (coord.x * regionWidth),
        y: regionY + (coord.y * regionHeight)
      };
    } else {
      // Fallback to full image coordinates
      return {
        x: coord.x * actualImageSize.width,
        y: coord.y * actualImageSize.height
      };
    }
  };

  // Convert normalized bounding box to pixel bounding box
  const normalizedBoundingBoxToPixel = (bbox: BoundingBox): BoundingBox => {
    return {
      x: bbox.x * actualImageSize.width,
      y: bbox.y * actualImageSize.height,
      width: bbox.width * actualImageSize.width,
      height: bbox.height * actualImageSize.height
    };
  };

  // Get color for condition type
  const getConditionColor = (condition: string): string => {
    const colors: Record<string, string> = {
      'hormonal_acne': '#ef4444', // red
      'forehead_wrinkles': '#f97316', // orange
      'oily_skin': '#eab308', // yellow
      'dry_skin': '#06b6d4', // cyan
      'dark_spots': '#8b5cf6', // purple
      'under_eye_bags': '#10b981', // emerald
      'rosacea': '#f43f5e', // rose
      'normal_skin': '#6b7280' // gray
    };
    return colors[condition] || '#6b7280';
  };

  // Get severity badge color
  const getSeverityColor = (severity?: string): string => {
    switch (severity) {
      case 'mild': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'severe': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format condition name for display
  const formatConditionName = (condition: string): string => {
    return condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const resetZoom = () => setZoom(1);
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>Skin Analysis Visualization</span>
            {detectedFeatures.length > 0 && (
              <Badge variant="outline">{detectedFeatures.length} features detected</Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOverlays(!showOverlays)}
            >
              {showOverlays ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showOverlays ? 'Hide' : 'Show'} Overlays
            </Button>
            
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" onClick={zoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetZoom}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={zoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDebugMode(!debugMode)}
                className={debugMode ? 'bg-blue-100' : ''}
              >
                🐛
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Image Container */}
          <div 
            ref={containerRef}
            className="relative border rounded-lg overflow-hidden bg-gray-50"
            style={{ maxHeight: '600px' }}
          >
            <div 
              className="relative inline-block"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Skin analysis"
                className="max-w-full h-auto block"
                onLoad={handleImageLoad}
                onError={() => setImageLoaded(false)}
              />
              
              {/* Overlays - Best Feature Points Only */}
              {showOverlays && imageLoaded && actualImageSize.width > 0 && (
                <>
                  {/* Show analyzed region boundary if available */}
                  {(imageMetadata as any)?.analyzedRegion && (
                    <div
                      className="absolute border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-20"
                      style={{
                        left: `${(imageMetadata as any).analyzedRegion.x * actualImageSize.width}px`,
                        top: `${(imageMetadata as any).analyzedRegion.y * actualImageSize.height}px`,
                        width: `${(imageMetadata as any).analyzedRegion.width * actualImageSize.width}px`,
                        height: `${(imageMetadata as any).analyzedRegion.height * actualImageSize.height}px`,
                        zIndex: 5
                      }}
                    >
                      <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Analyzed Region
                      </div>
                    </div>
                  )}

                  {/* Feature points */}
                  {detectedFeatures.map((feature, index) => {
                    // Get the best coordinate point (first one, or center of bounding box if no coordinates)
                    let bestPoint: { x: number; y: number };
                    
                    if (feature.coordinates && feature.coordinates.length > 0) {
                      // Use the first coordinate as the best point
                      bestPoint = feature.coordinates[0];
                    } else if (feature.boundingBox) {
                      // Fallback to center of bounding box
                      bestPoint = {
                        x: feature.boundingBox.x + feature.boundingBox.width / 2,
                        y: feature.boundingBox.y + feature.boundingBox.height / 2
                      };
                    } else {
                      // Skip if no coordinates available
                      return null;
                    }

                    const pixelCoord = normalizedToPixel(bestPoint);
                    const radius = Math.max(15, Math.min(30, feature.confidence * 40)); // Dynamic radius based on confidence
                    
                    return (
                      <div key={index}>
                        {/* Circular Area with Radius */}
                        <div
                          className={`absolute rounded-full cursor-pointer transition-all duration-300 ${
                            selectedFeature === feature ? 'ring-4 ring-white ring-opacity-70' : ''
                          }`}
                          style={{
                            left: `${pixelCoord.x - radius}px`,
                            top: `${pixelCoord.y - radius}px`,
                            width: `${radius * 2}px`,
                            height: `${radius * 2}px`,
                            backgroundColor: `${getConditionColor(feature.condition)}30`,
                            border: `2px solid ${getConditionColor(feature.condition)}`,
                            zIndex: 10
                          }}
                          onClick={() => setSelectedFeature(feature)}
                        />
                        
                        {/* Center Dot */}
                        <div
                          className="absolute cursor-pointer"
                          style={{
                            left: `${pixelCoord.x - 6}px`,
                            top: `${pixelCoord.y - 6}px`,
                            zIndex: 20
                          }}
                          onClick={() => setSelectedFeature(feature)}
                        >
                          <div
                            className={`w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all duration-200 ${
                              selectedFeature === feature ? 'w-4 h-4 ring-2 ring-white ring-opacity-50' : 'hover:w-4 hover:h-4'
                            }`}
                            style={{ backgroundColor: getConditionColor(feature.condition) }}
                            title={`${formatConditionName(feature.condition)} - ${Math.round(feature.confidence * 100)}%`}
                          />
                        </div>
                        
                        {/* Feature Label */}
                        <div
                          className="absolute pointer-events-none"
                          style={{
                            left: `${pixelCoord.x - 40}px`, // Center the label
                            top: `${Math.max(5, pixelCoord.y - radius - 25)}px`, // Position above the circle
                            zIndex: 30
                          }}
                        >
                          <div
                            className="px-2 py-1 rounded text-xs font-medium text-white shadow-lg whitespace-nowrap"
                            style={{ backgroundColor: getConditionColor(feature.condition) }}
                          >
                            {formatConditionName(feature.condition)}
                            <span className="ml-1">({Math.round(feature.confidence * 100)}%)</span>
                          </div>
                        </div>
                        
                        {/* Debug Info */}
                        {debugMode && (
                          <div
                            className="absolute bg-black text-white text-xs px-1 py-0.5 rounded pointer-events-none"
                            style={{
                              left: `${pixelCoord.x + radius + 5}px`,
                              top: `${pixelCoord.y - 10}px`,
                              zIndex: 40
                            }}
                          >
                            Norm: ({bestPoint.x.toFixed(3)}, {bestPoint.y.toFixed(3)})
                            <br />
                            Pixel: [{Math.round(pixelCoord.x)}, {Math.round(pixelCoord.y)}]
                            <br />
                            {(imageMetadata as any)?.analyzedRegion ? 'Face-relative' : 'Full-image'}
                            <br />
                            R: {radius}px
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
          
          {/* Feature Details */}
          {selectedFeature && (
            <Card className="border-l-4" style={{ borderLeftColor: getConditionColor(selectedFeature.condition) }}>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">
                      {formatConditionName(selectedFeature.condition)}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="font-medium">{Math.round(selectedFeature.confidence * 100)}%</span>
                      </div>
                      {selectedFeature.severity && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Severity:</span>
                          <Badge className={getSeverityColor(selectedFeature.severity)}>
                            {selectedFeature.severity}
                          </Badge>
                        </div>
                      )}
                      {selectedFeature.area !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Affected Area:</span>
                          <span className="font-medium">{selectedFeature.area.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    {selectedFeature.description && (
                      <div>
                        <h5 className="font-medium mb-2">Description:</h5>
                        <p className="text-sm text-gray-600">{selectedFeature.description}</p>
                      </div>
                    )}
                    
                    {selectedFeature.coordinates && selectedFeature.coordinates.length > 0 && (
                      <div className="mt-3">
                        <h5 className="font-medium mb-2">Detected Points:</h5>
                        <div className="text-xs text-gray-600 space-y-1">
                          {selectedFeature.coordinates.slice(0, 3).map((coord, idx) => (
                            <div key={idx}>
                              Point {idx + 1}: ({(coord.x * 100).toFixed(1)}%, {(coord.y * 100).toFixed(1)}%)
                            </div>
                          ))}
                          {selectedFeature.coordinates.length > 3 && (
                            <div>...and {selectedFeature.coordinates.length - 3} more points</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setSelectedFeature(null)}
                >
                  Close Details
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Features Legend */}
          {detectedFeatures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Detected Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {detectedFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                        selectedFeature === feature ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedFeature(feature)}
                    >
                      <div
                        className="w-3 h-3 rounded border"
                        style={{ backgroundColor: getConditionColor(feature.condition) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {formatConditionName(feature.condition)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round(feature.confidence * 100)}% confidence
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Image Metadata */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            {imageMetadata && (
              <div>
                Original: {imageMetadata.width} × {imageMetadata.height} ({imageMetadata.format}) • 
                Zoom: {Math.round(zoom * 100)}%
              </div>
            )}
            {debugMode && (
              <div className="bg-gray-100 p-2 rounded text-left">
                <strong>Debug Info:</strong><br />
                Displayed: {actualImageSize.width} × {actualImageSize.height}<br />
                Natural: {naturalImageSize.width} × {naturalImageSize.height}<br />
                Features: {detectedFeatures.length} detected<br />
                Image Loaded: {imageLoaded ? 'Yes' : 'No'}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageWithOverlays; 