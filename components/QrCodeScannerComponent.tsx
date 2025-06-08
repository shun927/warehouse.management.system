import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState, CameraDevice, Html5QrcodeResult, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { UI_TEXTS_JP } from '../constants';
import { CameraIcon, VideoCameraSlashIcon } from '@heroicons/react/24/solid';

// Define a minimal interface for the error object if Html5QrcodeError is not available
interface QrScannerError {
  errorMessage: string;
  type?: number; // Or whatever type 'type' is, if it exists
  // Add other properties if known from library's behavior or common error objects
}


interface QrCodeScannerComponentProps {
  onScanSuccess: (decodedText: string, decodedResult: Html5QrcodeResult) => void;
  onScannerCriticalError?: (error: string) => void;
  fps?: number;
  qrboxPercentage?: number; 
}

export interface QrCodeScannerComponentRef {
  stopScanning: () => Promise<void>;
}

const QR_READER_ELEMENT_ID = "qr-reader-element";

export const QrCodeScannerComponent = forwardRef<QrCodeScannerComponentRef, QrCodeScannerComponentProps>(({
  onScanSuccess,
  onScannerCriticalError = (error) => console.warn("QR Scanner Critical Error:", error),
  fps = 10,
  qrboxPercentage = 0.7, // Default to 70% of the smaller dimension
}, ref) => {
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isAttemptingStart, setIsAttemptingStart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | undefined>(undefined);
  const userManuallyStoppedRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    Html5Qrcode.getCameras()
      .then(devices => {
        if (!isMountedRef.current) return;
        if (devices && devices.length) {
          setCameras(devices);
          const rearCamera = devices.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('environment'));
          const initialCameraId = rearCamera ? rearCamera.id : devices[0].id;
          setSelectedCameraId(initialCameraId);
        } else {
          const noCamMsg = "利用可能なカメラが見つかりません。";
          setError(noCamMsg);
          if (onScannerCriticalError) onScannerCriticalError(noCamMsg);
        }
      })
      .catch(err => {
        if (!isMountedRef.current) return;
        console.error("Failed to get cameras", err);
        const camErrorMsg = "カメラの取得に失敗しました。カメラのアクセス許可を確認してください。";
        setError(camErrorMsg);
        if (onScannerCriticalError) onScannerCriticalError(camErrorMsg);
      });
      
    return () => {
      isMountedRef.current = false;
      const currentScannerInstance = html5QrCodeRef.current;
      if (currentScannerInstance) {
        const state = currentScannerInstance.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          currentScannerInstance.stop()
            .then(() => console.log("QR Scanner stopped on unmount (cleanup)."))
            .catch(stopErr => { 
                console.warn("Error stopping QR scanner on unmount (cleanup):", stopErr.message || stopErr);
            });
        }
        html5QrCodeRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startScanning = useCallback(async () => {
    console.log('[startScanning] Attempting to start scan...');
    if (isScanning || isAttemptingStart) {
      console.log("[startScanning] Scanner is already scanning or attempting to start.");
      return;
    }
    if (!selectedCameraId) {
        const noCamSelectedMsg = "使用するカメラが選択されていません。";
        if (isMountedRef.current) setError(noCamSelectedMsg);
        if (onScannerCriticalError && isMountedRef.current) onScannerCriticalError(noCamSelectedMsg);
        console.log('[startScanning] No camera selected.');
        return;
    }
    
    if (isMountedRef.current && error) {
      const criticalErrors = ["利用可能なカメラが見つかりません。", "カメラの取得に失敗しました。カメラのアクセス許可を確認してください。"];
      if (!criticalErrors.some(e => error.includes(e))) { 
          setError(null);
      }
    }
    userManuallyStoppedRef.current = false;
    if (isMountedRef.current) setIsAttemptingStart(true);
    
    const readerElement = document.getElementById(QR_READER_ELEMENT_ID);
    if(!readerElement) {
        console.error(`[startScanning] QR Reader element with ID ${QR_READER_ELEMENT_ID} not found.`);
        const notFoundErrorMsg = `スキャナー表示領域が見つかりません。ページを再読み込みしてください。`;
        if (isMountedRef.current) {
            setError(notFoundErrorMsg);
            setIsAttemptingStart(false);
        }
        if (onScannerCriticalError && isMountedRef.current) onScannerCriticalError(notFoundErrorMsg);
        return;
    }
    console.log(`[startScanning] Reader element found. offsetWidth: ${readerElement.offsetWidth}, offsetHeight: ${readerElement.offsetHeight}, offsetParent: ${readerElement.offsetParent !== null}`);

    try {
        if (html5QrCodeRef.current) {
            const state = html5QrCodeRef.current.getState();
            if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
                try {
                    console.log('[startScanning] Stopping existing scanner instance...');
                    await html5QrCodeRef.current.stop();
                    console.log('[startScanning] Existing scanner instance stopped.');
                } catch (stopError) {
                    console.warn("[startScanning] Could not stop existing scanner instance before starting new one:", stopError);
                }
            }
        }
        
        console.log(`[startScanning] Initializing Html5Qrcode with element ID: ${QR_READER_ELEMENT_ID}`);
        html5QrCodeRef.current = new Html5Qrcode(QR_READER_ELEMENT_ID, { verbose: process.env.NODE_ENV === 'development' }); // verbose only in dev
        
        const scanConfig = { 
            fps: fps, 
            qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                const percentage = qrboxPercentage || 0.7;
                const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                let qrboxSize = Math.floor(minEdge * percentage);
                qrboxSize = Math.max(150, Math.min(qrboxSize, 400)); // Clamp size: min 150px, max 400px
                return { width: qrboxSize, height: qrboxSize };
            },
            aspectRatio: 1.0, // Recommended for square QR codes
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true,
            },
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            rememberLastUsedCamera: false, 
          };
        console.log('[startScanning] Using scan config:', scanConfig);
        console.log(`[startScanning] Calling html5QrCode.start() with camera ID: ${selectedCameraId}`);
        await html5QrCodeRef.current.start(
          selectedCameraId!,
          scanConfig,
          (decodedText: string, decodedResult: Html5QrcodeResult) => { 
            console.log("QR Decoded (Library):", decodedText, "Current state: isScanning=", isScanning, "isAttemptingStart=", isAttemptingStart);
            if (isMountedRef.current) {
                 console.log("[SUCCESS_CALLBACK] Calling onScanSuccess prop with:", decodedText);
                 onScanSuccess(decodedText, decodedResult);
            } else {
                 console.log("[SUCCESS_CALLBACK] Component not mounted, not calling onScanSuccess.");
            }
          },
          (errorMessage: string, errorObject?: QrScannerError) => { // Use the custom QrScannerError interface
             // This callback is for non-critical errors during scanning (e.g., QR not found in frame)
             // console.warn("QR Scan attempt failed by library (non-critical, will retry):", errorMessage, errorObject);
          }
        );
        
        console.log('[startScanning] html5QrCode.start() promise RESOLVED.');
        if (isMountedRef.current) {
            setIsScanning(true);
            setError(null); 
            console.log('[startScanning] Html5Qrcode state after start:', html5QrCodeRef.current?.getState());
        }

    } catch (err: any) {
        console.error("[startScanning] Failed to start QR scanner:", err);
        const errorMessage = `スキャナーの起動に失敗: ${err.name || err.message || err}`;
        if (isMountedRef.current) {
            setError(errorMessage);
            setIsScanning(false);
        }
        if(onScannerCriticalError && isMountedRef.current) onScannerCriticalError(errorMessage); 
    } finally {
        if (isMountedRef.current) {
            setIsAttemptingStart(false);
        }
        console.log('[startScanning] Finished attempting to start scan.');
    }
  }, [
    isScanning, 
    isAttemptingStart, 
    selectedCameraId, 
    error, // error state is read to clear non-critical ones
    fps, 
    qrboxPercentage, 
    onScanSuccess, 
    onScannerCriticalError, 
    setError, // state setter
    setIsAttemptingStart, // state setter
    setIsScanning // state setter
  ]);
  
  useEffect(() => {
    if (!isMountedRef.current) {
      console.log('[AutoStart Scanner Effect] Component not mounted, skipping.');
      return;
    }
    console.log('[AutoStart Scanner Effect] Evaluating conditions:', {
      selectedCameraId,
      isScanning,
      isAttemptingStart,
      userManuallyStopped: userManuallyStoppedRef.current,
      currentError: error,
    });

    if (selectedCameraId && !isScanning && !isAttemptingStart && !userManuallyStoppedRef.current) {
      const criticalErrors = [
          "利用可能なカメラが見つかりません。", 
          "カメラの取得に失敗しました。カメラのアクセス許可を確認してください。",
          "使用するカメラが選択されていません。",
          `スキャナー表示領域が見つかりません。ページを再読み込みしてください。`
        ];
      const hasCriticalError = criticalErrors.some(e => error?.includes(e));
      console.log('[AutoStart Scanner Effect] Has critical error:', hasCriticalError);
      
      if (!hasCriticalError) {
          const readerEl = document.getElementById(QR_READER_ELEMENT_ID);
          console.log('[AutoStart Scanner Effect] Reader element:', readerEl ? 'found' : 'NOT FOUND', '; Visible (offsetParent !== null):', readerEl ? readerEl.offsetParent !== null : 'N/A');
          if (readerEl && readerEl.offsetParent !== null) { 
            console.log('[AutoStart Scanner Effect] Conditions met, calling startScanning().');
            startScanning();
          } else {
            console.log('[AutoStart Scanner Effect] Reader element not found or not visible, not starting scan automatically.');
          }
      } else {
        console.log('[AutoStart Scanner Effect] Critical error present, not starting scan automatically.');
      }
    } else {
      let logReason = '';
      if (!selectedCameraId) logReason += 'No camera selected. ';
      if (isScanning) logReason += 'Already scanning. ';
      if (isAttemptingStart) logReason += 'Already attempting to start. ';
      if (userManuallyStoppedRef.current) logReason += 'User manually stopped. ';
      console.log(`[AutoStart Scanner Effect] Conditions NOT met for starting scan automatically. Reason: ${logReason || 'Unknown'}`);
    }
  }, [selectedCameraId, isScanning, isAttemptingStart, error, startScanning]); 

  const internalStopScanning = async () => {
    userManuallyStoppedRef.current = true; 
    if (html5QrCodeRef.current) {
      const scannerState = html5QrCodeRef.current.getState();
      if (scannerState === Html5QrcodeScannerState.SCANNING || scannerState === Html5QrcodeScannerState.PAUSED) {
        try {
          await html5QrCodeRef.current.stop(); 
          console.log("QR Scanner stopped successfully via internalStopScanning.");
        } catch (err: any) {
          console.error("Failed to stop QR scanner via internalStopScanning:", err);
          if (isMountedRef.current) {
            setError(`スキャナーの停止処理中にエラーが発生しました: ${err.message || '不明なエラー'}`);
          }
        } finally {
          if (isMountedRef.current) {
            setIsScanning(false); 
          }
        }
      } else {
        console.log(`Scanner was not in an active state to be stopped (current state: ${scannerState}), UI reset via internalStopScanning.`);
        if (isMountedRef.current) {
          setIsScanning(false);
        }
      }
    } else {
      if (isMountedRef.current) {
        setIsScanning(false);
      }
    }
  };
  
  useImperativeHandle(ref, () => ({
    stopScanning: internalStopScanning,
  }));

  const handleCameraChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCameraId = e.target.value;
    
    if (isMountedRef.current) {
        setIsAttemptingStart(true); 
        setError(null); 
    }
    
    if (isScanning && html5QrCodeRef.current) {
        try {
            await html5QrCodeRef.current.stop();
        } catch (err) {
            console.error("Error stopping scanner for camera change:", err);
            if (isMountedRef.current) setError("カメラ変更時にスキャナー停止エラーが発生しました。");
        } finally {
             if (isMountedRef.current) setIsScanning(false);
        }
    } else {
         if (isScanning && isMountedRef.current) setIsScanning(false); 
    }
    
    if (isMountedRef.current) setSelectedCameraId(newCameraId); 
    userManuallyStoppedRef.current = false; 
  };


  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow">
      <div className="relative w-full min-w-[150px] aspect-square mb-4">
        <div 
            id={QR_READER_ELEMENT_ID} 
            className="absolute inset-0 w-full h-full border-2 border-gray-300 rounded-md overflow-hidden bg-gray-900"
            aria-live="polite"
            aria-atomic="true" 
        />
        {(!isScanning && !isAttemptingStart) && (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 bg-gray-900/80 rounded-md">
                <CameraIcon className="w-20 h-20 mb-2" aria-hidden="true" />
                <p className="text-center text-white">
                  {error && !error.includes("スキャナーの停止処理中") 
                    ? error 
                    : UI_TEXTS_JP.qrScanInstruction} 
                </p>
            </div>
        )}
      </div>

       {cameras.length > 1 && ( 
        <div className="mb-4">
          <label htmlFor="camera-select" className="block text-sm font-medium text-gray-700 mb-1">カメラ選択:</label>
          <select
            id="camera-select"
            value={selectedCameraId || ''}
            onChange={handleCameraChange}
            disabled={isAttemptingStart || isScanning} 
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-200"
          >
            {cameras.map(camera => (
              <option key={camera.id} value={camera.id}>{camera.label || camera.id}</option>
            ))}
          </select>
        </div>
      )}
      {error && error.includes("スキャナーの停止処理中") && <p className="text-yellow-600 text-sm mb-2 text-center break-words" role="alert">{error}</p>}
      <div className="flex space-x-2">
        {(!isScanning || userManuallyStoppedRef.current) && !isAttemptingStart ? ( 
          <Button 
            onClick={() => {
              if (isMountedRef.current) setError(null); 
              userManuallyStoppedRef.current = false; 
              startScanning();
            }} 
            className="w-full" // Replaced fullWidth with className
            disabled={!selectedCameraId || cameras.length === 0 || isAttemptingStart}
            aria-label={UI_TEXTS_JP.startScan}
          >
            <CameraIcon className="h-5 w-5 mr-2" aria-hidden="true"/>
            {UI_TEXTS_JP.startScan}
          </Button>
        ) : (
          <Button 
            onClick={internalStopScanning} 
            variant="secondary" 
            className="w-full" // Replaced fullWidth with className
            disabled={isAttemptingStart && !isScanning} 
            aria-label={UI_TEXTS_JP.stopScan}
          >
            <VideoCameraSlashIcon className="h-5 w-5 mr-2" aria-hidden="true"/>
            {UI_TEXTS_JP.stopScan}
          </Button>
        )}
      </div>
    </div>
  );
});
QrCodeScannerComponent.displayName = 'QrCodeScannerComponent';
