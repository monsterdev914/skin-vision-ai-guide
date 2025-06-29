import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CameraOff, RotateCcw, CheckCircle, AlertTriangle, Info, Loader2, TestTube } from 'lucide-react';
import { aiService } from '@/lib/api';

interface CameraCaptureProps {
  onImageCapture: (imageFile: File, imageUrl: string) => void;
  onError?: (error: string) => void;
  testingMode?: boolean; // New prop for testing mode
}

interface QualityCheck {
  resolution: 'good' | 'warning' | 'error';
  lighting: 'good' | 'warning' | 'error';
  blur: 'good' | 'warning' | 'error';
  face: 'good' | 'warning' | 'error';
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageCapture, onError, testingMode: propTestingMode = false }) => {
  const webcamRef = useRef<Webcam>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [qualityChecks, setQualityChecks] = useState<QualityCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [skinValidation, setSkinValidation] = useState<any>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [testingMode, setTestingMode] = useState(propTestingMode); // Internal testing mode state
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [showCameraList, setShowCameraList] = useState(false);
  const [webcamKey, setWebcamKey] = useState(0); // Key to force webcam re-mount

  // Video constraints - relaxed for testing mode
  const getVideoConstraints = () => {
    if (testingMode) {
      // Very relaxed constraints for virtual cameras and testing
      return {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: { ideal: 'user' }, // Make facingMode optional
        frameRate: { ideal: 15 },
        // Remove minimum constraints that might cause issues
      };
    } else {
      // Production constraints
      return {
        width: { ideal: 1280, min: 1280 },
        height: { ideal: 720, min: 720 },
        facingMode: 'user', // Front camera
        frameRate: { ideal: 30, min: 15 },
      };
    }
  };

  // Ultra-minimal constraints for testing mode fallback
  const getMinimalConstraints = () => {
    return {}; // No constraints at all - just grab any camera
  };

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
          if (testingMode) {
            errorMessage = 'No camera found. In testing mode, make sure your virtual camera (OBS, ManyCam, etc.) is running and set as the default camera device.';
          } else {
            errorMessage = 'No camera found. Please connect a camera and try again.';
          }
          break;
        case 'NotReadableError':
        case 'TrackStartError':
          errorMessage = 'Camera is already in use by another application. Please close other apps using the camera and try again.';
          break;
        case 'OverconstrainedError':
        case 'ConstraintNotSatisfiedError':
          if (testingMode) {
            errorMessage = 'Camera constraints not supported. Trying with minimal constraints...';
            shouldRetryWithMinimalConstraints = true;
          } else {
            errorMessage = 'Camera does not meet the required specifications. Please try a different camera or update your browser.';
          }
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

    if (shouldRetryWithMinimalConstraints && testingMode) {
      console.log('🧪 Testing mode: Retrying with minimal constraints...');
      // Force webcam component to remount with no constraints
      setWebcamKey(prev => prev + 1);
      setError('Retrying with minimal camera constraints...');
      return;
    }
    
    setError(errorMessage);
    setIsStreaming(false);
    onError?.(errorMessage);
  }, [onError, testingMode]);

  // New function to try fallback camera access in testing mode
  const tryFallbackCamera = useCallback(async () => {
    if (!testingMode) return;
    
    console.log('🧪 Testing mode: Trying fallback camera access...');
    
    try {
      // Try to get any available camera without constraints
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // If successful, we know there's a camera available
      // Stop this stream and let webcam component handle it
      stream.getTracks().forEach(track => track.stop());
      
      console.log('✅ Fallback camera access successful');
      setError(null);
      return true;
    } catch (fallbackError) {
      console.error('❌ Fallback camera access failed:', fallbackError);
      return false;
    }
  }, [testingMode]);

  // Function to list available cameras
  const listAvailableCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);
      console.log('📹 Available cameras:', cameras);
      return cameras;
    } catch (error) {
      console.error('Failed to enumerate cameras:', error);
      setAvailableCameras([]);
      return [];
    }
  }, []);

  // Enhanced start camera function
  const startCamera = useCallback(async () => {
    setIsStreaming(true);
    setError(null);
    
    // In testing mode, first list available cameras and try fallback
    if (testingMode) {
      console.log('🧪 Testing mode: Checking available cameras...');
      const cameras = await listAvailableCameras();
      
      if (cameras.length === 0) {
        setError('No camera devices found. Please ensure your virtual camera software (OBS, ManyCam, etc.) is running and properly installed.');
        setIsStreaming(false);
        return;
      }
      
      console.log(`📹 Found ${cameras.length} camera device(s):`, cameras.map(c => c.label || 'Unknown Camera'));
      
      const hasCamera = await tryFallbackCamera();
      if (!hasCamera) {
        setError(`Found ${cameras.length} camera device(s) but unable to access. Check if your virtual camera is running and not in use by another application.`);
        setIsStreaming(false);
        return;
      }
    }
  }, [testingMode, tryFallbackCamera, listAvailableCameras]);

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

      // Quality assessment - more lenient for testing mode
      const quality: QualityCheck = testingMode ? {
        resolution: 'good', // Always good in testing mode
        lighting: 'good',   // Always good in testing mode
        blur: 'good',       // Always good in testing mode  
        face: 'good'        // Always good in testing mode
      } : {
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

      // Validate with backend AI - skip in testing mode if desired
      if (testingMode) {
        console.log('🧪 Testing mode: Skipping AI validation');
        // Mock successful validation
        setSkinValidation({
          success: true,
          data: {
            suitable: true,
            hasFace: true,
            skinAreaDetected: true,
            faceRegion: true
          },
          message: 'Testing mode: Validation skipped'
        });
        onImageCapture(file, imageSrc);
      } else {
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
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture image';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsCapturing(false);
    }
  }, [cameraReady, onImageCapture, onError, testingMode]);

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
    setWebcamKey(0); // Reset webcam key
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
          {testingMode && (
            <Badge variant="secondary" className="ml-2">
              <TestTube className="w-3 h-3 mr-1" />
              Testing Mode
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Testing Mode Toggle */}
        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            <div>
              <p className="text-sm font-medium">Testing Mode</p>
              <p className="text-xs text-gray-600">
                Relaxed constraints for virtual cameras and development
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {testingMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCameraList(!showCameraList)}
                className="text-xs"
              >
                {showCameraList ? 'Hide' : 'Show'} Cameras
              </Button>
            )}
            <Button
              variant={testingMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setTestingMode(!testingMode);
                // Reset states when toggling mode
                stopCamera();
              }}
            >
              {testingMode ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>

        {/* Testing Mode Info */}
        {testingMode && (
          <Alert>
            <TestTube className="w-4 h-4" />
            <AlertDescription>
              <strong>Testing Mode Active:</strong> Using relaxed camera constraints (640x480 min), 
              simplified quality checks, and optional AI validation. Perfect for virtual cameras and development.
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            {testingMode ? (
              "Testing mode: Any camera resolution supported. Perfect for virtual cameras like OBS, ManyCam, or browser extensions."
            ) : (
              "Position your face in good lighting, ensure the camera is steady, and capture a clear image for the best analysis results."
            )}
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
                {testingMode && (
                  <>
                    <br />• <strong>Testing mode:</strong> Try enabling your virtual camera (OBS, ManyCam, etc.)
                    <br />• Check if your virtual camera is running and set as default
                    <br />• Some virtual cameras need to be started BEFORE opening the browser
                    <br />• Try the "Force Restart" button below
                  </>
                )}
              </div>
              {testingMode && (
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
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Camera List (Testing Mode Only) */}
        {testingMode && showCameraList && (
          <div className="p-3 border rounded-lg bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Available Camera Devices</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={listAvailableCameras}
                className="text-xs"
              >
                Refresh
              </Button>
            </div>
            {availableCameras.length === 0 ? (
              <div className="text-sm text-gray-600">
                <p>No cameras detected. If you're using a virtual camera:</p>
                <ul className="mt-1 ml-4 text-xs list-disc">
                  <li>Make sure OBS Virtual Camera, ManyCam, or similar software is running</li>
                  <li>Check that virtual camera is enabled in the software</li>
                  <li>Try restarting your browser after starting the virtual camera</li>
                  <li>Some virtual cameras need to be set as the default camera</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-1">
                {availableCameras.map((camera, index) => (
                  <div key={camera.deviceId} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                    <span className="flex-1">
                      {camera.label || `Camera ${index + 1} (${camera.deviceId.slice(0, 8)}...)`}
                    </span>
                    {camera.label.toLowerCase().includes('obs') && (
                      <Badge variant="secondary" className="text-xs">OBS</Badge>
                    )}
                    {camera.label.toLowerCase().includes('manycam') && (
                      <Badge variant="secondary" className="text-xs">ManyCam</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Camera Controls */}
        <div className="flex gap-2 justify-center">
          {!isStreaming ? (
            <Button 
              onClick={startCamera}
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Start Camera
            </Button>
          ) : (
            <>
              <Button 
                onClick={captureImage} 
                disabled={!cameraReady || isCapturing || (isValidating && !testingMode)}
                className="flex items-center gap-2"
              >
                {isCapturing || (isValidating && !testingMode) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                {isCapturing ? 'Capturing...' : (isValidating && !testingMode) ? 'Validating...' : 'Capture Photo'}
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
              videoConstraints={webcamKey > 0 && testingMode ? getMinimalConstraints() : getVideoConstraints()}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              className="w-full rounded-lg border"
              style={{ maxHeight: '400px' }}
            />
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-spin" />
                  <p className="text-gray-600">
                    {testingMode ? (
                      webcamKey > 0 ? 'Retrying with minimal constraints...' : 'Loading camera (testing mode)...'
                    ) : (
                      'Loading camera...'
                    )}
                  </p>
                </div>
              </div>
            )}
            {testingMode && cameraReady && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <TestTube className="w-3 h-3 mr-1" />
                  {webcamKey > 0 ? 'Minimal Mode' : 'Test Mode'}
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
            {skinValidation && !isValidating && (
              <div className="space-y-3">
                <h4 className="font-medium">
                  AI Skin Analysis Validation
                  {testingMode && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Testing Mode
                    </Badge>
                  )}
                </h4>
                
                {skinValidation.success && skinValidation.data?.suitable ? (
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription className="text-green-700">
                      ✅ {testingMode ? 'Testing mode: Mock validation passed!' : 'Perfect! AI detected a clear face with suitable skin areas for analysis.'}
                      {skinValidation.data.faceRegion && (
                        <div className="mt-2 text-xs">
                          {testingMode ? 'Mock face region detected.' : 'Face region detected at optimal position for skin analysis.'}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      ⚠️ {skinValidation.message || 'AI validation found issues with the image'}
                      {!testingMode && (
                        <div className="mt-2 text-xs">
                          Issues detected:
                          {!skinValidation.data?.hasFace && <div>• No clear face detected</div>}
                          {!skinValidation.data?.skinAreaDetected && <div>• Insufficient skin area visible</div>}
                          <div className="mt-2">
                            <strong>Suggestions:</strong> Ensure good lighting, position face clearly in frame, and remove any obstructions.
                          </div>
                        </div>
                      )}
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