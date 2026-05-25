import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { eventBus } from '../services/event.bus';

export const checkoutV2Router = Router();
const prisma = new PrismaClient();

// Create a fast checkout session
checkoutV2Router.post('/session', async (req, res) => {
  const { retailer_name, amount, requested_attributes } = req.body;
  const nonce = uuidv4();
  
  try {
    const session = await prisma.presentationSession.create({
      data: {
        session_nonce: nonce,
        retailer_id: retailer_name || 'E-Commerce Merchant',
        use_case: 'FAST_CHECKOUT',
        requested_attributes: (requested_attributes || []).join(','),
        payment_requested: true,
        expires_at: new Date(Date.now() + 15 * 60 * 1000)
      }
    });
    
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Submit the wallet's cryptographic proof (SCA Attestation)
checkoutV2Router.post('/submit', async (req, res) => {
  const { session_id, sca_attestation_id, amount } = req.body;
  
  try {
    const session = await prisma.presentationSession.findUnique({ where: { id: session_id } });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // We only require SCA Attestation if the session requested it (e.g. FastFerry)
    const requiresSca = session.requested_attributes.includes('ScaAttestation');
    if (requiresSca) {
      const hasSca = await prisma.eUDIAttribute.findFirst({
        where: { type: 'ScaAttestation', status: 'ACTIVE' }
      });
      if (!hasSca) {
        return res.status(400).json({ error: 'SCA Attestation missing or invalid. Please complete Banque enrollment first.' });
      }
    } else {
      // For other scenarios, we verify the user has an IdentityCredential (which is seeded by default)
      const hasIdentity = await prisma.eUDIAttribute.findFirst({
        where: { type: 'IdentityCredential', status: 'ACTIVE' }
      });
      if (!hasIdentity) {
        return res.status(400).json({ error: 'Identity Credential missing or invalid.' });
      }
    }
    
    const finalAmount = amount || 25.0;
    
    // Create SBT receipt
    await prisma.walletDocument.create({
      data: {
        subject_ref: 'did:key:user_wallet',
        type: 'Receipt',
        issuer: session.retailer_id,
        payload: JSON.stringify({ item: 'E-commerce Purchase', amount: finalAmount, status: 'PAID', auth: 'SCA_EUDI' }),
      }
    });

    await prisma.presentationSession.update({
      where: { id: session_id },
      data: { status: 'COMPLETED' }
    });
    
    // Publish telemetry event for instant Wallet receipts stream update
    eventBus.publish('purchase.completed', {
      intent_id: session.session_nonce,
      mandate_id: sca_attestation_id || 'ewc_direct_sca',
      amount: finalAmount,
      currency: 'EUR',
      rail: 'EUDI SCA Attestation'
    });
    
    res.json({ success: true, message: 'Payment authorized via SCA Attestation' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process checkout' });
  }
});

// Poll session status for V2 retailer terminal
checkoutV2Router.get('/session/poll/:nonce', async (req, res) => {
  const { nonce } = req.params;
  try {
    const session = await prisma.presentationSession.findUnique({ where: { session_nonce: nonce } });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ success: true, status: session.status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to poll session' });
  }
});
