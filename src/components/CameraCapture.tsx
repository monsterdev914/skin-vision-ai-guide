import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { FaceDetection, Results } from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera as CameraIcon, CameraOff, RotateCcw, CheckCircle, AlertTriangle, Info, Loader2, User, UserX } from 'lucide-react';
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

interface BoundingBox {
  xCenter: number;
  yCenter: number;
  width: number;
  height: number;
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
  const [webcamKey, setWebcamKey] = useState(0); // Key to force webcam re-mount
  
  // Face detection state
  const [faceDetection, setFaceDetection] = useState<FaceDetection | null>(null);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [isFaceDetectionLoading, setIsFaceDetectionLoading] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [facesDetected, setFacesDetected] = useState(0);
  const [boundingBox, setBoundingBox] = useState<BoundingBox[]>([]);
  
  // Video constraints
  const getVideoConstraints = () => {
    return {
      width: { ideal: 1280, min: 640 },
      height: { ideal: 720, min: 480 },
      facingMode: { ideal: 'user' },
      frameRate: { ideal: 30, min: 10 },
    };
  };

  // Ultra-minimal constraints for fallback
  const getMinimalConstraints = () => {
    return {}; // No constraints at all - just grab any camera
  };

  // Initialize MediaPipe Face Detection
  useEffect(() => {
    const initializeFaceDetection = async () => {
      setIsFaceDetectionLoading(true);
      
      try {
        const faceDetectionModel = new FaceDetection({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
          },
        });

        faceDetectionModel.setOptions({
          model: 'short',
          minDetectionConfidence: 0.5,
        });

        faceDetectionModel.onResults((results: Results) => {
          const faces = results.detections || [];
          setFacesDetected(faces.length);
          setFaceDetected(faces.length > 0);
          
          // Convert detections to bounding boxes
          const boxes: BoundingBox[] = faces.map(detection => {
            const bbox = detection.boundingBox;
            return {
              xCenter: (bbox.xCenter || 0) * 100,
              yCenter: (bbox.yCenter || 0) * 100,
              width: (bbox.width || 0) * 100,
              height: (bbox.height || 0) * 100,
            };
          });
          setBoundingBox(boxes);
        });

        setFaceDetection(faceDetectionModel);
        setIsFaceDetectionLoading(false);
      } catch (err) {
        console.error('Failed to initialize face detection:', err);
        setIsFaceDetectionLoading(false);
      }
    };

    initializeFaceDetection();

    return () => {
      if (faceDetection) {
        faceDetection.close();
      }
      if (camera) {
        camera.stop();
      }
    };
  }, []);

  // Start camera for face detection
  useEffect(() => {
    if (!faceDetection || !webcamRef.current?.video || !cameraReady) {
      return;
    }

    const videoElement = webcamRef.current.video;
    
    const cameraInstance = new Camera(videoElement, {
      onFrame: async () => {
        if (faceDetection && videoElement) {
          await faceDetection.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480
    });

    setCamera(cameraInstance);
    cameraInstance.start();

    return () => {
      cameraInstance.stop();
    };
  }, [faceDetection, cameraReady]);

  // Function to get screenshot from webcam
  const getScreenshot = useCallback(() => {
    if (webcamRef.current) {
      return webcamRef.current.getScreenshot();
    }
    return null;
  }, [webcamRef]);

  // Handle webcam ready state
  const handleUserMedia = useCallback(() => {
    console.log('Camera stream started successfully');
    setCameraReady(true);
    setError(null);
  }, []);

  // Handle webcam errors with fallback retry
  const handleUserMediaError = useCallback(async (error: string | DOMException) => {
    console.error('Camera access error:', error);
    setCameraReady(false);
    
    let errorMessage = 'Failed to access camera';
    let shouldRetryWithMinimalConstraints = false;
    
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
          errorMessage = 'Camera constraints not supported. Trying with minimal constraints...';
          shouldRetryWithMinimalConstraints = true;
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
    
    // Retry with minimal constraints if needed
    if (shouldRetryWithMinimalConstraints) {
      console.log('Retrying with minimal constraints...');
      setTimeout(() => {
      setWebcamKey(prev => prev + 1);
        setError(null);
      }, 2000);
    }
    
    if (onError) {
      onError(errorMessage);
    }
  }, [onError]);

  // Basic quality checks without MediaPipe
  const performQualityCheck = useCallback(async (imageData: string): Promise<QualityCheck> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve({
            resolution: 'error',
            lighting: 'error',
            blur: 'error',
            face: 'error'
          });
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Resolution check
        const resolution = img.width >= 640 && img.height >= 480 ? 'good' : 
                         img.width >= 320 && img.height >= 240 ? 'warning' : 'error';
        
        // Lighting check - average brightness
        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        const avgBrightness = totalBrightness / (data.length / 4);
        const lighting = avgBrightness > 50 && avgBrightness < 200 ? 'good' : 
                        avgBrightness > 30 && avgBrightness < 220 ? 'warning' : 'error';
        
        // Basic blur detection using variance
        let variance = 0;
        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          variance += Math.pow(brightness - avgBrightness, 2);
        }
        variance = variance / (data.length / 4);
        const blur = variance > 1000 ? 'good' : variance > 500 ? 'warning' : 'error';
        
        // Face detection simplified - just check if there's a face-like region
        const face = 'good'; // Since we can't detect faces without MediaPipe, assume good
        
        resolve({ resolution, lighting, blur, face });
      };
      img.src = imageData;
    });
  }, []);

  // Capture image with quality checks
  const captureImage = useCallback(async () => {
    if (!cameraReady) {
      setError('Camera not ready');
      return;
    }

    if (!faceDetected) {
      setError('Please position your face in the camera view');
      return;
    }

    setIsCapturing(true);
    setError(null);
    
    try {
      const imageSrc = getScreenshot();
      if (!imageSrc) {
        throw new Error('Failed to capture image');
      }

      // Perform quality checks
      const quality = await performQualityCheck(imageSrc);
      setQualityChecks(quality);

      // Check if quality is acceptable
      const hasError = Object.values(quality).some(check => check === 'error');
      if (hasError) {
        setError('Image quality too low. Please ensure good lighting and hold the camera steady.');
        setIsCapturing(false);
        return;
      }

      setCapturedImage(imageSrc);
      setIsValidating(true);

      // Convert to file
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });

      // Validate skin area
        const validation = await aiService.validateSkinArea(file);
        setSkinValidation(validation);

      setIsValidating(false);
        
        if (validation.success && validation.data?.suitable) {
        onImageCapture(file, imageSrc);
      } else {
        setError(validation.message || 'Image not suitable for skin analysis');
      }
    } catch (err) {
      console.error('Capture error:', err);
      setError(err instanceof Error ? err.message : 'Failed to capture image');
      setIsValidating(false);
    } finally {
      setIsCapturing(false);
    }
  }, [cameraReady, faceDetected, getScreenshot, performQualityCheck, onImageCapture]);

  // Reset capture state
  const resetCapture = useCallback(() => {
    setCapturedImage(null);
    setQualityChecks(null);
    setSkinValidation(null);
    setError(null);
  }, []);

  // Restart camera
  const restartCamera = useCallback(() => {
    setWebcamKey(prev => prev + 1);
    setCameraReady(false);
    setError(null);
    setFaceDetected(false);
    setFacesDetected(0);
    setBoundingBox([]);
    resetCapture();
  }, [resetCapture]);

  // Get quality status icon
  const getQualityIcon = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  // Get quality text
  const getQualityText = (type: keyof QualityCheck, status: 'good' | 'warning' | 'error') => {
    const texts = {
      resolution: {
        good: 'High resolution',
        warning: 'Medium resolution',
        error: 'Low resolution'
      },
      lighting: {
        good: 'Good lighting',
        warning: 'Acceptable lighting',
        error: 'Poor lighting'
      },
      blur: {
        good: 'Sharp image',
        warning: 'Slightly blurred',
        error: 'Too blurry'
      },
      face: {
        good: 'Face detected',
        warning: 'Face partially visible',
        error: 'No face detected'
      }
    };
    return texts[type][status];
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <CameraIcon className="h-5 w-5" />
          Camera Capture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
          {/* Camera Stream */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <Webcam
              key={webcamKey}
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              screenshotQuality={1}
              videoConstraints={getVideoConstraints()}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '400px',
                objectFit: 'cover',
                display: cameraReady ? 'block' : 'none'
              }}
            />
            
            {/* Loading overlay */}
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Starting camera...</p>
                </div>
              </div>
            )}

            {/* Face detection overlay */}
            {cameraReady && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Face detection bounding boxes */}
                {boundingBox.map((box, index) => (
                  <div
                    key={index}
                    className="absolute border-2 border-green-400 rounded-lg"
                    style={{
                      left: `${box.xCenter - box.width / 2}%`,
                      top: `${box.yCenter - box.height / 2}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                  />
                ))}
                
                {/* Face detection status */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-lg p-2">
                  <div className="flex items-center gap-2 text-white text-sm">
                    {isFaceDetectionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Initializing...</span>
                      </>
                    ) : faceDetected ? (
                      <>
                        <User className="h-4 w-4 text-green-400" />
                        <span className="text-green-400">Face Detected</span>
                      </>
                    ) : (
                      <>
                        <UserX className="h-4 w-4 text-red-400" />
                        <span className="text-red-400">No Face</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={captureImage}
              disabled={!cameraReady || isCapturing || isValidating || isFaceDetectionLoading || !faceDetected}
              className="flex-1"
            >
              {isCapturing || isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isCapturing ? 'Capturing...' : 'Validating...'}
                </>
              ) : isFaceDetectionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading Face Detection...
                </>
              ) : !faceDetected ? (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Position Your Face
                </>
              ) : (
                <>
                  <CameraIcon className="h-4 w-4 mr-2" />
                  Capture Image
                </>
              )}
            </Button>
            
            <Button
              onClick={restartCamera}
              variant="outline"
              disabled={isCapturing || isValidating}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
                    </div>

          {/* Face Detection Status */}
          {cameraReady && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  {faceDetected ? (
                    <User className="h-4 w-4 text-green-500" />
                  ) : (
                    <UserX className="h-4 w-4 text-red-500" />
                  )}
                  Face Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  {isFaceDetectionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-sm">Initializing face detection...</span>
                    </>
                  ) : faceDetected ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        {facesDetected} face{facesDetected !== 1 ? 's' : ''} detected
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">No face detected - position your face in the camera</span>
                    </>
                  )}
                </div>
                
                {facesDetected > 1 && (
                  <div className="text-xs text-yellow-600">
                    <Info className="h-3 w-3 inline mr-1" />
                    Multiple faces detected - ensure only one person is in frame
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quality Checks */}
          {qualityChecks && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Image Quality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(qualityChecks).map(([key, status]) => (
                  <div key={key} className="flex items-center gap-2">
                    {getQualityIcon(status)}
                    <span className="text-sm">
                      {getQualityText(key as keyof QualityCheck, status)}
                                </span>
                              </div>
                            ))}
              </CardContent>
            </Card>
          )}

          {/* Skin Validation Results */}
          {skinValidation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Skin Area Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {skinValidation.success && skinValidation.data?.suitable ? (
                  <div className="text-green-600">
                    <CheckCircle className="h-4 w-4 inline mr-2" />
                    ✅ <strong>Image suitable for analysis</strong>
                        </div>
                ) : (
                  <div className="text-red-600">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    ⚠️ {skinValidation.message || 'Image not suitable for analysis'}
                      </div>
                )}
              </CardContent>
            </Card>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

export default CameraCapture; 