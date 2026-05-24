import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export const issuanceV2Router = Router();
const prisma = new PrismaClient();

issuanceV2Router.post('/issue-sca', async (req, res) => {
  try {
    const credential = await prisma.eUDIAttribute.create({
      data: {
        subject_ref: 'did:key:user_wallet',
        type: 'ScaAttestation',
        issuer: 'did:web:bank.com',
        format: 'jwt_vc_json',
        payload: JSON.stringify({ 
          iban: 'FR76 3000 0000 0000 0000 0000 000',
          auth_level: 'HIGH',
          psd2_compliant: true
        })
      }
    });
    res.json({ success: true, credential });
  } catch (error) {
    res.status(500).json({ error: 'Failed to issue SCA Attestation' });
  }
});

issuanceV2Router.post('/issue-card', async (req, res) => {
  const { type } = req.body;
  try {
    const credential = await prisma.eUDIAttribute.create({
      data: {
        subject_ref: 'did:key:user_wallet',
        type: type || 'StudentCard',
        issuer: 'did:web:university.edu',
        format: 'jwt_vc_json',
        payload: JSON.stringify({ 
          student_id: 'STU-998877',
          active: true,
          discount_eligible: true
        })
      }
    });
    res.json({ success: true, credential });
  } catch (error) {
    res.status(500).json({ error: 'Failed to issue card' });
  }
});
