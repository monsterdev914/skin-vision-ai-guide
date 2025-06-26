import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CameraOff, RotateCcw, CheckCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { aiService } from '@/lib/api';

interface CameraCaptureProps {
  onImageCapture: (imageFile: File, imageUrl: string) => void;
  onError?: (error: string) => void;
}

interface QualityCheck {
  resolution: 'good' | 'warning' | 'error';
  lighting: 'good' | 'warning' | 'error';
  blur: 'good' | 'warning' | 'error';
  face: 'good' | 'warning' | 'error';
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageCapture, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [qualityChecks, setQualityChecks] = useState<QualityCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [skinValidation, setSkinValidation] = useState<any>(null);

  // Camera constraints for high quality
  const constraints = {
    video: {
      width: { ideal: 1920, min: 1280 },
      height: { ideal: 1080, min: 720 },
      facingMode: 'user', // Front camera
      frameRate: { ideal: 30 },
    }
  };

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          setIsStreaming(true);
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onError]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setCameraReady(false);
    setCapturedImage(null);
    setQualityChecks(null);
  }, []);

  const analyzeImageQuality = useCallback((canvas: HTMLCanvasElement): QualityCheck => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { resolution: 'error', lighting: 'error', blur: 'error', face: 'error' };
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Resolution check
    const resolution = canvas.width >= 1280 && canvas.height >= 720 ? 'good' : 
                      canvas.width >= 640 && canvas.height >= 480 ? 'warning' : 'error';

    // Lighting analysis (brightness)
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      totalBrightness += (r + g + b) / 3;
    }
    const avgBrightness = totalBrightness / (data.length / 4);
    const lighting = avgBrightness > 40 && avgBrightness < 220 ? 'good' :
                    avgBrightness > 20 && avgBrightness < 240 ? 'warning' : 'error';

    // Blur detection (using edge detection approximation)
    let edgeStrength = 0;
    const width = canvas.width;
    for (let i = 0; i < data.length - width * 4; i += 4) {
      const current = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const below = (data[i + width * 4] + data[i + width * 4 + 1] + data[i + width * 4 + 2]) / 3;
      edgeStrength += Math.abs(current - below);
    }
    const avgEdgeStrength = edgeStrength / (data.length / 4);
    const blur = avgEdgeStrength > 15 ? 'good' : avgEdgeStrength > 8 ? 'warning' : 'error';

    // Basic face detection (looking for skin-tone colors in center region)
    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor(canvas.height / 2);
    const sampleSize = 50;
    let skinTonePixels = 0;
    
    for (let y = centerY - sampleSize; y < centerY + sampleSize; y++) {
      for (let x = centerX - sampleSize; x < centerX + sampleSize; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        // Basic skin tone detection
        if (r > 95 && g > 40 && b > 20 && 
            r > g && r > b && 
            Math.abs(r - g) > 15) {
          skinTonePixels++;
        }
      }
    }
    
    const skinToneRatio = skinTonePixels / (sampleSize * sampleSize * 4);
    const face = skinToneRatio > 0.3 ? 'good' : skinToneRatio > 0.15 ? 'warning' : 'error';

    return { resolution, lighting, blur, face };
  }, []);

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return;

    setIsCapturing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas context not available');

      // Set canvas size to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Analyze image quality
      const quality = analyzeImageQuality(canvas);
      setQualityChecks(quality);

      // Convert to blob and create file
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to capture image');
        }

        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        
        // Validate with backend AI
        setIsValidating(true);
        try {
          console.log('Validating captured image with AI...');
          const validation = await aiService.validateSkinArea(file);
          setSkinValidation(validation);
          
          if (validation.success && validation.data?.suitable) {
            console.log('✅ Camera image validation passed');
            onImageCapture(file, imageUrl);
          } else {
            console.log('⚠️ Camera image validation failed:', validation.message);
            // Still allow capture but show warning
            onImageCapture(file, imageUrl);
          }
        } catch (validationError) {
          console.error('Camera image validation error:', validationError);
          // Still allow capture if validation fails
          onImageCapture(file, imageUrl);
        } finally {
          setIsValidating(false);
        }
      }, 'image/jpeg', 0.95); // High quality JPEG

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture image';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsCapturing(false);
    }
  }, [cameraReady, analyzeImageQuality, onImageCapture, onError]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setQualityChecks(null);
    setError(null);
    setSkinValidation(null);
    setIsValidating(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const getQualityIcon = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getQualityText = (type: keyof QualityCheck, status: 'good' | 'warning' | 'error') => {
    const messages = {
      resolution: {
        good: 'High resolution (1280x720+)',
        warning: 'Medium resolution (640x480+)',
        error: 'Low resolution (below 640x480)'
      },
      lighting: {
        good: 'Good lighting conditions',
        warning: 'Lighting could be improved',
        error: 'Poor lighting - too dark or bright'
      },
      blur: {
        good: 'Sharp and clear image',
        warning: 'Slightly blurry - hold steady',
        error: 'Too blurry - stabilize camera'
      },
      face: {
        good: 'Face detected in frame',
        warning: 'Face partially visible',
        error: 'No clear face detected'
      }
    };
    return messages[type][status];
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Camera Capture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instructions */}
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            Position your face in good lighting, ensure the camera is steady, and capture a clear image for the best analysis results.
          </AlertDescription>
        </Alert>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Camera Controls */}
        <div className="flex gap-2 justify-center">
          {!isStreaming ? (
            <Button onClick={startCamera} className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Start Camera
            </Button>
          ) : (
            <>
              <Button 
                onClick={captureImage} 
                disabled={!cameraReady || isCapturing || isValidating}
                className="flex items-center gap-2"
              >
                {isCapturing || isValidating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                {isCapturing ? 'Capturing...' : isValidating ? 'Validating...' : 'Capture Photo'}
              </Button>
              <Button 
                variant="outline" 
                onClick={stopCamera}
                className="flex items-center gap-2"
              >
                <CameraOff className="w-4 h-4" />
                Stop Camera
              </Button>
            </>
          )}
          
          {capturedImage && (
            <Button 
              variant="outline" 
              onClick={retakePhoto}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake
            </Button>
          )}
        </div>

        {/* Camera Preview */}
        {isStreaming && !capturedImage && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg border"
              style={{ maxHeight: '400px' }}
            />
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Loading camera...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Captured Image Preview */}
        {capturedImage && (
          <div className="space-y-4">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full rounded-lg border"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
            
            {/* AI Validation Status */}
            {isValidating && (
              <Alert>
                <Loader2 className="w-4 h-4 animate-spin" />
                <AlertDescription>
                  Validating image with AI for skin analysis suitability...
                </AlertDescription>
              </Alert>
            )}

            {/* Quality Assessment */}
            {qualityChecks && (
              <div className="space-y-3">
                <h4 className="font-medium">Image Quality Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(Object.entries(qualityChecks) as [keyof QualityCheck, 'good' | 'warning' | 'error'][]).map(([key, status]) => (
                    <div key={key} className="flex items-center gap-3 p-3 border rounded-lg">
                      {getQualityIcon(status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">{key}</p>
                        <p className="text-xs text-gray-600">{getQualityText(key, status)}</p>
                      </div>
                      <Badge 
                        variant={status === 'good' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {status}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                {/* Overall Quality Status */}
                {Object.values(qualityChecks).includes('error') && (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      Image quality issues detected. Please retake the photo with better lighting and positioning for optimal analysis results.
                    </AlertDescription>
                  </Alert>
                )}
                
                {Object.values(qualityChecks).includes('warning') && !Object.values(qualityChecks).includes('error') && (
                  <Alert>
                    <Info className="w-4 h-4" />
                    <AlertDescription>
                      Image quality is acceptable but could be improved. Consider retaking for better analysis accuracy.
                    </AlertDescription>
                  </Alert>
                )}
                
                {Object.values(qualityChecks).every(status => status === 'good') && (
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription className="text-green-700">
                      Excellent image quality! This image is ready for analysis.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* AI Validation Results */}
            {skinValidation && !isValidating && (
              <div className="space-y-3">
                <h4 className="font-medium">AI Skin Analysis Validation</h4>
                
                {skinValidation.success && skinValidation.data?.suitable ? (
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription className="text-green-700">
                      ✅ Perfect! AI detected a clear face with suitable skin areas for analysis.
                      {skinValidation.data.faceRegion && (
                        <div className="mt-2 text-xs">
                          Face region detected at optimal position for skin analysis.
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      ⚠️ {skinValidation.message || 'AI validation found issues with the image'}
                      <div className="mt-2 text-xs">
                        Issues detected:
                        {!skinValidation.data?.hasFace && <div>• No clear face detected</div>}
                        {!skinValidation.data?.skinAreaDetected && <div>• Insufficient skin area visible</div>}
                        <div className="mt-2">
                          <strong>Suggestions:</strong> Ensure good lighting, position face clearly in frame, and remove any obstructions.
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </CardContent>
    </Card>
  );
};

export default CameraCapture; 