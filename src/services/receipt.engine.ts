import { eventBus } from './event.bus';

export interface ReceiptData {
    intent_id: string;
    mandate_id: string;
    amount?: number;
    currency?: string;
    rail?: string;
}

export interface StoredReceipt {
    intent_id: string;
    mandate_id: string;
    amount: number;
    currency: string;
    rail: string;
    issuedAt: string;
    vc_hash: string;
    sbt_token_id: string;
    sbt_uri: string;
}

export class ReceiptEngine {
    // In-memory store for this pilot (would be persisted in DB in production)
    private receipts: StoredReceipt[] = [];

    constructor() {
        this.registerListeners();
    }

    private registerListeners() {
        // When saga completes successfully, automatically forge the receipts
        eventBus.subscribe('purchase.completed', (data: ReceiptData) => {
            const receipt = this.issueVerifiableReceipt(data);
            this.receipts.unshift(receipt);
        });
    }

    public issueVerifiableReceipt(data: ReceiptData): StoredReceipt {
        const issuedAt = new Date().toISOString();
        const vcHash = `0x${data.intent_id.replace(/-/g, '').slice(0, 32)}`;
        const sbtTokenId = `sbt_${Date.now()}`;

        // Mock W3C Verifiable Credential (logged to console for auditability)
        const vc = {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential", "PurchaseReceiptCredential"],
            "issuer": "did:web:antigravity.merchant",
            "issuanceDate": issuedAt,
            "credentialSubject": {
                "id": "did:key:user",
                "paymentIntent": data.intent_id,
                "amount": data.amount || 0,
                "currency": data.currency || 'EUR',
                "settlementRail": data.rail || 'UNKNOWN'
            },
            "proof": {
                "type": "Ed25519Signature2020",
                "proofPurpose": "assertionMethod",
                "verificationMethod": "did:web:antigravity.merchant#key-1",
                "signatureValue": `zMockSig_${crypto.randomUUID().split('-')[0]}`
            }
        };

        console.log(`[Receipt Engine] ✅ FORGED VC for ${data.intent_id} — ${data.amount} ${data.currency || 'EUR'} on ${data.rail}`);
        console.log(`[Receipt Engine] ⛓️  MINED SBT ${sbtTokenId} → ipfs://receipt_${data.intent_id}`);

        return {
            intent_id: data.intent_id,
            mandate_id: data.mandate_id,
            amount: data.amount || 0,
            currency: data.currency || 'EUR',
            rail: data.rail || 'UNKNOWN',
            issuedAt,
            vc_hash: vcHash,
            sbt_token_id: sbtTokenId,
            sbt_uri: `ipfs://receipt_${data.intent_id}`
        };
    }

    public getReceipts(): StoredReceipt[] {
        return this.receipts;
    }
}

export const receiptEngine = new ReceiptEngine();
