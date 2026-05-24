import { eventBus } from './event.bus';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type SagaStatus = 'PENDING' | 'PRESENTATION_REQUEST_DISPLAYED' | 'PRESENTATION_VERIFIED' | 'EXECUTING' | 'MERCHANT_CONFIRMATION_PENDING' | 'COMPLETED' | 'COMPENSATION_REQUIRED' | 'COMPENSATED' | 'CANCELLED' | 'REJECTED';

export class SagaOrchestrator {
  private activeSagas: Map<string, { status: SagaStatus; mandate_id: string; rail?: string; amount?: number }> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.registerListeners();
  }

  private registerListeners() {
    eventBus.subscribe('payment.intent.created', (payload: { intent_id: string; mandate_id: string; amount: number }) => {
      if (this.activeSagas.has(payload.intent_id)) {
          console.warn(`[Saga] Ignored duplicate payment intent creation for ${payload.intent_id} (Idempotency shield).`);
          return;
      }
      this.activeSagas.set(payload.intent_id, { status: 'PENDING', mandate_id: payload.mandate_id, amount: payload.amount });
      console.log(`[Saga] Payment intent ${payload.intent_id} registered and pending.`);
    });

    // unified V2 presentation session tracking
    eventBus.subscribe('presentation.scanned', (payload: { nonce: string }) => {
        console.log(`[Saga] Presentation session ${payload.nonce} scanned by wallet. Waiting user consent...`);
        this.activeSagas.set(payload.nonce, { status: 'PRESENTATION_REQUEST_DISPLAYED', mandate_id: 'none' });
    });

    eventBus.subscribe('presentation.consent.rejected', (payload: { nonce: string }) => {
        const saga = this.activeSagas.get(payload.nonce);
        if (saga) {
            saga.status = 'REJECTED';
            this.activeSagas.set(payload.nonce, saga);
            console.warn(`[Saga] User REJECTED presentation for session ${payload.nonce}`);
        }
    });

    eventBus.subscribe('presentation.verified', (payload: { nonce: string }) => {
        const saga = this.activeSagas.get(payload.nonce);
        if (saga) {
            saga.status = 'PRESENTATION_VERIFIED';
            this.activeSagas.set(payload.nonce, saga);
            console.log(`[Saga] ZKP & Payload VERIFIED for session ${payload.nonce}`);
        }
    });

    eventBus.subscribe('payment.execution.started', (payload: { intent_id: string; rail: string }) => {
      const saga = this.activeSagas.get(payload.intent_id);
      if (saga && saga.status !== 'CANCELLED') {
        saga.status = 'EXECUTING';
        saga.rail = payload.rail;
        this.activeSagas.set(payload.intent_id, saga);
        console.log(`[Saga] Payment intent ${payload.intent_id} executing on rail ${payload.rail}.`);
      }
    });

    eventBus.subscribe('payment.execution.completed', (payload: { intent_id: string }) => {
        const saga = this.activeSagas.get(payload.intent_id);
        if (saga && saga.status === 'EXECUTING') {
            saga.status = 'MERCHANT_CONFIRMATION_PENDING';
            this.activeSagas.set(payload.intent_id, saga);
            console.log(`[Saga] Intent ${payload.intent_id} payment complete. Waiting for Merchant Confirmation...`);
            
            // Timeout Watch (e.g. 5 seconds for demonstration)
            const timeout = setTimeout(() => this.triggerCompensation(payload.intent_id), 5000);
            this.timers.set(payload.intent_id, timeout);
        }
    });

    eventBus.subscribe('merchant.order.confirmed', (payload: { intent_id: string; amount?: number; currency?: string; rail?: string }) => {
        const saga = this.activeSagas.get(payload.intent_id);
        if (saga && saga.status === 'MERCHANT_CONFIRMATION_PENDING') {
            clearTimeout(this.timers.get(payload.intent_id));
            this.timers.delete(payload.intent_id);
            saga.status = 'COMPLETED';
            this.activeSagas.set(payload.intent_id, saga);
            console.log(`[Saga] Merchant Confirmed! Intent ${payload.intent_id} is COMPLETED successfully.`);
            
            // Trigger the verifiable receipt engine with full data
            eventBus.publish('purchase.completed', {
                intent_id: payload.intent_id,
                amount: payload.amount ?? saga.amount,
                currency: payload.currency ?? 'EUR',
                rail: payload.rail ?? saga.rail,
                mandate_id: saga.mandate_id
            });
        }
    });

    eventBus.subscribe('mandate.revoked', async (payload: { mandate_id: string }) => {
      console.warn(`[Saga Circuit Breaker] Mandate ${payload.mandate_id} revoked! Cancelling matching sagas.`);
      await prisma.delegationMandate.update({
        where: { mandate_id: payload.mandate_id },
        data: { status: 'REVOKED' }
      });

      for (const [intent_id, saga] of this.activeSagas.entries()) {
        if (saga.mandate_id === payload.mandate_id) {
          saga.status = 'CANCELLED';
          this.activeSagas.set(intent_id, saga);
          console.error(`[Saga Circuit Breaker] TRIPPED! Payment intent ${intent_id} cancelled mid-flight.`);
        }
      }
    });
  }

  private async triggerCompensation(intent_id: string) {
      const saga = this.activeSagas.get(intent_id);
      if (!saga || saga.status !== 'MERCHANT_CONFIRMATION_PENDING') return;

      saga.status = 'COMPENSATION_REQUIRED';
      this.activeSagas.set(intent_id, saga);
      console.warn(`[Saga Rollback] TIME OUT! Merchant did not confirm order for ${intent_id}. Triggering Compensation.`);

      // Simulated automated refund
      console.log(`[Saga Rollback] Refunding on rail ${saga.rail}...`);
      await new Promise(r => setTimeout(r, 600));

      saga.status = 'COMPENSATED';
      this.activeSagas.set(intent_id, saga);
      console.log(`[Saga Rollback] Saga for ${intent_id} successfully reversed to status COMPENSATED.`);
  }

  public isSagaCancelled(intent_id: string): boolean {
    return this.activeSagas.get(intent_id)?.status === 'CANCELLED';
  }

  // Exposed strictly for Unit Testing Assertions
  public getSagaStatus(intent_id: string): SagaStatus | undefined {
      return this.activeSagas.get(intent_id)?.status;
  }
}

// Export singleton instance
export const sagaOrchestrator = new SagaOrchestrator();
