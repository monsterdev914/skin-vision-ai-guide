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
    aspectRatio?: number;
    skinCoverage?: {
      totalSkinAreaPercentage: number;
      visibleSkinRegions: string[];
      description: string;
    };
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
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update image dimensions with proper calculations
  const updateImageDimensions = () => {
    if (imageRef.current) {
      // Use getBoundingClientRect for more accurate sizing
      const rect = imageRef.current.getBoundingClientRect();
      const displayedWidth = rect.width;
      const displayedHeight = rect.height;
      
      // Get the natural dimensions
      const naturalWidth = imageRef.current.naturalWidth;
      const naturalHeight = imageRef.current.naturalHeight;
      
      // Only update if dimensions have actually changed
      if (displayedWidth !== actualImageSize.width || displayedHeight !== actualImageSize.height) {
        setActualImageSize({
          width: displayedWidth,
          height: displayedHeight
        });
      }
      
      if (naturalWidth !== naturalImageSize.width || naturalHeight !== naturalImageSize.height) {
        setNaturalImageSize({
          width: naturalWidth,
          height: naturalHeight
        });
      }
      
      console.log('Image dimensions updated:', {
        displayed: { width: displayedWidth, height: displayedHeight },
        natural: { width: naturalWidth, height: naturalHeight }
      });
    }
  };

  // Handle image load to get actual rendered dimensions
  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageLoaded(true);
      // Use setTimeout to ensure the image is fully rendered
      setTimeout(() => {
        updateImageDimensions();
      }, 100);
    }
  };

  // Use ResizeObserver for better resize detection
  useEffect(() => {
    if (!imageRef.current || !imageLoaded) return;

    const resizeObserver = new ResizeObserver((entries) => {
      // Debounce the resize handling
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = setTimeout(() => {
        updateImageDimensions();
      }, 150);
    });

    resizeObserver.observe(imageRef.current);

    // Fallback resize handler for older browsers
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = setTimeout(() => {
        updateImageDimensions();
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [imageLoaded, actualImageSize.width, actualImageSize.height]);

  // Update dimensions when zoom changes
  useEffect(() => {
    if (imageLoaded && imageRef.current) {
      setTimeout(() => {
        updateImageDimensions();
      }, 100);
    }
  }, [zoom]);

  // Convert normalized coordinates to pixel coordinates
  // For comprehensive skin analysis, coordinates are relative to the full image
  const normalizedToPixel = (coord: Coordinate): Coordinate => {
    if (actualImageSize.width === 0 || actualImageSize.height === 0) {
      return { x: 0, y: 0 };
    }

    // Convert normalized coordinates directly to pixel coordinates
    return {
      x: coord.x * actualImageSize.width,
      y: coord.y * actualImageSize.height
    };
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

  // Get color for condition type - comprehensive skin conditions
  const getConditionColor = (condition: string): string => {
    const colors: Record<string, string> = {
      // Facial conditions
      'hormonal_acne': '#ef4444', // red
      'forehead_wrinkles': '#f97316', // orange
      'oily_skin': '#eab308', // yellow
      'dry_skin': '#06b6d4', // cyan
      'dark_spots': '#8b5cf6', // purple
      'under_eye_bags': '#10b981', // emerald
      'rosacea': '#f43f5e', // rose
      'normal_skin': '#6b7280', // gray
      // Body conditions
      'eczema': '#f59e0b', // amber
      'psoriasis': '#dc2626', // red-600
      'keratosis_pilaris': '#059669', // emerald-600
      'stretch_marks': '#7c3aed', // violet-600
      'scars': '#4b5563', // gray-600
      'moles': '#1f2937', // gray-800
      'sun_damage': '#f59e0b', // amber
      'age_spots': '#92400e', // amber-800
      'seborrheic_keratosis': '#78716c' // stone-500
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
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-2 sm:gap-0">
            <span className="text-base sm:text-lg">Comprehensive Skin Analysis</span>
            {detectedFeatures.length > 0 && (
              <Badge variant="outline" className="text-xs sm:text-sm w-fit">
                {detectedFeatures.length} condition{detectedFeatures.length !== 1 ? 's' : ''} detected
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center sm:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOverlays(!showOverlays)}
              className="text-xs sm:text-sm"
            >
              {showOverlays ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
              {showOverlays ? 'Hide' : 'Show'} Overlays
            </Button>
            
            <div className="flex items-center justify-center space-x-1 sm:space-x-2">
              <Button variant="outline" size="sm" onClick={zoomOut} className="px-2 sm:px-3">
                <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetZoom} className="px-2 sm:px-3">
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={zoomIn} className="px-2 sm:px-3">
                <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDebugMode(!debugMode)}
                className={`px-2 sm:px-3 text-xs ${debugMode ? 'bg-blue-100' : ''}`}
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
            className="relative border rounded-lg overflow-hidden bg-gray-50 w-full flex justify-center"
            style={{ maxHeight: '600px' }}
          >
            <div 
              className="relative"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Skin analysis"
                className="max-w-full h-auto block"
                style={{ 
                  maxHeight: '600px',
                  width: 'auto',
                  height: 'auto'
                }}
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
                            Body: {feature.bodyRegion || 'Unknown'}
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
                      {selectedFeature.bodyRegion && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Body Region:</span>
                          <Badge variant="secondary" className="capitalize">
                            {selectedFeature.bodyRegion}
                          </Badge>
                        </div>
                      )}
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
                  
                  <div className="space-y-3">
                    {selectedFeature.description && (
                      <div>
                        <h5 className="font-medium mb-2">Description:</h5>
                        <p className="text-sm text-gray-600">{selectedFeature.description}</p>
                      </div>
                    )}
                    
                    {selectedFeature.distinctiveCharacteristics && (
                      <div>
                        <h5 className="font-medium mb-2">Why This Location:</h5>
                        <p className="text-sm text-gray-600">{selectedFeature.distinctiveCharacteristics}</p>
                      </div>
                    )}
                    
                    {selectedFeature.coordinates && selectedFeature.coordinates.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Most Distinctive Point:</h5>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>
                            Location: ({(selectedFeature.coordinates[0].x * 100).toFixed(1)}%, {(selectedFeature.coordinates[0].y * 100).toFixed(1)}%)
                          </div>
                          <div className="text-gray-500">
                            This represents the most obvious manifestation of {formatConditionName(selectedFeature.condition).toLowerCase()}.
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedFeature.coordinateVerification?.skinAreaDescription && (
                      <div>
                        <h5 className="font-medium mb-2">Skin Area Analysis:</h5>
                        <p className="text-xs text-gray-600">{selectedFeature.coordinateVerification.skinAreaDescription}</p>
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
          
          {/* Skin Coverage Summary */}
          {imageMetadata?.skinCoverage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Analyzed Skin Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Skin Coverage:</span>
                    <Badge variant="outline">
                      {imageMetadata.skinCoverage.totalSkinAreaPercentage}% of image
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Visible Regions:</div>
                    <div className="flex flex-wrap gap-1">
                      {imageMetadata.skinCoverage.visibleSkinRegions.map((region, index) => (
                        <Badge key={index} variant="secondary" className="text-xs capitalize">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {imageMetadata.skinCoverage.description && (
                    <p className="text-xs text-gray-500 mt-2">
                      {imageMetadata.skinCoverage.description}
                    </p>
                  )}
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
                Conditions: {detectedFeatures.length} detected<br />
                Body Regions: {[...new Set(detectedFeatures.map(f => f.bodyRegion).filter(Boolean))].join(', ') || 'None'}<br />
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