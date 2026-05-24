import { useEffect, useState } from 'react';
import { WalletCards, LockKeyhole, ShieldCheck, Trash2, Trash } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { translations } from '../translations';

const STORAGE_KEY = 'sbt_receipts';

const loadStored = (): any[] => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
};

export const SbtGalleryView = () => {
    const { lang } = useSettings();
    const t = translations[lang];

    const [receipts, setReceipts] = useState<any[]>(loadStored);
    const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

    // Fetch any receipts the backend has in memory (e.g. from this session before page load)
    useEffect(() => {
        fetch('/v1/wallet/receipts')
            .then(r => r.json())
            .then(data => {
                if (data.success && data.receipts?.length > 0) {
                    setReceipts(prev => {
                        const existingIds = new Set(prev.map((r: any) => r.intent_id));
                        const newOnes = data.receipts.filter((r: any) => !existingIds.has(r.intent_id));
                        if (newOnes.length === 0) return prev;
                        const merged = [...newOnes, ...prev];
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
                        return merged;
                    });
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        // SSE Listener
        const evtSource = new EventSource('/v1/telemetry/stream');
        const handleEvent = (data: any) => {
            if (data.type === 'purchase.completed') {
                setReceipts(prev => {
                    if (prev.find(r => r.intent_id === data.payload?.intent_id)) return prev;
                    const payload = { ...data.payload, currency: data.payload.currency === 'EUR' && data.payload.rail?.includes('Agentic') ? 'EURC' : data.payload.currency };
                    const next = [{ ...payload, issuedAt: new Date().toISOString() }, ...prev];
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                    return next;
                });
            }
        };

        evtSource.onmessage = (event) => {
            try { handleEvent(JSON.parse(event.data)); } catch(e) {}
        };

        const handleLocalSbt = (e: any) => {
            if (e.detail) {
                handleEvent({ type: 'purchase.completed', payload: e.detail });
            }
        };
        window.addEventListener('demo_sbt_generate', handleLocalSbt);

        return () => {
            evtSource.close();
            window.removeEventListener('demo_sbt_generate', handleLocalSbt);
        };
    }, []);

    const deleteReceipt = (intentId: string) => {
        setReceipts(prev => {
            const next = prev.filter(r => r.intent_id !== intentId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const deleteAll = () => {
        setReceipts([]);
        localStorage.setItem(STORAGE_KEY, '[]');
        setConfirmDeleteAll(false);
    };

    return (
        <div className="animate-enter" style={{ color: 'var(--text-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h1 style={{ color: 'var(--text-main)', margin: 0 }}>{t.sbt.title}</h1>
                {receipts.length > 0 && (
                    confirmDeleteAll ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                                {lang === 'fr' ? 'Confirmer ?' : 'Confirm?'}
                            </span>
                            <button
                                onClick={deleteAll}
                                style={{
                                    background: '#EF4444', color: 'white', border: 'none',
                                    borderRadius: '8px', padding: '6px 12px', fontSize: '12px',
                                    fontWeight: 700, cursor: 'pointer'
                                }}
                            >
                                {lang === 'fr' ? 'Oui, tout supprimer' : 'Yes, delete all'}
                            </button>
                            <button
                                onClick={() => setConfirmDeleteAll(false)}
                                style={{
                                    background: 'var(--bg-panel)', color: 'var(--text-dim)',
                                    border: '1px solid var(--border-light)', borderRadius: '8px',
                                    padding: '6px 12px', fontSize: '12px', cursor: 'pointer'
                                }}
                            >
                                {lang === 'fr' ? 'Annuler' : 'Cancel'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmDeleteAll(true)}
                            style={{
                                background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px',
                                padding: '6px 12px', fontSize: '12px', fontWeight: 600,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            <Trash size={13} />
                            {lang === 'fr' ? 'Tout supprimer' : 'Clear all'}
                        </button>
                    )
                )}
            </div>

            {receipts.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px', marginTop: '16px' }}>
                    <WalletCards size={32} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
                    <p style={{ color: 'var(--text-dim)' }}>{t.sbt.emptyState}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                    {receipts.map((r, i) => (
                        <div key={r.intent_id || i} className="glass-panel animate-enter" style={{
                            borderLeft: '4px solid var(--success-green)',
                            background: 'var(--bg-panel-hover)',
                            position: 'relative'
                        }}>
                            {/* Header row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ShieldCheck size={16} color="var(--success-green)" />
                                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--success-green)', letterSpacing: '0.08em' }}>{t.sbt.verifiableCredential}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>ERC-5114 SBT</span>
                                    <button
                                        onClick={() => deleteReceipt(r.intent_id)}
                                        title={lang === 'fr' ? 'Supprimer ce reçu' : 'Delete this receipt'}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'var(--text-dim)', padding: '2px', borderRadius: '4px',
                                            display: 'flex', alignItems: 'center',
                                            transition: 'color 0.15s'
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '16px', marginBottom: '4px', color: 'var(--text-main)' }}>{t.sbt.proofOfPurchase}</h3>
                            <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
                                {r.amount ?? '—'} <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>{r.currency || 'EUR'}</span>
                                {r.rail && <span style={{ fontSize: '12px', color: 'var(--accent-neon)', marginLeft: '12px', background: 'rgba(112,0,255,0.15)', padding: '2px 8px', borderRadius: '4px' }}>{r.rail}</span>}
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                <div style={{ background: 'var(--bg-panel)', borderRadius: '8px', padding: '10px', border: '1px solid var(--border-light)' }}>
                                    <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-dim)' }}>{t.sbt.intentId}</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '10px', color: 'var(--text-main)', wordBreak: 'break-all', fontFamily: 'monospace' }}>{r.intent_id?.slice(0, 16) ?? '—'}</p>
                                </div>
                                <div style={{ background: 'var(--bg-panel)', borderRadius: '8px', padding: '10px', border: '1px solid var(--border-light)' }}>
                                    <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-dim)' }}>{t.sbt.issuedAt}</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-main)' }}>{r.issuedAt ? new Date(r.issuedAt).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US') : '—'}</p>
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg-panel)', borderRadius: '6px', padding: '10px', border: '1px solid var(--border-light)' }}>
                                <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-dim)', marginBottom: '4px' }}>SBT Reference Hash (Ed25519)</p>
                                <p style={{ margin: 0, fontSize: '10px', color: 'var(--accent-neon)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                    <LockKeyhole size={10} style={{ display: 'inline', marginRight: '6px' }} />
                                    0x{(r.intent_id || 'unknown').replace(/-/g, '').slice(0, 32)}…
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
