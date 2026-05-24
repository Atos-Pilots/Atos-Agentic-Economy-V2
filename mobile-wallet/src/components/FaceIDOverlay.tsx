import React, { useState, useEffect, useRef } from 'react';
import { ScanFace, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface Props {
  onSuccess: (mandateId: string) => void;
  onCancel: () => void;
  mode?: 'GENERATE_MANDATE' | 'PURE_AUTHENTICATION';
}

export const FaceIDOverlay = ({ onSuccess, onCancel, mode = 'GENERATE_MANDATE' }: Props) => {
  const [scanning, setScanning] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Demander l'accès à la caméra pour simuler le scan FaceID
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable for FaceID mock', err);
      }
    };
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSimulateSca = async () => {
    setScanning(true);
    try {
      // Simulate real-time cryptographic binding reading face geometry
      setTimeout(async () => {
        setAuthorized(true);
        setTimeout(async () => {
            if (mode === 'PURE_AUTHENTICATION') {
                onSuccess('auth_success');
                return;
            }

            const res = await fetch('/v1/wallet/mandates/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                subject_ref: 'C_VON_N', 
                scope: 'urn:atos:pilot:all', 
                max_amount: 100, 
                currency: 'EUR',
                authorized_rails: ['SEPA'],
                sca_timestamp: new Date().toISOString()
              })
            });
            const responseData = await res.json();
            
            if (responseData.success && responseData.data?.mandate) {
              onSuccess(responseData.data.mandate.mandate_id);
            } else {
              console.error("Erreur backend:", responseData);
              onCancel();
            }
        }, 1000); // Wait 1s after show Success
      }, 2000); // 2s of "Scanning"
      
    } catch (e) {
      console.error('SCA Simulation Failed', e);
      setScanning(false);
      onCancel();
    }
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.90)', backdropFilter: 'blur(15px)',
      zIndex: 1000, display: 'flex', flexDirection: 'column', 
      justifyContent: 'center', alignItems: 'center', padding: '24px'
    }} className="animate-enter">
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
         <ShieldAlert size={40} color="#0EA5E9" style={{ marginBottom: '16px' }} />
         <h2 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '24px' }}>Autorisation Requise</h2>
         <p style={{ color: '#94A3B8', fontSize: '15px', margin: 0, maxWidth: '280px' }}>
            Vous êtes sur le point de déléguer une capacité de paiement souveraine.
         </p>
      </div>

      <div style={{ position: 'relative', width: '220px', height: '220px', marginBottom: '40px' }}>
          {/* Circular Camera Mask */}
          <div style={{ 
              width: '100%', height: '100%', 
              borderRadius: '50%', overflow: 'hidden', 
              border: `4px solid ${authorized ? '#10B981' : (scanning ? '#0EA5E9' : '#334155')}`,
              boxShadow: authorized ? '0 0 40px rgba(16,185,129,0.4)' : (scanning ? '0 0 40px rgba(14,165,233,0.4)' : 'none'),
              background: '#0F172A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative'
          }}>
              {authorized ? (
                   <CheckCircle2 size={80} color="#10B981" />
              ) : (
                  <>
                      {/* Video Feed */}
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: scanning ? 1 : 0.4, transition: 'opacity 0.3s' }} 
                      />
                      
                      {/* Idle Overlay */}
                      {!scanning && (
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.4)' }}>
                              <ScanFace size={60} color="white" opacity={0.8} />
                          </div>
                      )}

                      {/* Scanning Animation */}
                      {scanning && (
                          <div style={{
                              position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                              background: '#0EA5E9',
                              boxShadow: '0 0 20px #0EA5E9',
                              animation: 'scanFace 1.5s ease-in-out infinite alternate'
                          }} />
                      )}
                  </>
              )}
          </div>
      </div>

      {!authorized && (
        <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button 
                onClick={handleSimulateSca}
                disabled={scanning}
                style={{ 
                    background: scanning ? '#334155' : '#0EA5E9', 
                    color: 'white', border: 'none', padding: '16px', borderRadius: '12px', 
                    fontSize: '16px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                    transition: 'all 0.2s'
                }}
            >
                {scanning ? 'Acquisition biométrique...' : <> <ScanFace size={20} /> Initier Scan FaceID</>}
            </button>
            
            <button 
                onClick={onCancel}
                disabled={scanning}
                style={{ 
                    background: 'transparent', border: 'none', color: '#94A3B8', padding: '12px', 
                    fontSize: '15px', fontWeight: 500, cursor: scanning ? 'not-allowed' : 'pointer'
                }}
            >
                Annuler
            </button>
        </div>
      )}

      <style>{`
        @keyframes scanFace {
            from { top: 0%; }
            to { top: 100%; }
        }
      `}</style>
    </div>
  );
};
