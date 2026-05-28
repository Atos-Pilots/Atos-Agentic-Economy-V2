import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, Ticket, ShieldCheck, CreditCard, Building2, Car, ShoppingBag } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSettings } from '../context/SettingsContext';
import { translations } from '../translations';

interface Scenario {
  id: string;
  name: string;
  retailerName: string;
  icon: React.ReactNode;
  color: string;
  price: number;
  attributes: string[];
  description: string;
  items: { name: string; price: number }[];
}

export function RetailerTerminal() {
  const { lang } = useSettings();
  const t = translations[lang];

  const SCENARIOS: Scenario[] = [
    {
      id: 'tabac',
      name: lang === 'fr' ? '🔞 Tabac - Âge & Paiement' : '🔞 Tobacconist - Age & Payment',
      retailerName: 'Tabac Le Havane',
      icon: <ShoppingBag size={24} color="#f43f5e" />,
      color: '#f43f5e',
      price: 15.50,
      attributes: ['IdentityCredential'],
      description: lang === 'fr' 
        ? 'Achat de produits réglementés avec vérification d\'âge Zero-Knowledge Proof (ZKP).' 
        : 'Age-restricted sales demanding a sovereign Zero-Knowledge Age Proof (ZKP).',
      items: [{ name: lang === 'fr' ? 'Achat Articles Tabac' : 'Tobacco Items Purchase', price: 15.50 }]
    },
    {
      id: 'hotel',
      name: lang === 'fr' ? '🏨 Hôtel - Caution & Identité' : '🏨 Hotel - Deposit & Identity',
      retailerName: 'Hôtel Royal Palace',
      icon: <Building2 size={24} color="#a855f7" />,
      color: '#a855f7',
      price: 120.00,
      attributes: ['IdentityCredential'],
      description: lang === 'fr'
        ? 'Check-in d\'hôtel avec validation d\'identité décentralisée et dépôt de caution.'
        : 'Hotel check-in with decentralized identity validation and deposit hold.',
      items: [{ name: lang === 'fr' ? 'Nuitée Suite Executive' : 'Executive Suite Night', price: 120.00 }]
    },
    {
      id: 'rental',
      name: lang === 'fr' ? '🚗 Location - Permis de Conduire' : '🚗 Rental - Driving License',
      retailerName: 'Elite Car Rental',
      icon: <Car size={24} color="#10b981" />,
      color: '#10b981',
      price: 300.00,
      attributes: ['IdentityCredential'],
      description: lang === 'fr'
        ? 'Location de véhicule premium avec validation cryptographique de votre permis de conduire ANTS.'
        : 'Premium vehicle rental with cryptographic ANTS driving license validation.',
      items: [{ name: lang === 'fr' ? 'Location Tesla Model Y (1 jour)' : 'Tesla Model Y Rental (1 day)', price: 300.00 }]
    },
    {
      id: 'fastferry',
      name: lang === 'fr' ? '🛳️ FastFerry - EWC Fast Checkout' : '🛳️ FastFerry - EWC Fast Checkout',
      retailerName: 'FastFerry E-Commerce',
      icon: <Ticket size={24} color="#0ea5e9" />,
      color: '#0ea5e9',
      price: 25.00,
      attributes: ['IdentityCredential', 'StudentCard', 'ScaAttestation'],
      description: lang === 'fr'
        ? 'Achat de billet avec attestation SCA (Strong Customer Authentication) et réduction étudiante.'
        : 'Ferry ticket purchase with SCA attestation (biometrics) and student discount.',
      items: [{ name: lang === 'fr' ? 'Billet de Ferry : Athènes - Santorin' : 'Ferry Ticket: Athens - Santorini', price: 25.00 }]
    }
  ];

  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[3]); // Default to FastFerry
  const [checkoutSession, setCheckoutSession] = useState<any>(null);
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS'>('IDLE');

  const handleCancel = () => {
    setStatus('IDLE');
    setCheckoutSession(null);
    window.dispatchEvent(new CustomEvent('demo_navigate', { detail: { tab: 'identity' } }));
  };
  
  const handleFastCheckout = async (scenario: Scenario) => {
    setStatus('PENDING');
    try {
      const res = await fetch('/v2/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailer_name: scenario.retailerName,
          amount: scenario.price,
          requested_attributes: scenario.attributes
        })
      });
      const data = await res.json();
      setCheckoutSession(data.session);

      // Auto-sync for the Wallet demo tab in Split View
      localStorage.setItem('demo_last_nonce', data.session.session_nonce);
      window.dispatchEvent(new Event('demo_nonce_updated'));
      window.dispatchEvent(new CustomEvent('demo_navigate', { detail: { tab: 'scanner' } }));
    } catch (e) {
      console.error('Failed to create session', e);
      setStatus('IDLE');
    }
  };

  // Poll session status for V2 checkout
  useEffect(() => {
    if (status !== 'PENDING' || !checkoutSession) return;

    let interval = setInterval(async () => {
      try {
        const res = await fetch(`/v2/checkout/session/poll/${checkoutSession.session_nonce}`);
        const data = await res.json();
        if (data.status === 'COMPLETED') {
          setStatus('SUCCESS');
          clearInterval(interval);
        }
      } catch (e) { }
    }, 2000);

    return () => clearInterval(interval);
  }, [status, checkoutSession]);

  return (
    <div style={{ padding: '40px', color: 'var(--text-main)', height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      
      {/* Title Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: selectedScenario.color, padding: '12px', borderRadius: '12px', transition: 'background-color 0.3s' }}>
            {selectedScenario.icon}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', color: selectedScenario.color, transition: 'color 0.3s' }}>
              {selectedScenario.retailerName}
            </h1>
            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '13px' }}>{t.retailer.title}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
          <ShoppingCart size={18} />
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>€{selectedScenario.price.toFixed(2)}</span>
        </div>
      </header>

      {status === 'IDLE' && (
        <div className="animate-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Scenario Selector Cards */}
          <div>
            <h3 style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '12px', marginTop: 0 }}>{t.retailer.scenariosLabel || t.retailer.modeSelection}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {SCENARIOS.map((scen) => {
                const isSelected = selectedScenario.id === scen.id;
                return (
                  <div
                    key={scen.id}
                    onClick={() => setSelectedScenario(scen)}
                    style={{
                      background: isSelected ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                      border: isSelected ? `2px solid ${scen.color}` : '2px solid var(--border-light)',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-light)';
                    }}
                  >
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px' }}>
                      {scen.icon}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{scen.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>€{scen.price.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description of Scenario */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px', fontSize: '13px', lineHeight: 1.5 }}>
            <span style={{ color: selectedScenario.color, fontWeight: 'bold' }}>{lang === 'fr' ? 'Description : ' : 'Description: '}</span>
            <span style={{ color: 'var(--text-dim)' }}>{selectedScenario.description}</span>
            <div style={{ marginTop: '8px', fontSize: '11px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ color: 'white', fontWeight: 600 }}>{lang === 'fr' ? 'Attributs requis :' : 'Required claims:'}</span>
              {selectedScenario.attributes.map(attr => (
                <span key={attr} style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', color: '#94a3b8' }}>
                  {attr}
                </span>
              ))}
            </div>
          </div>
          
          {/* Panier Detail */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '18px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-dim)' }}>{t.retailer.cart}</h3>
            {selectedScenario.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '14px' }}>
                <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{item.name}</span>
                <span style={{ fontWeight: 'bold' }}>€{item.price.toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px dashed var(--border-light)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: '14px' }}>{lang === 'fr' ? 'Total Commande' : 'Total Order'}</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: selectedScenario.color, transition: 'color 0.3s' }}>
                €{selectedScenario.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              className="primary-button" 
              style={{ padding: '14px', fontSize: '15px', background: selectedScenario.color, color: '#000', fontWeight: 700, display: 'flex', justifyContent: 'center', gap: '10px', transition: 'background-color 0.3s' }}
              onClick={() => handleFastCheckout(selectedScenario)}
            >
              <ShieldCheck size={20} /> {t.retailer.verifyAndPay}
            </button>
            <button className="secondary-button" style={{ padding: '14px', fontSize: '15px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <CreditCard size={20} /> {lang === 'fr' ? 'Payer par carte classique' : 'Pay with traditional card'}
            </button>
          </div>
        </div>
      )}

      {status === 'PENDING' && checkoutSession && (
        <div className="animate-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '24px', marginBottom: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            <QRCodeSVG value={JSON.stringify({ nonce: checkoutSession.session_nonce, type: 'EUDI_FAST_CHECKOUT' })} size={200} />
          </div>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>{t.retailer.waitingScan}</h2>
          <p style={{ color: 'var(--text-dim)', maxWidth: '420px', lineHeight: 1.5, fontSize: '14px', margin: 0 }}>
            {t.retailer.instructionsText}
          </p>
          
          {/* Bouton Annuler / Retour */}
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
                {lang === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
          </div>

          <div className="pulse-dot" style={{ marginTop: '32px', background: selectedScenario.color }} />
        </div>
      )}

      {status === 'SUCCESS' && (
        <div className="animate-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <CheckCircle2 color="var(--success-green)" size={80} style={{ marginBottom: '20px' }} />
          <h1 style={{ color: 'var(--success-green)', marginBottom: '12px', fontSize: '28px' }}>{t.retailer.successIdentity}</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px', maxWidth: '440px', lineHeight: 1.6, margin: 0 }}>
            {t.retailer.receiptTitle}
          </p>
          <button 
            className="secondary-button" 
            style={{ marginTop: '40px', padding: '12px 30px' }}
            onClick={() => setStatus('IDLE')}
          >
            {t.retailer.newTransaction}
          </button>
        </div>
      )}
    </div>
  );
}
