import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { SagaOrchestrator } from '../../services/saga.orchestrator';
import { eventBus } from '../../services/event.bus';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    delegationMandate: { update: jest.fn() }
  }))
}));

describe('Saga Chaos & Resilience Engineering', () => {
    let orchestrator: SagaOrchestrator;

    beforeEach(() => {
        orchestrator = new SagaOrchestrator();
        jest.clearAllMocks();
        eventBus.removeAllListeners();
        orchestrator['registerListeners']();
    });

    test('State Machine Idempotency against Duplicate/Out-of-Order Events', () => {
        const intentId = 'chaos_dup_1';
        
        // Chaos 1: Duplicate initialization events
        eventBus.publish('payment.intent.created', { intent_id: intentId, mandate_id: 'm1', amount: 100 });
        eventBus.publish('payment.intent.created', { intent_id: intentId, mandate_id: 'm1', amount: 100 });
        
        expect(orchestrator.getSagaStatus(intentId)).toBe('PENDING'); // No crash, no corruption

        // Normal transition
        eventBus.publish('payment.execution.started', { intent_id: intentId, rail: 'SEPA' });
        expect(orchestrator.getSagaStatus(intentId)).toBe('EXECUTING');

        // Chaos 2: Late/Out-of-Order previous state events arrive from slow message queue
        eventBus.publish('payment.intent.created', { intent_id: intentId, mandate_id: 'm1', amount: 100 });
        
        // Resilience: Should ignore backwards transitions and stay EXECUTING
        expect(orchestrator.getSagaStatus(intentId)).toBe('EXECUTING'); 

        // Chaos 3: Duplicate transition from EXECUTING
        eventBus.publish('payment.execution.completed', { intent_id: intentId });
        eventBus.publish('payment.execution.completed', { intent_id: intentId });

        expect(orchestrator.getSagaStatus(intentId)).toBe('MERCHANT_CONFIRMATION_PENDING');
    });
});
