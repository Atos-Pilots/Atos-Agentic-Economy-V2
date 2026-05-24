import { useEffect, useState } from 'react';
import { AlertTriangle, ServerCrash, CheckCircle2 } from 'lucide-react';

export const MandateView = ({ mandateId, onRevoke }: { mandateId: string, onRevoke: () => void }) => {
  const [sagaState, setSagaState] = useState<string>('EN COURS DE CRÉATION...');

  useEffect(() => {
    const executeFrictionlessFlow = async () => {
      await fetch('/v1/agent/personal/simulate_intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mandate_id: mandateId,
          intent: {
            user_id: 'C_VON_N',
            product_category: 'test_product',
            target_budget: 60,
            currency: 'EUR'
          }
        })
      });

      // Lot 5A: Consent was implicit in the Chat + FaceID phase, auto-approve the queued API proposal
      const pendingRes = await fetch('/v1/consent/pending');
      const pendingData = await pendingRes.json();
      if (pendingData.proposals && pendingData.proposals.length > 0) {
         const matching = pendingData.proposals.find((p: any) => p.mandate_id === mandateId) || pendingData.proposals[pendingData.proposals.length - 1];
         if (matching) {
             await fetch(`/v1/consent/approve/${matching.proposal_id}`, { method: 'POST' });
         }
      }
    };
    executeFrictionlessFlow().catch(console.error);

    // Listen to the SSE Telemetry Stream for real-time Saga updates!
    const evtSource = new EventSource('/v1/telemetry/stream');
    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'payment.intent.created') setSagaState('PENDING');
        if (data.type === 'payment.execution.started') setSagaState('EXECUTING');
        if (data.type === 'merchant.order.confirmed') setSagaState('TRANSACTION COMPLETE');
        if (data.type === 'mandate.revoked') setSagaState('CANCELLED');
        
        // Final receipt hook
        if (data.type === 'purchase.completed') setSagaState('RECEIPT_GENERATED');
      } catch (e) {}
    };

    return () => evtSource.close();
  }, [mandateId]);

  return (
    <div className="animate-enter">
      <h1>Mandat Cryptographique</h1>
      
      <div className={`glass-panel`} style={{ marginBottom: '24px', borderColor: sagaState === 'EXECUTING' ? 'var(--accent-neon)' : 'var(--border-light)' }}>
        <h2 style={{ fontSize: '13px', marginBottom: '8px' }}>Contrat SD-JWT (W3C Standard)</h2>
        <p style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-dim)', wordBreak: 'break-all', opacity: 0.5 }}>
          {mandateId}
        </p>
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
          <span>Statut Global:</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: sagaState === 'CANCELLED' ? 'var(--danger-red)' : 'var(--accent-neon)' }}>
            {sagaState}
          </span>
        </div>
      </div>

      {sagaState !== 'CANCELLED' && sagaState !== 'RECEIPT_GENERATED' && sagaState !== 'TRANSACTION COMPLETE' && (
         <button className="panic-button animate-enter" onClick={onRevoke}>
           <AlertTriangle size={20} />
           <span>RÉVOQUER LE MANDAT D'URGENCE</span>
         </button>
      )}

      {sagaState === 'CANCELLED' && (
         <div className="glass-panel animate-enter" style={{ borderColor: 'var(--danger-red)', background: 'rgba(255,51,51,0.05)'}}>
            <ServerCrash size={32} color="var(--danger-red)" style={{ marginBottom: '12px' }}/>
            <h3 style={{ color: 'var(--danger-red)', marginBottom: '8px' }}>Mandat Annulé</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Circuit-breaker déclenché. Le processus IA a été violemment expulsé.</p>
         </div>
      )}

      {sagaState === 'RECEIPT_GENERATED' && (
         <div className="glass-panel animate-enter" style={{ borderColor: 'var(--success-green)', background: 'rgba(0, 210, 106, 0.05)'}}>
            <CheckCircle2 size={32} color="var(--success-green)" style={{ marginBottom: '12px' }}/>
            <h3 style={{ color: 'var(--success-green)', marginBottom: '8px' }}>Paiement Sécurisé</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Les preuves infalsifiables ont été transmises à votre galerie.</p>
         </div>
      )}
    </div>
  );
};
