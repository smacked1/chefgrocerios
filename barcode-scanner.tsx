import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, X, Scan, Package, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface BarcodeResult {
  code: string;
  format: string;
  product?: {
    name: string;
    brand?: string;
    category?: string;
    ingredients?: string[];
    nutrition?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
    };
    allergens?: string[];
    price_estimate?: string;
  };
}

interface BarcodeScannerProps {
  onScanSuccess?: (result: BarcodeResult) => void;
  onClose?: () => void;
  showProductLookup?: boolean;
}

export function BarcodeScanner({ 
  onScanSuccess, 
  onClose, 
  showProductLookup = true 
}: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<BarcodeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const zxingReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const { toast } = useToast();

  // Request camera permissions
  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Stop the stream immediately - we just needed to check permissions
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setError(null);
      return true;
    } catch (err: any) {
      console.error('Camera permission denied:', err);
      setHasPermission(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please enable camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Camera access failed. Please try again.');
      }
      return false;
    }
  }, []);

  // Start barcode scanning with multiple libraries for better compatibility
  const startScanning = useCallback(async () => {
    if (!scannerRef.current) return;

    setIsScanning(true);
    setError(null);

    try {
      // Try HTML5-QRCode first (good for QR codes and basic barcodes)
      html5QrCodeRef.current = new Html5Qrcode("barcode-scanner");
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.777778
      };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
          const format = decodedResult?.result?.format?.formatName || 'Unknown';
          handleScanSuccess(decodedText, format);
        },
        (errorMessage) => {
          // Silent error handling - this is called frequently during scanning
        }
      );

    } catch (error) {
      console.warn('HTML5-QRCode failed, trying ZXing:', error);
      
      // Fallback to ZXing library for more barcode formats
      try {
        zxingReaderRef.current = new BrowserMultiFormatReader();
        
        const videoElement = document.createElement('video');
        videoElement.style.width = '100%';
        videoElement.style.height = '300px';
        videoElement.style.objectFit = 'cover';
        
        if (scannerRef.current) {
          scannerRef.current.appendChild(videoElement);
          
          await zxingReaderRef.current.decodeFromVideoDevice(
            null,
            videoElement,
            (result, error) => {
              if (result) {
                const format = result.getBarcodeFormat()?.toString() || 'Unknown';
                handleScanSuccess(result.getText(), format);
              }
            }
          );
        }
      } catch (zxingError) {
        console.error('ZXing library also failed:', zxingError);
        setError('Failed to initialize barcode scanner. Please check camera permissions.');
        setIsScanning(false);
      }
    }
  }, []);

  // Handle successful scan
  const handleScanSuccess = async (code: string, format: string) => {
    console.log('Barcode scanned:', code, format);
    
    const result: BarcodeResult = { code, format };
    setScanResult(result);
    
    // Stop scanning
    stopScanning();
    
    // Look up product information if enabled
    if (showProductLookup) {
      setIsLoading(true);
      try {
        // Try premium FatSecret API first
        const fatSecretResponse = await apiRequest('POST', '/api/fatsecret/barcode', { barcode: code });
        const fatSecretData = await fatSecretResponse.json();
        
        if (fatSecretData.success && fatSecretData.product) {
          const product = fatSecretData.product;
          result.product = {
            name: product.name,
            brand: product.brand,
            category: 'Food Product',
            nutrition: product.nutrition,
            ingredients: [],
            allergens: []
          };
          setScanResult(result);
          
          toast({
            title: "Premium Product Found!",
            description: `${product.name} ${product.brand ? 'by ' + product.brand : ''} (FatSecret Premium)`,
          });
        } else {
          // Fallback to basic barcode lookup
          try {
            const response = await apiRequest('POST', '/api/barcode-lookup', { code });
            const productData = await response.json();
            
            if (productData.product) {
              result.product = productData.product;
              setScanResult(result);
              
              toast({
                title: "Product Found!",
                description: `${productData.product.name} ${productData.product.brand ? 'by ' + productData.product.brand : ''}`,
              });
            } else {
              toast({
                title: "Barcode Scanned",
                description: `Code: ${code} (Product details not found)`,
              });
            }
          } catch (fallbackError) {
            console.error('Fallback barcode lookup failed:', fallbackError);
            toast({
              title: "Barcode Scanned",
              description: `Code: ${code} (Product lookup unavailable)`,
            });
          }
        }
      } catch (error) {
        console.error('Product lookup failed:', error);
        toast({
          title: "Barcode Scanned",
          description: `Code: ${code} (Product lookup unavailable)`,
        });
      }
      setIsLoading(false);
    }
    
    // Call success callback
    if (onScanSuccess) {
      onScanSuccess(result);
    }
  };

  // Stop scanning
  const stopScanning = useCallback(() => {
    setIsScanning(false);
    
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(console.error);
      html5QrCodeRef.current.clear();
      html5QrCodeRef.current = null;
    }
    
    if (zxingReaderRef.current) {
      zxingReaderRef.current.reset();
      zxingReaderRef.current = null;
    }
    
    // Clear scanner container
    if (scannerRef.current) {
      scannerRef.current.innerHTML = '';
    }
  }, []);

  // Initialize permissions on mount
  useEffect(() => {
    requestCameraPermission();
    
    return () => {
      stopScanning();
    };
  }, [requestCameraPermission, stopScanning]);

  // Permission request screen
  if (hasPermission === null) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <Camera className="w-5 h-5" />
            Barcode Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking camera permissions...</p>
        </CardContent>
      </Card>
    );
  }

  // Permission denied screen
  if (hasPermission === false) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center text-destructive">
            <AlertCircle className="w-5 h-5" />
            Camera Access Required
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{error}</p>
          <div className="space-y-2">
            <Button onClick={requestCameraPermission} variant="outline">
              <Camera className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="ghost" className="w-full">
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Scan result screen
  if (scanResult) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center text-success">
            <CheckCircle2 className="w-5 h-5" />
            Scan Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Scan className="w-4 h-4" />
              <span className="font-medium">Barcode: {scanResult.code}</span>
            </div>
            <Badge variant="secondary">{scanResult.format}</Badge>
          </div>

          {scanResult.product && (
            <div className="bg-success/10 p-4 rounded-lg border border-success/20">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-success" />
                <h3 className="font-semibold">{scanResult.product.name}</h3>
              </div>
              
              {scanResult.product.brand && (
                <p className="text-sm text-muted-foreground mb-2">
                  Brand: {scanResult.product.brand}
                </p>
              )}
              
              {scanResult.product.category && (
                <Badge variant="outline" className="mb-3">
                  {scanResult.product.category}
                </Badge>
              )}

              {scanResult.product.nutrition && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Calories: {scanResult.product.nutrition.calories || 'N/A'}</div>
                  <div>Protein: {scanResult.product.nutrition.protein || 'N/A'}g</div>
                  <div>Carbs: {scanResult.product.nutrition.carbs || 'N/A'}g</div>
                  <div>Fat: {scanResult.product.nutrition.fat || 'N/A'}g</div>
                </div>
              )}

              {scanResult.product.price_estimate && (
                <p className="text-sm font-medium text-success mt-2">
                  Est. Price: {scanResult.product.price_estimate}
                </p>
              )}

              {scanResult.product.allergens && scanResult.product.allergens.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-destructive mb-1">Allergens:</p>
                  <div className="flex flex-wrap gap-1">
                    {scanResult.product.allergens.map((allergen, idx) => (
                      <Badge key={idx} variant="destructive" className="text-xs">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setScanResult(null);
                startScanning();
              }} 
              variant="outline" 
              className="flex-1"
            >
              <Scan className="w-4 h-4 mr-2" />
              Scan Another
            </Button>
            {onClose && (
              <Button onClick={onClose} className="flex-1">
                Done
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main scanner interface
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <Scan className="w-5 h-5" />
          Barcode Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScanning ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Position barcode within the camera frame to scan
            </p>
            <Button onClick={startScanning} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Start Scanning
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="ghost" className="w-full">
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div 
              ref={scannerRef}
              id="barcode-scanner"
              className="w-full bg-black rounded-lg overflow-hidden"
              style={{ minHeight: '300px' }}
            />
            
            {isLoading && (
              <div className="text-center">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Looking up product...</p>
              </div>
            )}
            
            <Button onClick={stopScanning} variant="destructive" className="w-full">
              <X className="w-4 h-4 mr-2" />
              Stop Scanning
            </Button>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BarcodeScanner;