import axios from 'axios';

const API_URL = 'http://localhost:3000/v1';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runLot2Simulation() {
  console.log('=== Starting Lot 2 Simulation Script ===\n');

  try {
    console.log('1. Fetching a new Delegation Mandate from EUDI Wallet...');
    const scanRes = await axios.post(`${API_URL}/wallet/mandates/scan-context`, { user_id: 'u_123' });
    const context = scanRes.data.data;
    
    await axios.post(`${API_URL}/wallet/mandates/simulate-sca`, { user_id: 'u_123', device_id: 'dev_iphone_16' });

    const generateRes = await axios.post(`${API_URL}/wallet/mandates/generate`, {
      subject_ref: 'sub_999',
      scope: context.requested_scope,
      max_amount: context.max_suggested_amount,
      currency: 'EUR',
      authorized_rails: ['SEPA'],
      sca_timestamp: new Date().toISOString()
    });

    const mandateId = generateRes.data.data.mandate.mandate_id;
    console.log(`   Mandate Generated: ${mandateId}\n`);
    await sleep(500);

    console.log('2. Supplying Intent to the Personal Agent (Cognitive Orchestrator)...');
    
    // Test 1: Buying Perfume (Matches Sephora Agent)
    console.log('   => Intent: Perfume with 250 EUR budget.');
    await axios.post(`${API_URL}/agent/personal/simulate_intent`, {
        mandate_id: mandateId,
        product_category: 'urn:atos:pilot:retail:perfume',
        target_budget: 150.00 // Intentionally testing strict budget constraints against Sephora (Perfumes are 110 and 125)
    });
    
    await sleep(500);

    // Test 2: Buying a Flight (Matches AirFrance Agent)
    console.log('   => Intent: Flight with 500 EUR budget.');
    await axios.post(`${API_URL}/agent/personal/simulate_intent`, {
        mandate_id: mandateId,
        product_category: 'urn:atos:pilot:travel:flight',
        target_budget: 500.00
    });

    console.log('\n=== Simulation Requests Sent ===');
    console.log('Les deux agents marchands (Sephora et AirFrance) ont été interrogés par le Personal Agent.');
    console.log('Les meilleures propositions ont été séléctionnées (scoring déterministe) et ont été bloquées en statut `user_review_pending`.');
    console.log('=> Veuillez maintenant ouvrir http://localhost:3000/ dans votre navigateur web pour examiner et valider les paiements dans votre EUDI Wallet (Frontend).');

  } catch (error: any) {
    if (error.response) {
      console.error(`Simulation failed with API error: ${error.response.status}`, error.response.data);
    } else {
      console.error('Simulation failed:', error);
    }
  }
}

runLot2Simulation();
