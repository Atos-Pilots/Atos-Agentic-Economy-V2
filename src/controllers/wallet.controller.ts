import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { eventBus } from '../services/event.bus';
import { presentationService } from '../services/presentation.service';
import { ScanContextResponse, MandateStatus } from '../models/types';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-pilot-key-eudiv';

export class WalletController {

  public async scanPresentationRequest(req: Request, res: Response): Promise<void> {
    try {
      const { nonce } = req.body;
      const session = await presentationService.geSessionByNonce(nonce);
      res.json({ success: true, session });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  public async approvePresentation(req: Request, res: Response): Promise<void> {
    try {
      const { nonce, approved_attributes, zkp_used, intent_id } = req.body;
      const session = await presentationService.approveFromWallet(nonce, approved_attributes, zkp_used, intent_id);
      res.json({ success: true, session });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  public async listAttributes(req: Request, res: Response): Promise<void> {
    try {
      const attributes = await prisma.eUDIAttribute.findMany({
        orderBy: { created_at: 'desc' }
      });
      console.log(`[WalletController] listAttributes fetched ${attributes.length} attributes`);
      res.json({ success: true, attributes });
    } catch (e: any) {
      console.error("[WalletController] Error in listAttributes:", e);
      res.status(500).json({ error: e.message });
    }
  }

  public async listDocuments(req: Request, res: Response): Promise<void> {
    try {
      const documents = await prisma.walletDocument.findMany({
        orderBy: { created_at: 'desc' }
      });
      res.json({ success: true, documents });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  public async scanContext(req: Request, res: Response): Promise<void> {
    try {
      // In reality, this reads a QR code or AP2 deep link.
      // We mock the decoded context.
      const response: ScanContextResponse = {
        merchant_id: 'mch_lv_parfums',
        merchant_name: 'Louis Vuitton Parfums',
        requested_scope: 'urn:atos:pilot:retail:perfume',
        max_suggested_amount: 250.00
      };
      
      eventBus.publish('wallet.consent.requested', { user: 'u_123', merchant: response.merchant_id });
      res.json({ success: true, data: response });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  public async simulateSca(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, device_id } = req.body;
      // Simulating FaceID validation sequence
      const sca_timestamp = new Date();
      
      eventBus.publish('wallet.sca.validated', { user_id, device_id, sca_timestamp });
      res.json({ success: true, sca_timestamp });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  public async listMandates(req: Request, res: Response): Promise<void> {
    try {
      const mandates = await prisma.delegationMandate.findMany({
        orderBy: { mandate_id: 'desc' }
      });
      res.json({ success: true, mandates });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  public async generateMandate(req: Request, res: Response): Promise<void> {
    try {
      const {
        subject_ref,
        scope,
        max_amount,
        currency,
        authorized_rails,
        auto_execute,
        duration_days,
        sca_timestamp
      } = req.body;

      if (!subject_ref || !scope || !max_amount || !Array.isArray(authorized_rails)) {
        res.status(400).json({ error: 'Missing or invalid parameters' });
        return;
      }

      // Store in database
      const expiresAt = duration_days
        ? new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000)
        : undefined;

      const mandate = await prisma.delegationMandate.create({
        data: {
          subject_ref,
          scope,
          max_amount,
          currency: currency || 'EUR',
          authorized_rails: authorized_rails.join(','),
          liability_waiver_signed: true,
          sca_timestamp: new Date(sca_timestamp),
          auto_execute: auto_execute ?? false,
          expires_at: expiresAt,
          status: MandateStatus.ACTIVE
        }
      });

      // Generate SD-JWT (mocking standard JWT for pilot)
      const SD_JWT_MOCK = jwt.sign(
        {
          sub: mandate.subject_ref,
          iss: 'urn:atos:eudiv:wallet',
          mandate_id: mandate.mandate_id,
          scope: mandate.scope,
          max_amount: mandate.max_amount,
          rails: authorized_rails,
          _sd_alg: 'sha-256'
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      eventBus.publish('mandate.generated', { mandate_id: mandate.mandate_id });

      res.json({ success: true, data: { mandate, sd_jwt: SD_JWT_MOCK } });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }

  public async revokeMandate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Ensure mandate exists
      const existing = await prisma.delegationMandate.findUnique({ where: { mandate_id: id as string } });
      if (!existing) {
        res.status(404).json({ error: 'Mandate not found' });
        return;
      }

      // We publish the event first to instantly trip the circuit breaker.
      // The Orchestrator will handle the database update to REVOKED as well.
      eventBus.publish('mandate.revoked', { mandate_id: id });

      res.json({ success: true, message: `Panic Button activated for mandate ${id}. Circuit breaker tripped.` });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
}
