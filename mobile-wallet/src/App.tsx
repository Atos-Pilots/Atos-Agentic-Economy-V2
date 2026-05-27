import { useState, useEffect } from 'react';
import { Fingerprint, WalletCards, ShieldCheck, ScanLine, Building2 } from 'lucide-react';
import './index.css';
import { SbtGalleryView } from './components/SbtGalleryView';
import { FaceIDOverlay } from './components/FaceIDOverlay';
import { RetailerTerminal } from './components/RetailerTerminal';
import { CredentialsGallery } from './components/CredentialsGallery';
import { ScannerEngine } from './components/ScannerEngine';
import { ConsentReview } from './components/ConsentReview';
import { IssuancePortal } from './components/IssuancePortal';
import { useSettings } from './context/SettingsContext';
import { translations } from './translations';
import { SettingsToggle } from './components/SettingsToggle';

type TabType = 'identity' | 'scanner' | 'sbt' | 'issuance';

function App() {
  const { lang } = useSettings();
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<TabType>('scanner');
  const [showSca, setShowSca] = useState(false);

  // Routing State
  const [route, setRoute] = useState<string>(window.location.hash || '#wallet');

  // V2 Presentation Session State
  const [presentationSession, setPresentationSession] = useState<any>(null);

  // Selected Card Brand for Co-badging
  const [selectedBrand, setSelectedBrand] = useState<'CB' | 'VISA'>('CB');

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

  const handleScaSuccess = async (mandateId: string) => {
    setShowSca(false);

    // V2 Execution: Submit the presentation session to the backend
    if (presentationSession) {
      let finalAmount = 25.00;
      if (presentationSession.retailer_id === 'Tabac Le Havane') finalAmount = 15.50;
      else if (presentationSession.retailer_id === 'Hôtel Royal Palace') finalAmount = 120.00;
      else if (presentationSession.retailer_id === 'Elite Car Rental') finalAmount = 300.00;

      try {
        await fetch('/v2/checkout/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: presentationSession.id,
            sca_attestation_id: mandateId || 'ewc_direct_sca',
            amount: finalAmount,
            selected_brand: selectedBrand // Transmit selected brand (co-badging)
          })
        });
      } catch (e) { console.error('Failed to submit checkout', e); }

      // Force a refresh of SBTs (Receipts)
      setActiveTab('sbt');
      setPresentationSession(null);
    }
  };

  const DemoNavigator = () => (
    <>
      <div style={{ position: 'fixed', top: 8, right: 8, zIndex: 9999, background: 'rgba(15, 23, 42, 0.9)', padding: '6px 12px', borderRadius: '20px', display: 'flex', gap: '12px', border: '1px solid #334155', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
        <a href="#wallet" style={{ color: route === '#wallet' || route === '' ? '#0EA5E9' : '#94A3B8', textDecoration: 'none', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>📱 Wallet V2</a>
        <a href="#retailer-terminal" style={{ color: route === '#retailer-terminal' ? '#0EA5E9' : '#94A3B8', textDecoration: 'none', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>🏪 E-commerce</a>
        <a href="#split-view" style={{ color: route === '#split-view' ? '#0EA5E9' : '#94A3B8', textDecoration: 'none', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid #334155', paddingLeft: '12px' }}>🖥️ Split View Demo</a>
      </div>
      <SettingsToggle />
    </>
  );

  if (route === '#retailer-terminal') {
    return <><DemoNavigator /><RetailerTerminal /></>;
  }

  const renderWalletApp = (isSplitView = false) => (
    <div className={`iphone-frame-wrapper${isSplitView ? ' iphone-frame-wrapper--split' : ''}`}>
      <div className="iphone-dynamic-island" />
      <div className="mobile-app-container" style={isSplitView ? { height: '100%', maxHeight: 'none', borderRadius: '46px' } : {}}>
        {route !== '#split-view' && <DemoNavigator />}
        {showSca && (
          <FaceIDOverlay
            onSuccess={handleScaSuccess}
            onCancel={() => setShowSca(false)}
          />
        )}

        <header className="glass-panel" style={{ margin: '20px', marginTop: '64px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '16px', border: '1px solid var(--success-green)' }}>
          <div style={{ background: 'rgba(0, 210, 106, 0.2)', padding: '12px', borderRadius: '50%' }}>
            <ShieldCheck color="var(--success-green)" size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: 'white' }}>{t.app.identityVault}</h2>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)' }}>EUDI Fast Checkout V2</p>
          </div>
        </header>

        <div className="view-container">
          {presentationSession ? (
            <div className="animate-enter" style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '16px', minHeight: '100%', color: 'var(--text-main)', border: '1px solid var(--border-light)' }}>
              <ConsentReview
                session={presentationSession}
                onCancel={() => setPresentationSession(null)}
                onSuccess={(completed, brand) => {
                  if (brand) setSelectedBrand(brand as 'CB' | 'VISA');
                  // For all EWC V2 checkouts, trigger FaceID consent to authorize the transaction
                  setShowSca(true);
                }}
              />
            </div>
          ) : (
            <>
              {activeTab === 'identity' && (
                <div className="animate-enter">
                  <h1>{t.app.myIdentities}</h1>
                  <CredentialsGallery />
                </div>
              )}

              {activeTab === 'scanner' && (
                <div className="animate-enter" style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '16px', color: 'var(--text-main)', border: '1px solid var(--border-light)' }}>
                  <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-main)' }}>Scan QR Code</h2>
                  <ScannerEngine onScanSuccess={(session) => {
                    setPresentationSession(session);
                  }} />
                </div>
              )}

              {activeTab === 'issuance' && (
                <div className="animate-enter">
                  <h1>Émission (Issuance)</h1>
                  <IssuancePortal />
                </div>
              )}

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
          <button className={`nav-item ${activeTab === 'issuance' ? 'active' : ''}`} onClick={() => { setActiveTab('issuance'); setPresentationSession(null); }}>
            <Building2 size={24} /><span>Banque</span>
          </button>
          <button className={`nav-item ${activeTab === 'sbt' ? 'active' : ''}`} onClick={() => { setActiveTab('sbt'); setPresentationSession(null); }}>
            <WalletCards size={24} /><span>{t.nav.receipts}</span>
          </button>
        </nav>
      </div>
      <div className="iphone-home-indicator" />
    </div>
  );

  if (route === '#split-view') {
    return (
      <div style={{ display: 'flex', width: '100vw', height: '100vh', padding: '20px', paddingTop: '60px', gap: '40px', background: 'var(--bg-dark)', overflow: 'hidden', justifyContent: 'center' }}>
        <DemoNavigator />
        {/* WALLET COLUMN */}
        <div style={{ display: 'flex', justifyContent: 'center', minWidth: '430px', flexShrink: 0, position: 'relative', overflow: 'visible', background: 'transparent' }}>
          {renderWalletApp(true)}
        </div>
        {/* RETAIL COLUMN */}
        <div style={{ width: '600px', flexShrink: 0, position: 'relative', overflowY: 'hidden', background: 'var(--bg-panel)', borderRadius: '24px', border: '1px solid var(--border-light)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <RetailerTerminal />
        </div>
      </div>
    );
  }

  return renderWalletApp(false);
}

export default App;
