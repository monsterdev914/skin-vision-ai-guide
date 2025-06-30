import { SelfieSegmentation, Results as SegmentationResults } from '@mediapipe/selfie_segmentation';

// Skin region interface with polygon support
export interface SkinRegion {
  id: string;
  bodyPart: 'face' | 'neck' | 'arm' | 'hand' | 'torso' | 'leg' | 'foot' | 'unknown';
  polygon: Point[];
  boundingBox: BoundingBox;
  area: number; // pixel count
  confidence: number;
  centerPoint: Point;
}

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SkinDetectionResult {
  success: boolean;
  regions: SkinRegion[];
  totalSkinArea: number;
  totalImageArea: number;
  skinCoveragePercentage: number;
  personMask?: ImageData;
  skinMask?: ImageData;
  message: string;
}

export class SkinDetectionService {
  private selfieSegmentation: SelfieSegmentation | null = null;
  private isInitialized = false;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  // Initialize MediaPipe Selfie Segmentation
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        },
      });

      this.selfieSegmentation.setOptions({
        modelSelection: 1, // 0 for general, 1 for landscape
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize skin detection:', error);
      throw error;
    }
  }

  // Main skin detection function
  async detectSkinAreas(imageElement: HTMLImageElement | HTMLVideoElement): Promise<SkinDetectionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.selfieSegmentation) {
      return {
        success: false,
        regions: [],
        totalSkinArea: 0,
        totalImageArea: 0,
        skinCoveragePercentage: 0,
        message: 'Skin detection not initialized'
      };
    }

    try {
      // Set canvas size to match image
      this.canvas.width = imageElement.width || 640;
      this.canvas.height = imageElement.height || 480;
      
      // Draw image to canvas
      this.ctx.drawImage(imageElement, 0, 0, this.canvas.width, this.canvas.height);
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

      // Get person segmentation
      const personMask = await this.getPersonSegmentation(imageElement);
      
      if (!personMask) {
        return {
          success: false,
          regions: [],
          totalSkinArea: 0,
          totalImageArea: this.canvas.width * this.canvas.height,
          skinCoveragePercentage: 0,
          message: 'Failed to detect person in image'
        };
      }

      // Detect skin areas within person mask
      const skinMask = this.detectSkinPixels(imageData, personMask);
      
      // Find connected skin regions
      const regions = this.findSkinRegions(skinMask);
      
      // Calculate statistics
      const totalSkinArea = regions.reduce((sum, region) => sum + region.area, 0);
      const totalImageArea = this.canvas.width * this.canvas.height;
      const skinCoveragePercentage = (totalSkinArea / totalImageArea) * 100;

      return {
        success: true,
        regions,
        totalSkinArea,
        totalImageArea,
        skinCoveragePercentage,
        personMask,
        skinMask,
        message: `Detected ${regions.length} skin regions covering ${skinCoveragePercentage.toFixed(1)}% of image`
      };

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
  }

  // Get person segmentation mask using MediaPipe
  private async getPersonSegmentation(imageElement: HTMLImageElement | HTMLVideoElement): Promise<ImageData | null> {
    return new Promise((resolve) => {
      if (!this.selfieSegmentation) {
        resolve(null);
        return;
      }

      this.selfieSegmentation.onResults((results: SegmentationResults) => {
        if (results.segmentationMask) {
          try {
            // Convert segmentation mask to ImageData
            const maskCanvas = document.createElement('canvas');
            const maskCtx = maskCanvas.getContext('2d')!;
            
            // Handle different mask types
            if (results.segmentationMask instanceof HTMLCanvasElement) {
              // If mask is already a canvas, draw it and get ImageData
              maskCanvas.width = results.segmentationMask.width;
              maskCanvas.height = results.segmentationMask.height;
              maskCtx.drawImage(results.segmentationMask, 0, 0);
              const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
              resolve(imageData);
            } else {
              // For other types, create a simple person mask
              // This is a fallback approach when we can't access raw mask data
              maskCanvas.width = this.canvas.width;
              maskCanvas.height = this.canvas.height;
              const imageData = maskCtx.createImageData(maskCanvas.width, maskCanvas.height);
              
              // Create a simple mask (this is a simplified approach)
              for (let i = 0; i < imageData.data.length; i += 4) {
                imageData.data[i] = 255;     // R
                imageData.data[i + 1] = 255; // G  
                imageData.data[i + 2] = 255; // B
                imageData.data[i + 3] = 255; // A
              }
              
              resolve(imageData);
            }
          } catch (error) {
            console.error('Error processing segmentation mask:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });

      this.selfieSegmentation.send({ image: imageElement });
    });
  }

  // Detect skin pixels using HSV color space filtering
  private detectSkinPixels(imageData: ImageData, personMask: ImageData): ImageData {
    const skinMask = new ImageData(imageData.width, imageData.height);
    const pixels = imageData.data;
    const maskPixels = personMask.data;
    const skinPixels = skinMask.data;

    for (let i = 0; i < pixels.length; i += 4) {
      // Only process pixels that are part of the person
      if (maskPixels[i] > 128) { // Person mask threshold
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        if (this.isSkinColor(r, g, b)) {
          skinPixels[i] = 255;     // R
          skinPixels[i + 1] = 255; // G
          skinPixels[i + 2] = 255; // B
          skinPixels[i + 3] = 255; // A
        }
      }
    }

    return skinMask;
  }

  // Skin color detection using HSV color space
  private isSkinColor(r: number, g: number, b: number): boolean {
    // Convert RGB to HSV
    const { h, s, v } = this.rgbToHsv(r, g, b);
    
    // Skin color ranges in HSV (multiple ranges for different skin tones)
    const skinRanges = [
      // Light skin tones
      { hMin: 0, hMax: 20, sMin: 0.2, sMax: 0.7, vMin: 0.4, vMax: 1.0 },
      // Medium skin tones
      { hMin: 5, hMax: 25, sMin: 0.3, sMax: 0.8, vMin: 0.3, vMax: 0.9 },
      // Dark skin tones
      { hMin: 10, hMax: 30, sMin: 0.2, sMax: 0.6, vMin: 0.2, vMax: 0.7 },
      // Edge case: reddish skin tones
      { hMin: 340, hMax: 360, sMin: 0.2, sMax: 0.7, vMin: 0.4, vMax: 1.0 }
    ];

    return skinRanges.some(range => 
      h >= range.hMin && h <= range.hMax &&
      s >= range.sMin && s <= range.sMax &&
      v >= range.vMin && v <= range.vMax
    );
  }

  // Convert RGB to HSV
  private rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    if (diff !== 0) {
      if (max === r) {
        h = (60 * ((g - b) / diff) + 360) % 360;
      } else if (max === g) {
        h = (60 * ((b - r) / diff) + 120) % 360;  
      } else {
        h = (60 * ((r - g) / diff) + 240) % 360;
      }
    }

    const s = max === 0 ? 0 : diff / max;
    const v = max;

    return { h, s, v };
  }

  // Find connected skin regions using flood fill algorithm
  private findSkinRegions(skinMask: ImageData): SkinRegion[] {
    const width = skinMask.width;
    const height = skinMask.height;
    const visited = new Uint8Array(width * height);
    const regions: SkinRegion[] = [];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const pixelIndex = index * 4;
        
        if (skinMask.data[pixelIndex] > 0 && !visited[index]) {
          const region = this.floodFillRegion(skinMask, x, y, visited);
          
          // Filter out small regions (noise)
          if (region.area > 100) { // Minimum 100 pixels
            regions.push({
              ...region,
              id: `skin_region_${regions.length}`,
              bodyPart: this.classifyBodyPart(region, skinMask.width, skinMask.height)
            });
          }
        }
      }
    }

    // Sort regions by size (largest first)
    regions.sort((a, b) => b.area - a.area);
    
    return regions;
  }

  // Flood fill algorithm to find connected skin region
  private floodFillRegion(skinMask: ImageData, startX: number, startY: number, visited: Uint8Array): Omit<SkinRegion, 'id' | 'bodyPart'> {
    const width = skinMask.width;
    const height = skinMask.height;
    const stack: Point[] = [{ x: startX, y: startY }];
    const regionPixels: Point[] = [];
    
    let minX = startX, maxX = startX;
    let minY = startY, maxY = startY;

    while (stack.length > 0) {
      const { x, y } = stack.pop()!;
      const index = y * width + x;
      
      if (x < 0 || x >= width || y < 0 || y >= height || visited[index]) {
        continue;
      }
      
      const pixelIndex = index * 4;
      if (skinMask.data[pixelIndex] === 0) {
        continue;
      }
      
      visited[index] = 1;
      regionPixels.push({ x, y });
      
      // Update bounding box
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      
      // Add neighbors to stack
      stack.push({ x: x + 1, y });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
    }

    // Create polygon from boundary pixels (simplified approach)
    const polygon = this.createPolygonFromPixels(regionPixels);
    
    return {
      polygon,
      boundingBox: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      },
      area: regionPixels.length,
      confidence: Math.min(1.0, regionPixels.length / 1000), // Confidence based on size
      centerPoint: {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2
      }
    };
  }

  // Create simplified polygon from pixels (boundary detection)
  private createPolygonFromPixels(pixels: Point[]): Point[] {
    if (pixels.length < 3) return pixels;
    
    // Find convex hull as a simplified polygon
    return this.convexHull(pixels);
  }

  // Convex hull algorithm (Graham scan)
  private convexHull(points: Point[]): Point[] {
    if (points.length < 3) return points;
    
    // Find bottom-most point (and left-most in case of tie)
    let bottom = points[0];
    for (const point of points) {
      if (point.y > bottom.y || (point.y === bottom.y && point.x < bottom.x)) {
        bottom = point;
      }
    }
    
    // Sort points by polar angle with respect to bottom point
    const sorted = points.filter(p => p !== bottom).sort((a, b) => {
      const angleA = Math.atan2(a.y - bottom.y, a.x - bottom.x);
      const angleB = Math.atan2(b.y - bottom.y, b.x - bottom.x);
      return angleA - angleB;
    });
    
    const hull = [bottom];
    
    for (const point of sorted) {
      while (hull.length > 1 && this.crossProduct(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) {
        hull.pop();
      }
      hull.push(point);
    }
    
    return hull;
  }

  // Cross product for convex hull calculation
  private crossProduct(o: Point, a: Point, b: Point): number {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }

  // Classify body part based on region position and characteristics
  private classifyBodyPart(region: Omit<SkinRegion, 'id' | 'bodyPart'>, imageWidth: number, imageHeight: number): SkinRegion['bodyPart'] {
    const { centerPoint, boundingBox, area } = region;
    const relativeX = centerPoint.x / imageWidth;
    const relativeY = centerPoint.y / imageHeight;
    const aspectRatio = boundingBox.width / boundingBox.height;
    
    // Face detection (top-center, roughly square, largest in upper area)
    if (relativeY < 0.4 && relativeX > 0.2 && relativeX < 0.8 && aspectRatio > 0.7 && aspectRatio < 1.3) {
      return 'face';
    }
    
    // Neck detection (below face, narrow)
    if (relativeY > 0.3 && relativeY < 0.6 && relativeX > 0.35 && relativeX < 0.65 && aspectRatio < 0.5) {
      return 'neck';
    }
    
    // Arms detection (sides, elongated)
    if ((relativeX < 0.3 || relativeX > 0.7) && aspectRatio < 0.4) {
      return 'arm';
    }
    
    // Hands detection (small, at extremities)
    if (area < 2000 && (relativeX < 0.2 || relativeX > 0.8)) {
      return 'hand';
    }
    
    // Torso detection (center, large)
    if (relativeX > 0.3 && relativeX < 0.7 && relativeY > 0.4 && relativeY < 0.8 && area > 5000) {
      return 'torso';
    }
    
    // Legs detection (lower area, elongated)
    if (relativeY > 0.6 && aspectRatio < 0.6) {
      return 'leg';
    }
    
    return 'unknown';
  }

  // Check if a point is within any skin region
  isPointInSkinArea(x: number, y: number, regions: SkinRegion[]): { inSkin: boolean; region?: SkinRegion } {
    for (const region of regions) {
      if (this.pointInPolygon({ x, y }, region.polygon)) {
        return { inSkin: true, region };
      }
    }
    return { inSkin: false };
  }

  // Point-in-polygon test using ray casting algorithm
  private pointInPolygon(point: Point, polygon: Point[]): boolean {
    const { x, y } = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  // Clean up resources
  dispose(): void {
    if (this.selfieSegmentation) {
      this.selfieSegmentation.close();
      this.selfieSegmentation = null;
    }
    this.isInitialized = false;
  }
} 