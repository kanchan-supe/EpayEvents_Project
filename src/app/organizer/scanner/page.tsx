'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  QrCode, CheckCircle2, XCircle, Camera, ArrowLeft, 
  RefreshCw, Volume2, VolumeX, ShieldCheck, AlertTriangle, 
  Users, Check, Upload, Sparkles, Smartphone, Eye, History, Filter, Calendar
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { Html5Qrcode } from 'html5-qrcode';

interface ScanRecord {
  id: string;
  code: string;
  attendeeName?: string;
  ticketTier?: string;
  eventTitle?: string;
  status: 'approved' | 'duplicate' | 'cancelled' | 'invalid';
  message: string;
  time: string;
}

// Synthesize pleasant gate entry sounds without external audio files
function playBeep(type: 'success' | 'duplicate' | 'error') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'success') {
      // Pleasant double high chime (880Hz -> 1320Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.15);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.frequency.setValueAtTime(1320, ctx.currentTime);
        gain2.gain.setValueAtTime(0.25, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.25);
      }, 100);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(100);
      }
    } else {
      // Low dual buzzer (220Hz -> 180Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  } catch (err) {
    // Audio context may be restricted by autoplay policy until user interacts
  }
}

export default function QRScannerPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();

  const [ticketInput, setTicketInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isQrInView, setIsQrInView] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Verification result banner state
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'already_checked_in' | 'cancelled' | 'error';
    message: string;
    attendeeName?: string;
    ticketType?: string;
    eventTitle?: string;
    orderId?: string;
    time?: string;
  } | null>(null);

  // Session gate statistics
  const [gateStats, setGateStats] = useState({
    totalScanned: 0,
    approved: 0,
    duplicates: 0,
    rejected: 0,
  });

  // Recent scans feed
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);

  // Selected event filter state
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [eventsList, setEventsList] = useState<Array<{ id: string; title: string; slug: string; date?: string }>>([]);

  // Fetch organizer events for gate filtering
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/events');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setEventsList(json.data.map((e: any) => ({
            id: e.id,
            title: e.title,
            slug: e.slug,
            date: e.date || e.startDate,
          })));
        }
      } catch (err) {
        console.warn('Failed to load events for scanner:', err);
      }
    }
    loadEvents();
  }, []);

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/organizer/scanner');
    }
  }, [authLoading, user, router]);

  // Execute verification against /api/checkin
  const processTicketVerification = useCallback(async (codeToVerify: string) => {
    const raw = codeToVerify.trim();
    if (!raw || isVerifying) return;

    setIsVerifying(true);

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: raw, targetEventId: selectedEventId !== 'all' ? selectedEventId : undefined }),
      });
      const data = await res.json();

      const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      if (data.status === 'valid_and_checked_in') {
        if (soundEnabled) playBeep('success');
        setScanResult({
          status: 'success',
          message: data.message || 'VALID SMART TICKET - GATE ENTRY APPROVED',
          attendeeName: data.attendeeName,
          ticketType: data.ticketTierName,
          eventTitle: data.eventTitle,
          orderId: data.ticketCode || data.orderId,
          time: currentTime,
        });

        setGateStats(prev => ({ ...prev, totalScanned: prev.totalScanned + 1, approved: prev.approved + 1 }));
        setRecentScans(prev => [
          {
            id: `scan-${Date.now()}`,
            code: data.ticketCode || raw.slice(0, 20),
            attendeeName: data.attendeeName,
            ticketTier: data.ticketTierName,
            eventTitle: data.eventTitle,
            status: 'approved',
            message: 'Entry Approved',
            time: currentTime,
          },
          ...prev.slice(0, 9),
        ]);
      } else if (data.status === 'already_checked_in') {
        if (soundEnabled) playBeep('duplicate');
        setScanResult({
          status: 'already_checked_in',
          message: data.message || 'DUPLICATE ENTRY DETECTED! Pass was already scanned.',
          attendeeName: data.attendeeName,
          ticketType: data.ticketTierName,
          eventTitle: data.eventTitle,
          orderId: data.ticketCode || data.orderId,
          time: data.checkedInAt || currentTime,
        });

        setGateStats(prev => ({ ...prev, totalScanned: prev.totalScanned + 1, duplicates: prev.duplicates + 1 }));
        setRecentScans(prev => [
          {
            id: `scan-${Date.now()}`,
            code: data.ticketCode || raw.slice(0, 20),
            attendeeName: data.attendeeName,
            ticketTier: data.ticketTierName,
            eventTitle: data.eventTitle,
            status: 'duplicate',
            message: `Duplicate: already scanned at ${data.checkedInAt || 'Gate'}`,
            time: currentTime,
          },
          ...prev.slice(0, 9),
        ]);
      } else if (data.status === 'wrong_event') {
        if (soundEnabled) playBeep('error');
        setScanResult({
          status: 'error',
          message: data.message || 'WRONG EVENT PASS! Ticket is for another event.',
          attendeeName: data.attendeeName,
          ticketType: data.ticketTierName,
          eventTitle: data.eventTitle,
          orderId: data.ticketCode,
          time: currentTime,
        });

        setGateStats(prev => ({ ...prev, totalScanned: prev.totalScanned + 1, rejected: prev.rejected + 1 }));
        setRecentScans(prev => [
          {
            id: `scan-${Date.now()}`,
            code: data.ticketCode || raw.slice(0, 20),
            attendeeName: data.attendeeName,
            ticketTier: data.ticketTierName,
            eventTitle: data.eventTitle,
            status: 'invalid',
            message: `Wrong Event Pass: ${data.eventTitle || 'Different Event'}`,
            time: currentTime,
          },
          ...prev.slice(0, 9),
        ]);
      } else if (data.status === 'cancelled') {
        if (soundEnabled) playBeep('error');
        setScanResult({
          status: 'cancelled',
          message: data.message || 'TICKET CANCELLED - REFUND WAS PROCESSED',
          attendeeName: data.attendeeName,
          ticketType: data.ticketTierName,
          eventTitle: data.eventTitle,
          orderId: data.ticketCode,
          time: currentTime,
        });

        setGateStats(prev => ({ ...prev, totalScanned: prev.totalScanned + 1, rejected: prev.rejected + 1 }));
        setRecentScans(prev => [
          {
            id: `scan-${Date.now()}`,
            code: data.ticketCode || raw.slice(0, 20),
            attendeeName: data.attendeeName,
            ticketTier: data.ticketTierName,
            status: 'cancelled',
            message: 'Cancelled Pass',
            time: currentTime,
          },
          ...prev.slice(0, 9),
        ]);
      } else {
        if (soundEnabled) playBeep('error');
        setScanResult({
          status: 'error',
          message: data.message || 'INVALID OR UNRECOGNIZED PASS',
          orderId: raw.slice(0, 30),
          time: currentTime,
        });

        setGateStats(prev => ({ ...prev, totalScanned: prev.totalScanned + 1, rejected: prev.rejected + 1 }));
        setRecentScans(prev => [
          {
            id: `scan-${Date.now()}`,
            code: raw.slice(0, 25),
            status: 'invalid',
            message: 'Unrecognized Pass',
            time: currentTime,
          },
          ...prev.slice(0, 9),
        ]);
      }
    } catch (err: any) {
      setScanResult({
        status: 'error',
        message: err.message || 'Failed to communicate with check-in verification service.',
      });
    } finally {
      setIsVerifying(false);
      setTicketInput('');
    }
  }, [isVerifying, soundEnabled]);

  // Stop active camera
  const stopCamera = async () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Start webcam / mobile camera directly with native MediaStream + jsQR / BarcodeDetector
  const startCamera = async () => {
    setCameraError(null);
    try {
      await stopCamera();

      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported by this browser environment or connection is not HTTPS/localhost.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      setIsCameraActive(true);

      // Wait a tick for <video> element to mount and bind stream
      await new Promise(r => setTimeout(r, 100));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play().catch(err => console.warn('Video play err:', err));
      }
    } catch (err: any) {
      console.warn('[QRScanner] Camera start error:', err);
      let msg = err.message || 'Camera access denied or unavailable.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please allow camera permissions in your browser address bar.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera found on this device.';
      }
      setCameraError(msg);
      setIsCameraActive(false);
    }
  };

  // Toggle camera direction (front / back)
  const toggleCameraFacing = async () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (isCameraActive) {
      setTimeout(() => startCamera(), 150);
    }
  };

  // High-performance continuous frame barcode detection directly from video stream
  useEffect(() => {
    if (!isCameraActive || typeof window === 'undefined') return;

    let isScanningFrame = false;
    const BarcodeDetectorClass = (window as any).BarcodeDetector;
    const nativeDetector = BarcodeDetectorClass ? new BarcodeDetectorClass({ formats: ['qr_code'] }) : null;

    const scanFrame = async () => {
      const activeVideo = videoRef.current;

      if (!isCameraActive || !activeVideo || activeVideo.readyState < 2 || activeVideo.paused) {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      if (!isScanningFrame && !isVerifying) {
        isScanningFrame = true;
        try {
          let detectedCode: string | null = null;

          // Attempt 1: Native BarcodeDetector (Chrome/Edge Android hardware acceleration)
          if (nativeDetector) {
            try {
              const barcodes = await nativeDetector.detect(activeVideo);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                detectedCode = barcodes[0].rawValue;
              }
            } catch {}
          }

          // Attempt 2: jsQR Software Decoder (Universal fallback for all desktop & mobile browsers)
          if (!detectedCode && activeVideo.videoWidth > 0 && activeVideo.videoHeight > 0) {
            if (!canvasRef.current) {
              canvasRef.current = document.createElement('canvas');
            }
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              // Optimized processing resolution (640px max) for ultra-fast frame rates
              const maxDim = 640;
              let w = activeVideo.videoWidth;
              let h = activeVideo.videoHeight;
              if (w > maxDim || h > maxDim) {
                const ratio = Math.min(maxDim / w, maxDim / h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);
              }
              canvas.width = w;
              canvas.height = h;
              ctx.drawImage(activeVideo, 0, 0, w, h);
              const imageData = ctx.getImageData(0, 0, w, h);
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'attemptBoth',
              });
              if (code && code.data) {
                detectedCode = code.data;
              }
            }
          }

          if (detectedCode) {
            await processTicketVerification(detectedCode);
            // Brief cooldown to avoid firing duplicate alerts on the same pass
            await new Promise(r => setTimeout(r, 2000));
          }
        } catch {
          // Frame read error, continue scanning
        } finally {
          isScanningFrame = false;
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isCameraActive, isVerifying, processTicketVerification]);

  // Handle uploaded QR image / screenshot / PDF document with multi-pass scanning
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let decodedResult: string | null = null;
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

      if (isPdf) {
        // PDF Processing: render first page to canvas and decode with jsQR
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
          
          if (!pdfjs.GlobalWorkerOptions.workerSrc) {
            pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
          }

          const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
          const pdfDoc = await loadingTask.promise;
          const page = await pdfDoc.getPage(1);

          // Render at 2x scale for crisp QR resolution
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          if (ctx) {
            const renderContext = {
              canvasContext: ctx,
              viewport: viewport,
            };
            await page.render(renderContext).promise;

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const res = jsQR(imgData.data, imgData.width, imgData.height, {
              inversionAttempts: 'attemptBoth',
            });
            if (res?.data) {
              decodedResult = res.data;
            }
          }
        } catch (pdfErr) {
          console.warn('PDF extraction failed:', pdfErr);
        }
      } else {
        // Method 1: Html5Qrcode.scanFile (for PNG, JPG, WEBP)
        try {
          const fileScanner = new Html5Qrcode('file-qr-temp-reader');
          decodedResult = await fileScanner.scanFile(file, true);
          fileScanner.clear();
        } catch (scanErr) {
          console.warn('Html5Qrcode scanFile pass:', scanErr);
        }

        // Method 2: Multi-pass Canvas jsQR (handles original size, downscaled sizes, and center-crop)
        if (!decodedResult) {
          decodedResult = await new Promise<string | null>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const img = new Image();
              img.onload = () => {
                // Try different resolutions/scalings for robust QR discovery
                const scales = [1.0, 800 / Math.max(img.width, img.height), 400 / Math.max(img.width, img.height)];
                
                for (const scale of scales) {
                  const targetW = Math.max(100, Math.round(img.width * Math.min(1.0, scale)));
                  const targetH = Math.max(100, Math.round(img.height * Math.min(1.0, scale)));
                  
                  const canvas = document.createElement('canvas');
                  canvas.width = targetW;
                  canvas.height = targetH;
                  const ctx = canvas.getContext('2d', { willReadFrequently: true });
                  if (!ctx) continue;

                  ctx.drawImage(img, 0, 0, targetW, targetH);
                  const imgData = ctx.getImageData(0, 0, targetW, targetH);
                  
                  const res = jsQR(imgData.data, imgData.width, imgData.height, {
                    inversionAttempts: 'attemptBoth',
                  });

                  if (res?.data) {
                    return resolve(res.data);
                  }
                }

                // Also try center 70% crop (often attendees screenshot the entire ticket dialog or page)
                try {
                  const cropW = Math.round(img.width * 0.7);
                  const cropH = Math.round(img.height * 0.7);
                  const startX = Math.round((img.width - cropW) / 2);
                  const startY = Math.round((img.height - cropH) / 2);
                  const canvas = document.createElement('canvas');
                  canvas.width = cropW;
                  canvas.height = cropH;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(img, startX, startY, cropW, cropH, 0, 0, cropW, cropH);
                    const imgData = ctx.getImageData(0, 0, cropW, cropH);
                    const res = jsQR(imgData.data, imgData.width, imgData.height, {
                      inversionAttempts: 'attemptBoth',
                    });
                    if (res?.data) return resolve(res.data);
                  }
                } catch {}

                resolve(null);
              };
              img.onerror = () => resolve(null);
              img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
          });
        }
      }

      if (decodedResult) {
        await processTicketVerification(decodedResult);
      } else {
        alert('Could not decode QR code from this file. Please ensure the document or image contains a clear QR code, or enter the ticket code manually in the box below.');
      }
    } catch (err: any) {
      console.warn('Upload error:', err);
      alert(`Could not parse QR from uploaded file: ${err.message || 'Unrecognized format'}`);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processTicketVerification(ticketInput);
  };

  const handlePresetClick = (preset: string) => {
    setTicketInput(preset);
    processTicketVerification(preset);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
      <Navbar />

      {/* Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 py-4">
        <div className="container mx-auto px-4 md:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/organizer/dashboard" 
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Return to Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-black flex items-center gap-2">
                <QrCode className="h-5 w-5 text-emerald-400" /> Gate Entry Check-in Scanner
              </h1>
              <p className="text-xs text-slate-400">Live ticket verification & duplicate-entry prevention</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                soundEnabled 
                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title={soundEnabled ? 'Mute Audio Chimes' : 'Enable Audio Chimes'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Chime Active' : 'Muted'}</span>
            </button>

            <div className="text-xs text-emerald-400 font-bold bg-emerald-950 border border-emerald-800/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Scanner Ready</span>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 py-4 flex-1 max-w-6xl space-y-3">
        {/* Top Control Bar: Event Filter & Gate Stats combined in one single row */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
          {/* Event Filter */}
          <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Filter className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                Gate Event Target
              </span>
              <div className="relative mt-0.5">
                <select
                  id="event-filter"
                  value={selectedEventId}
                  onChange={e => setSelectedEventId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 hover:border-emerald-500 text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition cursor-pointer appearance-none pr-7"
                >
                  <option value="all">🌐 All My Published Events (Auto-Detect)</option>
                  {eventsList.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      🎯 {ev.title} {ev.date ? `(${ev.date})` : ''}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Mini Gate Stats */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-center min-w-[64px]">
              <span className="text-[9px] font-bold uppercase text-slate-400 block">Total</span>
              <span className="text-sm font-black text-white">{gateStats.totalScanned}</span>
            </div>
            <div className="bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl text-center min-w-[64px]">
              <span className="text-[9px] font-bold uppercase text-emerald-400 block">Passed</span>
              <span className="text-sm font-black text-emerald-400">{gateStats.approved}</span>
            </div>
            <div className="bg-amber-950/60 border border-amber-800/60 px-3 py-1.5 rounded-xl text-center min-w-[64px]">
              <span className="text-[9px] font-bold uppercase text-amber-400 block">Duplicate</span>
              <span className="text-sm font-black text-amber-400">{gateStats.duplicates}</span>
            </div>
            <div className="bg-red-950/60 border border-red-800/60 px-3 py-1.5 rounded-xl text-center min-w-[64px]">
              <span className="text-[9px] font-bold uppercase text-red-400 block">Rejected</span>
              <span className="text-sm font-black text-red-400">{gateStats.rejected}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Split Cockpit Layout: Left = Camera + Manual Input | Right = Live Scan Result + Audit Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          
          {/* Left Column (5 cols): Camera Viewport & Fast Scanner Input */}
          <div className="lg:col-span-5 space-y-3">
            {/* Camera Viewport */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3 relative overflow-hidden shadow-xl">
              {/* Hidden off-screen element for Html5Qrcode scanFile processing */}
              <div id="file-qr-temp-reader" style={{ position: 'absolute', width: 250, height: 250, top: -9999, left: -9999, opacity: 0, pointerEvents: 'none' }} />

              <div className="relative mx-auto w-full aspect-square max-w-[280px] bg-slate-950 rounded-xl overflow-hidden border border-slate-700 flex flex-col items-center justify-center">
                {/* Live Camera Video Feed */}
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                />

                {/* Laser Targeting HUD overlay when camera is active */}
                {isCameraActive && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <div className="relative w-48 h-48 border-2 border-emerald-500/80 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      {/* Corner targeting brackets */}
                      <span className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-emerald-400 rounded-tl" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-emerald-400 rounded-tr" />
                      <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-emerald-400 rounded-bl" />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-emerald-400 rounded-br" />
                      
                      {/* Animated laser line */}
                      <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-pulse" style={{ top: '48%' }} />
                    </div>
                    <span className="mt-2 text-[10px] font-bold text-emerald-400 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                      Align QR inside frame
                    </span>
                  </div>
                )}

                {/* Inactive State Display */}
                {!isCameraActive && (
                  <div className="p-4 text-center space-y-2">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                      <Camera className="h-6 w-6" />
                    </div>
                    <p className="text-xs text-slate-300 font-bold">Webcam / Mobile Camera</p>
                    <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">Click below to activate live auto-focus scanner</p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 transition shadow inline-flex items-center gap-1.5"
                    >
                      <Camera className="h-3.5 w-3.5" /> Start Camera
                    </button>
                  </div>
                )}
              </div>

              {cameraError && (
                <p className="text-[11px] text-amber-400 mt-2 font-semibold text-center">{cameraError}</p>
              )}

              {/* Camera Controls & File Upload in one compact bar */}
              <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
                {isCameraActive ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] py-1 px-2.5 border border-slate-700"
                    >
                      Stop
                    </button>
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] py-1 px-2.5 border border-slate-700 inline-flex items-center gap-1"
                    >
                      <Smartphone className="h-3 w-3" /> Flip ({cameraFacing})
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-emerald-400" /> Point camera at pass QR
                  </span>
                )}

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,application/pdf,.pdf"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                    title="Upload QR Image (PNG, JPG) or PDF ticket"
                  >
                    <Upload className="h-3 w-3" /> Upload QR / PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Manual Code / USB Scanner Box */}
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-emerald-400" /> Manual / USB Scanner Code
                </span>
                <span className="text-[10px] text-slate-400">Press Enter</span>
              </div>

              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={ticketInput}
                  onChange={e => setTicketInput(e.target.value)}
                  placeholder="Ticket code (e.g. EPAY-ORD-849204-TKT-1)..."
                  className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition shadow disabled:opacity-50 inline-flex items-center gap-1 shrink-0"
                >
                  {isVerifying ? (
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Verify</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Test Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] pt-1">
                <span className="text-slate-400 font-semibold">Test:</span>
                <button
                  type="button"
                  onClick={() => handlePresetClick('EPAY-ORD-388115-TKT-1')}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono border border-slate-700"
                >
                  Abhay (Indie Music)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetClick('EPAY-ORD-849201-TKT-1')}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono border border-slate-700"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetClick('REF-849206')}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-red-300 font-mono border border-slate-700"
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Active Scan Result & Recent Scans Stream */}
          <div className="lg:col-span-7 space-y-3">
            
            {/* Live Scan Result Card */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Live Verification Screen
              </span>

              {scanResult ? (
                <div className={`p-4 rounded-xl border shadow-lg transition-all animate-in fade-in ${
                  scanResult.status === 'success'
                    ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100'
                    : scanResult.status === 'already_checked_in'
                    ? 'bg-amber-950/90 border-amber-500 text-amber-100'
                    : 'bg-red-950/90 border-red-500 text-red-100'
                }`}>
                  <div className="flex items-start gap-3">
                    {scanResult.status === 'success' && (
                      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                    )}
                    {scanResult.status === 'already_checked_in' && (
                      <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                    )}
                    {(scanResult.status === 'cancelled' || scanResult.status === 'error') && (
                      <div className="p-2 bg-red-500/20 text-red-400 rounded-xl shrink-0">
                        <XCircle className="h-6 w-6" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-black text-sm sm:text-base leading-snug">
                          {scanResult.message}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 font-bold shrink-0">
                          {scanResult.time}
                        </span>
                      </div>

                      {scanResult.attendeeName && (
                        <div className="pt-2 border-t border-white/10 text-xs grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">Attendee</span>
                            <strong className="text-xs text-white truncate block">{scanResult.attendeeName}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">Tier</span>
                            <strong className="text-xs text-white truncate block">{scanResult.ticketType}</strong>
                          </div>
                          {scanResult.eventTitle && (
                            <div className="col-span-2">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Event</span>
                              <span className="text-xs text-emerald-300 font-semibold truncate block">{scanResult.eventTitle}</span>
                            </div>
                          )}
                          {scanResult.orderId && (
                            <div className="col-span-2">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold">Pass Code</span>
                              <code className="text-[10px] font-mono text-cyan-300">{scanResult.orderId}</code>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 space-y-1">
                  <QrCode className="h-8 w-8 mx-auto text-slate-700" />
                  <p className="text-xs font-semibold text-slate-400">Awaiting Pass Scan</p>
                  <p className="text-[11px] text-slate-500">Scan QR via camera or enter ticket code to view real-time clearance.</p>
                </div>
              )}
            </div>

            {/* Recent Gate Scans Feed (Compact Scrollable Window) */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-slate-400" /> Recent Gate Audit Feed
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Last {recentScans.length} scans</span>
              </div>

              {recentScans.length > 0 ? (
                <div className="divide-y divide-slate-800/80 max-h-[190px] overflow-y-auto pr-1">
                  {recentScans.map(scan => (
                    <div key={scan.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                          scan.status === 'approved' 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                            : scan.status === 'duplicate'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          {scan.status}
                        </span>
                        <div className="min-w-0 truncate">
                          <span className="font-mono font-bold text-slate-300 text-[11px]">{scan.code}</span>
                          {scan.attendeeName && <span className="text-slate-400 ml-1.5 text-[11px]">({scan.attendeeName})</span>}
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-500 font-mono shrink-0">{scan.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 text-center py-4">No passes scanned in this session yet.</p>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
