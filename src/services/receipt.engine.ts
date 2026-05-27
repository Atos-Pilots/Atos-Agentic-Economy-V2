import { eventBus } from './event.bus';

export interface ReceiptData {
    intent_id: string;
    mandate_id: string;
    amount?: number;
    currency?: string;
    rail?: string;
    selected_brand?: string;
    retailer_id?: string;
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
    selected_brand: string;
}

export interface GreenImpactNft {
    token_id: string;
    owner: string;
    greenCheckoutsCount: number;
    tier: 'Seedling' | 'Sapling' | 'Gold Forest';
    title: string;
    description: string;
    updatedAt: string;
}

export class ReceiptEngine {
    private receipts: StoredReceipt[] = [];
    private greenCheckoutsCount: number = 0;

    constructor() {
        this.registerListeners();
    }

    private registerListeners() {
        eventBus.subscribe('purchase.completed', (data: ReceiptData) => {
            const receipt = this.issueVerifiableReceipt(data);
            this.receipts.unshift(receipt);
            
            // Check if green merchant
            const isGreen = data.retailer_id === 'FastFerry E-Commerce' || data.retailer_id?.includes('FastFerry');
            if (isGreen) {
                this.greenCheckoutsCount++;
                console.log(`[Receipt Engine] 🌱 Green checkout registered! Count is now ${this.greenCheckoutsCount}`);
            }
        });
    }

    public issueVerifiableReceipt(data: ReceiptData): StoredReceipt {
        const issuedAt = new Date().toISOString();
        const vcHash = `0x${data.intent_id.replace(/-/g, '').slice(0, 32)}`;
        const sbtTokenId = `sbt_${Date.now()}`;
        const brand = data.selected_brand || 'CB';

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
                "settlementRail": data.rail || 'UNKNOWN',
                "cardBrand": brand
            },
            "proof": {
                "type": "Ed25519Signature2020",
                "proofPurpose": "assertionMethod",
                "verificationMethod": "did:web:antigravity.merchant#key-1",
                "signatureValue": `zMockSig_${Math.random().toString(36).substring(2, 10)}`
            }
        };

        console.log(`[Receipt Engine] ✅ FORGED VC for ${data.intent_id} — ${data.amount} ${data.currency || 'EUR'} on ${data.rail} with brand ${brand}`);
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
            sbt_uri: `ipfs://receipt_${data.intent_id}`,
            selected_brand: brand
        };
    }

    public getReceipts(): StoredReceipt[] {
        return this.receipts;
    }

    public getGreenImpactNft(): GreenImpactNft {
        let tier: 'Seedling' | 'Sapling' | 'Gold Forest' = 'Seedling';
        let title = 'Jeune Pousse (Seedling)';
        let description = 'Niveau 1 : Émissions de carbone compensées via des checkouts verts.';
        
        if (this.greenCheckoutsCount >= 3) {
            tier = 'Gold Forest';
            title = "Forêt d'Or (Gold Forest)";
            description = 'Niveau Élite : Champion de la compensation carbone de l’économie agentique Atos.';
        } else if (this.greenCheckoutsCount >= 2) {
            tier = 'Sapling';
            title = 'Arbrisseau (Sapling)';
            description = 'Niveau 2 : Engagement continu avec compensation carbone de vos trajets.';
        }

        return {
            token_id: 'atos_green_impact_sbt_001',
            owner: 'did:key:user_wallet',
            greenCheckoutsCount: this.greenCheckoutsCount,
            tier,
            title,
            description,
            updatedAt: new Date().toISOString()
        };
    }
    
    public incrementGreenCheckouts() {
        this.greenCheckoutsCount++;
    }
}

export const receiptEngine = new ReceiptEngine();
