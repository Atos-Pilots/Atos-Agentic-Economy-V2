import React, { useState } from 'react';
import { AlertCircle, FileText, CheckCircle2, ShieldCheck, CreditCard, GraduationCap, Camera } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { translations } from '../translations';

interface ConsentReviewProps {
  session: any;
  onCancel: () => void;
  onSuccess: (completed: boolean) => void;
}

export function ConsentReview({ session, onCancel, onSuccess }: ConsentReviewProps) {
  const { lang } = useSettings();
  const t = translations[lang];

  const requestedAttrs = session.requested_attributes || '';
  const requiresIdentity = requestedAttrs.includes('IdentityCredential') || requestedAttrs.includes('AgeProof');
  const requiresStudentCard = requestedAttrs.includes('StudentCard');
  const requiresSca = requestedAttrs.includes('ScaAttestation');
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Demande de Partage</h2>
      <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '24px' }}>
        <strong>{session.retailer_id}</strong> souhaite accéder aux informations suivantes pour finaliser l'opération.
      </p>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        
        {requiresIdentity && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ background: 'rgba(14, 165, 233, 0.2)', padding: '8px', borderRadius: '8px' }}>
                <Camera color="#0ea5e9" size={20} />
              </div>
              <span style={{ fontWeight: 'bold' }}>Identité & Photo</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '24px', color: 'var(--text-dim)', fontSize: '14px' }}>
              <li>Photo ID (Minimal Disclosure)</li>
              <li>Prénom & Nom</li>
            </ul>
          </div>
        )}

        {requiresStudentCard && (
          <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '8px', borderRadius: '8px' }}>
                <GraduationCap color="#f59e0b" size={20} />
              </div>
              <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>Carte Étudiante</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '24px', color: 'var(--text-dim)', fontSize: '14px' }}>
              <li>Statut étudiant actif</li>
              <li>Sera utilisé pour appliquer une réduction automatique.</li>
            </ul>
          </div>
        )}

        {requiresSca && (
          <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '8px', borderRadius: '8px' }}>
                <CreditCard color="#3b82f6" size={20} />
              </div>
              <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>Autorisation de Paiement (SCA)</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '24px', color: 'var(--text-dim)', fontSize: '14px' }}>
              <li>Montant: <strong style={{ color: 'white' }}>€{
                session.retailer_id === 'Tabac Le Havane' ? '15.50' :
                session.retailer_id === 'Hôtel Royal Palace' ? '120.00' :
                session.retailer_id === 'Elite Car Rental' ? '300.00' : '25.00'
              }</strong></li>
              <li>Fournir l'attestation SCA PSD2 pour un paiement direct (Fast Checkout).</li>
            </ul>
          </div>
        )}
      </div>

      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <button className="secondary-button" style={{ flex: 1 }} onClick={onCancel}>
          {t.consent.btnCancel}
        </button>
        <button 
          className="primary-button" 
          style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px', background: 'var(--success-green)', color: '#000' }} 
          onClick={() => onSuccess(true)}
        >
          <ShieldCheck size={20} /> Accepter
        </button>
      </div>
    </div>
  );
}
