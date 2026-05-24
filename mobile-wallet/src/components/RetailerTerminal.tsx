import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, QrCode, Ticket, ShieldCheck, CreditCard } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export function RetailerTerminal() {
  const [cart] = useState([{ name: 'Ferry Ticket: Athens - Santorini', price: 25.00 }]);
  const [checkoutSession, setCheckoutSession] = useState<any>(null);
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS'>('IDLE');
  
  const handleFastCheckout = async () => {
    setStatus('PENDING');
    try {
      const res = await fetch('/v2/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailer_name: 'FastFerry E-Commerce',
          amount: 25.00,
          requested_attributes: ['IdentityCredential', 'StudentCard', 'ScaAttestation']
        })
      });
      const data = await res.json();
      setCheckoutSession(data.session);
    } catch (e) {
      console.error('Failed to create session', e);
      setStatus('IDLE');
    }
  };

  useEffect(() => {
    if (status !== 'PENDING' || !checkoutSession) return;

    let interval = setInterval(async () => {
      try {
        const res = await fetch(`/v1/consent/poll/${checkoutSession.session_nonce}`);
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
    <div style={{ padding: '40px', color: 'var(--text-main)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#0ea5e9', padding: '12px', borderRadius: '12px' }}>
            <Ticket color="white" size={28} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#0ea5e9' }}>FastFerry</h1>
            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '14px' }}>E-commerce Checkout</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
          <ShoppingCart size={20} />
          <span style={{ fontWeight: 'bold' }}>€25.00</span>
        </div>
      </header>

      {status === 'IDLE' && (
        <div className="animate-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Votre Panier</h2>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px', marginBottom: '40px' }}>
            {cart.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#1e293b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ticket size={20} color="#94a3b8" />
                  </div>
                  <span style={{ fontWeight: 500 }}>{item.name}</span>
                </div>
                <span style={{ fontWeight: 'bold' }}>€{item.price.toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px dashed var(--border-light)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-dim)' }}>Total</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0ea5e9' }}>€25.00</span>
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button 
              className="primary-button" 
              style={{ padding: '16px', fontSize: '16px', background: '#3b82f6', display: 'flex', justifyContent: 'center', gap: '12px' }}
              onClick={handleFastCheckout}
            >
              <ShieldCheck size={24} /> Fast Checkout avec EUDI Wallet
            </button>
            <button className="secondary-button" style={{ padding: '16px', fontSize: '16px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <CreditCard size={24} /> Payer par carte classique
            </button>
          </div>
        </div>
      )}

      {status === 'PENDING' && checkoutSession && (
        <div className="animate-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '24px', marginBottom: '24px' }}>
            <QRCodeSVG value={JSON.stringify({ nonce: checkoutSession.session_nonce, type: 'EUDI_FAST_CHECKOUT' })} size={200} />
          </div>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Scan to Checkout</h2>
          <p style={{ color: 'var(--text-dim)', maxWidth: '400px', lineHeight: 1.5 }}>
            Veuillez scanner ce QR code avec votre EUDI Wallet pour partager votre carte étudiante (si applicable) et autoriser le paiement.
          </p>
          <div className="pulse-dot" style={{ marginTop: '32px' }} />
        </div>
      )}

      {status === 'SUCCESS' && (
        <div className="animate-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <CheckCircle2 color="var(--success-green)" size={80} style={{ marginBottom: '24px' }} />
          <h1 style={{ color: 'var(--success-green)', marginBottom: '12px' }}>Paiement Validé !</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '16px', maxWidth: '400px' }}>
            L'autorisation SCA a été vérifiée avec succès. Vos billets ont été ajoutés à votre portefeuille numérique.
          </p>
          <button 
            className="secondary-button" 
            style={{ marginTop: '40px' }}
            onClick={() => setStatus('IDLE')}
          >
            Retour à l'accueil
          </button>
        </div>
      )}
    </div>
  );
}
