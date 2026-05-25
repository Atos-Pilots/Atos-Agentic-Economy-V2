import { useState, useEffect } from 'react';
import { Fingerprint, ScrollText, WalletCards, ShieldCheck, Mail, ScanLine } from 'lucide-react';
import './index.css';
import { MandateManager } from './components/MandateManager';
import { SbtGalleryView } from './components/SbtGalleryView';
import { FaceIDOverlay } from './components/FaceIDOverlay';
import { DesktopDashboard } from './components/dashboard/DesktopDashboard';
import { CompanionApp } from './CompanionApp';
import { RetailerTerminal } from './components/RetailerTerminal';
import { CredentialsGallery } from './components/CredentialsGallery';
import { ScannerEngine } from './components/ScannerEngine';
import { ConsentReview } from './components/ConsentReview';
import { useSettings } from './context/SettingsContext';
import { translations } from './translations';
import { SettingsToggle } from './components/SettingsToggle';

type TabType = 'identity' | 'scanner' | 'notifications' | 'mandates' | 'sbt';

function App() {
  const { lang } = useSettings();
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<TabType>('scanner');
  const [showSca, setShowSca] = useState(false);

  // Routing State
  const [route, setRoute] = useState<string>(window.location.hash || '#wallet');

  // Cloud Push Notification State (Agentic Payments Old Flow)
  const [pushRequest, setPushRequest] = useState<any>(null);

  // V2 Presentation Session State
  const [presentationSession, setPresentationSession] = useState<any>(null);

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#wallet');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // UseEffect for syncing tabs from other Split-View apps
  useEffect(() => {
    const handleDemoNav = (e: any) => {
      if (e.detail && e.detail.tab) {
        setActiveTab(e.detail.tab);
        setPresentationSession(null);
      }
    };
    window.addEventListener('demo_navigate', handleDemoNav);
    return () => window.removeEventListener('demo_navigate', handleDemoNav);
  }, []);

  // UseEffect for scanning intent passed through deep link in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const nonceFromUrl = urlParams.get('nonce');
    if (nonceFromUrl && route === '#wallet') {
      // If we detect a nonce, we simulate fetching it immediately
      setActiveTab('scanner');
    }
  }, [route]);

  // SSE Listener exclusively for the EUDI Wallet (Listening to push notifications from the cloud)
  useEffect(() => {
    if (route !== '#wallet' && route !== '' && route !== '#split-view') return;

    // Local fallback/sync for Split-View mode
    const handleLocalPush = (e: any) => {
      if (e.detail) {
        setPushRequest(e.detail);
        setActiveTab('notifications');
      }
    };
    window.addEventListener('demo_push_notification', handleLocalPush);

    // 1. Fetch any pending requests immediately
    const fetchPending = async () => {
      try {
        const res = await fetch('/v1/consent/remote/pending');
        const data = await res.json();
        if (data.success && data.request && !pushRequest) {
          if (Date.now() - data.request.timestamp < 120000) {
            setPushRequest(data.request);
            setActiveTab('notifications');
          }
        }
      } catch (e) { }
    };
    fetchPending();

    // 2. Subscribe to real-time events
    const evtSource = new EventSource('/v1/telemetry/stream');
    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'wallet.consent.requested') {
          // Push Received from the Companion Agent!
          setPushRequest(data.payload);
          setActiveTab('notifications');
        }
      } catch (e) { }
    };
    return () => {
      evtSource.close();
      window.removeEventListener('demo_push_notification', handleLocalPush);
    };
  }, [route]);

  const handleScaSuccess = async (mandateId: string) => {
    setShowSca(false);

    // Execute the remote AP2 payment with the freshly signed mandate
    if (pushRequest) {
      try {
        await fetch('/v1/consent/execute-remote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mandate_id: mandateId,
            amount: pushRequest.amount,
            merchant: pushRequest.merchant
          })
        });
      } catch (e) { console.error('Failed to execute remote payment', e); }

      const newReceipt = {
        intent_id: pushRequest.intent_id + '-' + Date.now(),
        amount: pushRequest.amount,
        currency: 'EURC',
        rail: 'EUDI Agentic Mandate',
        issuedAt: new Date().toISOString()
      };
      try {
        const existing = JSON.parse(localStorage.getItem('sbt_receipts') || '[]');
        localStorage.setItem('sbt_receipts', JSON.stringify([newReceipt, ...existing]));
      } catch (e) { }
    }

    setPushRequest(null);
    setActiveTab('sbt');
  };

  const DemoNavigator = () => (
    <>
      <div style={{ position: 'fixed', top: 8, right: 8, zIndex: 9999, background: 'rgba(15, 23, 42, 0.9)', padding: '6px 12px', borderRadius: '20px', display: 'flex', gap: '12px', border: '1px solid #334155', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
        <a href="#wallet" style={{ color: route === '#wallet' || route === '' ? '#0EA5E9' : '#94A3B8', textDecoration: 'none', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>{t.demoToggle.wallet}</a>
        <a href="#retailer-terminal" style={{ color: route === '#retailer-terminal' ? '#0EA5E9' : '#94A3B8', textDecoration: 'none', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>{t.demoToggle.terminal}</a>
        <a href="#agent-companion" style={{ color: route === '#agent-companion' ? '#0EA5E9' : '#94A3B8', textDecoration: 'none', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>{t.demoToggle.agent}</a>
        <a href="#split-view" style={{ color: route === '#split-view' ? '#0EA5E9' : '#94A3B8', textDecoration: 'none', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid #334155', paddingLeft: '12px' }}>🖥️ Split View</a>
      </div>
      <SettingsToggle />
    </>
  );

  if (route === '#dashboard') {
    return <><SettingsToggle /><DesktopDashboard /></>; // Dashboard uses its own header layout without DemoNav
  }
  if (route === '#agent-companion') {
    return <><DemoNavigator /><CompanionApp /></>;
  }
  if (route === '#retailer-terminal') {
    return <><DemoNavigator /><RetailerTerminal /></>;
  }

  const renderWalletApp = (isSplitView = false) => (
    <div className={`iphone-frame-wrapper${isSplitView ? ' iphone-frame-wrapper--split' : ''}`}>
      {/* Dynamic Island */}
      <div className="iphone-dynamic-island" />
      <div className="mobile-app-container" style={isSplitView ? { height: '100%', maxHeight: 'none', borderRadius: '46px' } : {}}>
        {route !== '#split-view' && <DemoNavigator />}
        {showSca && (
          <FaceIDOverlay
            onSuccess={handleScaSuccess}
            onCancel={() => setShowSca(false)}
          />
        )}

        {/* Wallet Header */}
        <header className="glass-panel" style={{ margin: '20px', marginTop: '64px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '16px', border: '1px solid var(--success-green)' }}>
          <div style={{ background: 'rgba(0, 210, 106, 0.2)', padding: '12px', borderRadius: '50%' }}>
            <ShieldCheck color="var(--success-green)" size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: 'white' }}>{t.app.identityVault}</h2>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)' }}>EUDI Secure Enclave V2</p>
          </div>
        </header>

        <div className="view-container">
          {/* If there is an active presentation session, overlay the ConsentReview */}
          {presentationSession ? (
            <div className="animate-enter" style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '16px', minHeight: '100%', color: 'var(--text-main)', border: '1px solid var(--border-light)' }}>
              <ConsentReview
                session={presentationSession}
                onCancel={() => setPresentationSession(null)}
                onSuccess={(completed) => {
                  setPresentationSession(null);
                  setActiveTab('sbt'); // Go to receipts/documents
                }}
              />
            </div>
          ) : (
            <>
              {/* Regular Tabs */}
              {activeTab === 'identity' && (
                <div className="animate-enter">
                  <h1>{t.app.myIdentities}</h1>
                  <CredentialsGallery />
                </div>
              )}

              {activeTab === 'scanner' && (
                <div className="animate-enter" style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '16px', color: 'var(--text-main)', border: '1px solid var(--border-light)' }}>
                  <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-main)' }}>Scanner QR Code</h2>
                  <ScannerEngine onScanSuccess={(session) => {
                    setPresentationSession(session);
                  }} />
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="animate-enter">
                  <h1>{t.app.inboxApprovals}</h1>
                  {pushRequest ? (
                    <div className="glass-panel" style={{ border: '1px solid #ff9d00', background: 'rgba(255, 157, 0, 0.05)' }}>
                      <h3 style={{ color: '#ff9d00', marginBottom: '8px' }}>{t.app.pendingSignature}</h3>
                      <p style={{ fontSize: '14px', marginBottom: '16px' }}>
                        {t.app.cloudRequest.replace('{amount}', String(pushRequest.amount)).replace('{merchant}', pushRequest.merchant)}
                      </p>
                      <button className="primary-button" onClick={() => setShowSca(true)}>
                        {t.app.signMandate}
                      </button>
                    </div>
                  ) : (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <Mail size={32} color="var(--text-dim)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                      <p style={{ color: 'var(--text-dim)' }}>{t.app.noRequest}</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'mandates' && <MandateManager />}
              {activeTab === 'sbt' && <SbtGalleryView />}
            </>
          )}
        </div>

        <nav className="bottom-nav" style={isSplitView ? { borderRadius: '0 0 24px 24px', position: 'absolute' } : { position: 'absolute' }}>
          <button className={`nav-item ${activeTab === 'scanner' ? 'active' : ''}`} onClick={() => { setActiveTab('scanner'); setPresentationSession(null); }}>
            <ScanLine size={24} /><span>{t.nav.scanner}</span>
          </button>
          <button className={`nav-item ${activeTab === 'identity' ? 'active' : ''}`} onClick={() => { setActiveTab('identity'); setPresentationSession(null); }}>
            <Fingerprint size={24} /><span>{t.nav.vault}</span>
          </button>
          <button className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => { setActiveTab('notifications'); setPresentationSession(null); }}>
            <div style={{ position: 'relative' }}>
              <Mail size={24} />
              {pushRequest && <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#ff9d00', borderRadius: '50%' }}></div>}
            </div>
            <span>{t.nav.cloud}</span>
          </button>
          <button className={`nav-item ${activeTab === 'mandates' ? 'active' : ''}`} onClick={() => { setActiveTab('mandates'); setPresentationSession(null); }}>
            <ScrollText size={24} /><span>{t.nav.mandates}</span>
          </button>
          <button className={`nav-item ${activeTab === 'sbt' ? 'active' : ''}`} onClick={() => { setActiveTab('sbt'); setPresentationSession(null); }}>
            <WalletCards size={24} /><span>{t.nav.receipts}</span>
          </button>
        </nav>
      </div>
      {/* Home Indicator */}
      <div className="iphone-home-indicator" />
    </div>
  );

  if (route === '#dashboard') {
    return <><SettingsToggle /><DesktopDashboard /></>; // Dashboard uses its own header layout without DemoNav
  }
  if (route === '#agent-companion') {
    return <><DemoNavigator /><CompanionApp /></>;
  }
  if (route === '#retailer-terminal') {
    return <><DemoNavigator /><RetailerTerminal /></>;
  }
  if (route === '#split-view') {
    return (
      <div style={{ display: 'flex', width: '100vw', height: '100vh', padding: '20px', paddingTop: '60px', gap: '20px', background: 'var(--bg-dark)', overflow: 'hidden' }}>
        <DemoNavigator />
        {/* WALLET COLUMN */}
        <div style={{ display: 'flex', justifyContent: 'center', minWidth: '430px', flexShrink: 0, position: 'relative', overflow: 'visible', background: 'transparent' }}>
          {renderWalletApp(true)}
        </div>
        {/* RETAIL COLUMN */}
        <div style={{ flex: 1, position: 'relative', overflowY: 'hidden', background: 'var(--bg-panel)', borderRadius: '24px', border: '1px solid var(--border-light)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <RetailerTerminal />
        </div>
        {/* COMPANION COLUMN */}
        <div style={{ flex: 1, position: 'relative', overflowY: 'hidden', background: 'var(--bg-panel)', borderRadius: '24px', border: '1px solid var(--border-light)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <CompanionApp />
        </div>
      </div>
    );
  }

  // --- WALLET EUDI RENDER (#wallet) ---
  return renderWalletApp(false);
}

export default App;
