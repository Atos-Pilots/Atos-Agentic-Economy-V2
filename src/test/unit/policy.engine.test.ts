import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { PolicyEngine } from '../../services/policy.engine';
import { AuthorizedRail } from '../../models/types';

// Let's mock Prisma specifically for the test cases
let mockMandateData: any = null;

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    delegationMandate: {
      findUnique: jest.fn().mockImplementation(() => Promise.resolve(mockMandateData))
    }
  }))
}));

describe('Policy Engine Security Boundaries', () => {
    let engine: PolicyEngine;

    beforeEach(() => {
        engine = new PolicyEngine();
    });

    test('Rejects missing mandate', async () => {
        mockMandateData = null; // simulate nonexistent/invalid DB return
        const result = await engine.evaluateExecution('invalid_abc', 50, AuthorizedRail.SEPA);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('Mandate not found');
    });

    test('Rejects revoked mandate instantly', async () => {
        mockMandateData = { status: 'REVOKED', max_amount: 100, authorized_rails: 'SEPA', currency: 'EUR' };
        const result = await engine.evaluateExecution('m_123', 50, AuthorizedRail.SEPA);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('status is REVOKED');
    });

    test('Rejects amounts strictly exceeding the crypto ceiling', async () => {
        mockMandateData = { status: 'ACTIVE', max_amount: 250, authorized_rails: 'SEPA,STABLECOIN_EURC', currency: 'EUR' };
        const result = await engine.evaluateExecution('m_123', 251, AuthorizedRail.STABLECOIN_EURC); // Amount is 251, Ceiling is 250
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('exceeds maximum authorized amount 250');
    });

    test('Rejects unauthorized rails', async () => {
        mockMandateData = { status: 'ACTIVE', max_amount: 1000, authorized_rails: 'SEPA,BITCOIN', currency: 'EUR' };
        const result = await engine.evaluateExecution('m_123', 25, AuthorizedRail.STABLECOIN_EURC); // Rail not listed!
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('not within authorized rails');
    });

    test('Permits valid constraints', async () => {
        mockMandateData = { status: 'ACTIVE', max_amount: 500, authorized_rails: 'SEPA', currency: 'EUR' };
        const result = await engine.evaluateExecution('m_123', 500, AuthorizedRail.SEPA); // Max amount exact match
        expect(result.allowed).toBe(true);
        expect(result.intentId).toBeDefined();
    });
});
