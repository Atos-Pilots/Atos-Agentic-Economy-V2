# Spécifications Techniques : Pilote Agentic Payment (État Actuel de l'Implémentation)

Ce document décrit en détail l'architecture, les patterns et les concepts implémentés dans la dernière version vancée de la démo Atos Agentic Economy.

## 1. Architecture Globale et Acteurs

L'architecture est construite autour de trois composants principaux côté client (Frontend) simulant des entités distinctes, soutenus par un backend monolithique (Node.js) orchestrant le comportement des entités distribuées.

1. **Identity Vault (Le Wallet EUDI)** : Portefeuille souverain géré par le citoyen. Il sert de coffre-fort cryptographique, abrite la "Galerie" des preuves cryptographiques (Verifiable Credentials / SBT) et permet de générer des **Mandats de Délégation**.
2. **Companion Agent (L'Agent Personnel IA)** : Assistant IA qui reçoit les intentions de l'utilisateur (via chat) et négocie de manière autonome avec les marchands.
3. **Control Room (Dashboard)** : Écran grand format destiné à démontrer au public l'activité transactionnelle asynchrone ("Sous le capot"), combinant Console IA et Blockchain Ledger.

## 2. Modèles de Données (Prisma ORM)

La base de données repose sur SQLite via Prisma, centrée actuellement sur la gestion des délégations :
- Modèle `DelegationMandate` :
  - `mandate_id` (UUID), `subject_ref`, `scope` (ex: beauty, travel).
  - `max_amount`, `currency`, `authorized_rails` (ex: SEPA, STABLECOIN_EURC).
  - `auto_execute` (Boolean) : Détermine si l'agent peut payer en "Zero-Click" (True) ou nécessite un "Human-in-the-Loop" asynchrone (False).
  - `expires_at`, `status` (ACTIVE, REVOKED, EXPIRED).

## 3. Protocoles & Mécanismes Implémentés

### A. UCP (Universal Commerce Protocol)
Protocole conversationnel B2B pour la négociation de services :
- **Search (`/ucp/search`)** : Requête de catalogues marchands. Implémente nativement un **Paywall L402** (Code HTTP 402 - Payment Required). Si l'agent IA cherche sans payer, le serveur rejette la demande avec une exigence de jeton macaroon/lightning. L'agent règle des micro-frais (ex: 0.05 EURC) pour récupérer le catalogue.
- **Checkout (`/ucp/checkout/prepare`)** : Sélectionne l'offre et prépare la structure de la transaction.

### B. AP2 (Agentic Payment Protocol)
Sépare la phase de sélection du transfert de valeur final :
- **Authorize (`/ap2/payment-intents/:id/authorize`)** : Appelle le `Policy Engine` côté backend pour valider que le Mandat utilisé a les fonds, correspond à la catégorie, et est actif.
- **Confirm (`/ap2/payment-intents/:id/confirm`)** : Exécute le paiement via le sous-connecteur requis (SEPA, Bitcoin, EURC simulés).

### C. Gestion des Mandats (Délégation A Priori)
Implémentation avancée de la PSD3 / EUDI 2.0 :
- L'utilisateur utilise FaceID *une seule fois* (SCA upfront) lors de la création d'un plafond autorisé.
- L'IA vérifie nativement ce mandat avant l'achat. Si `auto_execute = true`, l'IA procède sans friction.
- Si le plafond est dépassé ou si l'utilisateur exige une validation par transaction, le backend envoie une **Push Notification asynchrone (via SSE - Server Sent Events)** que le Mobile Wallet intercepte (`/consent/request`). L'utilisateur valide alors à distance (`execute-remote`).

### D. Le Saga Orchestrator (Circuit Breakers & Résilience)
La robustesse est assurée par un orchestrateur asynchrone (Saga Pattern) basé sur un bus d'événements interne (`EventBus`). Les états : `PENDING` -> `EXECUTING` -> `MERCHANT_CONFIRMATION_PENDING` -> `COMPLETED`.
- Le système dispose de **Timeouts** : Si le marchand ne confirme pas sous X secondes, le système procède à un état `COMPENSATION_REQUIRED` (Remboursement de la machine).
- Un interrupteur (Circuit breaker) écoute les révocations manuelles (`mandate.revoked`). Si un mandat est révoqué via le Wallet pendant un achat asynchrone, le paiement de l'agent est instantanément `CANCELLED`.
- La passerelle (`Gateway`) implémente un Middleware `Chaos Engineering`, ajoutant artificiellement de la latence ou de l’échec probabiliste (10%) pour simuler des nœuds instables, justifiant l'utilisation de la Saga.

### E. Moteur de Preuves (Receipt Engine SBT & W3C)
Une fois la transaction confirmée (`purchase.completed`), le `Receipt Engine` forge un *W3C Verifiable Credential* (Signé en Ed25519) et émet un Soulbound Token (ERC-5114) factice vers le Wallet. Ces preuves s'affichent dynamiquement dans la Galerie du Wallet en temps réel pour l'historique d'audit.

## 4. Stack Applicative

- **Backend** : Node.js (TypeScript), Express.js. Architecture par Contrôleurs et Services sans Framework lourd. 
- **Persistance** : Prisma, SQLite, variables en mémoire (pour les reçus volatils et les intent en cours de Saga).
- **Frontend** : Vite, React 18, CSS Modulaire et design asynchrone (Glassmorphism, animations fluides).
- **Communication Real-Time** : Server-Sent Events (SSE) via `/v1/telemetry/stream` (pour notifier le Dashboard ET le Wallet des poussées d'intention et des mints SBT).

## 5. Synthèse & Problématiques de design pour évolution

La version actuelle a réussi à matérialiser visuellement la fluidité d'un achat délégué avec résilience (Saga, mandats, receipt). Cependant, d'un point de vue évolutif :
1. **Centralisation** : Les agents, le registre (`AgentRegistry`) et l'orchestrateur sont tous dans le même thread mémoire Node. Pour un vrai M2M, ils devraient être des microservices appelables via TLS mutuel (mTLS).
2. **Mock Cryptographique** : Les attestations W3C sont mockées (hash simple). La prochaine ambition technique devrait relier ces signatures à une vraie librairie cryptographique d'Identité Décentralisée (DID).
3. **Standard externe** : L'AP2 et l'UCP sont émulés en interne via de simples appels Axios inter-contrôleurs ; ils devraient idéalement suivre des vocabulaires JSON-LD stricts.
