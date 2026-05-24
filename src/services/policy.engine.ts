import { PrismaClient } from '@prisma/client';
import { AuthorizedRail, MandateStatus } from '../models/types';
import { eventBus } from './event.bus';
import { sagaOrchestrator } from './saga.orchestrator';

const prisma = new PrismaClient();

export class PolicyEngine {
  /**
   * Evaluates if the agent is allowed to execute a payment on a specific rail
   */
  public async evaluateExecution(
    mandateId: string,
    requestedAmount: number,
    requestedRail: AuthorizedRail
  ): Promise<{ allowed: boolean; reason?: string; intentId?: string }> {
    
    // 1. Fetch mandate from database
    const mandate = await prisma.delegationMandate.findUnique({
      where: { mandate_id: mandateId }
    });

    if (!mandate) {
        return { allowed: false, reason: "Mandate not found." };
    }

    // 2. Check Status is ACTIVE
    if (mandate.status !== MandateStatus.ACTIVE) {
        return { allowed: false, reason: `Mandate status is ${mandate.status}, must be ACTIVE.` };
    }

    // 3. Check Amount limits
    if (requestedAmount > mandate.max_amount) {
        return { allowed: false, reason: `Requested amount ${requestedAmount} exceeds maximum authorized amount ${mandate.max_amount}.` };
    }

    // 4. Check Authorized Rails
    const authorizedRailsArray = mandate.authorized_rails.split(',') as AuthorizedRail[];
    if (!authorizedRailsArray.includes(requestedRail)) {
        return { allowed: false, reason: `Rail ${requestedRail} is not within authorized rails: ${mandate.authorized_rails}.` };
    }

    // If allowed, create a payment intent and engage the Saga orchestrator
    const intentId = `pi_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    eventBus.publish('payment.intent.created', { intent_id: intentId, mandate_id: mandateId });
    
    // Simulate processing delay between intent created and execution started
    // In a real system, the policy engine just evaluates, and another service starts execution. 
    // Here we're checking if the circuit breaker gets tripped before execution.
    if (sagaOrchestrator.isSagaCancelled(intentId)) {
      return { allowed: false, reason: "Saga was cancelled by Circuit Breaker." };
    }

    return { allowed: true, intentId };
  }
}

export const policyEngine = new PolicyEngine();
