export const t = {
    fr: {
        console_title: "Console IA - Agent Atos Souverain",
        ledger_title: "Architecture Ledger & Registre Actif",
        status_idle: "En attente d'intention...",
        event_intent_created: "Détection d'anomalie de logs. Chiffrement local des données & Récupération des secrets d'enclave...",
        event_execution_started: "Délégation validée. Appel de l'API de Calcul Souverain (Serverless HuggingFace Mistral-7B)...",
        event_merchant_confirmed: "Paiement de calcul AP2 finalisé. Inférence validée par consensus cryptographique décentralisé.",
        event_purchase_completed: "Transaction close. Reçu SBT de calcul souverain émis et archivé dans le Wallet.",
        event_revoked: "ACTION INTERROMPUE : MANDAT RÉVOQUÉ PAR LE CITOYEN",
        x402_detect: "Mur de paiement de ressources détecté. Négociation micro-paiement éphémère (AP2).",
        sbt_minted: "Jeton de preuve de calcul souverain (SBT) émis sur le registre."
    },
    en: {
        console_title: "AI Console - Atos Sovereign Agent",
        ledger_title: "Ledger Architecture & Active Registry",
        status_idle: "Waiting for intent...",
        event_intent_created: "Log anomaly detected. Encrypting payload locally & loading enclave secrets...",
        event_execution_started: "Delegation approved. Calling Sovereign Serverless Compute API (HuggingFace Mistral-7B)...",
        event_merchant_confirmed: "AP2 Compute Payment settled. Inference verified via decentralized cryptographic consensus.",
        event_purchase_completed: "Transaction closed. Sovereign compute SBT receipt issued and saved in the Wallet.",
        event_revoked: "ACTION INTERRUPTED: MANDATE REVOKED BY CITIZEN",
        x402_detect: "Compute resource paywall detected. Negotiating ephemeral micropayments (AP2).",
        sbt_minted: "Sovereign compute proof token (SBT) minted on the ledger."
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
