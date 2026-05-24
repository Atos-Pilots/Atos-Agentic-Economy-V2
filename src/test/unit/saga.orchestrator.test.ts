import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { SagaOrchestrator, SagaStatus } from '../../services/saga.orchestrator';
import { eventBus } from '../../services/event.bus';

// Mock DB Driver
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    delegationMandate: { update: jest.fn() }
  }))
}));

describe('Saga Orchestrator State Machine', () => {
    let orchestrator: SagaOrchestrator;
    
    // Provide a short timeout mock
    jest.useFakeTimers();

    beforeEach(() => {
        // Fresh orchestrator specifically for the test, bypassing the global singleton to isolate state
        orchestrator = new SagaOrchestrator();
        jest.clearAllMocks();
        // Since eventBus is a singleton across tests natively, we remove all listeners added by other tests
        eventBus.removeAllListeners();
        // Re-inject listener via private constructor
        orchestrator['registerListeners']();
    });

    test('Valid execution sequence (PENDING -> EXECUTING -> MERCHANT_CONFIRMATION_PENDING -> COMPLETED)', () => {
        const intentId = 'test_intent_1';
        
        eventBus.publish('payment.intent.created', { intent_id: intentId, mandate_id: 'm1', amount: 100 });
        expect(orchestrator.getSagaStatus(intentId)).toBe('PENDING');

        eventBus.publish('payment.execution.started', { intent_id: intentId, rail: 'SEPA' });
        expect(orchestrator.getSagaStatus(intentId)).toBe('EXECUTING');

        eventBus.publish('payment.execution.completed', { intent_id: intentId });
        expect(orchestrator.getSagaStatus(intentId)).toBe('MERCHANT_CONFIRMATION_PENDING');

        eventBus.publish('merchant.order.confirmed', { intent_id: intentId });
        expect(orchestrator.getSagaStatus(intentId)).toBe('COMPLETED');
    });

    test('Rollback Compensation Sequence on Merchant Timeout', async () => {
        const intentId = 'test_intent_timeout';
        
        eventBus.publish('payment.intent.created', { intent_id: intentId, mandate_id: 'm1', amount: 100 });
        eventBus.publish('payment.execution.started', { intent_id: intentId, rail: 'STABLECOIN_EURC' });
        eventBus.publish('payment.execution.completed', { intent_id: intentId });
        
        expect(orchestrator.getSagaStatus(intentId)).toBe('MERCHANT_CONFIRMATION_PENDING');

        // Fast forward 5 seconds
        jest.advanceTimersByTime(5000);

        // Awaiting any microtasks since the compensation utilizes Promises.
        await Promise.resolve(); 

        expect(orchestrator.getSagaStatus(intentId)).toBe('COMPENSATION_REQUIRED');
        
        // Fast-forward simulated network timeout for rollback settlement
        jest.advanceTimersByTime(600);
        await Promise.resolve();

        expect(orchestrator.getSagaStatus(intentId)).toBe('COMPENSATED');
    });

    test('Circuit Breaker (Panic Button) cancels active matching intents', async () => {
        const i1 = 'pi_1';
        const i2 = 'pi_2';
        
        eventBus.publish('payment.intent.created', { intent_id: i1, mandate_id: 'mandate_compromised', amount: 50 });
        eventBus.publish('payment.intent.created', { intent_id: i2, mandate_id: 'mandate_compromised', amount: 75 });
        
        eventBus.publish('mandate.revoked', { mandate_id: 'mandate_compromised' });

        await Promise.resolve();

        expect(orchestrator.getSagaStatus(i1)).toBe('CANCELLED');
        expect(orchestrator.getSagaStatus(i2)).toBe('CANCELLED');
        expect(orchestrator.isSagaCancelled(i1)).toBe(true);
    });
});
