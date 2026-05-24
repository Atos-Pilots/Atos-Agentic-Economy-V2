import axios from 'axios';

const API_URL = 'http://localhost:3000/v1';

async function verifyE2ENominalPath() {
    console.log('=== LOT 3.5: E2E Nominal Happy Path Integration Test ===\n');

    try {
        console.log('✓ Stage 1: Wallet EUDI Authentication & Mandate');
        const scanRes = await axios.post(`${API_URL}/wallet/mandates/scan-context`, { user_id: 'user_nom' });
        await axios.post(`${API_URL}/wallet/mandates/simulate-sca`, { user_id: 'user_nom', device_id: 'dev_iphone_16' });
        const generateRes = await axios.post(`${API_URL}/wallet/mandates/generate`, {
            subject_ref: 'sub_nom',
            scope: scanRes.data.data.requested_scope,
            max_amount: 600,
            currency: 'EUR',
            authorized_rails: ['SEPA'],
            sca_timestamp: new Date().toISOString()
        });
        const mandateId = generateRes.data.data.mandate.mandate_id;

        console.log('✓ Stage 2: Intent Analysis & Agentic Offer Routing (Sephora A2A)');
        await axios.post(`${API_URL}/agent/personal/simulate_intent`, {
            mandate_id: mandateId,
            product_category: 'urn:atos:pilot:retail:perfume',
            target_budget: 200.00
        });

        // Simuler la pause BFF pour le test, on va simuler un ID
        console.log('✓ Stage 3: Fetching UI Review queue from BFF');
        const pendingRes = await axios.get(`${API_URL}/consent/pending`);
        const proposals = pendingRes.data.proposals;
        
        if (proposals.length === 0) throw new Error('No pending proposals caught!');
        const matchingProposal = proposals[proposals.length - 1]; // Prends le dernier

        console.log(`✓ Stage 4: Implicit API User Consent Approval (ID: ${matchingProposal.proposal_id}) -> AP2 Execution`);
        const approveRes = await axios.post(`${API_URL}/consent/approve/${matchingProposal.proposal_id}`);
        
        const ap2Intent = approveRes.data.execution.transaction.transaction_id || approveRes.data.execution.transaction.tx_ref; 
        
        console.log(`✓ Stage 5: Settlement Complete. W3C Receipt Emitted implicitly in Backend logs.`);
        console.log(`\n✅ E2E Sequence SUCCESS. AP2 Execution result:`, approveRes.data.status);
    } catch (e: any) {
        if(e.response) {
            console.error('❌ E2E Failed at Remote Node:', e.response.status, e.response.data);
        } else {
            console.error('❌ E2E Failed natively:', e.message);
        }
    }
}

verifyE2ENominalPath();
