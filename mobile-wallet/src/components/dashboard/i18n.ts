export const t = {
    fr: {
        console_title: "Console IA - Agent Atos Souverain",
        ledger_title: "Architecture Ledger & Registre Actif",
        status_idle: "En attente d'intention...",
        event_intent_created: "Analyse de l'intention utilisateur en cours : Capture locale préservant la vie privée...",
        event_execution_started: "Délégation approuvée. Vérification de la validité du mandat SD-JWT en enclave SGE...",
        event_merchant_confirmed: "Paiement AP2 finalisé. Transmission des clés de session via preuve à divulgation nulle de connaissance (ZKP).",
        event_purchase_completed: "Transaction close. Attestation infalsifiable (SBT) reçue et rattachée à l'identité souveraine.",
        event_revoked: "ACTION INTERROMPUE : MANDAT RÉVOQUÉ PAR LE CITOYEN",
        x402_detect: "Mur de paiement UCP (HTTP 402) détecté... Négociation micro-paiement (ERC-4337).",
        sbt_minted: "Soulbound Token (SBT) de preuve généré sur le registre distribué."
    },
    en: {
        console_title: "AI Console - Atos Sovereign Agent",
        ledger_title: "Ledger Architecture & Active Registry",
        status_idle: "Waiting for intent...",
        event_intent_created: "Analyzing user intent locally: Privacy-preserving edge capture in progress...",
        event_execution_started: "Delegation approved. Verifying SD-JWT mandate validity inside SGE enclave...",
        event_merchant_confirmed: "AP2 Payment completed. Transmitting session keys via Zero-Knowledge Proof (ZKP).",
        event_purchase_completed: "Transaction closed. Unforgeable receipt (SBT) received and linked to sovereign identity.",
        event_revoked: "ACTION INTERRUPTED: MANDATE REVOKED BY CITIZEN",
        x402_detect: "UCP Paywall (HTTP 402) detected... Negotiating micro-payment (ERC-4337).",
        sbt_minted: "Soulbound Token (SBT) proof minted on the distributed ledger."
    }
};

export type Lang = 'fr' | 'en';

export const translateEvent = (eventType: string, lang: Lang) => {
    switch (eventType) {
        case 'payment.intent.created': return t[lang].event_intent_created;
        case 'payment.execution.started': return t[lang].event_execution_started;
        case 'merchant.order.confirmed': return t[lang].event_merchant_confirmed;
        case 'purchase.completed': return t[lang].event_purchase_completed;
        case 'mandate.revoked': return t[lang].event_revoked;
        default: return null;
    }
};
