import { Request, Response } from 'express';
import { policyEngine } from '../services/policy.engine';
import { AuthorizedRail } from '../models/types';
import { worldlineConnector } from '../connectors/worldline.connector';
import { eventBus } from '../services/event.bus';

export class Ap2Controller {
    
    // POST /ap2/payment-intents
    public async createIntent(req: Request, res: Response): Promise<void> {
        res.json({ success: true, payment_intent_id: `pi_${Date.now()}_ap2` });
    }

    // POST /ap2/payment-intents/:id/authorize
    public async authorizeIntent(req: Request, res: Response): Promise<void> {
        try {
            const { mandate_id, amount, rail } = req.body;
            const { id } = req.params;

            // 1. Enforce validation against the Mandate (DelegationMandate)
            const evaluation = await policyEngine.evaluateExecution(mandate_id, amount, rail as AuthorizedRail);
            
            if (!evaluation.allowed) {
                res.status(403).json({ success: false, reason: evaluation.reason });
                return;
            }

            res.json({ success: true, status: 'AUTHORIZED', authorized_amount: amount, intent_id: evaluation.intentId });
        } catch (e: any) {
             res.status(500).json({ error: e.message });
        }
    }

    // POST /ap2/payment-intents/:id/confirm
    public async confirmIntent(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { amount, currency, rail } = req.body;

            let txData;

            // Execute actual network routes based on AP2 negotiated rail
            if (rail === AuthorizedRail.SEPA) {
                // SEPA
                txData = await worldlineConnector.initiateSepaTransfer(amount, currency, `idem_${id}`);
            } else if (rail === AuthorizedRail.STABLECOIN_EURC) {
                // EURC
                const { eurcConnector } = require('../connectors/eurc.connector');
                txData = await eurcConnector.initiateStablecoinTransfer(amount, '0xMerchantAddressMock');
            } else if (rail === AuthorizedRail.BITCOIN) {
                // BITCOIN
                const { bitcoinConnector } = require('../connectors/bitcoin.connector');
                txData = await bitcoinConnector.initiateBitcoinTransfer(amount, 'did:web:merchant');
            } else {
                throw new Error(`Unsupported payment rail: ${rail}`);
            }
                
            eventBus.publish('payment.execution.started', { intent_id: id, rail });
            
            // Simulating AP2 bridging completion
            console.log(`[AP2 Facade] Execution succeeded on rail ${rail}`);
            eventBus.publish('payment.execution.completed', { intent_id: id });

            // Auto merchant order confirmation — closes the Saga and triggers SBT issuance
            // (In production this would be a callback/webhook from the merchant system)
            const confirmedAmount = amount;
            const confirmedCurrency = currency;
            setTimeout(() => {
                eventBus.publish('merchant.order.confirmed', { 
                    intent_id: id, 
                    amount: confirmedAmount,
                    currency: confirmedCurrency,
                    rail 
                });
            }, 1500);

            res.json({ success: true, status: 'SUCCEEDED', transaction: txData });
        } catch (e: any) {
             res.status(500).json({ error: e.message });
        }
    }

    // POST /ap2/payment-intents/:id/cancel
    public async cancelIntent(req: Request, res: Response): Promise<void> {
        res.json({ success: true, status: 'CANCELLED' });
    }

    // GET /ap2/payment-intents/:id
    public async getIntent(req: Request, res: Response): Promise<void> {
        res.json({ success: true, intent: { id: req.params.id, status: 'UNKNOWN' } }); // Mock
    }

    // POST /ap2/payment-intents/:id/receipts
    public async uploadReceipt(req: Request, res: Response): Promise<void> {
        res.json({ success: true, message: 'Receipt attached to payment intent.' });
    }
}
