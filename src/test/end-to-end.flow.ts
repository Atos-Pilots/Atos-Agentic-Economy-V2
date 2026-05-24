import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { spawn } from 'child_process';
import path from 'path';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000/v1';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSimulation() {
  console.log('=== Starting Antigravity Agentic Payment User Journey ===\n');

  // Step 1: Scan Context
  console.log('1. Scanning Merchant QR Context...');
  const ctxRes = await axios.post(`${API_URL}/wallet/mandates/scan-context`);
  console.log('  Response:', ctxRes.data.data, '\n');

  // Step 2: Simulate SCA (Biometrics)
  console.log('2. Simulating User Biometric SCA...');
  const scaRes = await axios.post(`${API_URL}/wallet/mandates/simulate-sca`, {
    user_id: 'u_123',
    device_id: 'device_007'
  });
  console.log('  SCA Validated at:', scaRes.data.sca_timestamp, '\n');

  // Step 3: Generate Mandate (SD-JWT)
  console.log('3. Generating Multi-Rail SD-JWT Mandate...');
  const genRes = await axios.post(`${API_URL}/wallet/mandates/generate`, {
    subject_ref: 'u_123',
    scope: ctxRes.data.data.requested_scope,
    max_amount: ctxRes.data.data.max_suggested_amount,
    currency: 'EUR',
    authorized_rails: ['SEPA', 'STABLECOIN_EURC', 'BITCOIN'],
    sca_timestamp: scaRes.data.sca_timestamp
  });
  
  const mandateId = genRes.data.data.mandate.mandate_id;
  console.log(`  Mandate Generated: ${mandateId}`);
  console.log(`  SD-JWT Signature: ${genRes.data.data.sd_jwt.substring(0, 30)}...\n`);

  // Step 4: Normal Agent Execution (within limits)
  console.log('4. Agent attempts to execute an EURC payment of 50.00...');
  try {
      const execRes1 = await axios.post(`${API_URL}/agent/execute-payment`, {
          mandate_id: mandateId,
          requested_amount: 50.00,
          requested_rail: 'STABLECOIN_EURC'
      });
      console.log('  Payment Authorized & Started! Intent:', execRes1.data.intent_id, '\n');
  } catch (e: any) {
      console.error('  Payment rejected:', e.response?.data?.reason, '\n');
  }

  // Step 5: Normal Agent Execution (outside limits - failing amount)
  console.log('5. Agent attempts to execute an EURC payment of 300.00...');
  try {
      await axios.post(`${API_URL}/agent/execute-payment`, {
          mandate_id: mandateId,
          requested_amount: 300.00,
          requested_rail: 'STABLECOIN_EURC'
      });
  } catch (e: any) {
      console.error('  Payment correctly rejected! Reason:', e.response?.data?.reason, '\n');
  }

  // Step 6: Panic Button (Revoke)
  console.log('6. User presses the PANIC BUTTON (Revoke Mandate)...');
  const revokeRes = await axios.post(`${API_URL}/wallet/mandates/${mandateId}/revoke`);
  console.log('  Revocation Response:', revokeRes.data.message, '\n');

  await sleep(500); // Wait for Orchestrator async DB update

  // Step 7: Post-Panic Execution Attempt
  console.log('7. Agent attempts a small BITCOIN payment post-panic...');
  try {
      await axios.post(`${API_URL}/agent/execute-payment`, {
          mandate_id: mandateId,
          requested_amount: 10.00,
          requested_rail: 'BITCOIN'
      });
  } catch (e: any) {
      console.error('  Payment correctly rejected! Reason:', e.response?.data?.reason, '\n');
  }

  console.log('=== Simulation Complete ===');
}

// Scaffold server + test script execution
console.log('Starting server in background...');
const server = spawn('npx', ['ts-node', path.join(__dirname, '../index.ts')]);

server.stdout.on('data', (data: any) => console.log(`[Server] ${data.toString().trim()}`));
server.stderr.on('data', (data: any) => console.error(`[Server Error] ${data.toString().trim()}`));

setTimeout(async () => {
    try {
        await runSimulation();
    } catch (e) {
        console.error("Simulation failed:", e);
    } finally {
        server.kill();
        process.exit(0);
    }
}, 3000);
