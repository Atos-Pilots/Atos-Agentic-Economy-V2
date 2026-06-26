export interface DidacticInfo {
  title: string;
  role: string;
  importance: string;
  standards: string;
  blockchain: string;
  potential: string;
}

export const didacticData: Record<'fr' | 'en', Record<string, DidacticInfo>> = {
  fr: {
    cni: {
      title: "Carte Nationale d'Identité Numérique",
      role: "Prouve l'identité de l'utilisateur dans les transactions en ligne ou physiques (e-commerce, contrôles administratifs, accès régulés).",
      importance: "Garantit que l'utilisateur est bien la personne physique qu'il prétend être, évitant l'usurpation d'identité et les fausses déclarations.",
      standards: "eIDAS 2.0 (Cadre d'identité numérique européen), format W3C Verifiable Credentials, signature cryptographique de l'État émetteur.",
      blockchain: "Aucune donnée personnelle n'est stockée sur blockchain. Elle peut servir à générer une preuve d'identité cryptographique à usage unique.",
      potential: "Ouverture instantanée de compte bancaire européen, signature électronique de contrats avec force juridique dans toute l'UE."
    },
    age_proof: {
      title: "Attestation de Majorité (Age Proof)",
      role: "Permet de prouver que l'utilisateur a plus de 18 ans sans révéler sa date de naissance complète ni son identité.",
      importance: "Respecte la minimisation des données personnelles (RGPD) en ne révélant que le strict nécessaire pour l'accès aux produits réglementés.",
      standards: "SD-JWT (Selective Disclosure JWT) et preuves à divulgation nulle de connaissance (Zero Knowledge Proofs - ZKP).",
      blockchain: "La preuve mathématique d'âge peut être ancrée on-chain sous forme de preuve ZK pour valider des conditions de contrats intelligents sans divulguer de données privées.",
      potential: "Achat en ligne d'articles restreints à la majorité avec contrôle automatique instantané conforme à la vie privée."
    },
    driving_license: {
      title: "Permis de Conduire Numérique (mDL)",
      role: "Justifie du droit de conduire un véhicule lors d'une location de voiture ou d'un contrôle routier.",
      importance: "Permet le partage sélectif uniquement des catégories de véhicules autorisées sans divulguer l'historique d'infractions ni l'adresse.",
      standards: "Norme ISO 18013-5 (Mobile Driving Licence - mDL) compatible avec le framework européen EUDI Wallet.",
      blockchain: "Peut interagir avec des protocoles d'assurance décentralisée Web3 pour certifier la validité du permis lors de la souscription d'un contrat intelligent d'assurance.",
      potential: "Location de véhicule autonome ou autopartage avec validation instantanée et sans contact de l'habilitation."
    },
    student_card: {
      title: "Carte d'Étudiant Numérique",
      role: "Prouve le statut d'étudiant pour bénéficier de tarifs réduits (transports, cinémas, abonnements logiciels).",
      importance: "Élimine la fraude aux réductions étudiantes et facilite les démarches administratives universitaires.",
      standards: "Verifiable Credential du W3C émis par l'établissement d'enseignement supérieur (ex: Université Paris-Saclay).",
      blockchain: "Peut être émise sous forme de Soulbound Token (SBT) académique pour attester de l'inscription ou de la réussite à des examens.",
      potential: "Inscription universitaire paneuropéenne simplifiée (Erasmus) et accès instantané à des offres exclusives de services tiers."
    },
    sca_bank: {
      title: "Attestation de Paiement & SCA PSD3/PSR",
      role: "Enrôle une clé cryptographique asymétrique dans le Secure Enclave du smartphone, validée par votre banque (Crédit Agricole) après authentification forte (biométrie).",
      importance: "Permet l'initiation de paiements instantanés sécurisés en 1-click sans ressaisie de carte bancaire, en conformité avec la réglementation européenne.",
      standards: "Directive PSD3 (Payment Services Directive 3), Règlement PSR (Payment Services Regulation), A2A (Account-to-Account) payments, protocoles AP2 et X402.",
      blockchain: "Cette attestation de compte peut lier un IBAN traditionnel à une adresse de portefeuille Web3 pour des rampes d'accès/de sortie fluides vers des monnaies numériques (EURC).",
      potential: "Paiements de compte à compte instantanés à frais minimes, supprimant les intermédiaires de cartes traditionnels."
    },
    mandate_netflix: {
      title: "Mandat de Paiement Récurrent",
      role: "Autorise des retraits périodiques (abonnements) par un tiers, directement gérés et révocables par l'utilisateur depuis son EUDI Wallet.",
      importance: "L'utilisateur garde le contrôle souverain : il définit la périodicité, le montant plafond, et peut révoquer le mandat instantanément.",
      standards: "Protocole Mastercard Verifiable Intent (VI) pour signer l'intention d'achat récurrent, rails de virement SEPA ou stablecoin.",
      blockchain: "Le mandat de paiement récurrent peut s'exécuter via un contrat intelligent on-chain qui prélève automatiquement le stablecoin EURC dans les limites autorisées.",
      potential: "Gestion centralisée et unifiée de tous les abonnements numériques dans une seule interface de portefeuille souverain."
    },
    mandate_atos: {
      title: "Mandat de Délégation Agentique",
      role: "Alloue un budget limité (ex: max 50 €) et des règles d'exécution à un agent IA autonome pour effectuer des micropaiements en tâche de fond.",
      importance: "Permet aux agents d'agir de manière autonome sans interrompre l'utilisateur avec des notifications de paiement incessantes.",
      standards: "Google Agentic Payments Protocol (AP2), Account Abstraction (ERC-4337) et protocole L402 pour les micropaiements d'APIs.",
      blockchain: "S'appuie sur l'Account Abstraction (ERC-4337) pour permettre à l'agent IA d'exécuter des transactions cryptographiques de manière autonome sous conditions strictes.",
      potential: "Économie de machine à machine (M2M) où des objets connectés et agents IA achètent et vendent des services cloud, des données ou de l'énergie."
    },
    sbt_receipt: {
      title: "Reçu de Transaction Soulbound Token (SBT)",
      role: "Atteste de manière infalsifiable de la réussite d'une transaction, du paiement et de la conformité des justificatifs présentés.",
      importance: "Fournit une preuve d'achat immuable et vérifiable pour les audits, les remboursements ou les justificatifs de conformité réglementaire.",
      standards: "Norme de jeton non transférable Soulbound Token (SBT) dérivée de l'ERC-721 sur registre décentralisé ou signée cryptographiquement (Receipt Engine).",
      blockchain: "Ancré sur un registre blockchain public ou privé sous forme de SBT. Le jeton est lié à l'identité de l'utilisateur et ne peut pas être transféré ou vendu.",
      potential: "Garanties d'achat numériques infalsifiables, billetterie nominative sécurisée sans marché noir, traçabilité de bout en bout des transactions."
    },
    green_nft: {
      title: "Badge Fidélité / Green Impact NFT",
      role: "Récompense les comportements écoresponsables ou les achats labellisés de l'utilisateur (ex: voyages bas carbone, compensation).",
      importance: "Inciter les utilisateurs par la ludification (gamification) et la certification d'achats vertueux.",
      standards: "Standard de jeton non fongible (NFT) ERC-721 sur registre Web3 éco-efficient.",
      blockchain: "Entièrement hébergé on-chain. Le niveau du NFT (Seedling, Sapling, Gold Forest) évolue dynamiquement selon le nombre de transactions vertes de l'utilisateur.",
      potential: "Marché carbone grand public, crédits de fidélité carbone interopérables entre plusieurs marchands partenaires."
    },
    cobadging_selector: {
      title: "Sélecteur de Réseau (Co-badgeage)",
      role: "Permet à l'utilisateur de choisir le réseau de paiement préféré pour sa transaction de carte (ex: CB national vs. VISA international).",
      importance: "Garantit la conformité européenne de libre choix du consommateur, lui permettant d'optimiser les frais ou la rapidité du règlement.",
      standards: "Article 8 du Règlement européen sur les commissions d'interchange (IFR), intégration EUDI Wallet & AP2.",
      blockchain: "Peut être transposé dans le Web3 pour choisir le réseau blockchain de règlement (ex: Ethereum L1 vs. Arbitrum L2 vs. Solana) pour un paiement stablecoin.",
      potential: "Optimisation dynamique des coûts de transaction en temps réel selon les préférences de l'utilisateur."
    },
    airfrance_gate: {
      title: "Embarquement Air France (Fast-Track)",
      role: "Permet l'accès prioritaire à la porte d'embarquement en présentant une attestation de réservation de vol et un statut fidélité.",
      importance: "Expérience fluide en aéroport sans contact (sans paiement) garantissant que le passager détient les titres et statuts d'accès requis.",
      standards: "Présentation multi-attributs W3C Verifiable Credentials via protocole OID4VP (OpenID for Verifiable Presentations).",
      blockchain: "Les billets d'avion et abonnements de fidélité peuvent être modélisés sous forme de jetons dynamiques ou de SBT pour empêcher la contrefaçon de billets.",
      potential: "Parcours voyageur universel sans contact de la dépose bagages jusqu'à l'hôtel final via un portefeuille unique."
    },
    netflix_sub: {
      title: "Abonnement Netflix Premium",
      role: "Souscription et gestion de paiement périodique pour un service de streaming de contenu en ligne.",
      importance: "Permet le prélèvement mensuel automatique dans la limite stricte du mandat signé cryptographiquement par l'utilisateur.",
      standards: "Standard Mastercard Verifiable Intent (VI) pour attester du consentement récurrent lié au compte bancaire PSR.",
      blockchain: "Paiement récurrent décentralisé s'appuyant sur des contrats de paiement programmables (smart contracts) et stablecoins (EURC).",
      potential: "Facturation dynamique à l'usage ou à la minute de streaming résolue par des micro-transactions en temps réel."
    },
    atos_polaris: {
      title: "Achat & Activation d'Atos Polaris AI",
      role: "Achat initial d'un agent d'infrastructure IT et délégation de budget pour des tâches d'inférence de calcul souverain.",
      importance: "Démontre le potentiel de l'économie agentique où un agent logiciel autonome loue du compute, exécute des diagnostics et paie ses propres ressources.",
      standards: "Model Context Protocol (MCP), HuggingFace log-analysis models, validation de calcul par consensus décentralisé.",
      blockchain: "Intégration d'APIs DePIN (Decentralized Physical Infrastructure Networks) où le calcul GPU loué est validé par un consensus de nœuds validateurs et réglé en EURC.",
      potential: "Agents de maintenance IT autonomes, flottes d'IAs collaboratives s'échangeant des ressources de calcul sans intervention humaine."
    },
    agent_console: {
      title: "Console de l'Assistant IA Personnel",
      role: "Affiche le statut et les logs de l'agent IA agissant pour le compte de l'utilisateur.",
      importance: "Offre une transparence totale et une traçabilité de toutes les actions et paiements autonomes menés par l'agent IA.",
      standards: "Protocole L402 / ERC-4337 (Account Abstraction) pour l'interface de paiement de machine à machine.",
      blockchain: "Journalise les hachages de transactions et les signatures de mandats sur le registre décentralisé pour un audit immuable.",
      potential: "Gouvernance personnelle des agents IA avec alertes automatiques et ajustements dynamiques de budgets."
    }
  },
  en: {
    cni: {
      title: "Digital National Identity Card",
      role: "Proves the user's identity in online or physical transactions (e-commerce, administrative checks, restricted access).",
      importance: "Ensures the user is indeed the physical person they claim to be, preventing identity theft and false declarations.",
      standards: "eIDAS 2.0 (European Digital Identity framework), W3C Verifiable Credentials format, cryptographic signature of the issuing State.",
      blockchain: "No personal data is stored on-chain. It can be used to generate a single-use cryptographic proof of identity.",
      potential: "Instant opening of European bank accounts, electronic signature of contracts with legal weight across the EU."
    },
    age_proof: {
      title: "Proof of Majority (Age Proof)",
      role: "Allows proving the user is over 18 without revealing their complete birth date or identity.",
      importance: "Respects personal data minimization (GDPR) by only revealing what is strictly necessary to access restricted products.",
      standards: "SD-JWT (Selective Disclosure JWT) and Zero Knowledge Proofs (ZKP).",
      blockchain: "The mathematical age proof can be anchored on-chain as a ZK proof to validate smart contract conditions without leaking private data.",
      potential: "Online purchase of restricted goods with instant, privacy-compliant automated verification."
    },
    driving_license: {
      title: "Digital Driving Licence (mDL)",
      role: "Proves driving privileges when renting a car or during road safety checks.",
      importance: "Enables selective sharing of only the authorized vehicle categories without disclosing infractions history or address.",
      standards: "ISO 18013-5 standard (Mobile Driving Licence - mDL) compatible with the European EUDI Wallet framework.",
      blockchain: "Can interact with Web3 decentralized insurance protocols to certify driving licence validity when signing a smart insurance contract.",
      potential: "Autonomous vehicle rental or car-sharing with instant, contactless validation of authorization."
    },
    student_card: {
      title: "Digital Student Card",
      role: "Proves student status to benefit from discounts (transportation, cinemas, software subscriptions).",
      importance: "Eliminates student discount fraud and simplifies university administrative procedures.",
      standards: "W3C Verifiable Credential format issued by the higher education institution (e.g. Paris-Saclay University).",
      blockchain: "Can be issued as an academic Soulbound Token (SBT) to attest enrollment or successful exam completion.",
      potential: "Simplified pan-European university enrollment (Erasmus) and instant access to exclusive student offers from third-party services."
    },
    sca_bank: {
      title: "SCA PSD3/PSR Payment Attestation",
      role: "Enrolls an asymmetric cryptographic key in the smartphone's Secure Enclave, validated by your bank (Crédit Agricole) after strong authentication (biometrics).",
      importance: "Allows secure 1-click instant payments without re-entering card details, in compliance with European regulations.",
      standards: "PSD3 (Payment Services Directive 3), PSR (Payment Services Regulation), A2A (Account-to-Account) payments, AP2 & X402 protocols.",
      blockchain: "This account attestation can link a traditional IBAN to a Web3 wallet address for seamless on/off ramps to digital currencies (EURC).",
      potential: "Low-fee instant account-to-account payments, bypassing traditional card scheme intermediaries."
    },
    mandate_netflix: {
      title: "Recurring Payment Mandate",
      role: "Authorizes periodic debits (subscriptions) by a third party, directly managed and revocable by the user from their EUDI Wallet.",
      importance: "The user keeps sovereign control: they define the period, maximum amount caps, and can revoke the mandate instantly.",
      standards: "Mastercard Verifiable Intent (VI) protocol to sign the recurring purchase intent, SEPA direct debit rails or stablecoins.",
      blockchain: "The recurring payment mandate can execute via an on-chain smart contract that pulls EURC stablecoins automatically within authorized limits.",
      potential: "Centralized and unified management of all digital subscriptions in a single sovereign wallet interface."
    },
    mandate_atos: {
      title: "Agentic Payment Delegation Mandate",
      role: "Allocates a capped budget (e.g., max €50) and execution rules to an autonomous AI agent to perform background micropayments.",
      importance: "Enables agents to act autonomously without constantly interrupting the user with payment authorization requests.",
      standards: "Google Agentic Payments Protocol (AP2), Account Abstraction (ERC-4337) and L402 protocol for API micropayments.",
      blockchain: "Uses Account Abstraction (ERC-4337) to let the AI agent execute on-chain cryptographic transactions autonomously under strict rules.",
      potential: "Machine-to-machine (M2M) economy where IoT devices and AI agents trade cloud services, data, or energy."
    },
    sbt_receipt: {
      title: "SBT Transaction Receipt",
      role: "Tamper-proof attestation of transaction success, payment, and compliance of the presented credentials.",
      importance: "Provides an immutable and verifiable proof of purchase for audits, refunds, or regulatory compliance reporting.",
      standards: "Soulbound Token (SBT) non-transferable token standard derived from ERC-721 on a decentralized ledger or cryptographically signed (Receipt Engine).",
      blockchain: "Anchored on a public or private blockchain ledger as an SBT. The token is bound to the user's identity and cannot be transferred or sold.",
      potential: "Tamper-proof digital warranties, secure personalized ticketing preventing scalping, end-to-end transaction auditability."
    },
    green_nft: {
      title: "Fidelity Badge / Green Impact NFT",
      role: "Rewards the user's eco-friendly behaviors or certified green purchases (e.g. low-carbon travel, carbon offsets).",
      importance: "Nudges users through gamification and cryptographically certified virtuous purchases.",
      standards: "ERC-721 Non-Fungible Token (NFT) standard on an eco-efficient Web3 ledger.",
      blockchain: "Fully hosted on-chain. The NFT level (Seedling, Sapling, Gold Forest) updates dynamically based on the user's green transactions count.",
      potential: "Consumer carbon market, carbon loyalty credits interoperable across multiple partner merchants."
    },
    cobadging_selector: {
      title: "Card Network Selector (Co-badging)",
      role: "Allows the user to select their preferred payment network for card transactions (e.g. national CB vs. international VISA).",
      importance: "Ensures European compliance for consumer choice, allowing them to optimize fees or settlement speed.",
      standards: "Article 8 of the European Interchange Fee Regulation (IFR), EUDI Wallet & AP2 integration.",
      blockchain: "Can be transposed to Web3 for selecting the settlement blockchain network (e.g. Ethereum L1 vs. Arbitrum L2 vs. Solana) for stablecoin payments.",
      potential: "Real-time dynamic cost optimization of transactions based on user-defined parameters."
    },
    airfrance_gate: {
      title: "Air France Gate Check-in (Fast-Track)",
      role: "Provides priority boarding gate access by presenting flight booking proof and loyalty tier credentials.",
      importance: "Seamless, contactless airport experience (no payment) ensuring the traveler holds the correct boarding and loyalty status.",
      standards: "Multi-attribute presentation of W3C Verifiable Credentials using the OID4VP protocol (OpenID for Verifiable Presentations).",
      blockchain: "Flight tickets and loyalty passes can be modeled as dynamic NFTs or SBTs to prevent ticket scalping and counterfeiting.",
      potential: "Contactless traveler journey from baggage drop to hotel checkout using a single sovereign wallet."
    },
    netflix_sub: {
      title: "Netflix Premium Subscription",
      role: "Subscription setup and periodic payment management for online content streaming.",
      importance: "Enables monthly automatic debit within the strict limits of the mandate cryptographically signed by the user.",
      standards: "Mastercard Verifiable Intent (VI) standard to verify recurring consent linked to a PSR bank account.",
      blockchain: "Decentralized recurring payment relying on programmable smart contracts and stablecoins (EURC).",
      potential: "Pay-as-you-go billing or per-minute streaming resolved by real-time micro-transactions."
    },
    atos_polaris: {
      title: "Atos Polaris AI Purchase & Activation",
      role: "Initial purchase of an IT infrastructure agent and budget delegation for sovereign compute inference tasks.",
      importance: "Demonstrates the potential of the agentic economy where an autonomous agent rents compute, runs diagnostics, and settles its own resources.",
      standards: "Model Context Protocol (MCP), HuggingFace log-analysis models, computation validation by decentralized consensus.",
      blockchain: "Integration of DePIN (Decentralized Physical Infrastructure Networks) APIs where rented GPU compute is verified by validating nodes and settled in EURC.",
      potential: "Autonomous IT maintenance agents, collaborative AI fleets trading compute resources without human intervention."
    },
    agent_console: {
      title: "Personal AI Companion Console",
      role: "Displays the status and logs of the AI agent acting on behalf of the user.",
      importance: "Provides complete transparency and traceability of all autonomous actions and payments made by the AI agent.",
      standards: "L402 protocol / ERC-4337 (Account Abstraction) for machine-to-machine payments.",
      blockchain: "Logs transaction hashes and mandate signatures on a decentralized ledger for immutable audit trail.",
      potential: "Personal governance of AI agents with automatic alerts and dynamic budget adjustments."
    }
  }
};
