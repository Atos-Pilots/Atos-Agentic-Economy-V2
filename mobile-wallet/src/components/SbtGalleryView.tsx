import { useEffect, useState } from 'react';
import { WalletCards, LockKeyhole, ShieldCheck, Trash2, Trash, Leaf, Sparkles, ChevronDown, ChevronUp, Layers, Check } from 'lucide-react';
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
    const [fidelityNft, setFidelityNft] = useState<any>(null);
    const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);

    const fetchFidelityNft = () => {
        fetch('/v1/wallet/fidelity-nft')
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setFidelityNft(data.nft);
                }
            })
            .catch(() => {});
    };

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
        
        fetchFidelityNft();
    }, []);

    useEffect(() => {
        // SSE Listener
        const evtSource = new EventSource('/v1/telemetry/stream');
        const handleEvent = (data: any) => {
            if (data.type === 'purchase.completed') {
                setReceipts(prev => {
                    if (prev.find(r => r.intent_id === data.payload?.intent_id)) return prev;
                    const payload = { 
                        ...data.payload, 
                        currency: data.payload.currency === 'EUR' && data.payload.rail?.includes('Agentic') ? 'EURC' : data.payload.currency 
                    };
                    const next = [{ ...payload, issuedAt: new Date().toISOString() }, ...prev];
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                    return next;
                });
                
                // Reactive update of the green loyalty NFT
                fetchFidelityNft();
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

    const toggleDrawer = (id: string) => {
        setOpenDrawerId(prev => prev === id ? null : id);
    };

    // SVG graphics depending on green tier
    const renderGreenGraphic = (tier: string) => {
        if (tier === 'Gold Forest') {
            return (
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ filter: 'drop-shadow(0 0 10px #f59e0b)' }}>
                    {/* Gold forest of three trees */}
                    <path d="M22 45 V32 M22 36 L17 31 M22 33 L27 28" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="22" cy="22" r="6" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="1.5" />
                    
                    <path d="M42 45 V32 M42 36 L37 31 M42 33 L47 28" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="42" cy="22" r="6" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="1.5" />

                    <path d="M32 48 V26 M32 32 L25 25 M32 29 L39 22" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="32" cy="16" r="8" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1.5" />
                    
                    <circle cx="32" cy="8" r="2" fill="#fbbf24" />
                    <circle cx="16" cy="18" r="1.5" fill="#fbbf24" />
                    <circle cx="48" cy="18" r="1.5" fill="#fbbf24" />
                </svg>
            );
        } else if (tier === 'Sapling') {
            return (
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ filter: 'drop-shadow(0 0 8px #10b981)' }}>
                    {/* Medium growing tree */}
                    <path d="M32 48 V28 M32 36 L24 28 M32 32 L40 25" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="32" cy="18" r="8" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1.5" />
                    <circle cx="24" cy="28" r="5" fill="rgba(5, 150, 105, 0.2)" stroke="#059669" strokeWidth="1.5" />
                    <circle cx="40" cy="25" r="5" fill="rgba(5, 150, 105, 0.2)" stroke="#059669" strokeWidth="1.5" />
                    
                    <circle cx="32" cy="10" r="2" fill="#34d399" />
                    <circle cx="18" cy="24" r="1.5" fill="#34d399" />
                    <circle cx="46" cy="21" r="1.5" fill="#34d399" />
                </svg>
            );
        } else {
            // Seedling
            return (
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ filter: 'drop-shadow(0 0 6px #34d399)' }}>
                    {/* Tiny green seedling sprouting */}
                    <path d="M32 48 C32 36 26 30 20 28 C26 28 32 34 32 48 Z" fill="#10b981" />
                    <path d="M32 48 C32 33 38 27 44 25 C38 25 32 31 32 48 Z" fill="#34d399" />
                    <path d="M32 50 V44" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="20" cy="24" r="1.5" fill="#6ee7b7" />
                    <circle cx="44" cy="21" r="1.5" fill="#6ee7b7" />
                </svg>
            );
        }
    };

    return (
        <div className="animate-enter" style={{ color: 'var(--text-main)' }}>
            
            {/* Inject CSS Holographic and Float keyframes for beautiful premium design */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes holo-shimmer {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes float-slow {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-5px) rotate(0.3deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                .green-holo-card {
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(4, 120, 87, 0.1) 45%, rgba(6, 182, 212, 0.2) 100%);
                    background-size: 200% 200%;
                    animation: holo-shimmer 8s ease infinite, float-slow 5s ease-in-out infinite;
                    border: 1px solid rgba(16, 185, 129, 0.45);
                    box-shadow: 0 8px 30px rgba(16, 185, 129, 0.15), inset 0 0 15px rgba(255,255,255,0.05);
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .green-holo-card:hover {
                    transform: translateY(-6px) scale(1.01);
                    box-shadow: 0 16px 35px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(255,255,255,0.1);
                    border-color: rgba(16, 185, 129, 0.7);
                }
                .receipt-sbt-card {
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .receipt-sbt-card:hover {
                    transform: translateY(-4px);
                }
                .brand-badge-cb {
                    background: rgba(16, 185, 129, 0.12);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    color: #10b981;
                }
                .brand-badge-visa {
                    background: rgba(59, 130, 246, 0.12);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    color: #3b82f6;
                }
                .tech-drawer-line {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                    padding: 4px 0;
                    gap: 12px;
                }
                .tech-drawer-line:last-child {
                    border-bottom: none;
                }
            `}} />

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h1 style={{ color: 'var(--text-main)', margin: 0 }}>{t.sbt.title}</h1>
                {receipts.length > 0 && (
                    confirmDeleteAll ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                {lang === 'fr' ? 'Confirmer ?' : 'Confirm?'}
                            </span>
                            <button
                                onClick={deleteAll}
                                style={{
                                    background: '#EF4444', color: 'white', border: 'none',
                                    borderRadius: '6px', padding: '4px 10px', fontSize: '11px',
                                    fontWeight: 700, cursor: 'pointer'
                                }}
                            >
                                {lang === 'fr' ? 'Oui, tout supprimer' : 'Yes, delete all'}
                            </button>
                            <button
                                onClick={() => setConfirmDeleteAll(false)}
                                style={{
                                    background: 'var(--bg-panel)', color: 'var(--text-dim)',
                                    border: '1px solid var(--border-light)', borderRadius: '6px',
                                    padding: '4px 10px', fontSize: '11px', cursor: 'pointer'
                                }}
                            >
                                {lang === 'fr' ? 'Annuler' : 'Cancel'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmDeleteAll(true)}
                            style={{
                                background: 'rgba(239, 68, 68, 0.06)', color: '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px',
                                padding: '4px 10px', fontSize: '11px', fontWeight: 600,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                        >
                            <Trash size={12} />
                            {lang === 'fr' ? 'Tout supprimer' : 'Clear all'}
                        </button>
                    )
                )}
            </div>

            {/* Dynamic Eco-Loyalty SBT/NFT Card */}
            {fidelityNft && (
                <div className="green-holo-card" data-didactic-key="green_nft" style={{
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '20px',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <Leaf size={14} color="#10b981" />
                                <span style={{ fontSize: '10px', fontWeight: 800, color: '#10b981', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    Atos Sovereign Eco-Loyalty
                                </span>
                            </div>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'white' }}>
                                Atos Green Impact NFT
                            </h2>
                            <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.3' }}>
                                {lang === 'fr' 
                                    ? 'NFT Dynamique récompensant la compensation carbone des checkouts souverains.'
                                    : 'Dynamic NFT rewarding carbon offsetting during sovereign green checkouts.'}
                            </p>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', padding: '6px' }}>
                            {renderGreenGraphic(fidelityNft.tier)}
                        </div>
                    </div>

                    <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '10px', padding: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                                {lang === 'fr' ? 'Niveau Actuel :' : 'Current Tier:'}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Sparkles size={12} />
                                {fidelityNft.title}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                                {lang === 'fr' ? 'Compensation Carbone :' : 'Carbon Offsets:'}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>
                                {fidelityNft.greenCheckoutsCount} {lang === 'fr' ? 'Trajet(s) Validé(s)' : 'Trip(s) Compensated'}
                            </span>
                        </div>

                        {/* Progress bar towards next tier */}
                        <div style={{ marginTop: '8px' }}>
                            <div style={{ height: '5px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ 
                                    height: '100%', 
                                    width: `${Math.min((fidelityNft.greenCheckoutsCount / 3) * 100, 100)}%`, 
                                    background: 'linear-gradient(90deg, #10b981, #06b6d4)', 
                                    borderRadius: '3px',
                                    transition: 'width 0.5s ease-out'
                                }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                                <span>🌱 Seedling</span>
                                <span>🌳 Sapling (2)</span>
                                <span>✨ Gold Forest (3+)</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                        <span>SBT: atos_green_impact_sbt_001</span>
                        <span>Owner: {fidelityNft.owner.slice(0, 18)}…</span>
                    </div>
                </div>
            )}

            {receipts.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px', marginTop: '16px' }}>
                    <WalletCards size={32} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
                    <p style={{ color: 'var(--text-dim)' }}>{t.sbt.emptyState}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                    {receipts.map((r, i) => {
                        const brand = r.selected_brand || 'CB';
                        const isCB = brand === 'CB';
                        const isGreenMerchant = r.retailer_id === 'FastFerry E-Commerce' || r.rail?.includes('FastFerry') || r.issuer === 'FastFerry E-Commerce';
                        const isExpanded = openDrawerId === r.intent_id;

                        // Holographic glow parameters based on card brand selection
                        const cardBorder = isCB 
                            ? '1px solid rgba(16, 185, 129, 0.35)' 
                            : '1px solid rgba(59, 130, 246, 0.35)';
                        const cardShadow = isCB 
                            ? '0 4px 20px rgba(16, 185, 129, 0.08)' 
                            : '0 4px 20px rgba(59, 130, 246, 0.08)';
                        const brandColor = isCB ? '#10b981' : '#3b82f6';
                        
                        return (
                            <div 
                                key={r.intent_id || i} 
                                className="glass-panel animate-enter receipt-sbt-card" 
                                data-didactic-key="sbt_receipt"
                                style={{
                                    border: cardBorder,
                                    boxShadow: cardShadow,
                                    background: 'var(--bg-panel-hover)',
                                    position: 'relative',
                                    padding: '16px',
                                    borderRadius: '16px'
                                }}
                            >
                                {/* Holographic brand accent bar */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 24, right: 24, height: '2px',
                                    background: `linear-gradient(90deg, transparent, ${brandColor}, transparent)`
                                }} />

                                {/* Header row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ShieldCheck size={15} color={brandColor} />
                                        <span style={{ fontSize: '9px', fontWeight: 800, color: brandColor, letterSpacing: '0.08em' }}>
                                            {t.sbt.verifiableCredential}
                                        </span>
                                        {isGreenMerchant && (
                                            <span style={{ fontSize: '9px', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '1px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                <Leaf size={8} /> Carbon-Neutral
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {/* Glowing brand selector label */}
                                        <span className={`brand-badge-${brand.toLowerCase()}`} style={{
                                            fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px'
                                        }}>
                                            {brand === 'CB' ? 'CB Local' : 'Visa / MC'}
                                        </span>
                                        <button
                                            onClick={() => deleteReceipt(r.intent_id)}
                                            title={lang === 'fr' ? 'Supprimer ce reçu' : 'Delete this receipt'}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: 'var(--text-dim)', padding: '2px', borderRadius: '4px',
                                                display: 'flex', alignItems: 'center', transition: 'color 0.15s'
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '15px', marginBottom: '4px', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{t.sbt.proofOfPurchase}</span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                        {r.issuer || (lang === 'fr' ? 'Marchand Souverain' : 'Sovereign Retailer')}
                                    </span>
                                </h3>
                                
                                <p style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '14px' }}>
                                    {r.amount ?? '—'} <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>{r.currency || 'EUR'}</span>
                                    {r.rail && (
                                        <span style={{ 
                                            fontSize: '10px', 
                                            color: '#06b6d4', 
                                            marginLeft: '10px', 
                                            background: 'rgba(6, 182, 212, 0.1)', 
                                            padding: '2px 8px', 
                                            borderRadius: '4px',
                                            border: '1px solid rgba(6, 182, 212, 0.2)'
                                        }}>
                                            {r.rail}
                                        </span>
                                    )}
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                    <div style={{ background: 'var(--bg-panel)', borderRadius: '8px', padding: '8px', border: '1px solid var(--border-light)' }}>
                                        <p style={{ margin: 0, fontSize: '9px', color: 'var(--text-dim)' }}>{t.sbt.intentId}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: '9px', color: 'var(--text-main)', wordBreak: 'break-all', fontFamily: 'monospace' }}>{r.intent_id?.slice(0, 16) ?? '—'}</p>
                                    </div>
                                    <div style={{ background: 'var(--bg-panel)', borderRadius: '8px', padding: '8px', border: '1px solid var(--border-light)' }}>
                                        <p style={{ margin: 0, fontSize: '9px', color: 'var(--text-dim)' }}>{t.sbt.issuedAt}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'var(--text-main)' }}>{r.issuedAt ? new Date(r.issuedAt).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US') : '—'}</p>
                                    </div>
                                </div>

                                {/* ZK SBT Reference Hash row */}
                                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '9px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <LockKeyhole size={10} color={brandColor} />
                                        <span>ZK-SBT Reference Hash</span>
                                    </p>
                                    <p style={{ margin: 0, fontSize: '9px', color: brandColor, wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                        {r.vc_hash ? `${r.vc_hash.slice(0, 18)}…` : '—'}
                                    </p>
                                </div>

                                {/* Interactive Expandable Technical Details Drawer Button */}
                                <button 
                                    onClick={() => toggleDrawer(r.intent_id)}
                                    style={{
                                        marginTop: '12px',
                                        width: '100%',
                                        background: 'none',
                                        border: 'none',
                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                        padding: '8px 0 0 0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        color: isExpanded ? 'white' : 'var(--text-dim)',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                                    onMouseLeave={e => { if(!isExpanded) e.currentTarget.style.color = 'var(--text-dim)'; }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Layers size={11} color={brandColor} />
                                        {lang === 'fr' ? 'Détails Techniques Blockchain' : 'Blockchain Technical Details'}
                                    </span>
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>

                                {/* Technical Drawer Content */}
                                {isExpanded && (
                                    <div className="animate-enter" style={{
                                        marginTop: '8px',
                                        background: 'rgba(15, 23, 42, 0.8)',
                                        borderRadius: '8px',
                                        border: `1px solid ${brandColor}40`,
                                        padding: '10px',
                                        fontFamily: 'monospace',
                                        fontSize: '10px',
                                        color: '#34d399',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2px'
                                    }}>
                                        <div className="tech-drawer-line">
                                            <span style={{ color: '#94a3b8' }}>Contract address:</span>
                                            <span>0xAtosReceiptSBT_v2</span>
                                        </div>
                                        <div className="tech-drawer-line">
                                            <span style={{ color: '#94a3b8' }}>Token Standard:</span>
                                            <span>ERC-5114 (Soulbound)</span>
                                        </div>
                                        <div className="tech-drawer-line">
                                            <span style={{ color: '#94a3b8' }}>Token ID:</span>
                                            <span>{r.sbt_token_id || 'sbt_unknown'}</span>
                                        </div>
                                        <div className="tech-drawer-line">
                                            <span style={{ color: '#94a3b8' }}>IPFS Storage:</span>
                                            <span style={{ color: '#38bdf8' }}>{r.sbt_uri || 'ipfs://empty'}</span>
                                        </div>
                                        <div className="tech-drawer-line">
                                            <span style={{ color: '#94a3b8' }}>Holder DID:</span>
                                            <span>did:key:user_wallet</span>
                                        </div>
                                        <div className="tech-drawer-line">
                                            <span style={{ color: '#94a3b8' }}>Issuer DID:</span>
                                            <span>did:web:atos-pilot-merchant.com</span>
                                        </div>
                                        <div className="tech-drawer-line">
                                            <span style={{ color: '#94a3b8' }}>Gas Paymaster Sponsor:</span>
                                            <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                <Check size={8} /> Sponsorisé (Smart Account)
                                            </span>
                                        </div>
                                        <div className="tech-drawer-line" style={{ display: 'block', marginTop: '6px', paddingTop: '4px', borderTop: '1px solid rgba(52, 211, 153, 0.2)' }}>
                                            <span style={{ color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Enclave Ed25519 Signature:</span>
                                            <span style={{ wordBreak: 'break-all', color: '#10b981', fontSize: '9px' }}>
                                                0x{r.intent_id.replace(/-/g, '')}8f2c3b8e7da4c68b92ef…
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
