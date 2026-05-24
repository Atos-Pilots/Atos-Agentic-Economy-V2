import { EventEmitter } from 'events';

// Valid events based on specs
export type AgenticEvents = 
  | 'wallet.consent.requested'
  | 'wallet.sca.validated'
  | 'mandate.generated'
  | 'payment.intent.created'
  | 'payment.execution.started'
  | 'payment.execution.completed'
  | 'merchant.order.confirmed'
  | 'purchase.completed'
  | 'mandate.revoked'
  | 'intent.captured'
  | 'search.started'
  | 'search.failed'
  | 'offers.received'
  | 'offer.selected'
  | 'presentation.requested'
  | 'presentation.scanned'
  | 'presentation.consent.approved'
  | 'presentation.consent.rejected'
  | 'presentation.generated'
  | 'presentation.verified'
  | 'presentation.expired';

class AppEventBus extends EventEmitter {
  public publish(event: AgenticEvents, payload: any): void {
    console.log(`[EventBus] Publishing event: ${event}`, payload);
    this.emit(event, payload);
    
    // Broadcast for generic telemetry listeners (like SSE Vivatech Dashboard)
    this.emit('telemetry:*', { type: event, payload, timestamp: new Date().toISOString() });
  }

  public subscribe(event: AgenticEvents, listener: (...args: any[]) => void): void {
    this.on(event, listener);
  }
}

export const eventBus = new AppEventBus();
