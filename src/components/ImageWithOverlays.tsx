import React, { useState, useRef, useEffect } from 'react';
import { DetectedFeature, Coordinate, BoundingBox } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  isProfessional?: boolean;
}

const ImageWithOverlays: React.FC<ImageWithOverlaysProps> = ({
  imageUrl,
  detectedFeatures = [],
  imageMetadata,
  className = '',
  isProfessional = false
}) => {

  const [showOverlays, setShowOverlays] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedFeature, setSelectedFeature] = useState<DetectedFeature | null>(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [actualImageSize, setActualImageSize] = useState({ width: 0, height: 0 });
  const [naturalImageSize, setNaturalImageSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update image dimensions with proper calculations
  const updateImageDimensions = () => {
    if (imageRef.current) {
      // Get image dimensions at base zoom level (1.0)
      const naturalWidth = imageRef.current.naturalWidth;
      const naturalHeight = imageRef.current.naturalHeight;
      
      // Get the actual displayed size without transform effects
      const maxHeight = 600;
      const maxWidth = imageRef.current.parentElement?.clientWidth || 800;
      
      // Calculate displayed size respecting max constraints
      let displayWidth = naturalWidth;
      let displayHeight = naturalHeight;
      
      if (displayHeight > maxHeight) {
        const aspectRatio = naturalWidth / naturalHeight;
        displayHeight = maxHeight;
        displayWidth = displayHeight * aspectRatio;
      }
      
      if (displayWidth > maxWidth) {
        const aspectRatio = naturalHeight / naturalWidth;
        displayWidth = maxWidth;
        displayHeight = displayWidth * aspectRatio;
      }
      
      // Only update if dimensions have actually changed
      if (displayWidth !== actualImageSize.width || displayHeight !== actualImageSize.height) {
        setActualImageSize({
          width: displayWidth,
          height: displayHeight
        });
      }
      
      if (naturalWidth !== naturalImageSize.width || naturalHeight !== naturalImageSize.height) {
        setNaturalImageSize({
          width: naturalWidth,
          height: naturalHeight
        });
      }
      
      console.log('Image dimensions updated:', {
        displayed: { width: displayWidth, height: displayHeight },
        natural: { width: naturalWidth, height: naturalHeight },
        zoom: zoom
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
    // CSS transform scale will handle the zoom scaling automatically
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

  // Get color for condition type with distinct, medical-grade colors
  const getConditionColor = (condition: string): string => {
    const colors: Record<string, string> = {
      // Acne-related conditions - Reds
      'acne': '#dc2626',           // Red-600
      'hormonal_acne': '#ef4444',  // Red-500
      'blackheads': '#b91c1c',     // Red-700
      'closed_comedones': '#7f1d1d', // Red-900
      
      // Age-related conditions - Oranges/Ambers  
      'wrinkles': '#ea580c',       // Orange-600
      'forehead_wrinkles': '#f97316', // Orange-500
      'crows_feet': '#c2410c',     // Orange-700
      'age_spots': '#92400e',      // Amber-800
      'sun_damage': '#f59e0b',     // Amber-500
      
      // Pigmentation - Purples
      'dark_spots': '#7c3aed',     // Violet-600
      'melasma': '#8b5cf6',        // Purple-500
      'hyperpigmentation': '#6d28d9', // Violet-700
      'seborrheic_keratosis': '#581c87', // Purple-900
      
      // Eye area - Blues
      'dark_circles': '#2563eb',   // Blue-600
      'under_eye_bags': '#1d4ed8', // Blue-700
      'eye_bags': '#1e40af',       // Blue-800
      'puffy_eyes': '#3b82f6',     // Blue-500
      
      // Skin texture - Teals/Cyans
      'oily_skin': '#0891b2',      // Cyan-600
      'dry_skin': '#06b6d4',       // Cyan-500
      'enlarged_pores': '#0e7490', // Cyan-700
      'pores_forehead': '#0369a1', // Sky-700
      'pores_cheek': '#0284c7',    // Sky-600
      
      // Inflammation - Pinks/Roses
      'rosacea': '#e11d48',        // Rose-600
      'redness': '#f43f5e',        // Rose-500
      'inflammation': '#be185d',   // Pink-700
      'irritation': '#ec4899',     // Pink-500
      
      // Growth/Moles - Dark colors
      'moles': '#374151',          // Gray-700
      'sebaceous_hyperplasia': '#1f2937', // Gray-800
      'skin_tags': '#4b5563',      // Gray-600
      'keratosis': '#6b7280',      // Gray-500
      
      // Body conditions - Greens
      'eczema': '#059669',         // Emerald-600
      'psoriasis': '#047857',      // Emerald-700
      'keratosis_pilaris': '#10b981', // Emerald-500
      'stretch_marks': '#065f46',  // Emerald-800
      
      // Normal/Healthy - Neutrals
      'normal_skin': '#6b7280',    // Gray-500
      'healthy_skin': '#9ca3af',   // Gray-400
      'clear_skin': '#d1d5db',     // Gray-300
      
      // Default fallback
      'unknown': '#6b7280'         // Gray-500
    };
    return colors[condition] || colors['unknown'];
  };

  // Get color description for legend
  const getConditionColorInfo = () => {
    return [
      { category: 'Acne & Breakouts', color: '#dc2626', conditions: ['Acne', 'Hormonal Acne', 'Blackheads', 'Comedones'] },
      { category: 'Aging & Wrinkles', color: '#ea580c', conditions: ['Wrinkles', 'Fine Lines', 'Age Spots', 'Sun Damage'] },
      { category: 'Pigmentation', color: '#7c3aed', conditions: ['Dark Spots', 'Melasma', 'Hyperpigmentation', 'Keratosis'] },
      { category: 'Eye Area', color: '#2563eb', conditions: ['Dark Circles', 'Eye Bags', 'Puffy Eyes'] },
      { category: 'Skin Texture', color: '#0891b2', conditions: ['Oily Skin', 'Dry Skin', 'Enlarged Pores'] },
      { category: 'Inflammation', color: '#e11d48', conditions: ['Rosacea', 'Redness', 'Irritation'] },
      { category: 'Growths & Moles', color: '#374151', conditions: ['Moles', 'Skin Tags', 'Sebaceous Hyperplasia'] },
      { category: 'Body Conditions', color: '#059669', conditions: ['Eczema', 'Psoriasis', 'Keratosis Pilaris', 'Stretch Marks'] }
    ];
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
      <CardHeader className="pb-3 sm:pb-4 md:pb-6">
        <div className="flex flex-col space-y-3 sm:space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <CardTitle className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
            <span className="text-sm sm:text-base md:text-lg font-semibold leading-tight">
              {isProfessional ? "Professional Skin Analysis" : "Comprehensive Skin Analysis"}
            </span>
            {detectedFeatures.length > 0 && (
              <Badge variant="outline" className={`text-xs sm:text-sm w-fit ${isProfessional ? 'bg-purple-50 border-purple-200 text-purple-700' : ''}`}>
                {detectedFeatures.length} condition{detectedFeatures.length !== 1 ? 's' : ''} detected
                {isProfessional && ' (Medical Grade)'}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 md:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOverlays(!showOverlays)}
              className="text-xs sm:text-sm transition-all duration-300 hover:shadow-md rounded-full px-3 sm:px-4 py-2 flex items-center justify-center min-w-0"
            >
              {showOverlays ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />}
              <span className="hidden xs:inline">{showOverlays ? 'Hide' : 'Show'} Overlays</span>
              <span className="xs:hidden">{showOverlays ? 'Hide' : 'Show'}</span>
            </Button>
            
            <div className="flex items-center justify-center space-x-1 sm:space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={zoomOut} 
                className="px-2 sm:px-3 py-2 rounded-full transition-all duration-300 hover:shadow-md flex items-center justify-center min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px]"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetZoom} 
                className="px-2 sm:px-3 py-2 rounded-full transition-all duration-300 hover:shadow-md flex items-center justify-center min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px]"
                aria-label="Reset zoom"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={zoomIn} 
                className="px-2 sm:px-3 py-2 rounded-full transition-all duration-300 hover:shadow-md flex items-center justify-center min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px]"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {/* Image Container */}
          <div 
            ref={containerRef}
            className="relative border rounded-lg overflow-hidden bg-gray-50 w-full flex justify-center min-h-[200px] max-h-[400px] sm:max-h-[500px] md:max-h-[600px]"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Skin analysis"
                className="max-w-full max-h-full h-auto block object-contain"
                style={{ 
                  width: 'auto',
                  height: 'auto',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center'
                }}
                onLoad={handleImageLoad}
                onError={() => setImageLoaded(false)}
              />
              
              {/* Overlays - positioned relative to the image */}
              {showOverlays && imageLoaded && actualImageSize.width > 0 && (
                <div 
                  className="absolute inset-0 pointer-events-none transition-opacity duration-500 ease-in-out"
                  style={{ 
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center',
                    opacity: showOverlays ? 1 : 0
                  }}
                >
                  <div className="relative w-full h-full pointer-events-auto">
                  {/* Show analyzed region boundary if available - Smooth rounded */}
                  {(imageMetadata as any)?.analyzedRegion && (
                    <div
                      className="absolute border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-20 transition-all duration-300"
                      style={{
                        left: `${(imageMetadata as any).analyzedRegion.x * actualImageSize.width}px`,
                        top: `${(imageMetadata as any).analyzedRegion.y * actualImageSize.height}px`,
                        width: `${(imageMetadata as any).analyzedRegion.width * actualImageSize.width}px`,
                        height: `${(imageMetadata as any).analyzedRegion.height * actualImageSize.height}px`,
                        borderRadius: '12px',
                        backdropFilter: 'blur(1px)',
                        zIndex: 5
                      }}
                    >
                      <div className="absolute -top-6 sm:-top-7 left-1 sm:left-2 bg-blue-500 text-white text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md">
                        <span className="hidden xs:inline">Analyzed Region</span>
                        <span className="xs:hidden">Region</span>
                      </div>
                    </div>
                  )}

                  {/* Feature overlays - Professional vs Standard */}
                  {detectedFeatures.map((feature, index) => {
                    if (isProfessional && feature.boundingBox) {
                                              // Professional Analysis: Show single center point
                        const pixelBbox = normalizedBoundingBoxToPixel(feature.boundingBox);
                        
                        // Calculate marker size based on bounding box dimensions and screen size
                        const avgSize = (pixelBbox.width + pixelBbox.height) / 2;
                        const baseMarkerSize = Math.max(8, Math.min(20, avgSize * 0.3));
                        const markerSize = Math.max(6, Math.min(24, baseMarkerSize)); // Scale between 6-24px
                        const markerOffset = markerSize / 2;
                        
                        // Calculate center point of bounding box
                        const centerX = pixelBbox.x + pixelBbox.width / 2;
                        const centerY = pixelBbox.y + pixelBbox.height / 2;
                        
                        return (
                          <div key={index}>
                            {/* Single Center Point - Sized based on bounding box */}
                            <div
                              className={`absolute cursor-pointer transition-all duration-500 ease-in-out rounded-full shadow-xl ${
                                selectedFeature === feature ? 'animate-pulse' : 'hover:shadow-2xl'
                              }`}
                              style={{
                                left: `${centerX - markerOffset}px`,
                                top: `${centerY - markerOffset}px`,
                                width: `${markerSize}px`,
                                height: `${markerSize}px`,
                                backgroundColor: getConditionColor(feature.condition),
                                border: '2px solid white',
                                zIndex: 25,
                                boxShadow: `0 0 10px ${getConditionColor(feature.condition)}60`,
                                ...(selectedFeature === feature && {
                                  boxShadow: `0 0 0 4px ${getConditionColor(feature.condition)}80, 0 0 15px ${getConditionColor(feature.condition)}40`,
                                  width: `${markerSize * 1.3}px`,
                                  height: `${markerSize * 1.3}px`,
                                  left: `${centerX - (markerSize * 1.3) / 2}px`,
                                  top: `${centerY - (markerSize * 1.3) / 2}px`
                                })
                              }}
                              onClick={() => setSelectedFeature(feature)}
                              title={`${formatConditionName(feature.condition)} - ${Math.round(feature.confidence * 100)}%`}
                            />
                          

                        </div>
                      );
                    } else {
                      // Standard Analysis: Show single point marker
                    let bestPoint: { x: number; y: number };
                    
                    if (feature.coordinates && feature.coordinates.length > 0) {
                      bestPoint = feature.coordinates[0];
                    } else if (feature.boundingBox) {
                      bestPoint = {
                        x: feature.boundingBox.x + feature.boundingBox.width / 2,
                        y: feature.boundingBox.y + feature.boundingBox.height / 2
                      };
                    } else {
                      return null;
                    }

                    const pixelCoord = normalizedToPixel(bestPoint);
                      
                      // Calculate marker size based on bounding box size if available, otherwise use confidence
                      let markerSize;
                      if (feature.boundingBox) {
                        const pixelBbox = normalizedBoundingBoxToPixel(feature.boundingBox);
                        const avgSize = (pixelBbox.width + pixelBbox.height) / 2;
                        const baseMarkerSize = Math.max(8, Math.min(20, avgSize * 0.3));
                        markerSize = Math.max(6, Math.min(24, baseMarkerSize)); // Scale based on bounding box size
                      } else {
                        const baseMarkerSize = Math.max(8, Math.min(16, feature.confidence * 20));
                        markerSize = Math.max(6, Math.min(20, baseMarkerSize)); // Fallback to confidence-based sizing
                      }
                      const markerOffset = markerSize / 2;
                    
                    return (
                      <div key={index}>
                        {/* Single Point Marker */}
                        <div
                          className={`absolute cursor-pointer transition-all duration-500 ease-in-out rounded-full shadow-xl ${
                            selectedFeature === feature ? 'animate-pulse' : 'hover:shadow-2xl'
                          }`}
                          style={{
                            left: `${pixelCoord.x - markerOffset}px`,
                            top: `${pixelCoord.y - markerOffset}px`,
                            width: `${markerSize}px`,
                            height: `${markerSize}px`,
                            backgroundColor: getConditionColor(feature.condition),
                            border: '2px solid white',
                            zIndex: 25,
                            boxShadow: `0 0 10px ${getConditionColor(feature.condition)}60`,
                            ...(selectedFeature === feature && {
                              boxShadow: `0 0 0 4px ${getConditionColor(feature.condition)}80, 0 0 15px ${getConditionColor(feature.condition)}40`,
                              width: `${markerSize * 1.3}px`,
                              height: `${markerSize * 1.3}px`,
                              left: `${pixelCoord.x - (markerSize * 1.3) / 2}px`,
                              top: `${pixelCoord.y - (markerSize * 1.3) / 2}px`
                            })
                          }}
                          onClick={() => setSelectedFeature(feature)}
                          title={`${formatConditionName(feature.condition)} - ${Math.round(feature.confidence * 100)}%`}
                        />
                        


                      </div>
                    );
                    }
                  })}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Feature Details */}
          {selectedFeature && (
            <Card className="border-l-4" style={{ borderLeftColor: getConditionColor(selectedFeature.condition) }}>
              <CardContent className="pt-3 sm:pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg mb-3">
                      {formatConditionName(selectedFeature.condition)}
                    </h4>
                    <div className="space-y-2 sm:space-y-3 text-sm">
                      <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="font-medium">{Math.round(selectedFeature.confidence * 100)}%</span>
                      </div>
                      {selectedFeature.bodyRegion && (
                        <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1 xs:gap-0">
                          <span className="text-gray-600">Body Region:</span>
                          <Badge variant="secondary" className="capitalize w-fit">
                            {selectedFeature.bodyRegion}
                          </Badge>
                        </div>
                      )}
                      {selectedFeature.severity && (
                        <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1 xs:gap-0">
                          <span className="text-gray-600">Severity:</span>
                          <Badge className={`${getSeverityColor(selectedFeature.severity)} w-fit`}>
                            {selectedFeature.severity}
                          </Badge>
                        </div>
                      )}
                      {selectedFeature.area !== undefined && (
                        <div className="flex flex-col xs:flex-row xs:justify-between gap-1 xs:gap-0">
                          <span className="text-gray-600">Affected Area:</span>
                          <span className="font-medium">{selectedFeature.area.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
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
          
          {/* Color Legend */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">Color Guide</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Each color represents a different category of skin conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {getConditionColorInfo().map((colorInfo, index) => (
                  <div key={index} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded border mt-0.5 flex-shrink-0"
                      style={{ backgroundColor: colorInfo.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 leading-tight">
                        {colorInfo.category}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {colorInfo.conditions.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detected Features List */}
          {detectedFeatures.length > 0 && (
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-sm sm:text-base">Detected Conditions ({detectedFeatures.length})</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Click on any condition to view detailed information
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                  {detectedFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                        selectedFeature === feature 
                          ? 'bg-blue-50 border-blue-200 shadow-sm' 
                          : 'hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedFeature(feature)}
                    >
                      <div
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: getConditionColor(feature.condition) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-medium truncate text-gray-900">
                          {formatConditionName(feature.condition)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
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
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-sm sm:text-base">Analyzed Skin Areas</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 xs:gap-0">
                    <span className="text-sm text-gray-600">Skin Coverage:</span>
                    <Badge variant="outline" className="w-fit">
                      {imageMetadata.skinCoverage.totalSkinAreaPercentage}% of image
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Visible Regions:</div>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {imageMetadata.skinCoverage.visibleSkinRegions.map((region, index) => (
                        <Badge key={index} variant="secondary" className="text-xs capitalize">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {imageMetadata.skinCoverage.description && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-3 leading-relaxed">
                      {imageMetadata.skinCoverage.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image Metadata */}
          <div className="text-xs sm:text-sm text-gray-500 text-center space-y-1 px-2">
            {imageMetadata && (
              <div className="flex flex-col xs:flex-row xs:justify-center xs:items-center gap-1 xs:gap-2">
                <span>Original: {imageMetadata.width} × {imageMetadata.height} ({imageMetadata.format})</span>
                <span className="hidden xs:inline">•</span>
                <span>Zoom: {Math.round(zoom * 100)}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageWithOverlays; 