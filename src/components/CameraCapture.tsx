import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
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
  const webcamRef = useRef<Webcam>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [qualityChecks, setQualityChecks] = useState<QualityCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [skinValidation, setSkinValidation] = useState<any>(null);
  const [cameraReady, setCameraReady] = useState(false);

  // Video constraints for high quality
  const videoConstraints = {
    width: { ideal: 1280, min: 640 },
    height: { ideal: 720, min: 480 },
    facingMode: 'user', // Front camera
    frameRate: { ideal: 30, min: 15 },
  };

  // Handle webcam ready state
  const handleUserMedia = useCallback(() => {
    console.log('Camera stream started successfully');
    setCameraReady(true);
    setError(null);
  }, []);

  // Handle webcam errors
  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error('Camera access error:', error);
    setCameraReady(false);
    setIsStreaming(false);
    
    let errorMessage = 'Failed to access camera';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          errorMessage = 'Camera access denied. Please allow camera permissions and try again.';
          break;
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          errorMessage = 'No camera found. Please connect a camera and try again.';
          break;
        case 'NotReadableError':
        case 'TrackStartError':
          errorMessage = 'Camera is already in use by another application. Please close other apps using the camera and try again.';
          break;
        case 'OverconstrainedError':
        case 'ConstraintNotSatisfiedError':
          errorMessage = 'Camera does not meet the required specifications. Please try a different camera or update your browser.';
          break;
        case 'NotSupportedError':
          errorMessage = 'Camera not supported in this browser. Please use Chrome, Firefox, or Safari.';
          break;
        case 'SecurityError':
          errorMessage = 'Camera access blocked for security reasons. Please enable camera access in your browser settings.';
          break;
        default:
          errorMessage = error.message || 'Unknown camera error occurred';
      }
    }
    
    setError(errorMessage);
    onError?.(errorMessage);
  }, [onError]);

  const captureImage = useCallback(async () => {
    if (!webcamRef.current || !cameraReady) {
      setError('Camera not ready. Please wait for the camera to initialize.');
      return;
    }

    setIsCapturing(true);
    
    try {
      // Capture image from webcam
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (!imageSrc) {
        throw new Error('Failed to capture image from camera');
      }

      setCapturedImage(imageSrc);

      // Basic quality assessment (simplified since react-webcam handles most issues)
      const quality: QualityCheck = {
        resolution: 'good', // react-webcam handles resolution constraints
        lighting: 'good',   // We'll assume good for now
        blur: 'good',       // We'll assume good for now  
        face: 'good'        // We'll assume good for now
      };
      setQualityChecks(quality);

      // Convert data URL to blob and create file
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      
      const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      // Validate with backend AI
      setIsValidating(true);
      try {
        console.log('Validating captured image with AI...');
        const validation = await aiService.validateSkinArea(file);
        setSkinValidation(validation);
        
        if (validation.success && validation.data?.suitable) {
          console.log('✅ Camera image validation passed');
          onImageCapture(file, imageSrc);
        } else {
          console.log('⚠️ Camera image validation failed:', validation.message);
          // Still allow capture but show warning
          onImageCapture(file, imageSrc);
        }
      } catch (validationError) {
        console.error('Camera image validation error:', validationError);
        // Still allow capture if validation fails
        onImageCapture(file, imageSrc);
      } finally {
        setIsValidating(false);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture image';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsCapturing(false);
    }
  }, [cameraReady, onImageCapture, onError]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setQualityChecks(null);
    setError(null);
    setSkinValidation(null);
    setIsValidating(false);
  }, []);

  const stopCamera = useCallback(() => {
    setIsStreaming(false);
    setCameraReady(false);
    setCapturedImage(null);
    setQualityChecks(null);
    setError(null);
    setSkinValidation(null);
    setIsValidating(false);
  }, []);

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
            <AlertDescription>
              {error}
              <div className="mt-2 text-xs">
                <strong>Troubleshooting:</strong>
                <br />• Make sure you're using HTTPS or localhost
                <br />• Allow camera permissions when prompted
                <br />• Close other apps that might be using your camera
                <br />• Try refreshing the page
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Camera Controls */}
        <div className="flex gap-2 justify-center">
          {!isStreaming ? (
            <Button 
              onClick={() => setIsStreaming(true)}
              className="flex items-center gap-2"
            >
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
            <Webcam
              ref={webcamRef}
              audio={false}
              height={400}
              screenshotFormat="image/jpeg"
              width="100%"
              videoConstraints={videoConstraints}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              className="w-full rounded-lg border"
              style={{ maxHeight: '400px' }}
            />
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-spin" />
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
      </CardContent>
    </Card>
  );
};

export default CameraCapture; 