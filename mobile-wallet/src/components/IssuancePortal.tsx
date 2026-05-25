import React, { useState, useEffect } from 'react';
import { Building2, GraduationCap, ArrowRight, ShieldCheck, CreditCard, Lock, Loader2, KeyRound } from 'lucide-react';

interface Bank {
  id: string;
  name: string;
  logoColor: string;
  gradient: string;
  textColor: string;
}

export function IssuancePortal() {
  const BANKS: Bank[] = [
    { id: 'revolut', name: 'Revolut Bank', logoColor: '#ffffff', gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', textColor: '#ffffff' },
    { id: 'sg', name: 'Société Générale', logoColor: '#e11d48', gradient: 'linear-gradient(135deg, #e11d48 0%, #111827 100%)', textColor: '#ffffff' },
    { id: 'bnp', name: 'BNP Paribas', logoColor: '#10b981', gradient: 'linear-gradient(135deg, #065f46 0%, #022c22 100%)', textColor: '#10b981' },
    { id: 'worldline', name: 'Worldline Banking', logoColor: '#8b5cf6', gradient: 'linear-gradient(135deg, #6d28d9 0%, #2e1065 100%)', textColor: '#a78bfa' }
  ];

  // Bank flow states
  const [bankStep, setBankStep] = useState<'SELECT_BANK' | 'LOGIN' | 'CONSENT' | 'ENROLLING' | 'SUCCESS'>('SELECT_BANK');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [enrollProgress, setEnrollProgress] = useState(0);
  const [enrollText, setEnrollText] = useState('');

  // University states
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [studentIssued, setStudentIssued] = useState(false);

  // Auto-fill state if bank is already issued on load
  useEffect(() => {
    fetch('/v1/wallet/attributes')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.attributes) {
          const hasSca = data.attributes.some((a: any) => a.type === 'ScaAttestation');
          const hasStudent = data.attributes.some((a: any) => a.type === 'StudentCard');
          if (hasSca) setBankStep('SUCCESS');
          if (hasStudent) setStudentIssued(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank);
    setBankStep('LOGIN');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setBankStep('CONSENT');
  };

  const handleStartEnrollment = () => {
    setBankStep('ENROLLING');
    setEnrollProgress(0);
  };

  // Secure Enclave Cryptographic Simulation
  useEffect(() => {
    if (bankStep !== 'ENROLLING') return;

    const logs = [
      { progress: 15, text: '[Secure Enclave] Initialisation de la clé matérielle sécurisée...' },
      { progress: 35, text: '[Secure Enclave] Génération de la paire de clés asymétriques Ed25519...' },
      { progress: 55, text: '[Secure Enclave] Enregistrement du descripteur de clé dans le processeur sécurisé...' },
      { progress: 75, text: '[BFF] Génération de la requête de signature de certificat (CSR)...' },
      { progress: 90, text: '[OpenBanking API] Liaison de l\'IBAN et signature du certificat SCA...' },
      { progress: 100, text: '[Wallet] Enregistrement de l\'Attestation SCA dans le coffre-fort...' }
    ];

    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < logs.length) {
        setEnrollProgress(logs[logIndex].progress);
        setEnrollText(logs[logIndex].text);
        logIndex++;
      } else {
        clearInterval(interval);
        // Call backend API to persist the SCA Attestation
        executeBackendIssueSca();
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [bankStep]);

  const executeBackendIssueSca = async () => {
    try {
      const res = await fetch('/v2/issuance/issue-sca', { method: 'POST' });
      if (res.ok) {
        setBankStep('SUCCESS');
      } else {
        setBankStep('SELECT_BANK');
      }
    } catch (e) {
      console.error(e);
      setBankStep('SELECT_BANK');
    }
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
      
      {/* SECTION 1: BANK CONNECTIVITY */}
      <div className="glass-panel animate-enter" style={{ border: '1px solid #3b82f6', background: 'rgba(59, 130, 246, 0.02)', padding: '24px' }}>
        
        {bankStep === 'SELECT_BANK' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '10px', borderRadius: '12px' }}>
                <Building2 color="#3b82f6" size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#3b82f6', fontSize: '16px' }}>Attestation de Paiement PSD2</h3>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-dim)' }}>Strong Customer Authentication (SCA)</p>
              </div>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: '24px' }}>
              Pour payer via le Fast Checkout EUDI, connectez votre banque pour émettre une attestation SCA cryptographique liée à votre IBAN.
            </p>

            <h4 style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px', letterSpacing: '0.05em' }}>CHOISIR VOTRE BANQUE</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {BANKS.map(bank => (
                <div
                  key={bank.id}
                  onClick={() => handleSelectBank(bank)}
                  style={{
                    background: bank.gradient,
                    borderRadius: '12px',
                    padding: '20px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '100px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'white' }}>{bank.name}</span>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-start', background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '10px' }}>
                    <Lock size={8} /> PSD2 COMPLIANT
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {bankStep === 'LOGIN' && selectedBank && (
          <div className="animate-enter">
            <h3 style={{ margin: '0 0 8px 0', color: selectedBank.textColor }}>Connexion : {selectedBank.name}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '20px' }}>
              Identifiez-vous à votre espace client bancaire pour autoriser la liaison de votre compte.
            </p>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>N° IDENTIFIANT</label>
                <input
                  type="text"
                  placeholder="Ex: 87654321"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-panel)', color: 'white', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>CODE CONFIDENTIEL</label>
                <input
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-panel)', color: 'white', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="secondary-button"
                  style={{ flex: 1 }}
                  onClick={() => setBankStep('SELECT_BANK')}
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  style={{ flex: 1, background: selectedBank.logoColor === '#ffffff' ? '#3b82f6' : selectedBank.logoColor, color: selectedBank.logoColor === '#ffffff' ? 'white' : 'black' }}
                >
                  Continuer
                </button>
              </div>
            </form>
          </div>
        )}

        {bankStep === 'CONSENT' && selectedBank && (
          <div className="animate-enter">
            <h3 style={{ margin: '0 0 12px 0', color: selectedBank.textColor }}>Consentement d'Émission</h3>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '14px', marginBottom: '20px', fontSize: '12px', lineHeight: 1.5 }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>Attestation PSD2 SCA requise :</div>
              <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--text-dim)' }}>
                <li>IBAN : FR76 3000 6000 0001 2345 6789 001</li>
                <li>Génération de signature asymétrique liée à l'appareil</li>
                <li>Autorisation de paiements directs (Fast Checkout)</li>
              </ul>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '20px', lineHeight: 1.4 }}>
              En acceptant, votre Wallet initiera la génération d'un certificat d'attestation signé cryptographiquement par la banque, stocké en toute sécurité dans l'enclave sécurisée de votre processeur.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="secondary-button"
                style={{ flex: 1 }}
                onClick={() => setBankStep('LOGIN')}
              >
                Refuser
              </button>
              <button
                className="primary-button"
                style={{ flex: 1, background: '#10b981', color: 'black' }}
                onClick={handleStartEnrollment}
              >
                Autoriser
              </button>
            </div>
          </div>
        )}

        {bankStep === 'ENROLLING' && (
          <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: '20px', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={40} color="#3b82f6" style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: '#3b82f6' }}>Génération Cryptographique</h3>
            
            {/* Fake progress bar */}
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ width: `${enrollProgress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.4s ease' }} />
            </div>

            <div style={{ background: '#090d16', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '12px', width: '100%', minHeight: '60px', boxSizing: 'border-box' }}>
              <p style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace', color: '#10b981', textAlign: 'left', lineHeight: 1.4 }}>
                {enrollText}
              </p>
            </div>
          </div>
        )}

        {bankStep === 'SUCCESS' && (
          <div className="animate-enter">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--success-green)', fontWeight: 'bold', fontSize: '15px', marginBottom: '16px' }}>
              <ShieldCheck size={22} /> Attestation SCA PSD2 Active !
            </div>

            {/* Gorgeous Bank Virtual Card representation inside wallet */}
            <div style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #070b19 100%)',
              borderRadius: '16px',
              padding: '20px',
              color: 'white',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>EUDI PAYMENT CERTIFICATE</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '4px' }}>SCA Attestation</div>
                </div>
                <KeyRound size={28} color="#3b82f6" />
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.8)' }}>
                FR76 3000 •••• •••• 1234
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                <span>STATUS: SECURE_ENCLAVE_SIGNED</span>
                <span style={{ color: 'var(--success-green)', fontWeight: 'bold' }}>● ACTIVE</span>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.4, margin: 0 }}>
              Votre clé asymétrique est désormais enrôlée et stockée localement dans le Secure Enclave. Le terminal marchand pourra faire appel à cette attestation pour initier un paiement PSD2 sécurisé en 1-click.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: STUDENT CARD */}
      <div className="glass-panel animate-enter" style={{ border: '1px solid #f59e0b', background: 'rgba(245, 158, 11, 0.02)', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '10px', borderRadius: '12px' }}>
            <GraduationCap color="#f59e0b" size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#f59e0b', fontSize: '16px' }}>Université de Paris</h3>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-dim)' }}>Carte Étudiante</p>
          </div>
        </div>
        
        <p style={{ fontSize: '13px', marginBottom: '20px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
          Obtenez votre carte étudiante numérisée dans votre portefeuille pour bénéficier de réductions étudiantes automatiques (Selective Disclosure) lors du Fast Checkout.
        </p>

        {studentIssued ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-green)', fontSize: '14px', fontWeight: 'bold' }}>
            <ShieldCheck size={18} /> Carte Étudiante émise avec succès !
          </div>
        ) : (
          <button 
            className="primary-button" 
            style={{ width: '100%', background: '#f59e0b', color: 'white', fontWeight: 600 }}
            onClick={issueStudentCard}
            disabled={loadingStudent}
          >
            {loadingStudent ? 'Génération du diplôme...' : 'Récupérer ma carte étudiante'} <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
