import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import CameraCapture from "./CameraCapture";

interface ImageUploadCardProps {
  onImageUpload: (imageUrl: string, imageFile: File) => void;
}

const ImageUploadCard = ({ onImageUpload }: ImageUploadCardProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image compression function
  const compressImage = async (file: File, maxSizeKB: number = 150): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate dimensions to maintain aspect ratio
        let { width, height } = img;
        const maxDimension = 1024; // Max width or height
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        // Binary search for optimal quality to reach target size
        let quality = 0.9;
        let minQuality = 0.1;
        let maxQuality = 0.9;
        
        const tryCompress = () => {
          canvas.toBlob(async (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const currentSizeKB = blob.size / 1024;
            
            if (currentSizeKB <= maxSizeKB || Math.abs(maxQuality - minQuality) < 0.01) {
              // Target reached or quality range exhausted
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else if (currentSizeKB > maxSizeKB) {
              // Too large, reduce quality
              maxQuality = quality;
              quality = (minQuality + quality) / 2;
              tryCompress();
            } else {
              // Too small, increase quality
              minQuality = quality;
              quality = (quality + maxQuality) / 2;
              tryCompress();
            }
          }, 'image/jpeg', quality);
        };

        tryCompress();
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      // Check file size (10MB limit for original file)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setIsCompressing(true);

      try {
        let processedFile = file;
        const fileSizeKB = file.size / 1024;

        // Compress if over 150KB
        if (fileSizeKB > 150) {
          console.log(`Original file size: ${fileSizeKB.toFixed(1)}KB, compressing...`);
          processedFile = await compressImage(file, 150);
          console.log(`Compressed file size: ${(processedFile.size / 1024).toFixed(1)}KB`);
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setSelectedImage(imageUrl);
          setSelectedFile(processedFile);
          onImageUpload(imageUrl, processedFile);
        };
        reader.readAsDataURL(processedFile);
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try again.');
      } finally {
        setIsCompressing(false);
      }
    } else {
      alert('Please select a valid image file');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isCompressing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span>Processing Image</span>
          </CardTitle>
          <CardDescription>
            Compressing your image for optimal analysis...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Optimizing image size...</p>
              <p className="text-sm text-gray-500 mt-2">This ensures fast and accurate analysis</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleCameraCapture = (imageFile: File, imageUrl: string) => {
    setSelectedImage(imageUrl);
    setSelectedFile(imageFile);
    onImageUpload(imageUrl, imageFile);
  };

  const handleCameraError = (error: string) => {
    console.error('Camera error:', error);
    // You can add more error handling here if needed
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-blue-600" />
          <span>Capture or Upload Image</span>
        </CardTitle>
        <CardDescription>
          Use your camera or upload a photo of your skin for AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!selectedImage ? (
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="camera" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Use Camera
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="mt-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload your image
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop your image here, or click to browse
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
                
                <div className="space-y-3">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:opacity-90"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  
                  <div className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, WebP (Max 10MB)
                    <br />
                    Images will be automatically optimized to 150KB for fast analysis
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="camera" className="mt-6">
              <CameraCapture 
                onImageCapture={handleCameraCapture}
                onError={handleCameraError}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={selectedImage}
                alt="Uploaded skin image"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={clearImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Ready for Analysis!</h4>
              <p className="text-sm text-green-800">
                Your image has been uploaded and optimized successfully. The AI analysis will begin automatically.
              </p>
              <div className="mt-2 text-xs text-green-700">
                File: {selectedFile?.name} ({(selectedFile ? selectedFile.size / 1024 : 0).toFixed(1)} KB)
                {selectedFile && selectedFile.size / 1024 <= 150 && " ✓ Optimized"}
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Image Tips for Best Results:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure good lighting</li>
                <li>• Keep the camera steady</li>
                <li>• Focus on the affected area</li>
                <li>• Avoid shadows and glare</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploadCard;
