import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { eventBus } from './event.bus';

const prisma = new PrismaClient();

export class PresentationService {
    
    // 1. Retailer creating a Presentation Request (QR Code payload generator)
    public async createPresentationRequest(retailerId: string, useCase: string, requestedAttributes: string[], requirePayment: boolean, amount?: number, currency?: string, scope?: string) {
        const nonce = uuidv4();
        
        const session = await prisma.presentationSession.create({
            data: {
                session_nonce: nonce,
                mode: 'TERMINAL_SCAN',
                retailer_id: retailerId,
                use_case: useCase,
                payment_requested: requirePayment,
                // store amount in a new field if possible, or embed in `requested_attributes` for demonstration.
                // since schema string? doesn't easily store amount, we can append it conceptually in requested_attributes:
                requested_attributes: requestedAttributes.join(',') + (requirePayment && amount ? `|AMOUNT:${amount}|CURRENCY:${currency}|SCOPE:${scope || ''}` : ''),
                expires_at: new Date(Date.now() + 5 * 60 * 1000) // 5 mins expiry
            }
        });

        eventBus.publish('presentation.requested', { nonce, useCase, retailerId });

        return session;
    }

    // 2. Wallet reading the request
    public async geSessionByNonce(nonce: string) {
        const session = await prisma.presentationSession.findUnique({ where: { session_nonce: nonce } });
        if (!session) throw new Error('Session not found or expired');
        
        if (session.expires_at.getTime() < Date.now()) {
            await prisma.presentationSession.update({ where: { session_nonce: nonce }, data: { status: 'EXPIRED' } });
            eventBus.publish('presentation.expired', { nonce });
            throw new Error('Session is expired');
        }

        eventBus.publish('presentation.scanned', { nonce });
        return session;
    }

    // 3. User approves presentation from Wallet
    public async approveFromWallet(nonce: string, approvedAttributes: string[], zkpUsed: boolean, intentId?: string) {
        const session = await prisma.presentationSession.findUnique({ where: { session_nonce: nonce } });
        if (!session) throw new Error('Session not found');

        const updated = await prisma.presentationSession.update({
            where: { session_nonce: nonce },
            data: {
                status: 'PRESENTATION_GENERATED',
                shared_attributes: approvedAttributes.join(','),
                zkp_used: zkpUsed,
                payment_combined: !!intentId
            }
        });

        const presentationPayload = {
            nonce: session.session_nonce,
            claims: approvedAttributes,
            zkp_applied: zkpUsed,
            payment_intent: intentId,
            timestamp: new Date()
        };

        eventBus.publish('presentation.consent.approved', { nonce, payload: presentationPayload });
        eventBus.publish('presentation.generated', { nonce, payload: presentationPayload });

        return updated;
    }

    // 4. Verification by Retailer Terminal
    public async verifyPresentation(nonce: string) {
        const session = await prisma.presentationSession.findUnique({ where: { session_nonce: nonce } });
        if (!session || session.status !== 'PRESENTATION_GENERATED') {
            return { verified: false, reason: 'No presentation generated or invalid status' };
        }

        // Simulating crypto verification of ZKP and signatures
        console.log(`[PresentationService] Verifying ZKP and claims for session ${nonce}`);
        
        const updatedSession = await prisma.presentationSession.update({
            where: { session_nonce: nonce },
            data: { status: 'VERIFICATION_PENDING' } // Moving directly to COMPLETED or AP2 will handle it
        });

        eventBus.publish('presentation.verified', { nonce });

        return { verified: true, session: updatedSession };
    }
}

export const presentationService = new PresentationService();
