import { Request, Response } from 'express';
import { eventBus } from '../services/event.bus';
import axios from 'axios';

export class ConsentController {
    
    private lastPushRequest: any = null;

    // POST /consent/request
    public async requestConsent(req: Request, res: Response): Promise<void> {
        try {
            const { amount, merchant, intent_id } = req.body;
            console.log(`[Push Server] Sending consent push notification to Wallet for ${amount} EUR to ${merchant}`);
            
            this.lastPushRequest = { amount, merchant, intent_id, timestamp: Date.now() };
            
            eventBus.publish('wallet.consent.requested', { amount, merchant, intent_id });
            res.json({ success: true, message: 'Push notification sent to Secure Wallet.' });
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    }

    // GET /consent/remote/pending
    public async getPendingRemoteRequests(req: Request, res: Response): Promise<void> {
        res.json({ success: true, request: this.lastPushRequest });
    }
    
    // GET /consent/pending
    public async getPendingProposals(req: Request, res: Response): Promise<void> {
        res.json({ success: true, proposals: [] });
    }

    // POST /consent/approve/:id
    public async approveProposal(req: Request, res: Response): Promise<void> {
        res.status(404).json({ error: 'Proposals not supported in V2 standalone' });
    }

    // POST /consent/execute-remote
    public async executeRemotePayment(req: Request, res: Response): Promise<void> {
        try {
            const { mandate_id, amount, rail } = req.body;
            console.log(`[Consent] Remote EUDI Wallet (FaceID SCA) approved execution: mandate=${mandate_id}, amount=${amount}`);

            const transactionIntentId = `remote_${Date.now()}`;
            
            eventBus.publish('payment.intent.created', { 
                intent_id: transactionIntentId, 
                mandate_id, 
                amount 
            });

            const port = process.env.PORT || 3000;
            const ap2Res = await axios.post(`http://localhost:${port}/v1/ap2/payment-intents/${transactionIntentId}/confirm`, {
                amount,
                currency: 'EUR',
                rail: rail || 'SEPA'
            });

            res.json({ success: true, execution: ap2Res.data });
        } catch (e: any) {
             res.status(500).json({ error: 'Remote AP2 execution failed: ' + e.message });
        }
    }
}
