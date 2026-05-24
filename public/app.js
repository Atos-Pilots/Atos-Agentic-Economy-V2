document.addEventListener('DOMContentLoaded', () => {
    fetchProposals();
});

async function fetchProposals() {
    const container = document.getElementById('proposals-container');
    try {
        const response = await fetch('/v1/consent/pending');
        const data = await response.json();
        
        if (!data.success || data.proposals.length === 0) {
            container.innerHTML = '<div class="loader">Aucune proposition en attente de revue.</div>';
            return;
        }

        container.innerHTML = '';
        data.proposals.forEach(prop => {
            const card = document.createElement('div');
            card.className = 'proposal-card';
            card.innerHTML = `
                <div class="prop-header">
                    <span class="merchant-name">${prop.selected_offer.merchant_id}</span>
                    <span class="prop-id">${prop.proposal_id}</span>
                </div>
                <div class="prop-body">
                    <div><span class="label">Produit : </span><span class="value">${prop.selected_offer.item_description}</span></div>
                    <div><span class="label">Catégorie Intent : </span><span class="value">${prop.intent.product_category}</span></div>
                    <div><span class="label">Délai (Layovers/Jours) : </span><span class="value">${prop.selected_offer.estimated_delivery_days}</span></div>
                    <div><span class="label">Rail Suggéré : </span><span class="value">${prop.suggested_rail}</span></div>
                    <div><span class="label">Mandat EUDI : </span><span class="value prop-id">${prop.mandate_id}</span></div>
                    <div style="margin-top: 1rem;"><span class="label">Prix Final : </span><span class="value price">${prop.selected_offer.price} ${prop.selected_offer.currency}</span></div>
                </div>
                <div class="action-row">
                    <button class="btn-reject" onclick="reject('${prop.proposal_id}')">Rejeter</button>
                    <button class="btn-approve" onclick="approve('${prop.proposal_id}')">VALIDER & PAYER</button>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (e) {
        container.innerHTML = `<div class="loader" style="color:red">Erreur de connexion BFF (${e.message})</div>`;
    }
}

async function approve(proposalId) {
    try {
        const res = await fetch(`/v1/consent/approve/${proposalId}`, { method: 'POST' });
        const data = await res.json();
        if(data.success) {
            alert('Achat validé et transaction confirmée! ID: ' + data.execution.transaction?.transaction_id);
            fetchProposals();
        } else {
            alert('Erreur: ' + data.error);
        }
    } catch (e) {
        alert('Exception: ' + e.message);
    }
}

async function reject(proposalId) {
    alert('Bouton de rejet non cablé pour le POC 1, mais la logique rejetterait le Saga state.');
}
