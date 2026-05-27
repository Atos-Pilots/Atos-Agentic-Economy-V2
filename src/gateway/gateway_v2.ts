import express from 'express';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { redactionMiddleware } from './middleware/redaction.middleware';
import { chaosMiddleware } from './middleware/chaos.middleware';
import { WalletController } from '../controllers/wallet.controller';
import { policyEngine } from '../services/policy.engine';
import { eventBus } from '../services/event.bus';
import { AuthorizedRail } from '../models/types';
import { Ap2Controller } from '../controllers/ap2.controller';
import { ConsentController } from '../controllers/consent.controller';
import { UcpController } from '../controllers/ucp.controller';
import { RetailerController } from '../controllers/retailer.controller';
import { checkoutV2Router } from '../controllers/v2.checkout.routes';
import { issuanceV2Router } from '../controllers/v2.issuance.routes';
import { receiptEngine } from '../services/receipt.engine';

const gatewayApp = express();
gatewayApp.set('trust proxy', true);
gatewayApp.use(express.json());

// Enable serving static frontend for Lot 3/Review
gatewayApp.use(express.static(path.join(process.cwd(), 'public')));
gatewayApp.use('/wallet', express.static(path.join(process.cwd(), 'mobile-wallet/dist')));

// Mounting V2 routes
gatewayApp.use('/v2/checkout', checkoutV2Router);
gatewayApp.use('/v2/issuance', issuanceV2Router);

// 1. Sovereign Observability Middleware
gatewayApp.use(redactionMiddleware);

// 2. Global Rate Limiting (Disabled for Pilot / Polling)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000, // Increased from 100 to 10000 to allow demo polling
    message: 'Too many requests originating from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
gatewayApp.use('/v1/', apiLimiter);

// 3. API Versioning & Routing Configuration
const v1Router = express.Router();

// Enable chaos on the EUDI wallet subset (Failure Rate: 10%, Jitter 2500ms max)
v1Router.use('/wallet', chaosMiddleware({ failureRate: 0.10, maxLatencyMs: 2500 }));

const walletController = new WalletController();
const ucpController = new UcpController();
const ap2Controller = new Ap2Controller();
const consentController = new ConsentController();
const retailerController = new RetailerController();
const { TelemetryController } = require('../controllers/telemetry.controller');
const telemetryController = new TelemetryController();

// Telemetry (SSE) endpoint
v1Router.get('/telemetry/stream', telemetryController.stream.bind(telemetryController));

// Consent / Saga endpoints
v1Router.get('/consent/pending', consentController.getPendingProposals.bind(consentController));
v1Router.post('/consent/approve/:id', consentController.approveProposal.bind(consentController));
v1Router.post('/consent/request', consentController.requestConsent.bind(consentController));
v1Router.get('/consent/remote/pending', consentController.getPendingRemoteRequests.bind(consentController));
v1Router.post('/consent/execute-remote', consentController.executeRemotePayment.bind(consentController));

// Wallet Endpoints (BFF)
v1Router.post('/wallet/mandates/scan-context', walletController.scanContext.bind(walletController));
v1Router.post('/wallet/mandates/simulate-sca', walletController.simulateSca.bind(walletController));
v1Router.get('/wallet/mandates', walletController.listMandates.bind(walletController));
v1Router.post('/wallet/mandates/generate', walletController.generateMandate.bind(walletController));
v1Router.post('/wallet/mandates/:id/revoke', walletController.revokeMandate.bind(walletController));
v1Router.get('/wallet/receipts', (_req, res) => res.json({ success: true, receipts: receiptEngine.getReceipts() }));
v1Router.get('/wallet/fidelity-nft', (_req, res) => res.json({ success: true, nft: receiptEngine.getGreenImpactNft() }));
v1Router.get('/wallet/attributes', walletController.listAttributes.bind(walletController));
v1Router.get('/wallet/documents', walletController.listDocuments.bind(walletController));
v1Router.post('/wallet/scan-request', walletController.scanPresentationRequest.bind(walletController));
v1Router.post('/wallet/consent/approve/presentation', walletController.approvePresentation.bind(walletController));

// Retailer / Verifier Terminal Endpoints
v1Router.post('/retailer/presentation-request', retailerController.requestPresentation.bind(retailerController));
v1Router.post('/retailer/verify-presentation', retailerController.verifyPresentation.bind(retailerController));

// Universal Commerce Protocol (UCP) Endpoints
v1Router.post('/ucp/search', ucpController.search.bind(ucpController));
v1Router.post('/ucp/offers/select', ucpController.selectOffer.bind(ucpController));
v1Router.post('/ucp/cart/create', ucpController.createCart.bind(ucpController));
v1Router.post('/ucp/checkout/prepare', ucpController.prepareCheckout.bind(ucpController));
v1Router.post('/ucp/order/confirm', ucpController.confirmOrder.bind(ucpController));

// Agentic Payment Protocol (AP2) Facade Endpoints
v1Router.post('/ap2/payment-intents', ap2Controller.createIntent.bind(ap2Controller));
v1Router.get('/ap2/payment-intents/:id', ap2Controller.getIntent.bind(ap2Controller));
v1Router.post('/ap2/payment-intents/:id/authorize', ap2Controller.authorizeIntent.bind(ap2Controller));
v1Router.post('/ap2/payment-intents/:id/confirm', ap2Controller.confirmIntent.bind(ap2Controller));
v1Router.post('/ap2/payment-intents/:id/cancel', ap2Controller.cancelIntent.bind(ap2Controller));
v1Router.post('/ap2/payment-intents/:id/receipts', ap2Controller.uploadReceipt.bind(ap2Controller));

// Legacy Agent Connector Endpoint (Lot 1 simulation compat)
v1Router.post('/agent/execute-payment', async (req, res) => {
    const { mandate_id, requested_amount, requested_rail } = req.body;
    
    try {
      const evaluation = await policyEngine.evaluateExecution(mandate_id, requested_amount, requested_rail as AuthorizedRail);
      
      if (!evaluation.allowed) {
         res.status(403).json({ success: false, reason: evaluation.reason });
         return;
      }
  
      eventBus.publish('payment.execution.started', { 
          intent_id: evaluation.intentId, 
          rail: requested_rail 
      });
  
      res.json({ success: true, intent_id: evaluation.intentId, rail: requested_rail });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
});

// Mount /v1 router
gatewayApp.use('/v1', v1Router);

export { gatewayApp as app };
