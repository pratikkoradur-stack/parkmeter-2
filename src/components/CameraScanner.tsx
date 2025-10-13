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

  // Preprocess the current video frame: crop center area, resize, grayscale, and simple threshold
  const preprocessFrame = (video: HTMLVideoElement, targetCanvas: HTMLCanvasElement) => {
    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;

    // We'll crop to the central 60% area where plates are likely to appear
    const cropW = Math.floor(vw * 0.6);
    const cropH = Math.floor(vh * 0.25); // plates are wide and short
    const sx = Math.floor((vw - cropW) / 2);
    const sy = Math.floor((vh - cropH) / 2 + cropH * 0.4); // bias lower half

    // Size the canvas to a reasonable OCR-friendly resolution
    const outW = 1280;
    const outH = Math.floor((cropH / cropW) * outW);
    targetCanvas.width = outW;
    targetCanvas.height = outH;

    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return '';
    // draw cropped frame scaled to output size
    ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, outW, outH);

    // simple grayscale + adaptive-ish threshold
    const img = ctx.getImageData(0, 0, outW, outH);
    const data = img.data;
    // compute average luminance
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      sum += l;
    }
    const avg = sum / (outW * outH);
    const thresh = Math.max(100, Math.min(160, avg));

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      const v = l > thresh ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = v;
    }
    ctx.putImageData(img, 0, 0);
    return targetCanvas.toDataURL('image/png');
  };

  const takeSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setLoading(true);
    setError(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Preprocess and get data URL
      const dataUrl = preprocessFrame(video, canvas);

      // Use a Tesseract worker (runs off main thread) for better responsiveness
      const mod: any = await import('tesseract.js');
      // prefer the exported createWorker function (named export or default.createWorker)
      const createWorkerFn = mod.createWorker ?? mod.default?.createWorker;
      if (typeof createWorkerFn !== 'function') {
        throw new Error('Tesseract createWorker not available');
      }

      const worker = createWorkerFn({ logger: () => {} });
      try {
        if (worker.load) await worker.load();
        if (worker.loadLanguage) await worker.loadLanguage('eng');
        if (worker.initialize) await worker.initialize('eng');
        // whitelist typical plate chars (letters, digits and dash)
        if (worker.setParameters) await worker.setParameters({ tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-' });

        const res = await worker.recognize(dataUrl);
        const text = res?.data?.text ?? '';
        await (worker.terminate ? worker.terminate() : Promise.resolve());

        // plate extraction heuristics (below)
        const extractPlate = (raw: string) => {
          if (!raw) return undefined;
          const s = raw.toUpperCase().replace(/[|I\s:]/g, '');

          // India-like pattern: AA00AA0000 or variants
          const indiaPattern = /([A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4})/g;
          const matchIndia = s.match(indiaPattern);
          if (matchIndia && matchIndia.length) return matchIndia[0];

          // Generic: longest alphanumeric token length >=4
          const tokens = s.match(/[A-Z0-9\-]{4,}/g);
          if (tokens && tokens.length) {
            tokens.sort((a, b) => b.length - a.length);
            return tokens[0];
          }

          return undefined;
        };

  const plate = extractPlate(text);
  onResult?.({ raw: text, plate });
  return;
      } catch (workerErr) {
        // attempt to terminate worker if possible
        try { if (worker && worker.terminate) await worker.terminate(); } catch (_) {}
        throw workerErr;
      }

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
        <div className="flex flex-col md:flex-row gap-4 relative">
          <div className="flex-1 relative">
            <video ref={videoRef} className="w-full rounded bg-black" playsInline />
            {/* removed overlay guide per UX request */}
          </div>
          <div className="w-48 flex-shrink-0">
            <canvas ref={canvasRef} className="w-full rounded border bg-white" />
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
