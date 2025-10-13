import React, { useRef, useEffect, useState } from 'react';

type CameraScannerProps = {
  isOpen: boolean;
  onClose: () => void;
  onResult?: (result: { raw: string; plate?: string }) => void;
};

export const CameraScanner: React.FC<CameraScannerProps> = ({ isOpen, onClose, onResult }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyMessage, setBusyMessage] = useState<string | null>(null);
  const [loadingOCR, setLoadingOCR] = useState(false);

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
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [isOpen]);

  const preprocess = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;

    // crop center horizontally and a small height where plate likely lies
    const cropW = Math.floor(vw * 0.8);
    const cropH = Math.floor(vh * 0.25);
    const sx = Math.floor((vw - cropW) / 2);
    const sy = Math.floor((vh - cropH) / 2 + cropH * 0.4);

    const outW = 1024;
    const outH = Math.max(128, Math.floor((cropH / cropW) * outW));
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, outW, outH);

    // simple grayscale + threshold
    const img = ctx.getImageData(0, 0, outW, outH);
    const data = img.data;
    // compute avg luminance
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    const avg = sum / (outW * outH);
    const thresh = Math.max(100, Math.min(160, avg));
    for (let i = 0; i < data.length; i += 4) {
      const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const v = l > thresh ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = v;
    }
    ctx.putImageData(img, 0, 0);
    return canvas.toDataURL('image/png');
  };

  const extractPlate = (raw: string) => {
    if (!raw) return undefined;
    const s = raw.toUpperCase().replace(/[|I\s:.,]/g, '');
    const indiaPattern = /([A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4})/g;
    const matchIndia = s.match(indiaPattern);
    if (matchIndia && matchIndia.length) return matchIndia[0];
    const tokens = s.match(/[A-Z0-9\-]{4,}/g);
    if (tokens && tokens.length) {
      tokens.sort((a, b) => b.length - a.length);
      return tokens[0];
    }
    return undefined;
  };

  const runOCR = async () => {
    setError(null);
    setBusyMessage('Preparing OCR engine... (first run may download data)');
    setLoadingOCR(true);
    try {
      if (!videoRef.current || !canvasRef.current) {
        setError('Camera not ready');
        return;
      }
      const dataUrl = preprocess(videoRef.current, canvasRef.current);
      if (!dataUrl) {
        setError('Failed to capture image');
        return;
      }

      const mod: any = await import('tesseract.js');
      const createWorker = mod.createWorker ?? mod.default?.createWorker;
      if (typeof createWorker !== 'function') {
        throw new Error('Tesseract.createWorker not available');
      }

      setBusyMessage('Initializing OCR worker...');
      const worker = createWorker({ logger: m => { /* console.debug(m) */ } });
      try {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        await worker.setParameters({ tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-' });
        setBusyMessage('Running OCR...');
        const { data } = await worker.recognize(dataUrl);
        const text = (data?.text || '').trim();
        await worker.terminate();
        setBusyMessage(null);
        const plate = extractPlate(text);
        onResult?.({ raw: text, plate });
      } catch (wErr: any) {
        try { if (worker.terminate) await worker.terminate(); } catch (_) {}
        const msg = wErr?.message || String(wErr);
        setError('OCR worker error: ' + msg);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoadingOCR(false);
      setBusyMessage(null);
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
            <canvas ref={canvasRef} className="w-full rounded border bg-white" />
            <div className="mt-2 space-y-2">
              <button onClick={runOCR} disabled={loadingOCR} className="w-full bg-green-500 text-white px-3 py-2 rounded">
                {loadingOCR ? (busyMessage ?? 'Scanning...') : 'Capture & Scan'}
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

export default CameraScanner;
