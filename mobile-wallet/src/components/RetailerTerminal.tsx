import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, AlertCircle, ScanLine, CheckCircle2, ShieldCheck, Loader2, CreditCard, Receipt, Building2, Car, ShoppingBag, Film } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { translations } from '../translations';

export const RetailerTerminal = () => {
    const { lang } = useSettings();
    const t = translations[lang];

    const SCENARIOS = {
        'AGE_GATE_PAYMENT': {
            title: t.retailer.scenarios.lottery.title,
            type: t.retailer.scenarios.lottery.type,
            icon: <ScanLine size={24} color="#0EA5E9" />,
            items: [{ name: t.retailer.scenarios.lottery.item, price: 15.50 }],
            attributes: ['age_over_18'],
            scope: "urn:atos:pilot:retail:age_restricted",
            successText: t.retailer.scenarios.lottery.success
        },
        'HOTEL_CHECKIN': {
            title: t.retailer.scenarios.hotel.title,
            type: t.retailer.scenarios.hotel.type,
            icon: <Building2 size={24} color="#0EA5E9" />,
            items: [{ name: t.retailer.scenarios.hotel.item, price: 120.00 }],
            attributes: ['given_name', 'family_name'],
            scope: "urn:atos:pilot:travel:hotel",
            successText: t.retailer.scenarios.hotel.success
        },
        'CAR_RENTAL': {
            title: t.retailer.scenarios.rental.title,
            type: t.retailer.scenarios.rental.type,
            icon: <Car size={24} color="#0EA5E9" />,
            items: [{ name: t.retailer.scenarios.rental.item, price: 300.00 }],
            attributes: ['given_name', 'driving_categories_B'],
            scope: "urn:atos:pilot:mobility:rental",
            successText: t.retailer.scenarios.rental.success
        },
        'RETAIL_PERFUME': {
            title: t.retailer.scenarios.perfume.title,
            type: t.retailer.scenarios.perfume.type,
            icon: <ShoppingBag size={24} color="#0EA5E9" />,
            items: [{ name: t.retailer.scenarios.perfume.item, price: 135.00 }],
            attributes: [],
            scope: "urn:atos:pilot:retail:perfume",
            successText: t.retailer.scenarios.perfume.success,
            isEntryCheck: false
        },
        'CINEMA_ENTRY': {
            title: t.retailer.scenarios.cinema.title,
            type: t.retailer.scenarios.cinema.type,
            icon: <Film size={24} color="#0EA5E9" />,
            items: [],
            attributes: ['status', 'ticket_ref_cinema'],
            scope: "urn:atos:pilot:entertainment:tickets",
            successText: t.retailer.scenarios.cinema.success,
            isEntryCheck: true
        }
    };

    const [status, setStatus] = useState<'IDLE' | 'GENERATING' | 'WAITING_SCAN' | 'VERIFYING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [qrData, setQrData] = useState<any>(null);
    const [executionData, setExecutionData] = useState<any>(null);
    const [useCase, setUseCase] = useState<keyof typeof SCENARIOS>('AGE_GATE_PAYMENT');

    const handleCancel = () => {
        setStatus('IDLE');
        setQrData(null);
        window.dispatchEvent(new CustomEvent('demo_navigate', { detail: { tab: 'identity' } }));
    };

    const generateRequest = async () => {
        setStatus('GENERATING');
        setExecutionData(null);
        const scenario = SCENARIOS[useCase];
        const amount = scenario.items.reduce((acc, item) => acc + item.price, 0);

        try {
            const res = await fetch('/v1/retailer/presentation-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    retailer_id: 'mch_dynamic_demo',
                    use_case: useCase,
                    attributes: scenario.attributes,
                    require_payment: scenario.isEntryCheck ? false : true,
                    amount: amount,
                    currency: 'EUR',
                    scope: scenario.scope
                })
            });
            const data = await res.json();
            if (data.success) {
                setQrData(data);
                setStatus('WAITING_SCAN');
                // Auto-sync for the Wallet demo tab
                localStorage.setItem('demo_last_nonce', data.session.session_nonce);
                window.dispatchEvent(new Event('demo_nonce_updated'));
                window.dispatchEvent(new CustomEvent('demo_navigate', { detail: { tab: 'scanner' } }));
            } else {
                setStatus('ERROR');
            }
        } catch (e) {
            console.error(e);
            setStatus('ERROR');
        }
    };

    // Polling simulation for verification
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'WAITING_SCAN' && qrData) {
            interval = setInterval(async () => {
                try {
                    const scenario = SCENARIOS[useCase];
                    const amount = scenario.items.reduce((acc, item) => acc + item.price, 0);

                    const res = await fetch('/v1/retailer/verify-presentation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            nonce: qrData.session.session_nonce,
                            amount: amount,
                            currency: 'EUR'
                        })
                    });
                    const data = await res.json();
                    
                    if (data.success && data.session.status !== 'PENDING') {
                        if (data.session.status === 'VERIFICATION_PENDING' || data.session.status === 'COMPLETED') {
                            setStatus('VERIFYING');
                            setExecutionData(data);
                            clearInterval(interval);
                            
                            setTimeout(() => {
                                setStatus('SUCCESS');
                            }, 3500);
                        }
                    }
                } catch (e) {
                    // silent polling crash
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [status, qrData]);

    const activeScenario = SCENARIOS[useCase];
    const totalAmount = activeScenario.items.reduce((acc, item) => acc + item.price, 0).toFixed(2);

    return (
        <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto', background: 'var(--bg-dark)', color: 'var(--text-main)', minHeight: '100vh', transition: 'all 0.3s' }}>
            <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '2px solid var(--border-light)', paddingBottom: '16px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', margin: 0 }}>
                        {activeScenario.icon}
                        {activeScenario.title}
                    </h1>
                </div>

                {status === 'IDLE' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s ease' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
                                {t.retailer.modeSelection}
                            </label>
                            <select 
                                value={useCase} 
                                onChange={(e) => {
                                    setUseCase(e.target.value as keyof typeof SCENARIOS);
                                    window.dispatchEvent(new CustomEvent('demo_navigate', { detail: { tab: 'identity' } }));
                                }}
                                style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '15px', background: 'var(--bg-panel)', color: 'var(--text-main)' }}
                            >
                                <option value="AGE_GATE_PAYMENT">{SCENARIOS['AGE_GATE_PAYMENT'].title}</option>
                                <option value="HOTEL_CHECKIN">{SCENARIOS['HOTEL_CHECKIN'].title}</option>
                                <option value="CAR_RENTAL">{SCENARIOS['CAR_RENTAL'].title}</option>
                                <option value="RETAIL_PERFUME">{SCENARIOS['RETAIL_PERFUME'].title}</option>
                                <option value="CINEMA_ENTRY">{SCENARIOS['CINEMA_ENTRY'].title}</option>
                            </select>
                        </div>

                        {!activeScenario.isEntryCheck && (
                            <div style={{ background: 'var(--bg-panel-hover)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px', marginBottom: '8px' }}>
                                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Receipt size={16} /> {t.retailer.cart}
                                </h3>
                                {activeScenario.items.map((it, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: 'var(--text-main)', marginBottom: '8px' }}>
                                        <span>{it.name}</span>
                                        <strong>{it.price.toFixed(2)} €</strong>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', color: 'var(--text-main)', fontWeight: 700, borderTop: '2px dashed var(--border-light)', paddingTop: '8px' }}>
                                    <span>TOTAL</span>
                                    <span>{totalAmount} €</span>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={generateRequest}
                            style={{ background: '#0EA5E9', color: 'white', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)' }}
                        >
                            <QrCode size={22} />
                            {activeScenario.isEntryCheck ? "Générer QR Contrôle d'Accès" : t.retailer.verifyAndPay}
                        </button>
                    </div>
                )}

                {status === 'WAITING_SCAN' && qrData && (
                    <div style={{ textAlign: 'center', padding: '20px 0', animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ background: 'white', border: '4px solid #0EA5E9', borderRadius: '16px', padding: '16px', display: 'inline-block', marginBottom: '24px', boxShadow: '0 8px 30px rgba(14, 165, 233, 0.2)' }}>
                            <QRCodeSVG value={qrData.session.session_nonce} size={180} level="M" />
                        </div>
                        {!activeScenario.isEntryCheck && <h2 style={{ fontSize: '22px', color: 'var(--text-main)', margin: '0 0 8px 0', fontWeight: 800 }}>{t.retailer.toBePaid} {totalAmount} €</h2>}
                        <p style={{ color: 'var(--text-dim)', margin: '0 0 24px 0', fontSize: '15px' }}>
                            {t.retailer.instructionsText}
                        </p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#0EA5E9', fontSize: '15px', fontWeight: 600, background: 'rgba(14, 165, 233, 0.1)', padding: '12px 20px', borderRadius: '24px', width: 'fit-content', margin: '0 auto' }}>
                            <Loader2 size={18} className="animate-spin" />
                            {t.retailer.waitingScan}...
                        </div>

                        {/* Bouton Retour / Annuler */}
                        <div style={{ marginTop: '20px' }}>
                            <button 
                                onClick={handleCancel}
                                style={{ 
                                    background: 'transparent', 
                                    color: '#94A3B8', 
                                    border: '1px solid var(--border-light)', 
                                    padding: '10px 20px', 
                                    borderRadius: '12px', 
                                    fontSize: '14px', 
                                    fontWeight: 600, 
                                    cursor: 'pointer', 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    transition: 'all 0.2s' 
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94A3B8'; e.currentTarget.style.color = '#F1F5F9'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = '#94A3B8'; }}
                            >
                                {t.common.cancel}
                            </button>
                        </div>

                        {/* DEBUG HELPER FOR DEMO */}
                        <div style={{ marginTop: '40px', padding: '15px', background: 'var(--bg-panel-hover)', border: '1px solid var(--border-light)', color: 'var(--text-dim)', borderRadius: '8px', fontSize: '12px', textAlign: 'left' }}>
                            <strong style={{ color: 'var(--text-main)' }}>Nonce de Session :</strong><br/>
                            <code style={{ fontSize: '14px', color: '#0EA5E9', fontWeight: 600, userSelect: 'all' }}>{qrData.session.session_nonce}</code>
                        </div>
                    </div>
                )}

                {status === 'ERROR' && (
                    <div style={{ textAlign: 'center', padding: '40px 0', animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ color: '#EF4444', marginBottom: '16px' }}>
                            <AlertCircle size={48} style={{ margin: '0 auto' }} />
                        </div>
                        <h2 style={{ fontSize: '20px', color: '#EF4444', margin: '0 0 12px 0' }}>Une erreur est survenue</h2>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '24px' }}>Impossible de générer ou de vérifier la session EUDI.</p>
                        <button 
                            onClick={handleCancel}
                            style={{ background: '#334155', color: 'white', padding: '12px 24px', borderRadius: '12px', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                        >
                            {t.common.cancel}
                        </button>
                    </div>
                )}

                {status === 'VERIFYING' && (
                     <div style={{ textAlign: 'center', padding: '40px 0', animation: 'fadeIn 0.3s ease' }}>
                         <Loader2 size={64} className="animate-spin" color="#10B981" style={{ margin: '0 auto 24px' }} />
                         <h2 style={{ fontSize: '20px', color: '#10B981', margin: '0 0 8px 0' }}>Traitement EUDI V2...</h2>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px', textAlign: 'left', background: 'var(--bg-panel-hover)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', width: '80%', margin: '24px auto 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 600, fontSize: '14px' }}>
                                <CheckCircle2 size={16} /> Preuves Cryptographiques Reçues
                            </div>
                            {!activeScenario.isEntryCheck && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0EA5E9', fontWeight: 600, fontSize: '14px' }}>
                                    <Loader2 size={16} className="animate-spin" /> Exécution EUDI Pay ({totalAmount} €)
                                </div>
                            )}
                         </div>
                     </div>
                )}

                {status === 'SUCCESS' && (
                    <div style={{ textAlign: 'center', padding: '10px 0', animation: 'fadeIn 0.4s ease' }}>
                        <div style={{ background: '#10B981', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)' }}>
                            <CheckCircle2 size={48} color="white" />
                        </div>
                        <h2 style={{ fontSize: '26px', color: 'var(--text-main)', margin: '0 0 8px 0', fontWeight: 800 }}>{activeScenario.isEntryCheck ? "Vérification OK" : "Paiement Approuvé"}</h2>
                        {!activeScenario.isEntryCheck && <h3 style={{ fontSize: '20px', color: '#10B981', margin: '0 0 24px 0', fontWeight: 700 }}>{totalAmount} €</h3>}

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                            <span style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '20px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ShieldCheck size={14} /> {activeScenario.successText}
                            </span>
                            {!activeScenario.isEntryCheck && (
                                <span style={{ padding: '6px 12px', background: 'rgba(14, 165, 233, 0.1)', color: '#0EA5E9', borderRadius: '20px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <CreditCard size={14} /> EUDI Pay
                                </span>
                            )}
                        </div>

                        {/* Simulated Receipt Print */}
                        <div style={{ background: 'white', position: 'relative', width: '320px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderTop: '2px dashed #CBD5E1', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '24px 16px', textAlign: 'left', fontFamily: 'monospace', color: 'black' }}>
                            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                <strong>{activeScenario.title.toUpperCase()}</strong><br/>
                            </div>
                            <div style={{ borderBottom: '1px dashed #CBD5E1', paddingBottom: '8px', marginBottom: '8px', fontSize: '14px' }}>
                                {activeScenario.items.map((it, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{it.name.toUpperCase().substring(0,20)}</span>
                                        <span>{it.price.toFixed(2)} EUR</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
                                <span>TOTAL</span>
                                <span>{totalAmount} EUR</span>
                            </div>
                            <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748B', textAlign: 'center' }}>
                                PAIEMENT DIGITAL<br/>
                                <code>TX-{executionData?.executionData?.transaction?.transaction_id?.substring(0,8) || 'AGENTIC-39A2'}</code><br/><br/>
                                Scope: {activeScenario.scope.split(':').pop()}<br/>
                                Validation EUDI ☑<br/><br/>
                                MERCI DE VOTRE VISITE
                            </div>
                        </div>

                        <button 
                            onClick={() => { setStatus('IDLE'); }}
                            style={{ background: 'var(--accent-neon)', color: 'white', padding: '14px 28px', borderRadius: '12px', fontSize: '16px', fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '32px', display: 'inline-flex', gap: '8px', alignItems: 'center', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)' }}
                        >
                            {t.retailer.newTransaction}
                        </button>
                    </div>
                )}
            </div>
            
            <style>{`
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            `}</style>
        </div>
    );
};
