import { Request, Response } from 'express';
import { presentationService } from '../services/presentation.service';
import { eventBus } from '../services/event.bus';
import axios from 'axios';

export class RetailerController {
    
    // POST /retailer/presentation-request
    // Called by the Retailer Terminal to generate a QR Content
    public async requestPresentation(req: Request, res: Response): Promise<void> {
        try {
            const { retailer_id, use_case, attributes, require_payment, amount, currency, scope } = req.body;
            
            const session = await presentationService.createPresentationRequest(
                retailer_id || 'retailer:demo:01',
                use_case || 'AGE_GATE_PAYMENT',
                attributes || ['age_over_18'],
                require_payment || false,
                amount,
                currency,
                scope
            );

            // payload for the QR Code
            const host = req.get('host') || 'localhost:3000';
            const protocol = host.includes('azurewebsites.net') ? 'https' : 'http';

            const qrPayload = {
                type: 'EUDI_PRESENTATION_REQUEST',
                nonce: session.session_nonce,
                endpoint: `${protocol}://${host}/v1/wallet/scan-request`
            };

            res.json({ success: true, session, qrPayload });
        } catch (e: any) {
            console.error("[RetailerController] Error in requestPresentation:", e);
            res.status(500).json({ error: e.message });
        }
    }

    // POST /retailer/verify-presentation
    // Called when the terminal polls or receives success from wallet, and executes payment if combined
    public async verifyPresentation(req: Request, res: Response): Promise<void> {
        try {
            const { nonce, amount, currency } = req.body;

            const verification = await presentationService.verifyPresentation(nonce);
            if (!verification.verified) {
                res.status(400).json({ error: 'Verification failed', details: verification.reason });
                return;
            }

            const session = verification.session!;

            // If a payment was requested and combined in this session, trigger AP2 directly from here
            // using the unified transaction intent
            let executionData = null;
            if (session.payment_combined) {
                console.log(`[Retailer] ZKP Verified. Triggering AP2 auto-execution for session ${nonce}`);

                // Emulate AP2 Confirm
                const port = process.env.PORT || 3000;
                const ap2Res = await axios.post(`http://localhost:${port}/v1/ap2/payment-intents/${nonce}/confirm`, {
                    amount: amount || 0,
                    currency: currency || 'EUR',
                    rail: 'SEPA'
                });

                // Auto confirm merchant order to close the AP2 Saga and generate the SBT Receipt
                setTimeout(() => {
                    eventBus.publish('merchant.order.confirmed', { intent_id: nonce, amount: amount || 0, currency: currency || 'EUR', rail: 'SEPA' });
                }, 1000);

                executionData = ap2Res.data;
            }

            res.json({ success: true, session, executionData });
        } catch (e: any) {
            console.error("[RetailerController] Error in verifyPresentation:", e);
            res.status(500).json({ error: e.message });
        }
    }
}
