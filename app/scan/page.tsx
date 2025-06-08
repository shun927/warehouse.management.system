'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats, Html5QrcodeScanType, Html5QrcodeScannerState } from 'html5-qrcode'; // Added Html5QrcodeScannerState
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCodeIcon, VideoIcon, VideoOffIcon } from 'lucide-react';

const SCAN_REGION_ID = "qr-code-full-region";

export default function ScanPage() {
  const router = useRouter();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Cleanup logic moved to a separate effect or explicit stopScan call if needed before unmount
    };
  }, []);

  const handleScanSuccess = (decodedText: string) => {
    if (!isMounted.current) return;
    setScanResult(decodedText);
    toast.success(`QR Code Scanned: ${decodedText}`);

    try {
      // Attempt to parse as a URL first (e.g., for item details)
      const url = new URL(decodedText);
      if (decodedText.startsWith(window.location.origin) || decodedText.startsWith('/')) {
        router.push(decodedText);
        stopScan();
        return;
      }
    } catch (e) {
      // Not a full URL, proceed to check for custom schemes or patterns
      console.log("Scanned text is not a standard URL, checking for custom patterns.");
    }

    // Check for shibalab://box/move/{boxId} pattern or similar
    // Example: shibalab://box/move/abc-123-xyz
    const boxMoveMatch = decodedText.match(/^shibalab:\/\/box\/move\/([a-zA-Z0-9-]+)$/);
    if (boxMoveMatch && boxMoveMatch[1]) {
      const boxId = boxMoveMatch[1];
      router.push(`/locations/${boxId}/move`);
      stopScan();
      return;
    }

    // Check for shibalab://item/rent/{itemId} pattern (existing logic)
    // Example: shibalab://item/rent/xyz-789-abc
    const itemRentMatch = decodedText.match(/^shibalab:\/\/item\/rent\/([a-zA-Z0-9-]+)$/);
    if (itemRentMatch && itemRentMatch[1]) {
      const itemId = itemRentMatch[1];
      // Assuming you have a page or modal for renting an item like this
      // This part might need adjustment based on your actual item rental flow
      router.push(`/items/${itemId}/rent`); // Or the path to your rental modal trigger
      stopScan();
      return;
    }
    
    // Fallback for general shibalab://<path> (existing logic)
    if (decodedText.startsWith('shibalab://')) {
      const path = decodedText.substring('shibalab://'.length);
      router.push(`/${path}`);
      stopScan();
      return;
    }

    // If none of the above, treat as an unknown or external QR code
    toast.info("Scanned content is not a recognized internal link or action.");
    console.log("Unrecognized QR content:", decodedText);
    stopScan();
  };

  const handleScanError = (errorMessage: string) => {
    if (!isMounted.current) return;
    const ignorePatterns = ["qr code not found", "no qr code found", "scanner paused"];
    if (!ignorePatterns.some(pattern => errorMessage.toLowerCase().includes(pattern))) {
      console.error(`QR Code scan error: ${errorMessage}`);
      // setError(`Scan Error: ${errorMessage}`); // Avoid flooding UI with transient errors
    }
  };

  const startScan = () => {
    if (!isMounted.current) return;
    if (scannerRef.current && isScanning) {
      console.warn("Scanner already running or instance exists.");
      return;
    }
    setError(null);
    setScanResult(null);

    try {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Error clearing old scanner instance before start:", err));
        scannerRef.current = null;
      }

      const formatsToSupport = [Html5QrcodeSupportedFormats.QR_CODE];
      
      const newScanner = new Html5QrcodeScanner(
        SCAN_REGION_ID,
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.max(200, Math.floor(minEdge * 0.7));
            return { width: qrboxSize, height: qrboxSize };
          },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          formatsToSupport: formatsToSupport,
          rememberLastUsedCamera: true,
          aspectRatio: 1.0,
        },
        false 
      );

      newScanner.render(handleScanSuccess, handleScanError);
      scannerRef.current = newScanner;
      setIsScanning(true);
      toast.info("QR Code scanner started.");

    } catch (e: any) {
      console.error("Failed to start scanner", e);
      const errorMessage = `Failed to initialize scanner: ${e.message || 'Unknown error'}`;
      if (isMounted.current) {
        setError(errorMessage);
        toast.error(errorMessage);
        setIsScanning(false);
      }
    }
  };

  const stopScan = () => {
    // Check if scanner instance exists
    if (scannerRef.current) {
      // Check if the scanner is actually running before trying to clear
      // Html5QrcodeScanner doesn't have a reliable getState() like Html5Qrcode, 
      // so we rely on our `isScanning` state and attempt clear regardless if instance exists.
      scannerRef.current.clear()
        .then(() => {
          if (isMounted.current) {
            setIsScanning(false);
            // Only show toast if it was actively scanning or user intended to stop
            if(error === null) toast.info("QR Code scanner stopped.");
          }
          scannerRef.current = null; // Nullify the ref after successful clear
        })
        .catch((err: any) => {
          console.error("Failed to clear scanner:", err);
          if (isMounted.current) {
            toast.error("Could not stop scanner properly.");
            // Force stop state if clear fails but component is still mounted
            setIsScanning(false);
          }
          scannerRef.current = null; // Still try to nullify ref
        });
    } else if (isMounted.current) {
        // If no scannerRef but we thought we were scanning, update state.
        if(isScanning) setIsScanning(false);
    }
  };

  useEffect(() => {
    // Cleanup effect for component unmount
    return () => {
      isMounted.current = false; // Mark as unmounted first
      if (scannerRef.current) {
        // Attempt to clear the scanner if it exists and might be running
        scannerRef.current.clear()
          .then(() => console.log("Scanner cleared on unmount."))
          .catch(err => console.error("Error clearing scanner on unmount:", err));
        scannerRef.current = null;
      }
    };
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCodeIcon className="mr-2 h-6 w-6" /> QR Code Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div id={SCAN_REGION_ID} className="w-full h-auto aspect-square bg-gray-100 rounded-md mb-4" />
          
          {!isScanning ? (
            <Button onClick={startScan} className="w-full" disabled={isScanning}> {/* Disable if already scanning */} 
              <VideoIcon className="mr-2 h-4 w-4" /> Start Scan
            </Button>
          ) : (
            <Button onClick={stopScan} variant="outline" className="w-full" disabled={!isScanning}> {/* Disable if not scanning */} 
              <VideoOffIcon className="mr-2 h-4 w-4" /> Stop Scan
            </Button>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-500 text-center">Error: {error}</p>
          )}
          {scanResult && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700 font-semibold">Last Scan Result:</p>
              <p className="text-xs text-green-600 break-all">{scanResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
