import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertCircle, RefreshCw } from 'lucide-react';
import { parseVerificationQR } from '../utils/qr';

export default function Scanner({ onScanSuccess, onClose }) {
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const isMountedRef = useRef(true);

  async function stopCamera() {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    if (isMountedRef.current) {
      setActive(false);
    }
  }

  useEffect(() => {
    isMountedRef.current = true;
    startCamera();

    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, []);

  async function startCamera() {
    setError('');
    setBusy(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('wingroo-qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (decodedText) => {
          try {
            const token = parseVerificationQR(decodedText, window.location.origin);
            await stopCamera();
            if (typeof onScanSuccess === 'function') {
              onScanSuccess(token);
            }
          } catch (qrErr) {
            setError(qrErr.message || 'Scanned QR code is not a valid Wingroo certificate verification token.');
          }
        },
        () => {} // ignore frame errors
      );

      if (isMountedRef.current) {
        setActive(true);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(
          'Unable to access camera. Please allow camera permissions, ensure your webcam is connected, or enter Certificate ID / Token manually.'
        );
      }
    } finally {
      if (isMountedRef.current) {
        setBusy(false);
      }
    }
  }

  return (
    <div className="camera-scanner-card" style={{
      background: '#0f172a',
      borderRadius: '16px',
      padding: '20px',
      color: '#fff',
      margin: '16px 0',
      border: '1px solid rgba(2, 132, 199, 0.4)',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 600, fontSize: '0.95rem' }}>
          <Camera size={18} />
          <span>Scan Certificate QR Code</span>
        </div>
        <button 
          type="button" 
          onClick={() => { stopCamera(); onClose(); }}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
        >
          <X size={18} />
        </button>
      </div>

      <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '12px' }}>
        Point your camera at the QR code printed on the bottom-left corner of the Wingroo internship certificate.
      </p>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      <div 
        id="wingroo-qr-reader" 
        style={{ 
          width: '100%', 
          maxWidth: '360px', 
          margin: '0 auto', 
          borderRadius: '12px', 
          overflow: 'hidden',
          background: '#020617',
          minHeight: active ? '240px' : '60px'
        }} 
      />

      <div style={{ display: 'flex', gap: '10px', marginTop: '14px', justifyContent: 'center' }}>
        {active ? (
          <button 
            type="button" 
            onClick={stopCamera}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            Stop Camera
          </button>
        ) : (
          <button 
            type="button" 
            onClick={startCamera} 
            disabled={busy}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {busy ? <RefreshCw size={14} className="spin-anim" /> : <Camera size={14} />}
            <span>{busy ? 'Starting Camera...' : 'Retry Camera'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
