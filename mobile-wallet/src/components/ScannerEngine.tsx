import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Camera, QrCode, AlertCircle, ArrowRight, Loader2, ScanLine } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { translations } from '../translations';

interface ScannerEngineProps {
    onScanSuccess: (sessionData: any) => void;
}

export const ScannerEngine: React.FC<ScannerEngineProps> = ({ onScanSuccess }) => {
    const { lang } = useSettings();
    const t = translations[lang];

    const [mockNonce, setMockNonce] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanAnimationPhase, setScanAnimationPhase] = useState<'IDLE' | 'ANIMATING' | 'SUCCESS'>('IDLE');

    useEffect(() => {
        const updateNonce = () => {
            const current = localStorage.getItem('demo_last_nonce');
            if (current) setMockNonce(current);
        };

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'demo_last_nonce' && e.newValue) {
                setMockNonce(e.newValue);
            }
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('demo_nonce_updated', updateNonce);
        
        updateNonce();
        
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('demo_nonce_updated', updateNonce);
        };
    }, []);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (scanAnimationPhase === 'ANIMATING') {
            timeout = setTimeout(() => {
                setScanAnimationPhase('SUCCESS');
                executeBackendFetch();
            }, 2500); // 2.5s laser animation
        }
        return () => clearTimeout(timeout);
    }, [scanAnimationPhase]);

    const handleSimulateScan = () => {
        if (!mockNonce) {
            setError(t.scanner.errorEmpty);
            return;
        }
        setError(null);
        setIsScanning(true);
        setScanAnimationPhase('ANIMATING');
    };

    const executeBackendFetch = async () => {
        try {
            // Le wallet décode le QR et appelle son propre backend (BFF) pour récupérer les détails de la demande.
            const res = await fetch('/v1/wallet/scan-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nonce: mockNonce })
            });

            const data = await res.json();
            if (data.success && data.session) {
                // Succès : on passe les informations au parent pour afficher l'écran de consentement
                onScanSuccess(data.session);
            } else {
                setError(data.error || t.scanner.errorInvalid);
                setIsScanning(false);
                setScanAnimationPhase('IDLE');
            }
        } catch (e: any) {
            console.error("Fetch error in ScannerEngine:", e);
            setError((t.scanner.errorNetwork || 'Erreur réseau :') + " " + e.message);
            setIsScanning(false);
            setScanAnimationPhase('IDLE');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'var(--text-main)' }}>
            
            <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '12px', background: 'var(--bg-panel-hover)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontWeight: 600, marginBottom: '6px' }}>
                    <Camera size={20} color="#0EA5E9" />
                    {t.scanner.title}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>
                    {t.scanner.subtitle}
                </p>
            </div>

            {scanAnimationPhase !== 'IDLE' ? (
                <div style={{ 
                    flex: 1, 
                    background: '#0F172A', 
                    borderRadius: '16px', 
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '350px',
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
                }}>
                    <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ width: '8px', height: '8px', background: 'red', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>
                        TARGET LOCK
                    </div>

                    <div style={{ 
                        position: 'relative', 
                        padding: '20px', 
                        background: 'white', 
                        borderRadius: '16px',
                        transform: scanAnimationPhase === 'SUCCESS' ? 'scale(1.05)' : 'scale(1)',
                        transition: 'transform 0.4s ease',
                        boxShadow: scanAnimationPhase === 'SUCCESS' ? '0 0 30px rgba(16, 185, 129, 0.6)' : 'none'
                     }}>
                        <QRCodeSVG value={mockNonce} size={160} level="M" />
                        
                        {/* Laser animation overlay */}
                        {scanAnimationPhase === 'ANIMATING' && (
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, height: '4px',
                                background: '#10B981',
                                boxShadow: '0 0 10px #10B981, 0 0 20px #10B981',
                                animation: 'laserScan 1.2s ease-in-out infinite alternate',
                                zIndex: 10
                            }} />
                        )}
                        
                        {/* Scanner corners */}
                        <div style={{ position: 'absolute', top: -5, left: -5, width: 30, height: 30, borderTop: '4px solid #0EA5E9', borderLeft: '4px solid #0EA5E9', borderRadius: '4px 0 0 0' }}></div>
                        <div style={{ position: 'absolute', top: -5, right: -5, width: 30, height: 30, borderTop: '4px solid #0EA5E9', borderRight: '4px solid #0EA5E9', borderRadius: '0 4px 0 0' }}></div>
                        <div style={{ position: 'absolute', bottom: -5, left: -5, width: 30, height: 30, borderBottom: '4px solid #0EA5E9', borderLeft: '4px solid #0EA5E9', borderRadius: '0 0 0 4px' }}></div>
                        <div style={{ position: 'absolute', bottom: -5, right: -5, width: 30, height: 30, borderBottom: '4px solid #0EA5E9', borderRight: '4px solid #0EA5E9', borderRadius: '0 0 4px 0' }}></div>
                    </div>

                    {scanAnimationPhase === 'ANIMATING' && (
                        <div style={{ position: 'absolute', bottom: 30, color: '#10B981', fontSize: '14px', fontWeight: 'bold', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Loader2 size={16} className="animate-spin" />
                            {t.scanner.acquiring}
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input 
                        type="text" 
                        placeholder={t.scanner.placeholder}
                        value={mockNonce}
                        onChange={(e) => setMockNonce(e.target.value)}
                        style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '15px', fontFamily: 'monospace', background: 'var(--bg-panel)', color: 'var(--text-main)' }}
                    />
                    <button 
                        onClick={handleSimulateScan}
                        disabled={isScanning || !mockNonce}
                        style={{ background: '#0EA5E9', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: (isScanning || !mockNonce) ? 'not-allowed' : 'pointer', opacity: (isScanning || !mockNonce) ? 0.7 : 1 }}
                    >
                        <ScanLine size={18} />
                        {t.scanner.btnScan}
                        <ArrowRight size={18} />
                    </button>
                    
                    {error && (
                        <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>{error}</div>
                        </div>
                    )}
                </div>
            )}

            <style>{`
            @keyframes laserScan {
                from { top: 0; }
                to { top: 100%; }
            }
            @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.2); }
                100% { opacity: 1; transform: scale(1); }
            }
            `}</style>
        </div>
    );
};
