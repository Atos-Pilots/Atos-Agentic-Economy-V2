import { useState, useEffect } from 'react';
import { Bot, Server, Terminal, Music, Repeat, ShieldCheck } from 'lucide-react';
import { useSettings } from './context/SettingsContext';
import { translations } from './translations';
import './index.css';

type Message = { id: number; sender: 'user' | 'agent' | 'system'; text: string; scope?: string };

export const CompanionApp = () => {
    const { lang } = useSettings();
    const t = translations[lang];

    const SCENARIOS = [
        {
            id: 'it_services',
            icon: <Terminal size={18} color="#0EA5E9" />,
            label: t.companion.scenarios.it.label,
            requestText: t.companion.scenarios.it.desc,
            merchant: "RunPod L402 Node",
            amount: 2.50,
            currency: "EURC",
            scope: "urn:atos:pilot:tech:it",
            isAutonomous: true
        },
        {
            id: 'concert',
            icon: <Music size={18} color="#F43F5E" />,
            label: t.companion.scenarios.concert.label,
            requestText: t.companion.scenarios.concert.desc,
            merchant: "TicketMaster Bot API",
            amount: 150.00,
            currency: "EURC",
            scope: "urn:atos:pilot:entertainment:tickets",
            isAutonomous: false
        },
        {
            id: 'subscription',
            icon: <Repeat size={18} color="#10B981" />,
            label: t.companion.scenarios.sub.label,
            requestText: t.companion.scenarios.sub.desc,
            merchant: "AWS Billing Machine",
            amount: 45.99,
            currency: "EURC",
            scope: "urn:atos:pilot:tech:infrastructure",
            isAutonomous: true
        }
    ];

    const [messages, setMessages] = useState<Message[]>([]);
    const [hasMasterMandate, setHasMasterMandate] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);

    useEffect(() => {
        setMessages([]);
        setHasMasterMandate(false);
    }, [lang]);

    useEffect(() => {
        // Only insert greeting once
        if (messages.length === 0) {
            const timer = setTimeout(() => {
                setHasMasterMandate(true);
                setMessages([{ id: 1, sender: 'agent', text: t.companion.greeting }]);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [t.companion.greeting, messages.length]);

    const runScenario = async (scenario: typeof SCENARIOS[0]) => {
        if (isExecuting) return;
        setIsExecuting(true);
        
        window.dispatchEvent(new CustomEvent('demo_navigate', { detail: { tab: 'mandates' } }));

        const timestamp = Date.now();
        setMessages(prev => [...prev, { id: timestamp, sender: 'user', text: scenario.requestText }]);

        await new Promise(r => setTimeout(r, 1200));
        setMessages(prev => [...prev, { id: timestamp + 1, sender: 'agent', text: `${t.companion.negotiation} [${scenario.merchant}]...` }]);

        await new Promise(r => setTimeout(r, 1800));
        setMessages(prev => [...prev, { 
            id: timestamp + 2, 
            sender: 'system', 
            text: `⚠️ ${t.companion.paymentRequired.replace('{amount}', `${scenario.amount.toFixed(2)} ${scenario.currency}`)}` 
        }]);

        // Mandate Verification — check against the real backend
        await new Promise(r => setTimeout(r, 1000));
        setMessages(prev => [...prev, { id: timestamp + 3, sender: 'agent', text: t.companion.mandateCheck }]);
        await new Promise(r => setTimeout(r, 1500));

        let activeMandate: any = null;
        try {
            const res = await fetch('/v1/wallet/mandates');
            const data = await res.json();
            if (data.success && data.mandates) {
                activeMandate = data.mandates.find((m: any) =>
                    m.status === 'ACTIVE' &&
                    (m.scope === scenario.scope || m.scope === 'urn:atos:pilot:all')
                );
            }
        } catch(e) {
            // Backend unreachable — fail open with a meaningful error
            setMessages(prev => [...prev, { id: timestamp + 4, sender: 'system', text: "❌ Impossible de joindre le serveur de mandats. Vérifiez la connexion." }]);
            setIsExecuting(false);
            return;
        }

        if (!activeMandate) {
            setMessages(prev => [...prev, { 
                id: timestamp + 4, 
                sender: 'system', 
                text: t.companion.mandateMissing.replace('{scope}', scenario.scope)
            }]);
            window.dispatchEvent(new CustomEvent('demo_navigate', { detail: { tab: 'mandates' } }));
            setIsExecuting(false);
            return;
        }

        if (activeMandate.max_amount < scenario.amount && scenario.isAutonomous) {
            setMessages(prev => [...prev, { 
                id: timestamp + 4, 
                sender: 'system', 
                text: t.companion.mandateLimitExceeded
                        .replace('{amount}', `${scenario.amount} ${scenario.currency}`)
                        .replace('{limit}', `${activeMandate.max_amount} ${activeMandate.currency || 'EUR'}`)
            }]);
            window.dispatchEvent(new CustomEvent('demo_navigate', { detail: { tab: 'mandates' } }));
            setIsExecuting(false);
            return;
        }

        if (scenario.isAutonomous) {
            await new Promise(r => setTimeout(r, 2000));
            setMessages(prev => [...prev, { 
                id: timestamp + 3, 
                sender: 'agent', 
                text: t.companion.autonomousSuccess.replace(/{scope}/g, scenario.scope),
                scope: scenario.scope
            }]);
            
            await new Promise(r => setTimeout(r, 1500));
            setMessages(prev => [...prev, { id: timestamp + 4, sender: 'agent', text: t.companion.serviceDelivered }]);
            const newReceipt = {
                intent_id: scenario.id + '-' + Date.now(),
                amount: scenario.amount,
                currency: scenario.currency,
                rail: 'EUDI Agentic Mandate',
                issuedAt: new Date().toISOString()
            };
            try {
                const existing = JSON.parse(localStorage.getItem('sbt_receipts') || '[]');
                localStorage.setItem('sbt_receipts', JSON.stringify([newReceipt, ...existing]));
            } catch(e) {}

            window.dispatchEvent(new CustomEvent('demo_navigate', { detail: { tab: 'sbt' } }));
            setIsExecuting(false);
        } else {
            await new Promise(r => setTimeout(r, 1500));
            setMessages(prev => [...prev, { id: timestamp + 3, sender: 'agent', text: t.companion.scaEscalation.replace('{amount}', `${scenario.amount.toFixed(2)} ${scenario.currency}`) }]);
            
            await new Promise(r => setTimeout(r, 1000));
            setMessages(prev => [...prev, { id: timestamp + 4, sender: 'agent', text: t.companion.scaPush }]);

            try {
                await fetch('/v1/consent/request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: scenario.amount, merchant: scenario.merchant, intent_id: scenario.id })
                });
            } catch (e) {
                console.error("Backend Push fail", e);
            }
            
            // Instantly notify Demo Wallet context
            window.dispatchEvent(new CustomEvent('demo_push_notification', {
                detail: {
                    timestamp: Date.now(),
                    amount: scenario.amount,
                    merchant: scenario.merchant,
                    intent_id: scenario.id
                }
            }));
            
            setIsExecuting(false);
        }
    };

    return (
        <div className="mobile-app-container companion-app-theme" data-didactic-key="agent_console" style={{ borderColor: 'var(--accent-neon)', boxShadow: '0 0 50px rgba(112,0,255,0.2)' }}>
            <header className="glass-panel" style={{ margin: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '16px' }}>
                <div style={{ background: 'var(--accent-neon)', padding: '12px', borderRadius: '50%' }}>
                    <Bot color="white" size={24} />
                </div>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--text-main)' }}>{t.companion.title}</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Server size={12} /> {t.companion.subtitle}
                    </p>
                </div>
            </header>

            <div style={{ padding: '0 24px', marginBottom: '16px' }}>
                <div className="glass-panel" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{t.companion.protocolStatus}</span>
                    {hasMasterMandate ? (
                        <span style={{ color: 'var(--success-green)', fontSize: '12px', fontWeight: 'bold' }}>✓ {t.companion.deployed} (1000 EURC)</span>
                    ) : (
                        <span style={{ color: '#ff9d00', fontSize: '12px' }}>{t.common.loading}</span>
                    )}
                </div>
            </div>

            <div className="view-container" style={{ paddingTop: '0', display: 'flex', flexDirection: 'column' }}>
                <div className="chat-container" style={{ flex: 1, overflowY: 'auto' }}>
                    {messages.map((m) => (
                        <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                            <div className={`chat-bubble ${m.sender}`} style={m.sender === 'system' ? { background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C' } : {}}>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{m.text}</p>
                            </div>
                            {/* Explicit Mandate Consumed Badge */}
                            {m.scope && (
                                <div style={{ 
                                    marginTop: '8px', padding: '6px 12px', borderRadius: '8px', 
                                    border: '1px solid var(--success-green)', background: 'rgba(0, 210, 106, 0.1)',
                                    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: 'var(--success-green)'
                                }}>
                                    <ShieldCheck size={14} />
                                    <span>EUDI MANDATE CONSUMED: <strong style={{color:'var(--text-main)'}}>{m.scope}</strong></span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {hasMasterMandate && !isExecuting && (
                    <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', marginTop: 'auto' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {t.companion.simulateTitle}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {SCENARIOS.map(s => (
                                <button 
                                    key={s.id}
                                    onClick={() => runScenario(s)}
                                    style={{ 
                                        background: 'var(--bg-panel)', border: '1px solid var(--border-light)',
                                        color: 'var(--text-main)', padding: '12px', borderRadius: '10px',
                                        display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    {s.icon}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{s.label}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{s.amount.toFixed(2)} {s.currency} - {s.isAutonomous ? t.companion.authMode : t.companion.scaMode}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
