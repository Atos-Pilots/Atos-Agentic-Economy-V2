export type Language = 'fr' | 'en';

export const translations = {
  fr: {
    common: {
      cancel: 'Annuler',
      continue: 'Continuer',
      approve: 'Approuver',
      loading: 'Chargement...',
      success: 'Succès',
      error: 'Erreur',
      done: 'Terminé'
    },
    app: {
      myIdentities: 'Mes Identités',
      inboxApprovals: 'Boîte de Réception & Approbations',
      pendingSignature: 'Signature en attente',
      cloudRequest: 'Votre Cloud Agent demande un mandat pour régler {amount} EUR auprès de {merchant}.',
      signMandate: 'Signer le Mandat SD-JWT',
      noRequest: 'Aucune demande en attente.',
      proofsTransmitted: 'Preuves transmises avec succès.',
      identityVault: 'Coffre d\'Identité'
    },
    vault: {
      emptyState: 'Aucune identité ou preuve stockée pour le moment.',
      identityCard: 'Carte Nationale d\'Identité',
      rf: 'République Française',
      surname: 'Nom / Surname',
      givenName: 'Prénoms / Given names',
      birthDate: 'Date de naissance',
      nationality: 'Nationalité',
      drivingLicense: 'Permis de Conduire',
      categories: 'Catégories Autorisées (9.)',
      docNumber: 'N° du Document (5.)',
      ageProof: 'Attestation de Majorité',
      sdJwt: 'SD-JWT Verifiable Credential',
      issuer: 'Émetteur :',
      format: 'Format : SD-JWT (Divulgation Sélective)'
    },
    sbt: {
      title: 'Galerie ZK & SBT',
      emptyState: 'Vos preuves cryptographiques SBT apparaîtront ici à l\'issue de vos transactions.',
      verifiableCredential: 'W3C VERIFIABLE CREDENTIAL',
      proofOfPurchase: 'Preuve d\'Achat',
      intentId: 'Intent ID',
      issuedAt: 'Émis le'
    },
    nav: {
      scanner: 'Scan QR',
      vault: 'Coffre',
      cloud: 'Demandes',
      mandates: 'Mandats',
      receipts: 'Reçus'
    },
    demoToggle: {
      wallet: '📱 Portefeuille',
      terminal: '🏪 Terminal',
      agent: '🤖 Assistant IA'
    },
    dashboard: {
      title: 'Atos Sovereign AI Control Room',
      panicAction: 'ACTION INTERROMPUE : MANDAT RÉVOQUÉ PAR LE CITOYEN',
      logs: 'Logs Générés'
    },
    companion: {
      title: 'Assistant IA Personnel',
      subtitle: 'Agent M2M Autonome',
      protocolStatus: 'Protocole L402 / ERC-4337 Wallet :',
      deployed: 'DÉPLOYÉ',
      simulateTitle: 'Simuler une Requête M2M (Sans QR Code) :',
      mandateCheck: "Vérification des autorisations EUDI en cours...",
      mandateMissing: "❌ Opération bloquée : Aucun mandat Agentic Pay actif pour le scope '{scope}'. Veuillez configurer votre coffre d'identité.",
      mandateLimitExceeded: "❌ Opération bloquée : Le montant ({amount}) dépasse le plafond autorisé ({limit}). Une intervention humaine est requise.",
      authMode: 'Paiement Autonome',
      scaMode: 'SCA Requise',
      greeting: "Bonjour CVN. Mon Master Mandate L402 / ERC-4337 est connecté à votre Wallet. Je suis prêt à interagir avec des services M2M.",
      negotiation: "Négociation avec l'API Web3",
      paymentRequired: "HTTP 402 Payment Required\nEndpoint exige {amount} pour exécuter l'action.",
      autonomousSuccess: "Transaction L402 autonome approuvée via mon allocation Stablecoin ({scope}). Paiement on-chain exécuté.\n\nMandat consommé : {scope}",
      serviceDelivered: "✅ Service délivré avec succès. Aucun scan requis, tout s'est passé en backend.",
      scaEscalation: "Le montant de {amount} dépasse mon plafond autonome sans signature cryptographique EUDI.",
      scaPush: "J'ai transféré une demande de paiement silencieuse à votre Identity Wallet. Veuillez approuver sur l'onglet Cloud Inbox.",
      scenarios: {
        it: {
          label: 'Services IT (API IA)',
          desc: "Poursuis l'entraînement du modèle IA sur les GPU de RunPod.io."
        },
        concert: {
          label: 'Places de Concert',
          desc: "Trouve et achète 2 places pour Daft Punk ce soir à l'Accor Arena."
        },
        sub: {
          label: 'Abonnement Auto',
          desc: "Renouvelle mon instance de base de données AWS RDS mensuelle."
        }
      }
    },
    retailer: {
      title: 'Terminal de Caisse Agentique',
      modeSelection: 'Sélectionnez un Marchand :',
      cart: 'Panier :',
      verifyAndPay: 'Vérifier & Payer',
      waitingScan: 'Présentez votre QR Code',
      toBePaid: 'À Payer :',
      instructionsText: 'Veuillez ouvrir votre EUDI Mobile Wallet et scanner le QR code statique du commerçant.',
      instructionsVisual: 'Ouvrez le scanner',
      successIdentity: 'Identité Vérifiée Cryptographiquement',
      receiptTitle: 'Reçu Sécurisé EUDI',
      printReceipt: 'Imprimer Quittance',
      newTransaction: 'Nouvelle Transaction',
      scenarios: {
        lottery: {
          title: "Jeux Loterie - Terminal FDJ",
          type: "Jeux d'Argent (18+)",
          item: "Grille Loto",
          success: "Majeur Vérifié"
        },
        perfume: {
          title: "Sephora - TPE",
          type: "Beauté & Cosmétiques",
          item: "Parfum Chanel No. 5",
          success: "Paiement Validé"
        },
        hotel: {
          title: "Grand Hotel Paris - Réception",
          type: "Hôtel - Express Check-out",
          item: "Nuit + Minibar",
          success: "Caution & Identité Vérifiées"
        },
        cinema: {
          title: "UGC Cinémas - Contrôle d'Accès",
          type: "Billet & Réduction Étudiant",
          item: "Entrée Salle",
          success: "Accès Autorisé"
        },
        rental: {
          title: "AutoRent Express - Agence",
          type: "Location Véhicule",
          item: "Dépôt de Garantie",
          success: "Permis Vérifié"
        }
      }
    },
    scanner: {
      title: 'Scanner QR Code',
      target: 'Cibler le QR Code du Marchand',
      btnOpen: 'Ouvrir Viseur Virtuel',
      simInstruction: 'Saisie manuelle du Nonce (Démo locale)',
      subtitle: 'Visez le code QR pour initier la transaction.',
      errorEmpty: 'Veuillez saisir un nonce ou scanner un code QR.',
      errorInvalid: 'Code QR invalide ou session expirée.',
      errorNetwork: 'Erreur réseau :',
      placeholder: 'Saisissez le nonce ici...',
      btnScan: 'Simuler le Scan',
      acquiring: 'Acquisition en cours...'
    },
    consent: {
      title: 'Demande de Partage EUDI',
      subtitle: 'Le terminal marchand requiert vos informations de façon décentralisée.',
      sovereigntyTitle: 'Souveraineté & Privacy by Design',
      sovereigntyDesc: "La vérification de vos preuves est 100% locale au terminal via EBSI. Votre identité brute n'est jamais divulguée en clair au cloud.",
      transmitTitle: 'Ce qui sera transmis',
      btnSca: 'Continuer (FaceID)',
      btnCancel: 'Interrompre l\'autorisation',
      noMandate: "Aucun mandat dans votre wallet n'autorise un achat sous le scope {scope}. Transaction bloquée."
    },
    mandates: {
      title: 'Mandats',
      active: 'actif',
      actives: 'actifs',
      btnDelegate: 'Déléguer',
      warningAuto: "En mode autonome, vous déléguez formellement à l'agent le droit d'initier des paiements sans votre présence, dans les limites définies ci-dessus.",
      btnSign: 'Signer & Déléguer via FaceID',
      emptyState: 'Aucun mandat actif.',
      emptyStateDesc: 'Créez un mandat pour que votre agent puisse agir en votre nom.',
      btnHide: 'Masquer de l\'historique',
      btnRevoke: 'Révoquer ce mandat',
      expired: 'EXPIRÉ',
      coveredCategory: 'Catégorie couverte',
      limit: 'Plafond',
      rails: 'Rail(s)',
      expiry: 'Expiration',
      noLimit: 'Sans limite',
      daysLeft: 'J-{days}',
      autoExecute: 'Exécution autonome (AP2 §4.1)',
      autoExecuteDesc: 'L\'IA exécute sans friction dans la limite du mandat',
      approvalRequired: 'Approbation requise par transaction',
      approvalRequiredDesc: 'Chaque transaction nécessite votre validation FaceID (SCA)',
      signedOn: 'EUDI §3 — SD-JWT VC — Signé le {date}',
      delegationNotice: 'Délégation a priori',
      delegationNoticeBold: '(EUDI Art.5 & PSD3)',
      delegationNoticeDesc: '— Une seule approbation biométrique pour définir les droits de votre agent IA. La SCA (Strong Customer Authentication) n\'est requise qu\'à la création du mandat, pas à chaque transaction.',
      newMandate: 'Nouveau Mandat Délégué',
      maxLimit: 'Plafond max (€)',
      durationDays: 'Durée (jours)',
      merchantCategory: 'Catégorie marchande',
      paymentRail: 'Rail de paiement',
      fullAuto: 'Exécution autonome complète',
      fullAutoDesc: 'L\'agent paie automatiquement dans les limites — aucune friction',
      humanInTheLoop: 'Validation humaine par transaction',
      humanInTheLoopDesc: 'FaceID requis pour chaque paiement (Human-in-the-loop, DSP2/PSD3)',
      biometricValidation: 'Validation biométrique (SCA)…',
      hideHistory: 'Masquer l\'historique',
      showHistory: 'Voir l\'historique ({count} révoqué(s))',
      scopes: {
        retail: 'Achats Réglementés (Jeux/Alcool)',
        perfume: 'Retail & Cosmétiques',
        hotel: 'Hôtellerie & Check-in',
        rental: 'Location de Véhicules',
        it: 'Services IT (API/Fournisseurs)',
        infrastructure: 'Infrastructure & Abonnements',
        tickets: 'Billetterie & Divertissement',
        all: 'Toutes catégories (Illimité)'
      },
      railsOptions: {
        sepa: '🏦 SEPA (Bancaire - PSD3)',
        eurc: '🔗 EURC Stablecoin (ERC-4337)',
        l402: '⚡ L402 Micro-paiements (Lightning)'
      }
    }
  },
  en: {
    common: {
      cancel: 'Cancel',
      continue: 'Continue',
      approve: 'Approve',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      done: 'Done'
    },
    app: {
      myIdentities: 'My Identities',
      inboxApprovals: 'Inbox & Approvals',
      pendingSignature: 'Pending Signature',
      cloudRequest: 'Your Cloud Agent is requesting a mandate to settle {amount} EUR with {merchant}.',
      signMandate: 'Sign SD-JWT Mandate',
      noRequest: 'No pending requests.',
      proofsTransmitted: 'Proofs successfully transmitted.',
      identityVault: 'Identity Vault'
    },
    vault: {
      emptyState: 'No identity or credential stored at the moment.',
      identityCard: 'National Identity Card',
      rf: 'French Republic',
      surname: 'Surname',
      givenName: 'Given names',
      birthDate: 'Date of birth',
      nationality: 'Nationality',
      drivingLicense: 'Driving License',
      categories: 'Authorized Categories (9.)',
      docNumber: 'Document Number (5.)',
      ageProof: 'Age Proof',
      sdJwt: 'SD-JWT Verifiable Credential',
      issuer: 'Issuer :',
      format: 'Format : SD-JWT (Selective Disclosure)'
    },
    sbt: {
      title: 'ZK & SBT Gallery',
      emptyState: 'Your verifiable SBT credentials will appear here after your transactions.',
      verifiableCredential: 'W3C VERIFIABLE CREDENTIAL',
      proofOfPurchase: 'Proof of Purchase',
      intentId: 'Intent ID',
      issuedAt: 'Issued at'
    },
    nav: {
      scanner: 'Scan QR',
      vault: 'Vault',
      cloud: 'Requests',
      mandates: 'Mandates',
      receipts: 'Receipts'
    },
    demoToggle: {
      wallet: '📱 Wallet',
      terminal: '🏪 Terminal',
      agent: '🤖 Smart Assistant'
    },
    dashboard: {
      title: 'Atos Sovereign AI Control Room',
      panicAction: 'ACTION INTERRUPTED: MANDATE REVOKED BY CITIZEN',
      logs: 'Generated Logs'
    },
    companion: {
      title: 'Personal AI Assistant',
      subtitle: 'Autonomous M2M Agent',
      protocolStatus: 'L402 / ERC-4337 Wallet Protocol:',
      deployed: 'DEPLOYED',
      simulateTitle: 'Simulate M2M Request (No QR Code):',
      mandateCheck: "Verifying EUDI authorizations...",
      mandateMissing: "❌ Operation blocked: No active Agentic Pay mandate for '{scope}'. Please configure your vault.",
      mandateLimitExceeded: "❌ Operation blocked: Amount ({amount}) exceeds authorized limit ({limit}). Intervention required.",
      authMode: 'Autonomous Payment',
      scaMode: 'SCA Required',
      greeting: "Hello CVN. My L402 / ERC-4337 Master Mandate is attached to your Wallet. I am ready to interact with M2M services.",
      negotiation: "Negotiating with Web3 API",
      paymentRequired: "HTTP 402 Payment Required\nEndpoint requires {amount} to execute the action.",
      autonomousSuccess: "Autonomous L402 transaction approved via my Stablecoin allowance ({scope}). On-chain payment executed.\n\nMandate consumed: {scope}",
      serviceDelivered: "✅ Service delivered successfully. No human scan required, settled entirely in the backend.",
      scaEscalation: "The requested amount of {amount} exceeds my autonomous ceiling without an EUDI cryptographic signature.",
      scaPush: "I have transferred a silent payment request to your Identity Wallet. Please approve it from your Cloud Inbox tab.",
      scenarios: {
        it: {
          label: 'IT Services (AI API)',
          desc: "Continue AI model training on RunPod.io GPU instances."
        },
        concert: {
          label: 'Concert Tickets',
          desc: "Find and buy 2 tickets for Daft Punk tonight at Accor Arena."
        },
        sub: {
          label: 'Auto Subscription',
          desc: "Renew my AWS RDS monthly database instance."
        }
      }
    },
    retailer: {
      title: 'Agentic Retail Terminal',
      modeSelection: 'Select a Merchant:',
      cart: 'Cart:',
      verifyAndPay: 'Verify & Pay',
      waitingScan: 'Please present your QR Code',
      toBePaid: 'To Be Paid:',
      instructionsText: 'Please open your EUDI Mobile Wallet and scan the static merchant QR code.',
      instructionsVisual: 'Open the scanner',
      successIdentity: 'Identity Cryptographically Verified',
      receiptTitle: 'EUDI Secure Receipt',
      printReceipt: 'Print Receipt',
      newTransaction: 'New Transaction',
      scenarios: {
        lottery: {
          title: "Lottery Games - POS",
          type: "Gambling (18+)",
          item: "Loto Grid",
          success: "Adult Verified"
        },
        perfume: {
          title: "Sephora - POS",
          type: "Beauty & Cosmetics",
          item: "Chanel No. 5 Perfume",
          success: "Payment Validated"
        },
        hotel: {
          title: "Grand Hotel Paris - Reception",
          type: "Hotel - Express Check-out",
          item: "Night + Minibar",
          success: "Deposit & Identity Verified"
        },
        cinema: {
          title: "UGC Cinemas - Access Control",
          type: "Ticket & Student Discount",
          item: "Movie Entry",
          success: "Access Granted"
        },
        rental: {
          title: "AutoRent Express - Agency",
          type: "Vehicle Rental",
          item: "Security Deposit",
          success: "License Verified"
        }
      }
    },
    scanner: {
      title: 'QR Code Scanner',
      target: 'Target Merchant QR Code',
      btnOpen: 'Open Virtual Viewfinder',
      simInstruction: 'Manual Nonce Input (Local Demo)',
      subtitle: 'Aim at the QR code to initiate the transaction.',
      errorEmpty: 'Please enter a nonce or scan a QR code.',
      errorInvalid: 'Invalid QR code or session expired.',
      errorNetwork: 'Network error:',
      placeholder: 'Enter nonce here...',
      btnScan: 'Simulate Scan',
      acquiring: 'Acquiring...'
    },
    consent: {
      title: 'EUDI Data Request',
      subtitle: 'The merchant terminal requires your data defensively and decentralized.',
      sovereigntyTitle: 'Sovereignty & Privacy by Design',
      sovereigntyDesc: "Zero-Knowledge proofs are fully verified locally by the terminal via EBSI. Your clear-text identity is never sent to the cloud.",
      transmitTitle: 'Data to transmit',
      btnSca: 'Continue (FaceID)',
      btnCancel: 'Cancel Authorization',
      noMandate: "No mandate in your wallet permits a purchase under the {scope} scope. Transaction blocked."
    },
    mandates: {
      title: 'Mandates',
      active: 'active',
      actives: 'active',
      btnDelegate: 'Delegate',
      warningAuto: "In autonomous mode, you formally delegate to the agent the right to initiate payments dynamically, within the established limits.",
      btnSign: 'Sign & Delegate via FaceID',
      emptyState: 'No active mandates.',
      emptyStateDesc: 'Create a delegation mandate so your agent can act on your behalf.',
      btnHide: 'Hide from history',
      btnRevoke: 'Revoke this mandate',
      expired: 'EXPIRED',
      coveredCategory: 'Covered category',
      limit: 'Limit',
      rails: 'Rail(s)',
      expiry: 'Expiry',
      noLimit: 'No limit',
      daysLeft: '{days} days',
      autoExecute: 'Autonomous Execution (AP2 §4.1)',
      autoExecuteDesc: 'AI executes frictionlessly within mandate limits',
      approvalRequired: 'Approval required per transaction',
      approvalRequiredDesc: 'Every transaction requires your FaceID validation (SCA)',
      signedOn: 'EUDI §3 — SD-JWT VC — Signed on {date}',
      delegationNotice: 'A Priori Delegation',
      delegationNoticeBold: '(EUDI Art.5 & PSD3)',
      delegationNoticeDesc: '— A single biometric approval defines your AI agent\'s rights. SCA (Strong Customer Authentication) is only required at mandate creation, not at each transaction.',
      newMandate: 'New Delegated Mandate',
      maxLimit: 'Max limit (€)',
      durationDays: 'Duration (days)',
      merchantCategory: 'Merchant category',
      paymentRail: 'Payment rail',
      fullAuto: 'Full autonomous execution',
      fullAutoDesc: 'Agent pays automatically within limits — zero friction',
      humanInTheLoop: 'Human validation per transaction',
      humanInTheLoopDesc: 'FaceID required for each payment (Human-in-the-loop, DSP2/PSD3)',
      biometricValidation: 'Biometric validation (SCA)...',
      hideHistory: 'Hide history',
      showHistory: 'Show history ({count} revoked)',
      scopes: {
        retail: 'Regulated Purchases (Gambling/Alcohol)',
        perfume: 'Retail & Cosmetics',
        hotel: 'Hotel & Check-in',
        rental: 'Vehicle Rentals',
        it: 'IT Services (API/Providers)',
        infrastructure: 'Infrastructure & Subscriptions',
        tickets: 'Ticketing & Entertainment',
        all: 'All categories (Unlimited)'
      },
      railsOptions: {
        sepa: '🏦 SEPA (Banking - PSD3)',
        eurc: '🔗 EURC Stablecoin (ERC-4337)',
        l402: '⚡ L402 Micro-payments (Lightning)'
      }
    }
  }
};
