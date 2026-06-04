import React from 'react';
import type { Lang } from './i18n';
import { t } from './i18n';

interface BlockchainLedgerProps {
    lang: Lang;
    events: string[];
}

export const BlockchainLedger: React.FC<BlockchainLedgerProps> = ({ lang, events }) => {
    
    // We infer state from the historical event stream (events is an array of types)
    const hasPresentationReq = events.includes('presentation.requested');
    const hasPresentationScanned = events.includes('presentation.scanned');
    const hasPresentationVerified = events.includes('presentation.verified');
    
    const hasX402 = events.includes('payment.intent.created'); // Emulate x402 right after intent
    const hasSBT = events.includes('purchase.completed');

    return (
        <div className="dashboard-column ledger-column glass-panel">
            <div className="column-header">
                <h2>{t[lang].ledger_title} (EUDI V2)</h2>
            </div>
            
            <div className="ledger-visualizer">
                
                {/* ZKP Presentation Request Stage */}
                <div className={`protocol-block ${hasPresentationReq ? 'active' : ''}`} style={{ borderColor: hasPresentationVerified ? '#10B981' : '' }}>
                    <div className="block-title">ZKP Presentation Layer</div>
                    <div className="block-body">
                        {hasPresentationVerified ? (
                            <>
                                <p className="text-green" style={{ color: '#10B981', fontWeight: 600 }}>✓ Preuves Validées en Local (Zero-Knowledge)</p>
                                <div className="zkp-animation" style={{ background: '#ecfdf5', padding: '10px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                                    <code>[Self-Sovereign Identity]</code><br/>
                                    <code>verify(zkp_proof, did:web:france.identite) == TRUE</code>
                                </div>
                                <div style={{ fontSize: '11px', color: '#059669', marginTop: '8px', padding: '6px', background: '#D1FAE5', borderRadius: '4px' }}>
                                    <strong>Privacy Focus:</strong> Ancrage de la session de calcul sécurisé synchronisé sur la blockchain EBSI (Testnet). Aucune donnée brute partagée.
                                </div>
                            </>
                        ) : hasPresentationScanned ? (
                            <>
                                <p className="text-orange" style={{ color: '#F59E0B' }}>Attente de Signature EUDI Wallet...</p>
                                <div className="zkp-animation">
                                    <div className="zkp-node"></div>
                                    <div className="zkp-link"></div>
                                    <div className="zkp-node"></div>
                                </div>
                            </>
                        ) : hasPresentationReq ? (
                            <p className="text-blue" style={{ color: '#3B82F6' }}>Demande de présentation initiée (QR généré)</p>
                        ) : (
                            <p className="opacity-50">Aucune demande ZKP / No ZKP Request</p>
                        )}
                    </div>
                </div>

                {/* Simulated x402 block */}
                <div className={`protocol-block ${hasX402 ? 'active' : ''}`} style={{ marginTop: '20px' }}>
                    <div className="block-title">Protocol x402 (Compute Micropayment)</div>
                    <div className="block-body">
                        {hasX402 ? (
                            <>
                                <p className="text-orange">{t[lang].x402_detect}</p>
                                <div className="transaction-bar">
                                    <span className="tx-hash">0x9a4f...31bc</span>
                                    <span className="tx-amount">3.50 EURC</span>
                                    <span className="tx-status success">✓ CONFIRMED</span>
                                </div>
                            </>
                        ) : (
                            <p className="opacity-50">En attente / Waiting...</p>
                        )}
                    </div>
                </div>

                {/* Simulated AP2 Payment Execution */}
                <div className={`protocol-block ${events.includes('payment.execution.started') ? 'active' : ''}`} style={{ marginTop: '20px' }}>
                    <div className="block-title">AP2 Serverless Compute Settlement</div>
                    <div className="block-body">
                        {events.includes('payment.execution.started') ? (
                            <p style={{ color: '#0EA5E9', fontWeight: 600 }}>Règlement de calcul souverain par API autorisé et validé par consensus...</p>
                        ) : (
                            <p className="opacity-50">Non-initié / Uninitiated</p>
                        )}
                    </div>
                </div>

                {/* Simulated SBT issuance */}
                <div className={`protocol-block ${hasSBT ? 'active blast' : ''}`} style={{ marginTop: '20px', borderColor: hasSBT ? 'var(--success-green)' : '' }}>
                    <div className="block-title">Sovereign Compute Credential (SBT)</div>
                    <div className="block-body">
                        {hasSBT ? (
                            <>
                                <p className="text-green" style={{ color: '#10B981', fontWeight: 600 }}>{t[lang].sbt_minted}</p>
                                <div className="sbt-card">
                                    <div className="sbt-header">
                                        <span>ATOS SOVEREIGN MINT</span>
                                        <span>ERC-5114</span>
                                    </div>
                                    <div className="sbt-content">
                                        <div className="sbt-seal">🛡️</div>
                                        <div>
                                            <p>Compute Proof Hash:</p>
                                            <p className="hash-text">0x74c93a...df92</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="opacity-50">Aucun jeton de preuve / No proof token</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
