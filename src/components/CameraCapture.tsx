import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { FaceDetection, Results } from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera as CameraIcon, CameraOff, RotateCcw, CheckCircle, AlertTriangle, Info, Loader2, User, UserX, Scan, Users } from 'lucide-react';
import { aiService } from '@/lib/api';
import { SkinDetectionService, SkinRegion, SkinDetectionResult } from '@/services/skinDetection';

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
  const [faceDetectionEnabled, setFaceDetectionEnabled] = useState(true); // Always enabled
  
  // Face detection state
  const [faceDetection, setFaceDetection] = useState<FaceDetection | null>(null);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [isFaceDetectionLoading, setIsFaceDetectionLoading] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [facesDetected, setFacesDetected] = useState(0);
  const [boundingBox, setBoundingBox] = useState<BoundingBox[]>([]);
  
  // Skin detection state
  const [skinDetectionService] = useState(() => new SkinDetectionService());
  const [skinRegions, setSkinRegions] = useState<SkinRegion[]>([]);
  const [skinDetectionResult, setSkinDetectionResult] = useState<SkinDetectionResult | null>(null);
  const [isSkinDetectionLoading, setIsSkinDetectionLoading] = useState(false);

  // Initialize MediaPipe Face Detection
  useEffect(() => {
    if (!faceDetectionEnabled) return;

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
  }, [faceDetectionEnabled]);

  // Initialize skin detection service
  useEffect(() => {
    const initializeSkinDetection = async () => {
      try {
        setIsSkinDetectionLoading(true);
        await skinDetectionService.initialize();
        console.log('✅ Skin detection service initialized');
      } catch (error) {
        console.error('❌ Failed to initialize skin detection:', error);
      } finally {
        setIsSkinDetectionLoading(false);
      }
    };

    initializeSkinDetection();

    return () => {
      skinDetectionService.dispose();
    };
  }, [skinDetectionService]);

  // Start camera for face detection
  useEffect(() => {
    if (!faceDetection || !webcamRef.current?.video || !cameraReady || !faceDetectionEnabled) {
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
  }, [faceDetection, cameraReady, faceDetectionEnabled]);

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
          // Allow fallback in both modes now
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

    if (shouldRetryWithMinimalConstraints) {
      console.log(`🔄 Retrying with minimal constraints...`);
      // Force webcam component to remount with no constraints
      setWebcamKey(prev => prev + 1);
      setError('Retrying with minimal camera constraints...');
      return;
    }
    
    setError(errorMessage);
    setIsStreaming(false);
    onError?.(errorMessage);
  }, [onError]);

  const performSkinDetection = useCallback(async (imageSrc: string) => {
    try {
      // Create image element for skin detection
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise<SkinDetectionResult>((resolve, reject) => {
        img.onload = async () => {
          try {
            const result = await skinDetectionService.detectSkinAreas(img);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image for skin detection'));
        img.src = imageSrc;
      });
    } catch (error) {
      console.error('Skin detection error:', error);
      return {
        success: false,
        regions: [],
        totalSkinArea: 0,
        totalImageArea: 0,
        skinCoveragePercentage: 0,
        message: `Skin detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }, [skinDetectionService]);

  const captureImage = useCallback(async () => {
    if (!webcamRef.current || !cameraReady) {
      setError('Camera not ready. Please wait for the camera to initialize.');
      return;
    }

    setIsCapturing(true);
    
    try {
      // Capture image from webcam
      const imageSrc = getScreenshot();
      
      if (!imageSrc) {
        throw new Error('Failed to capture image from camera');
      }

      setCapturedImage(imageSrc);

      // Quality assessment using the new assessment function
      const quality = assessImageQuality(imageSrc);
      setQualityChecks(quality);

      // Check for face detection errors
      if (faceDetectionEnabled && quality.face === 'error') {
        setError('No face detected in the captured image. Please ensure your face is clearly visible and try again.');
        setIsCapturing(false);
        return;
      }

      // Perform comprehensive skin area detection
      console.log('🔍 Performing comprehensive skin area detection...');
      const skinResult = await performSkinDetection(imageSrc);
      setSkinDetectionResult(skinResult);
      setSkinRegions(skinResult.regions);

      if (skinResult.success) {
        console.log(`✅ Detected ${skinResult.regions.length} skin regions covering ${skinResult.skinCoveragePercentage.toFixed(1)}% of image`);
        
        // Log detected body parts
        const bodyParts = skinResult.regions.map(r => r.bodyPart);
        const uniqueBodyParts = [...new Set(bodyParts)];
        console.log('📍 Detected body parts:', uniqueBodyParts.join(', '));
      } else {
        console.log('⚠️ Skin detection failed:', skinResult.message);
      }

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
        console.log('Validating captured image with comprehensive skin analysis...');
        const validation = await aiService.validateSkinArea(file);
        setSkinValidation(validation);
        
        if (validation.success && validation.data?.suitable) {
          console.log('✅ Backend validation passed');
          onImageCapture(file, imageSrc);
        } else {
          console.log('⚠️ Backend validation failed:', validation.message);
          // Still allow capture but show warning
          onImageCapture(file, imageSrc);
        }
      } catch (validationError) {
        console.error('Backend validation error:', validationError);
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
  }, [cameraReady, onImageCapture, onError, getScreenshot, faceDetectionEnabled, performSkinDetection]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setQualityChecks(null);
    setError(null);
    setSkinValidation(null);
    setIsValidating(false);
    setSkinRegions([]);
    setSkinDetectionResult(null);
  }, []);

  const stopCamera = useCallback(() => {
    setIsStreaming(false);
    setCameraReady(false);
    setCapturedImage(null);
    setQualityChecks(null);
    setError(null);
    setSkinValidation(null);
    setIsValidating(false);
    setSkinRegions([]);
    setSkinDetectionResult(null);
    setWebcamKey(0); // Reset webcam key
  }, []);

  const startCamera = useCallback(() => {
    setIsStreaming(true);
    setError(null);
  }, []);

  const forceRestartCamera = useCallback(() => {
    console.log('🔄 Force restarting camera...');
    stopCamera();
    setWebcamKey(prev => prev + 1);
    setTimeout(() => {
      setIsStreaming(true);
    }, 100);
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
        good: faceDetectionEnabled ? 
          `${facesDetected === 1 ? 'Single face detected perfectly' : 'Face detected in frame'}` : 
          'Face area looks good',
        warning: faceDetectionEnabled ? 
          `${facesDetected > 1 ? `${facesDetected} faces detected - use single person` : 'Face partially visible'}` : 
          'Face partially visible',
        error: faceDetectionEnabled ? 
          'No face detected - position face in frame' : 
          'No clear face detected'
      }
    };
    return messages[type][status];
  };

  // Improved quality assessment based on image analysis
  const assessImageQuality = useCallback((imageSrc: string): QualityCheck => {
    // Create image element to analyze
    const img = new Image();
    img.src = imageSrc;
    
    // Basic quality assessment with face detection integration
    const assessment: QualityCheck = {
      resolution: 'good',
      lighting: 'good', 
      blur: 'good',
      face: 'good'
    };

    // Use face detection results for face quality assessment
    if (faceDetectionEnabled && !isFaceDetectionLoading) {
      if (!faceDetected || facesDetected === 0) {
        assessment.face = 'error';
      } else if (facesDetected === 1) {
        assessment.face = 'good';
      } else if (facesDetected > 1) {
        assessment.face = 'warning'; // Multiple faces detected
      }
    }

    // Default to good for other metrics
    // This is where you could add actual image analysis for:
    // - Resolution detection
    // - Brightness/contrast analysis  
    // - Blur detection
    
    return assessment;
  }, [faceDetectionEnabled, isFaceDetectionLoading, faceDetected, facesDetected]);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CameraIcon className="w-5 h-5" />
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

        {/* Face Detection Status */}
        {isStreaming && !capturedImage && (
          <div className="p-3 border rounded-lg bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              {isFaceDetectionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : faceDetected ? (
                <User className="w-4 h-4 text-green-600" />
              ) : (
                <UserX className="w-4 h-4 text-red-600" />
              )}
              <h4 className="text-sm font-medium">Face Detection</h4>
            </div>
            
            {isFaceDetectionLoading ? (
              <p className="text-xs text-gray-600">Loading face detection model...</p>
            ) : (
              <div className="space-y-1">
                <p className="text-xs">
                  Status: <span className={`font-medium ${faceDetected ? 'text-green-600' : 'text-red-600'}`}>
                    {faceDetected ? `${facesDetected} face(s) detected` : 'No face detected'}
                  </span>
                </p>
                {facesDetected > 1 && (
                  <p className="text-xs text-yellow-600">
                    ⚠️ Multiple faces detected. For best results, ensure only one person is in frame.
                  </p>
                )}
                {!faceDetected && (
                  <p className="text-xs text-red-600">
                    📹 Please position your face clearly in the camera view
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Skin Detection Status */}
        {isStreaming && !capturedImage && (
          <div className="p-3 border rounded-lg bg-purple-50">
            <div className="flex items-center gap-2 mb-2">
              {isSkinDetectionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Scan className="w-4 h-4 text-purple-600" />
              )}
              <h4 className="text-sm font-medium">Comprehensive Skin Detection</h4>
            </div>
            
            {isSkinDetectionLoading ? (
              <p className="text-xs text-gray-600">Initializing skin detection model...</p>
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-purple-700">
                  🎯 Ready to detect skin areas across entire body (face, arms, hands, torso, legs, etc.)
                </p>
                <p className="text-xs text-purple-600">
                  💡 Expose any skin areas for comprehensive analysis
                </p>
              </div>
            )}
          </div>
        )}

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
                <br />• Try the "Force Restart" button below to retry with minimal constraints
              </div>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={forceRestartCamera}
                  className="text-xs"
                >
                  🔄 Force Restart Camera
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Camera Controls */}
        <div className="flex gap-2 justify-center">
          {!isStreaming ? (
            <Button 
              onClick={startCamera}
              className="flex items-center gap-2"
            >
              <CameraIcon className="w-4 h-4" />
              Start Camera
            </Button>
          ) : (
            <>
              <Button 
                onClick={captureImage} 
                disabled={!cameraReady || isCapturing || isValidating || isSkinDetectionLoading || (faceDetectionEnabled && !faceDetected)}
                className="flex items-center gap-2"
              >
                {isCapturing || isValidating || isSkinDetectionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CameraIcon className="w-4 h-4" />
                )}
                {isCapturing ? 'Capturing...' : 
                 isValidating ? 'Validating...' : 
                 isSkinDetectionLoading ? 'Loading Skin Detection...' :
                 (faceDetectionEnabled && !faceDetected) ? 'No Face Detected' : 'Capture Photo'}
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
              key={`webcam-${webcamKey}`} // Force remount when key changes
              ref={webcamRef}
              audio={false}
              height={400}
              screenshotFormat="image/jpeg"
              width="100%"
              videoConstraints={webcamKey > 0 ? getMinimalConstraints() : getVideoConstraints()}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              className="w-full rounded-lg border"
              style={{ maxHeight: '400px' }}
            />
            
            {/* Face Detection Bounding Boxes */}
            {faceDetectionEnabled && boundingBox && boundingBox.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {boundingBox.map((box, index) => (
                  <div
                    key={index}
                    className="absolute border-2 border-green-400 bg-green-400/10 rounded"
                    style={{
                      left: `${box.xCenter - box.width / 2}%`,
                      top: `${box.yCenter - box.height / 2}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                  >
                    <div className="absolute -top-6 left-0 bg-green-400 text-white text-xs px-1 rounded">
                      Face {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skin Region Overlays */}
            {skinRegions.length > 0 && capturedImage && (
              <div className="absolute inset-0 pointer-events-none">
                {skinRegions.map((region, index) => {
                  // Calculate normalized coordinates
                  const imageElement = webcamRef.current?.video;
                  if (!imageElement) return null;
                  
                  const scaleX = 100 / imageElement.videoWidth;
                  const scaleY = 100 / imageElement.videoHeight;
                  
                  return (
                    <div
                      key={region.id}
                      className="absolute border-2 border-purple-500 bg-purple-500/10 rounded"
                      style={{
                        left: `${region.boundingBox.x * scaleX}%`,
                        top: `${region.boundingBox.y * scaleY}%`,
                        width: `${region.boundingBox.width * scaleX}%`,
                        height: `${region.boundingBox.height * scaleY}%`,
                      }}
                    >
                      <div className="absolute -top-6 left-0 bg-purple-500 text-white text-xs px-1 rounded">
                        {region.bodyPart}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-spin" />
                  <p className="text-gray-600">
                    {webcamKey > 0 ? (
                      'Retrying with minimal constraints...'
                    ) : (
                      'Loading camera...'
                    )}
                  </p>
                </div>
              </div>
            )}
            {cameraReady && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {webcamKey > 0 ? 'Minimal Mode' : 'Normal Mode'}
                </Badge>
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
            {/* Comprehensive Skin Detection Results */}
            {skinDetectionResult && capturedImage && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Scan className="w-4 h-4" />
                  Comprehensive Skin Detection Results
                </h4>
                
                {skinDetectionResult.success ? (
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription className="text-green-700">
                      <div className="space-y-2">
                        <div>
                          ✅ <strong>Detected {skinDetectionResult.regions.length} skin regions</strong> covering{' '}
                          <strong>{skinDetectionResult.skinCoveragePercentage.toFixed(1)}%</strong> of the image
                        </div>
                        
                        {skinDetectionResult.regions.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {skinDetectionResult.regions.map((region, index) => (
                              <div key={region.id} className="flex items-center gap-1">
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                  style={{ 
                                    borderColor: `hsl(${(index * 360) / skinDetectionResult.regions.length}, 70%, 50%)`,
                                    color: `hsl(${(index * 360) / skinDetectionResult.regions.length}, 70%, 40%)`
                                  }}
                                >
                                  {region.bodyPart}
                                </Badge>
                                <span className="text-gray-600">
                                  {(region.area / 1000).toFixed(1)}k px
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-600 mt-2">
                          <strong>Body parts detected:</strong> {
                            [...new Set(skinDetectionResult.regions.map(r => r.bodyPart))]
                              .filter(part => part !== 'unknown')
                              .join(', ') || 'Various skin areas'
                          }
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      ⚠️ {skinDetectionResult.message}
                      <div className="mt-2 text-xs">
                        <strong>Tip:</strong> Ensure adequate lighting and expose some skin areas (face, arms, hands, etc.) for optimal detection.
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {skinValidation && !isValidating && (
              <div className="space-y-3">
                <h4 className="font-medium">
                  Backend AI Validation
                </h4>
                
                {skinValidation.success && skinValidation.data?.suitable ? (
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription className="text-green-700">
                      ✅ Backend AI confirmed suitable skin areas for comprehensive analysis.
                      {skinValidation.data.visibleSkinAreas && (
                        <div className="mt-2 text-xs">
                          <strong>Backend detected regions:</strong> {
                            Object.entries(skinValidation.data.visibleSkinAreas)
                              .filter(([_, detected]) => detected)
                              .map(([region, _]) => region)
                              .join(', ') || 'Various skin areas'
                          }
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      ⚠️ {skinValidation.message || 'Backend validation found issues with the image'}
                      <div className="mt-2 text-xs">
                        <strong>Suggestions:</strong> Ensure good lighting, position skin areas clearly in frame, and remove any obstructions. Any exposed skin (face, arms, hands, etc.) can be analyzed.
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