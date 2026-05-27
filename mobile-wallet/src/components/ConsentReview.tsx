import React, { useState } from 'react';
import { ShieldCheck, CreditCard, GraduationCap, Camera, FileText, Check } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { translations } from '../translations';

interface ConsentReviewProps {
  session: any;
  onCancel: () => void;
  onSuccess: (completed: boolean, brand?: string) => void;
}

export function ConsentReview({ session, onCancel, onSuccess }: ConsentReviewProps) {
  const { lang } = useSettings();
  const t = translations[lang];

  const [selectedBrand, setSelectedBrand] = useState<'CB' | 'VISA'>('CB');

  const requestedAttrs = session.requested_attributes || '';
  const requiresIdentity = requestedAttrs.includes('IdentityCredential') || requestedAttrs.includes('AgeProof');
  const requiresStudentCard = requestedAttrs.includes('StudentCard');
  const requiresSca = requestedAttrs.includes('ScaAttestation');

  // Dynamic Merchant amount mapping
  let displayAmount = '25.00';
  if (session.retailer_id === 'Tabac Le Havane') displayAmount = '15.50';
  else if (session.retailer_id === 'Hôtel Royal Palace') displayAmount = '120.00';
  else if (session.retailer_id === 'Elite Car Rental') displayAmount = '300.00';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <ShieldCheck size={22} color="var(--accent-neon)" />
        <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--text-main)' }}>Demande de Partage EUDI</h2>
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '18px', lineHeight: 1.4 }}>
        Le terminal marchand souverain <strong style={{ color: 'white' }}>{session.retailer_id}</strong> sollicite vos justificatifs d'identité et de paiement.
      </p>

      {/* Mastercard Verifiable Intent - Checkout Mandate Info Box */}
      <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid #334155', borderRadius: '12px', padding: '12px', marginBottom: '16px', fontSize: '11px', fontFamily: 'monospace' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0ea5e9', marginBottom: '6px', fontWeight: 'bold' }}>
          <FileText size={12} />
          <span>CHECKOUT MANDATE (MARCHAND DE COMMANDE)</span>
        </div>
        <div style={{ color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div><strong style={{ color: '#94a3b8' }}>Merchant DID:</strong> did:web:atos-pilot-merchant.com</div>
          <div><strong style={{ color: '#94a3b8' }}>Invoice ID:</strong> inv_{session.session_nonce?.slice(0, 8)}</div>
          <div><strong style={{ color: '#94a3b8' }}>Montant Brut:</strong> {displayAmount} EUR</div>
          <div style={{ color: '#10b981' }}>✔ Signature cryptographique marchande validée</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Attestation 1: Identité */}
        {requiresIdentity && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ background: 'rgba(14, 165, 233, 0.15)', padding: '6px', borderRadius: '8px' }}>
                <Camera color="#0ea5e9" size={16} />
              </div>
              <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'white' }}>Carte Nationale d'Identité</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-dim)', fontSize: '12px', lineHeight: 1.4 }}>
              <li>Divulgation Sélective (SD-JWT) : Nom, Prénoms</li>
              <li>Preuve d'âge Zero-Knowledge Proof (Pas de date en clair)</li>
            </ul>
          </div>
        )}

        {/* Attestation 2: Carte Étudiante */}
        {requiresStudentCard && (
          <div style={{ background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '6px', borderRadius: '8px' }}>
                <GraduationCap color="#f59e0b" size={16} />
              </div>
              <span style={{ fontWeight: 'bold', color: '#f59e0b', fontSize: '13px' }}>Billet Réduction Étudiant</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-dim)', fontSize: '12px', lineHeight: 1.4 }}>
              <li>Preuve de scolarité valide (Académie de Paris)</li>
              <li>Permet d'appliquer une réduction de 20%</li>
            </ul>
          </div>
        )}

        {/* Attestation 3: SCA Attestation & Co-badging Selector */}
        {requiresSca && (
          <div style={{ background: 'rgba(59, 130, 246, 0.03)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '6px', borderRadius: '8px' }}>
                <CreditCard color="#3b82f6" size={16} />
              </div>
              <span style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '13px' }}>Autorisation de Paiement (SCA / DPC)</span>
            </div>

            <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'var(--text-dim)' }}>
              Montant à autoriser : <strong style={{ color: 'white' }}>{displayAmount} €</strong>
            </p>

            {/* CB Co-badging Card Brand Selector */}
            <div style={{ marginTop: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Choix de la marque de carte (Co-badgeage) :
              </label>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                
                {/* Brand 1: CB */}
                <div 
                  onClick={() => setSelectedBrand('CB')}
                  style={{
                    flex: 1,
                    background: selectedBrand === 'CB' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
                    border: selectedBrand === 'CB' ? '2px solid #10b981' : '1px solid var(--border-light)',
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 'bold', color: '#10b981' }}>CB</div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>CB (Local)</span>
                  </div>
                  {selectedBrand === 'CB' && <Check size={12} color="#10b981" />}
                </div>

                {/* Brand 2: Visa */}
                <div 
                  onClick={() => setSelectedBrand('VISA')}
                  style={{
                    flex: 1,
                    background: selectedBrand === 'VISA' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255,255,255,0.02)',
                    border: selectedBrand === 'VISA' ? '2px solid #3b82f6' : '1px solid var(--border-light)',
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 'bold', color: '#1e3a8a' }}>VISA</div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>Visa / MC</span>
                  </div>
                  {selectedBrand === 'VISA' && <Check size={12} color="#3b82f6" />}
                </div>

              </div>
            </div>

          </div>
        )}

      </div>

      {/* Actions */}
      <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
        <button className="secondary-button" style={{ flex: 1, padding: '10px', fontSize: '13px' }} onClick={onCancel}>
          {t.consent.btnCancel}
        </button>
        <button 
          className="primary-button" 
          style={{ flex: 1, padding: '10px', fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', background: 'var(--success-green)', color: '#000', fontWeight: 'bold' }} 
          onClick={() => onSuccess(true, selectedBrand)}
        >
          <ShieldCheck size={16} /> Accepter
        </button>
      </div>

    </div>
  );
}
