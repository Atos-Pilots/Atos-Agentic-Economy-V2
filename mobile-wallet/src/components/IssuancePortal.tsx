import React, { useState } from 'react';
import { Building2, GraduationCap, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';

export function IssuancePortal() {
  const [loadingBank, setLoadingBank] = useState(false);
  const [bankIssued, setBankIssued] = useState(false);

  const [loadingStudent, setLoadingStudent] = useState(false);
  const [studentIssued, setStudentIssued] = useState(false);

  const issueScaAttestation = async () => {
    setLoadingBank(true);
    try {
      const res = await fetch('/v2/issuance/issue-sca', { method: 'POST' });
      if (res.ok) setBankIssued(true);
    } catch (e) {
      console.error(e);
    }
    setLoadingBank(false);
  };

  const issueStudentCard = async () => {
    setLoadingStudent(true);
    try {
      const res = await fetch('/v2/issuance/issue-card', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'StudentCard' })
      });
      if (res.ok) setStudentIssued(true);
    } catch (e) {
      console.error(e);
    }
    setLoadingStudent(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '100px' }}>
      <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>
        Ce portail simule les services d'émission (Issuance) de vos fournisseurs d'identité et bancaires.
      </p>

      {/* BANK SCA ATTESTATION */}
      <div className="glass-panel" style={{ border: '1px solid #3b82f6', background: 'rgba(59, 130, 246, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '10px', borderRadius: '12px' }}>
            <Building2 color="#3b82f6" size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#3b82f6' }}>Banque & Paiement</h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)' }}>SCA Attestation PSD2</p>
          </div>
        </div>
        
        <p style={{ fontSize: '13px', marginBottom: '20px', color: 'var(--text-main)' }}>
          Enrôlez votre compte bancaire pour générer une attestation SCA. Elle vous permettra de payer en 1-click avec votre Wallet.
        </p>

        {bankIssued ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-green)', fontSize: '14px', fontWeight: 'bold' }}>
            <ShieldCheck size={18} /> SCA Attestation émise avec succès !
          </div>
        ) : (
          <button 
            className="primary-button" 
            style={{ width: '100%', background: '#3b82f6' }}
            onClick={issueScaAttestation}
            disabled={loadingBank}
          >
            {loadingBank ? 'Connexion à la banque...' : 'Connecter ma banque'} <ArrowRight size={16} />
          </button>
        )}
      </div>

      {/* STUDENT CARD */}
      <div className="glass-panel" style={{ border: '1px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '10px', borderRadius: '12px' }}>
            <GraduationCap color="#f59e0b" size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#f59e0b' }}>Université de Paris</h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)' }}>Carte Étudiante</p>
          </div>
        </div>
        
        <p style={{ fontSize: '13px', marginBottom: '20px', color: 'var(--text-main)' }}>
          Récupérez votre carte étudiante numérisée pour bénéficier de réductions lors de vos achats (Selective Disclosure).
        </p>

        {studentIssued ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-green)', fontSize: '14px', fontWeight: 'bold' }}>
            <ShieldCheck size={18} /> Carte générée avec succès !
          </div>
        ) : (
          <button 
            className="primary-button" 
            style={{ width: '100%', background: '#f59e0b', color: 'white' }}
            onClick={issueStudentCard}
            disabled={loadingStudent}
          >
            {loadingStudent ? 'Génération en cours...' : 'Obtenir ma carte'} <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
