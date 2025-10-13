import React, { useRef, useEffect, useState } from 'react';

type CameraScannerProps = {
  isOpen: boolean;
  onClose: () => void;
  // onResult returns raw OCR text and an optional parsed plate string (if extraction succeeds)
  onResult?: (result: { raw: string; plate?: string }) => void;
};

export const CameraScanner: React.FC<CameraScannerProps> = ({ isOpen, onClose, onResult }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (!isOpen) return;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err: any) {
        setError(err?.message || 'Unable to access camera');
      }
    };

    start();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isOpen]);

  const takeSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setLoading(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');

    try {
      // Dynamically import tesseract to avoid Vite pre-bundle resolution issues
      const mod: any = await import('tesseract.js');
      const Tesseract = mod?.default ?? mod;
      const { data: { text } } = await Tesseract.recognize(dataUrl, 'eng', { logger: () => {} });

      // Try to extract a vehicle plate using a couple of heuristics / regexes
      const extractPlate = (raw: string) => {
        if (!raw) return undefined;
        const s = raw.toUpperCase().replace(/[|I\s:]/g, ''); // remove some common OCR confusables and spaces

        // Common India-like pattern: AA00AA0000 or AA-00-AA-0000 etc.
        const indiaPattern = /([A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4})/g;
        const matchIndia = s.match(indiaPattern);
        if (matchIndia && matchIndia.length) return matchIndia[0];

        // Generic fallback: find longest alphanumeric token of length >=4
        const tokens = s.match(/[A-Z0-9]{4,}/g);
        if (tokens && tokens.length) {
          tokens.sort((a, b) => b.length - a.length);
          return tokens[0];
        }

        return undefined;
      };

      const plate = extractPlate(text);
      onResult && onResult({ raw: text, plate });
    } catch (err: any) {
      setError(err?.message || 'OCR failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Scan Number Plate</h3>
          <div>
            <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">Close</button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <video ref={videoRef} className="w-full rounded bg-black" playsInline />
          </div>
          <div className="w-48 flex-shrink-0">
            <canvas ref={canvasRef} className="w-full rounded border" />
            <div className="mt-2 space-y-2">
              <button onClick={takeSnapshot} disabled={loading} className="w-full bg-green-500 text-white px-3 py-2 rounded">
                {loading ? 'Scanning...' : 'Capture & Scan'}
              </button>
              <button onClick={onClose} className="w-full bg-gray-200 px-3 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
};
