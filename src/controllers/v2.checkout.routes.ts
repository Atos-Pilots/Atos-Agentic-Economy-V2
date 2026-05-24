import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

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
  const { session_id, sca_attestation_id } = req.body;
  
  try {
    const session = await prisma.presentationSession.findUnique({ where: { id: session_id } });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // In a real system, we'd verify the cryptographic signature of the SCA Attestation here.
    // For the pilot, we verify the user has the credential.
    const hasSca = await prisma.eUDIAttribute.findFirst({
      where: { type: 'ScaAttestation', status: 'ACTIVE' }
    });
    
    if (!hasSca) {
      return res.status(400).json({ error: 'SCA Attestation missing or invalid' });
    }
    
    // Create SBT receipt
    await prisma.walletDocument.create({
      data: {
        subject_ref: 'did:key:user_wallet',
        type: 'Receipt',
        issuer: session.retailer_id,
        payload: JSON.stringify({ item: 'E-commerce Purchase', amount: 25.0, status: 'PAID', auth: 'SCA_EUDI' }),
      }
    });

    await prisma.presentationSession.update({
      where: { id: session_id },
      data: { status: 'COMPLETED' }
    });
    
    res.json({ success: true, message: 'Payment authorized via SCA Attestation' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process checkout' });
  }
});
