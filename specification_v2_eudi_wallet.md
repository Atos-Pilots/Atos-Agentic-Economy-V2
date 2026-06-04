# Spécification détaillée V2 — Pilote Antigravity EUDI Wallet

## 1. Objet

Cette spécification définit la V2 du pilote existant développé via Antigravity afin d’aligner la démonstration avec la vision cible du futur EUDI Wallet européen dans un cadre compatible avec eIDAS 2.0.

La V2 doit permettre à un utilisateur et à un retailer ou fournisseur de service/produit de finaliser une transaction ou un contrôle par un mécanisme simple de présentation et de scan de QR-code, tout en conservant la complexité nécessaire côté architecture, conformité, preuve, paiement, consentement et audit.

Le pilote doit rester simple à démontrer, mais il doit être conçu comme une base crédible d’évolution vers un wallet européen conforme aux pratiques et standards émergents.

### 1.1 Cadre des Preuves de Concept (POC) et Rôles AP2 / Mastercard VI

Each POC is expected to instantiate the roles defined by Google Agentic Payments Protocol (AP2) and implement credentials and mandates aligned with Mastercard Verifiable Intent, with responsibilities distributed across participants to reflect realistic ecosystem conditions. It is therefore expected that participating actors have a sufficient understanding of these protocols and specifications, including their respective trust, payment, and interaction models.

CB plans to conduct three POCs exploring different allocations of the AP2 roles, with a particular focus on the roles of:
- **Credential Provider**
- **Trusted Surface**

These roles are expected to have the greatest influence on:
- User experience and trust perception
- Brand visibility
- Payment instrument selection
- Compliance with the overarching principles and core functional requirements defined in this document

In particular, the Trusted Surface used to capture and sign the Checkout Mandate may differ from the Trusted Surface used to capture and sign the Payment Mandate.
The objectives of the POCs are called out by section 1.2 in the beginning of the document.

### 1.2 Choix Technologiques Fondamentaux (UCP, AP2, Mastercard VI) et Alignement Marché

Les choix d'implémentation de la plateforme reposent sur des standards ouverts pour garantir l'adoption et la pérennité :
- **Google Agentic Payments Protocol (AP2)** pour la couche de paiement (Payment Layer).
- **Mastercard Verifiable Intent (VI)** pour la couche de vérification de l'intention (Intent Verification Layer).

Ces choix se justifient par :
- **Ouverture et Interopérabilité** : Les spécifications de l'UCP, de l'AP2 et du VI sont open-source et publiques, favorisant la collaboration industrielle, l'interopérabilité et limitant les dépendances aux écosystèmes propriétaires.
- **Alignement avec FIDO** : L'alliance FIDO a intégré AP2 et Verifiable Intent comme briques de base de ses futures spécifications pour le commerce agentique.

**Note sur l'implémentation de l'UCP (Universal Commerce Protocol) :**
Bien que l'UCP soit le choix naturel pour la couche commerciale ("Commerce Layer"), la priorité de ces POCs se concentre sur les aspects de confiance, de justificatifs d'identité et de rails de paiement sécurisés. Ainsi, pour réduire la complexité technique, les aspects de découverte de marchands compatibles par les agents IA, d'interactions approfondies avec les catalogues produits ou de négociations de remises complexes par les agents d'achat (Shopping Agents) ne sont pas traités comme prioritaires. Ils sont émulés de manière simplifiée dans notre architecture via des flux d'offres internes UCP, laissant le transport agnostique pour plus de flexibilité.

### 1.3 Cycle de Vie et Création des Mandats (État de l'Art et Validation Explicite)

Pour concilier l'état de l'art technologique et la conformité stricte en matière de consentement de l'utilisateur :
1. **Création assistée/automatique d'un brouillon de mandat (Draft Mandate)** : Lors de la phase de checkout, le marchand (ou l'agent d'achat) génère automatiquement une proposition de mandat pré-configurée avec les paramètres attendus (limite budgétaire suggérée, rails requis comme les stablecoins EURC ou virement SEPA, validité temporelle).
2. **Présentation et Revue Explicite dans le Wallet** : Ce projet de mandat est transmis au EUDI Wallet de l'utilisateur. Le portefeuille n'approuve rien en tâche de fond de manière opaque. Il affiche le mandat à l'écran sous une forme hautement lisible.
3. **Personnalisation et Signature par l'utilisateur** : L'utilisateur conserve le contrôle souverain. Il peut accepter le mandat tel quel, ou en modifier manuellement les limites (par exemple, baisser le montant maximum par transaction). Il valide ensuite explicitement le mandat à l'aide de son authentification forte (SCA biométrique, ex. Face ID), générant la signature cryptographique Ed25519 matérielle locale stockée dans le Secure Enclave.

## 2. Référentiel de départ

Le pilote existant comprend déjà les briques suivantes :
- Identity Vault jouant le rôle de wallet souverain.
- Companion Agent jouant le rôle d’agent personnel IA.
- Control Room pour la démonstration temps réel.
- Backend Node.js orchestrant les interactions.
- Gestion des mandats de délégation de paiement.
- UCP pour la négociation d’offres.
- AP2 pour l’autorisation et la confirmation de paiement.
- Saga Orchestrator pour la résilience et la compensation.
- Receipt Engine pour l’émission de preuves/reçus.

Ces composants et patterns restent valides en V2 et ne doivent pas être supprimés. Ils doivent être enrichis par une couche de présentation conforme à la logique EUDI Wallet.

## 3. Vision produit V2

Le pilote V2 doit couvrir un modèle où :
- le retailer ou fournisseur exprime un besoin minimal d’informations ;
- l’utilisateur contrôle finement ce qui est partagé depuis son wallet ;
- la présentation des informations s’effectue via QR-code ;
- les informations d’identité doivent être minimisées ;
- lorsque pertinent, une preuve à divulgation sélective ou Zero Knowledge Proof doit être privilégiée ;
- lorsque pertinent, les informations de paiement peuvent être combinées avec les autres preuves dans une même séquence transactionnelle ;
- les mandats agentiques déjà conçus restent utilisables ;
- l’ensemble produit une expérience très simple en façade, mais pilotée par une architecture riche et extensible.

## 4. Principes directeurs

### 4.1 Minimisation des données
Le système ne doit jamais transmettre l’identité complète si une simple preuve de majorité, d’éligibilité, de fidélité, de réservation ou de mandat suffit.

### 4.2 Consentement explicite
Le wallet doit toujours afficher à l’utilisateur ce qui est demandé, pourquoi, par qui, et pour combien de temps, sauf dans le cas précis d’un mandat préautorisé couvrant explicitement l’opération.

### 4.3 Séparation besoin métier / attributs
Le retailer n’exprime pas d’abord une liste brute de données. Il exprime un besoin métier, par exemple :
- vérifier majorité > 18 ans ;
- vérifier identité ;
- vérifier statut premium ;
- récupérer un moyen de paiement ou un mandat ;
- pousser une facture ;
- mettre à jour une carte de fidélité.

Le système traduit ensuite ce besoin en présentation minimale d’attributs.

### 4.4 Conformité et évolutivité
Le pilote doit être compatible conceptuellement avec les cadres EUDI Wallet, OpenID4VC/OpenID4VP, présentation sélective, credentials vérifiables, et logiques de preuve forte. Même si certains éléments sont mockés dans le pilote, leur structure doit être conforme aux standards cibles.

### 4.5 Simplicité de démonstration
Le démonstrateur doit pouvoir être exécuté de manière fluide en salon, atelier ou soutenance client avec quelques parcours clairs, sans dégrader la profondeur fonctionnelle de l’architecture.

## 5. Cas d’usage à couvrir

### 5.1 Achat réglementé avec preuve d’âge et paiement
Exemple : achat d’un paquet de cigarettes.
Le retailer ne doit recevoir que :
- la preuve que l’utilisateur a plus de 18 ans ;
- l’autorisation ou le moyen de paiement nécessaire à la transaction.

La date de naissance complète ne doit pas être révélée si une preuve booléenne ou un ZKP de majorité suffit.

### 5.2 Achat agentique e-commerce
L’agent personnel recherche un produit ou service, prépare la transaction, puis s’appuie sur un mandat existant ou sollicite l’utilisateur pour finaliser la preuve d’identité, la preuve d’éligibilité ou le paiement.

### 5.3 Achat loterie / Française des Jeux
Le fournisseur reçoit au minimum :
- la preuve de majorité ;
- le paiement ;
- éventuellement un identifiant pseudonyme de transaction si nécessaire pour l’audit.

### 5.4 Check-in ou embarquement accéléré en aéroport (Compagnie Aérienne)
Exemple : Enregistrement prioritaire Air France Terminal 2F.
Dans ce scénario marchand physique, la borne d'embarquement (Trusted Surface) interagit en proximité avec l'EUDI Wallet de l'utilisateur :
- Le voyageur scanne le QR-code de la borne ou présente son propre code.
- Le wallet transmet de manière sélective l'attestation de réservation du vol, la preuve de conformité d'identité (sans divulguer l'intégralité des données personnelles) et le statut de fidélité Premium (Loyalty Silver/Gold).
- L'écosystème valide instantanément les justificatifs cryptographiques pour débloquer l'accès prioritaire (Fast-Track) aux portillons d'embarquement, sans aucun flux de paiement associé.

### 5.5 Contrôle d’identité ou douanier
Le système doit aussi supporter un mode avec identité complète ou renforcée lorsque la réglementation l’exige. Ce cas d’usage justifie que le wallet puisse partager une identité forte, mais seulement dans les scénarios légitimes.

### 5.7 Achat récurrent en ligne (Abonnement Média Netflix / Apple TV)
Exemple : Souscription à l'abonnement mensuel Netflix Premium (19,99 €/mois).
Dans ce scénario d'agentic commerce par abonnement :
- L'utilisateur souscrit en ligne en autorisant son portefeuille à agir en tant que Credential Provider.
- Le portefeuille génère et signe un **Mandat de Paiement Récurrent** (Payment Mandate) encadré par des clauses strictes d'auto-exécution : prélèvements limités à un maximum de 20,00 € par mois sur le compte bancaire (ex. Crédit Agricole) lié à son attestation SCA.
- Le commerçant vérifie la preuve du mandat et de l'attestation SCA pour finaliser instantanément la souscription. Chaque mois, le paiement récurrent s'exécute automatiquement en tâche de fond dans le respect du mandat, et la facture est directement poussée dans le coffre-fort du portefeuille mobile.

### 5.8 Achat et activation d'un service IT agentique Atos AI (Agent IA MCP autonome)
Exemple : Achat de l'agent consultant autonome "Atos Polaris AI" (450,00 € + frais d'audit).
Ce cas d'usage combine la puissance des architectures d'agents IA modernes et des protocoles de paiement agentique (AP2/X402) :
- **Achat Initial** : Le client achète en ligne le package logiciel d'Atos Polaris AI. Il présente son attestation d'identité d'entreprise et signe via son portefeuille mobile une transaction sécurisée de 450,00 € (incluant l'attestation cryptographique SCA de sa banque, ex. Crédit Agricole).
- **Activation MCP (Model Context Protocol)** : Une fois la transaction validée sur le registre, l'agent Atos Polaris AI est activé et s'intègre nativement comme un agent dans l'environnement de production du client (ex: Slack, GitHub, Cloud d'entreprise). Il est rendu appelable dynamiquement via le protocole MCP de Model Context Protocol pour exécuter des tâches d'audit et de remédiation d'infrastructure IT en temps réel.
- **Micro-paiements Délégués (DePIN Serverless Compute API)** : Pour fonctionner de manière totalement autonome lors de ses audits d'infrastructure, l'agent IA fait appel à une **API de Calcul Souverain Serveur (Serverless Compute API)**. 
  Pour chaque tâche, l'agent instancie dynamiquement un conteneur d'inférence éphémère exécutant un modèle d'analyse Open Source récupéré depuis le hub **HuggingFace** (ex: *LogBERT* ou *Mistral-7B-Logs*). 
  Les secrets et jetons d'accès nécessaires pour interroger ces APIs distantes sont gérés de façon sécurisée via un **Secret Management décentralisé** (HSM/Coffre-fort décentralisé compatible avec l'identité de l'entreprise), évitant d'exposer des clés privées sur les serveurs d'exécution.
  Chaque calcul s'accompagne d'une **validation cryptographique par consensus** (vérification de la bonne exécution du modèle par des tiers validateurs) pour s'assurer que le modèle n'a pas été manipulé par le nœud de calcul éphémère.
  Le règlement des ressources calculatoires consommées au prorata du temps d'exécution (ex: quelques minutes de GPU) s'effectue en arrière-plan de manière autonome (sans intervention humaine) via le protocole **AP2** (stablecoins EURC ou virements instantanés), dans la limite stricte du **mandat de délégation agentique** préalablement configuré et signé par le CTO (max 50,00 € par tâche d'inférence).

### 5.6 Facturation, fidélité et justificatifs
Après transaction, le fournisseur doit pouvoir émettre vers le wallet :
- une facture ;
- un reçu ;
- une mise à jour de points de fidélité ;
- éventuellement une preuve de service rendu.

## 6. Modèle d’interaction cible

Le pilote V2 doit supporter deux modes principaux.

### 6.1 Mode A — QR présenté par le retailer et scanné par le wallet
Usage typique : paiement en ligne, borne, e-commerce, parcours agentique.

Séquence :
1. Le retailer crée une demande de présentation.
2. Le retailer affiche un QR-code.
3. L’utilisateur scanne le QR depuis son application wallet.
4. Le wallet récupère la demande, affiche les attributs demandés, demande consentement.
5. Le wallet génère une présentation vérifiable minimale.
6. Le retailer vérifie les preuves.
7. Si nécessaire, le flux de paiement AP2 est déclenché.
8. Les reçus/factures sont renvoyés vers le wallet.

### 6.2 Mode B — QR présenté par le wallet et scanné par le retailer
Usage typique : proximité physique, caisse, contrôle, embarquement, douane.

Séquence :
1. Le wallet prépare un QR de présentation ou d’engagement de session.
2. Le terminal retailer scanne ce QR.
3. Une session de présentation est établie.
4. Le retailer formule sa demande minimale.
5. Le wallet affiche ce qui est demandé et recueille le consentement.
6. Le wallet transmet les preuves minimales.
7. Le retailer vérifie puis poursuit la transaction ou le contrôle.

Le pilote peut simplifier techniquement certains transports de proximité, mais doit être structuré pour converger vers les modes recommandés par les standards européens.

## 7. Positionnement des standards à implémenter

Le pilote V2 doit prendre en compte les concepts suivants :
- EUDI Wallet Architecture Reference Framework.
- OpenID for Verifiable Presentations (OpenID4VP).
- OpenID for Verifiable Credentials si émission simulée de credentials.
- Verifiable Credentials / attestations vérifiables.
- SD-JWT ou mécanisme équivalent pour la divulgation sélective.
- ZKP ou simulation crédible pour preuves de majorité / seuil.
- Modèle de présentation multi-credentials dans une seule opération.

Dans le pilote, les standards peuvent être implémentés de manière réaliste mais simplifiée. L’important est que les interfaces, les payloads, les rôles et la logique de décision soient alignés avec la cible.

## 8. Architecture cible V2

### 8.1 Composants existants à conserver
- Identity Vault.
- Companion Agent.
- Control Room.
- Backend monolithique Node.js.
- AP2.
- UCP.
- Saga Orchestrator.
- Receipt Engine.

### 8.2 Nouveau composant à créer
Ajouter un composant **Retailer Terminal / Verifier App**.

Ce composant représente le point de vue du fournisseur et doit permettre :
- de définir un cas d’usage ;
- de générer une demande de présentation ;
- d’afficher ou scanner un QR-code ;
- de vérifier une présentation ;
- de déclencher le flux de paiement ;
- d’émettre un reçu, une facture ou une mise à jour fidélité.

### 8.3 Extension du Wallet
Le wallet doit devenir un vrai gestionnaire d’attributs partagés et non seulement un coffre-fort de preuves et de mandats.

Il doit pouvoir :
- stocker des credentials différents ;
- arbitrer leur partage ;
- générer une présentation minimale ;
- produire un QR ;
- consigner l’historique des partages ;
- recevoir des factures et cartes de fidélité.

## 9. Vue fonctionnelle côté utilisateur

L’application mobile côté utilisateur doit comporter au minimum les modules suivants.

### 9.1 Mes preuves / Mes credentials
Contient :
- identité (PID ou équivalent) ;
- preuves de majorité ;
- mandats de paiement ;
- cartes de fidélité ;
- reçus et factures ;
- autres justificatifs.

Chaque credential doit présenter :
- son type ;
- son émetteur ;
- son niveau de confiance ;
- son statut ;
- sa date de validité ;
- les règles de partage.

### 9.2 Scanner / Présenter
Deux actions principales :
- scanner un QR-code du retailer ;
- présenter un QR-code depuis le wallet.

L’écran doit afficher avant consentement :
- le nom du demandeur ;
- le cas d’usage ;
- les attributs demandés ;
- les attributs effectivement transmis ;
- si une preuve ZKP est utilisée ;
- si un paiement est inclus ;
- si un mandat existant est mobilisé.

### 9.3 Transactions et activité
Historique unifié des :
- paiements ;
- présentations de credentials ;
- mandats utilisés ;
- factures reçues ;
- points de fidélité crédités ;
- refus ou expirations.

### 9.4 Gestion des mandats
Reprendre et étendre la logique existante :
- création de mandat ;
- plafond ;
- catégories d’usage ;
- rails autorisés ;
- auto-exécution ;
- révocation ;
- consentement asynchrone si dépassement ou exception.

### 9.5 Paramètres de confidentialité
L’utilisateur doit pouvoir régler :
- partage automatique autorisé ou non ;
- usage des preuves de majorité ;
- partage pseudonymisé ;
- rétention locale des traces ;
- suppression ou archivage des reçus.

## 10. Vue fonctionnelle côté retailer / fournisseur

Le terminal retailer doit comporter les modules suivants.

### 10.1 Catalogue de politiques de demande
Le retailer ne choisit pas des attributs bruts au hasard. Il choisit un modèle métier, par exemple :
- Age Gate 18+ ;
- Identity Basic ;
- Identity Strong ;
- Loyalty Check ;
- Boarding Fast Track ;
- Agentic Payment ;
- Invoice Push ;
- Customs Control.

Chaque modèle métier est traduit en politique de réclamation minimale.

### 10.2 Génération de demande
Le terminal génère une demande formelle de présentation incluant :
- identifiant du retailer ;
- cas d’usage ;
- attributs requis ;
- attributs optionnels ;
- acceptation ou non d’une preuve ZKP ;
- besoin de paiement ;
- expiration ;
- nonce anti-rejeu.

### 10.3 Scan et vérification
Le terminal doit être capable :
- de scanner un QR présenté par le wallet ;
- ou d’afficher un QR à scanner par le wallet ;
- de recevoir la présentation ;
- de valider signature, format, cohérence, expiration, nonce, statut ;
- de transmettre la décision métier aux étapes suivantes.

### 10.4 Paiement
Si paiement requis :
- récupération du mandat ou du token de paiement ;
- appel à AP2 authorize ;
- appel à AP2 confirm ;
- affichage du statut final.

### 10.5 Post-transaction
Le retailer doit pouvoir renvoyer au wallet :
- la facture ;
- le reçu ;
- l’événement fidélité ;
- l’attestation de service.

## 11. Règles de minimisation par cas d’usage

### 11.1 Achat cigarettes
Attributs attendus :
- preuve `age_over_18 = true` ;
- moyen de paiement ou mandat ;
- identifiant de session pseudonyme.

À ne pas transmettre par défaut :
- nom complet ;
- date de naissance complète ;
- adresse ;
- identité civile complète.

### 11.2 FDJ / loterie
Attributs attendus :
- preuve de majorité ;
- paiement ;
- journal de consentement.

### 11.3 Hôtel
Attributs potentiels :
- identité minimale ;
- réservation ;
- carte de fidélité ;
- paiement si nécessaire.

### 11.4 Compagnie aérienne
Attributs potentiels :
- preuve de réservation ;
- statut premium ;
- identité minimale ou forte selon étape ;
- aucun paiement si déjà couvert.

### 11.5 Douane / contrôle réglementaire
Attributs attendus :
- identité forte ;
- justificatif documentaire ;
- nationalité ;
- autre attribut réglementaire si requis.

## 12. Agrégation identité + paiement

Le pilote V2 doit gérer deux modèles.

### 12.1 Modèle agrégé en une seule opération logique
Le wallet fournit dans une même présentation :
- une ou plusieurs preuves d’identité/éligibilité ;
- un mandat ou un token de paiement.

Ce mode est à privilégier pour la fluidité de l’expérience lorsque le standard et l’architecture retenus le permettent.

### 12.2 Modèle chaîné en deux sous-étapes transparentes
Si l’agrégation complète n’est pas réaliste dans certains cas :
1. le retailer vérifie d’abord les preuves d’identité/éligibilité ;
2. le système déclenche immédiatement ensuite l’autorisation de paiement.

Dans l’expérience utilisateur, cela doit apparaître comme une seule interaction, même si le backend exécute deux sous-étapes.

### 12.3 Règle d’implémentation
Le pilote doit donc être conçu avec une abstraction “Unified Transaction Session” permettant :
- soit une présentation agrégée ;
- soit une orchestration en deux phases ;
- sans changer l’expérience frontale.

## 13. Zero Knowledge Proof et divulgation sélective

### 13.1 Règle générale
Dès qu’un cas d’usage peut être satisfait par une preuve de seuil ou une affirmation booléenne, la V2 doit privilégier :
- un ZKP ;
- ou à défaut une divulgation sélective ne révélant que le minimum.

### 13.2 Cas prioritaires de ZKP
Le pilote doit couvrir au minimum :
- `age_over_18` ;
- `age_over_16` si utile ;
- `loyalty_above_tier_X` si démontré ;
- potentiellement `residency_in_country = true` pour démonstration.

### 13.3 Si ZKP complet non disponible
Le pilote peut simuler la mécanique par :
- génération d’un proof object ;
- vérification d’un engagement cryptographique ;
- non-divulgation de la valeur source.

L’important est de matérialiser l’expérience, la logique de consentement, le contrôle d’accès, les payloads et la vérification.

## 14. Modèle de données à ajouter

En complément de `DelegationMandate`, ajouter au minimum les entités suivantes.

### 14.1 EUDIAttribute
Représente un attribut ou credential stocké dans le wallet.

Champs recommandés :
- `id`
- `subject_ref`
- `type`
- `issuer`
- `format`
- `payload`
- `sd_jwt`
- `zkp_capable`
- `expires_at`
- `status`
- `created_at`

### 14.2 PresentationSession
Représente une session de partage / présentation.

Champs recommandés :
- `id`
- `session_nonce`
- `mode` (`WALLET_SCAN`, `TERMINAL_SCAN`)
- `retailer_id`
- `use_case`
- `requested_attributes`
- `shared_attributes`
- `zkp_used`
- `payment_requested`
- `payment_combined`
- `status`
- `created_at`
- `expires_at`

### 14.3 RetailerClaimPolicy
Politique de minimisation par use case.

Champs recommandés :
- `id`
- `retailer_id`
- `use_case`
- `required_attributes`
- `optional_attributes`
- `accept_zkp`
- `require_payment`
- `invoice_push_enabled`
- `loyalty_update_enabled`

### 14.4 WalletDocument
Pour stocker les reçus, factures et autres documents.

Champs recommandés :
- `id`
- `subject_ref`
- `type`
- `issuer`
- `document_ref`
- `payload`
- `related_transaction_id`
- `created_at`

### 14.5 LoyaltyArtifact
Pour cartes ou statuts de fidélité.

Champs recommandés :
- `id`
- `subject_ref`
- `provider`
- `tier`
- `points_balance`
- `member_id`
- `updated_at`

## 15. API à implémenter

### 15.1 Wallet
- `GET /wallet/attributes`
- `GET /wallet/documents`
- `GET /wallet/loyalty`
- `GET /wallet/presentation-sessions`
- `POST /wallet/scan-request`
- `POST /wallet/generate-presentation`
- `POST /wallet/generate-qr`
- `POST /wallet/consent/approve`
- `POST /wallet/consent/reject`
- `POST /wallet/mandates/:id/revoke`

### 15.2 Retailer / Verifier
- `GET /retailer/claim-policies`
- `POST /retailer/claim-policies`
- `POST /retailer/presentation-request`
- `POST /retailer/scan-wallet-qr`
- `POST /retailer/verify-presentation`
- `POST /retailer/push-invoice`
- `POST /retailer/push-loyalty-update`

### 15.3 Orchestration paiement
Conserver :
- `POST /ap2/payment-intents/:id/authorize`
- `POST /ap2/payment-intents/:id/confirm`

Étendre pour permettre la corrélation avec `PresentationSession`.

## 16. Payloads conceptuels

### 16.1 Politique de demande retailer
Exemple conceptuel :

```json
{
  "use_case": "AGE_GATE_PAYMENT",
  "required_attributes": ["age_over_18"],
  "optional_attributes": ["loyalty_member_id"],
  "accept_zkp": true,
  "require_payment": true,
  "accepted_payment_modes": ["MANDATE", "TOKENIZED_CARD", "SEPA", "EURC"],
  "invoice_push_enabled": true
}
```

### 16.2 Session de présentation

```json
{
  "session_nonce": "uuid",
  "retailer_id": "retailer:tabac:001",
  "use_case": "AGE_GATE_PAYMENT",
  "requested_attributes": ["age_over_18", "payment_mandate"],
  "expires_at": "2026-04-20T10:30:00Z"
}
```

### 16.3 Résultat de présentation côté wallet

```json
{
  "session_nonce": "uuid",
  "shared_attributes": ["age_over_18", "payment_mandate"],
  "zkp_used": true,
  "payment_combined": true,
  "presentation_token": "<opaque_token_or_sd_jwt_vp>",
  "consent_ref": "consent_123"
}
```

## 17. UX détaillée — Parcours de référence

### 17.1 Parcours “Achat cigarettes”
1. Le terminal retailer choisit le use case “Age Gate Payment”.
2. Le terminal génère un QR-code.
3. L’utilisateur ouvre son wallet et scanne le QR-code.
4. Le wallet affiche :
   - marchand ;
   - montant ;
   - preuve demandée : majorité > 18 ;
   - paiement demandé ;
   - donnée exacte transmise : preuve booléenne uniquement.
5. L’utilisateur valide avec biométrie/PIN.
6. Le wallet envoie une présentation agrégée.
7. Le retailer vérifie la preuve et lance AP2.
8. La transaction est confirmée.
9. Le reçu et la facture sont poussés vers le wallet.

### 17.2 Parcours “Achat agentique”
1. L’utilisateur mandate son agent pour un achat.
2. L’agent négocie et prépare le checkout via UCP.
3. Si le mandat couvre l’achat et que le contexte est autorisé, l’agent déclenche la transaction.
4. Si une preuve complémentaire est requise, le wallet reçoit une demande de consentement.
5. L’utilisateur valide ou refuse.
6. L’orchestrateur poursuit ou annule la saga.

### 17.3 Parcours “Embarquement premium en aéroport” (Air France)
1. Le voyageur s'approche du portillon d'embarquement prioritaire Air France.
2. La borne (Trusted Surface) formule une requête OpenID4VP demandant la preuve de réservation de vol (`BoardingPass`) et l'attestation de fidélité Premium (`LoyaltyArtifact` de niveau Silver/Gold).
3. Le voyageur ouvre son portefeuille, scanne le QR-code de la borne (ou interagit via NFC).
4. Le portefeuille effectue une vérification de divulgation sélective, affiche à l'écran les informations requises et confirme l'absence de toute donnée civile complète (nom/prénom non partagés, seule la validité du billet et du statut est envoyée).
5. L'utilisateur consent. Le portefeuille transmet la preuve cryptographique.
6. Le terminal valide le jeton de présentation, allume le signal vert et ouvre les barrières de l'accès prioritaire (Fast-Track).

### 17.4 Parcours “Abonnement Média Récurrent” (Netflix)
1. L'utilisateur sélectionne l'offre Netflix Premium sur la page d'abonnement en ligne.
2. Le site web (Trusted Surface Marchande) génère une session unifiée réclamant une preuve de signature de mandat récurrent associée à une clé SCA valide.
3. L'utilisateur scanne le QR-code avec son EUDI Wallet.
4. Le portefeuille mobile charge le formulaire de création de mandat : il configure un **Payment Mandate** récurrent rattaché au compte bancaire Crédit Agricole, plafonné à 20,00 € par mois.
5. L'utilisateur valide le mandat à l'aide de Face ID. La clé cryptographique Ed25519 stockée dans le Secure Enclave signe le mandat de paiement.
6. Netflix reçoit l'attestation signée, vérifie les signatures cryptographiques et active l'accès. Chaque mois, le paiement s'exécute de façon autonome (AP2 §4.1), et la facture acquittée est envoyée au wallet.

### 17.5 Parcours “Achat d'Agent IA IT avec MCP” (Atos Polaris AI)
1. Le CTO d'une entreprise commande l'agent consultant Atos Polaris AI sur le portail IT cloud d'Atos.
2. Le portail d'Atos formule une requête de présentation : preuve d'identité de l'entreprise (`CompanyIdentity`) et confirmation du paiement initial de 450,00 € (nécessitant une authentification SCA forte).
3. Le CTO scanne le QR-code avec l'EUDI Wallet de l'entreprise.
4. Le portefeuille affiche les détails : "Atos Polaris Cloud" réclame 450,00 € pour la licence de l'agent IA MCP, et demande la signature du mandat d'activation et de délégation financière de l'agent.
5. Le CTO valide par biométrie. L'attestation SCA issue de sa banque (ex. Crédit Agricole) est présentée, et la clé matérielle signe l'autorisation de transfert (virement direct ou EURC stablecoin) ainsi que le mandat de délégation (max 50,00 €/inférence).
6. Le paiement est validé. L'orchestrateur lance automatiquement le provisionnement du conteneur de l'agent IA Atos Polaris dans le cloud de l'entreprise.
7. L'agent IA Atos Polaris AI s'active, configure son protocole de communication MCP (Model Context Protocol) et s'intègre aux outils de l'entreprise (Slack, GitLab).
8. Lors de la détection d'une anomalie système, l'agent appelle l'**API de Calcul Souverain Serveur (Serverless Compute API)** :
   - L'agent chiffre localement les données de logs.
   - Il s'authentifie de manière sécurisée auprès de l'infrastructure de calcul via un service de **Secret Management décentralisé** (sans stocker de clés en clair).
   - Il transmet les logs et l'URI d'un modèle d'inférence open-source issu de **HuggingFace** pour démarrer un conteneur d'exécution éphémère.
   - Les validateurs du réseau vérifient l'exécution par un protocole de **consensus cryptographique** pour garantir l'intégrité de l'analyse (preuve de non-manipulation).
   - Le paiement éphémère (au prorata de l'usage des ressources GPU) est instancié de manière autonome via l'API **AP2** (stablecoins EURC).
   - L'agent déchiffre localement le diagnostic, résout l'incident, et consigne le rapport d'audit dans la Control Room de l'entreprise.

### 17.6 Parcours “Douane”
1. L’agent public demande une identité forte.
2. Le wallet affiche clairement le niveau de divulgation demandé.
3. L’utilisateur valide.
4. Le terminal reçoit l’identité complète nécessaire et trace l’opération.

## 18. Orchestration et résilience

Le Saga Orchestrator existant doit être réutilisé.

Nouveaux événements à ajouter :
- `presentation.requested`
- `presentation.scanned`
- `presentation.consent.approved`
- `presentation.consent.rejected`
- `presentation.generated`
- `presentation.verified`
- `presentation.expired`
- `invoice.pushed`
- `loyalty.updated`

États possibles d’une session unifiée :
- `PENDING`
- `REQUEST_DISPLAYED`
- `CONSENT_PENDING`
- `PRESENTATION_GENERATED`
- `VERIFICATION_PENDING`
- `PAYMENT_PENDING`
- `COMPLETED`
- `REJECTED`
- `EXPIRED`
- `COMPENSATION_REQUIRED`

Si la présentation est validée mais que le paiement échoue, la compensation doit suivre les règles existantes du pilote.

## 19. Sécurité et conformité

### 19.1 Règles minimales
- nonce unique par session ;
- TTL court des QR-codes ;
- anti-rejeu ;
- journal de consentement ;
- validation de signature ;
- traçabilité interne ;
- possibilité de révocation ;
- cloisonnement des rôles.

### 19.2 Confidentialité
- ne stocker côté retailer que ce qui est justifié ;
- stocker côté wallet l’historique visible par l’utilisateur ;
- éviter les corrélations inter-transactions ;
- privilégier pseudonymes et preuves booléennes.

### 19.3 Pilotage RGPD
Le pilote doit permettre de démontrer :
- minimisation ;
- finalité ;
- consentement ;
- audit ;
- suppression ou expiration des traces côté démonstrateur.

## 20. Évolutions frontend

### 20.1 Wallet Frontend React
Ajouter les écrans :
- Credentials ;
- Scan / Present ;
- Consent Review ;
- Documents ;
- Loyalty ;
- Presentation History.

### 20.2 Retailer Terminal Frontend React
Créer un nouvel écran :
- choix du use case ;
- affichage du QR ;
- scan d’un QR wallet ;
- statut de vérification ;
- statut paiement ;
- émission reçu/facture/fidélité.

### 20.3 Control Room
Étendre le dashboard pour visualiser :
- la session de présentation ;
- les attributs demandés vs transmis ;
- le recours à ZKP ;
- le lien avec la saga de paiement ;
- la génération des documents finaux.

## 21. Évolutions backend

### 21.1 Services à ajouter
- `PresentationService`
- `ClaimPolicyService`
- `VerifierService`
- `QRSessionService`
- `DocumentPushService`
- `LoyaltyService`

### 21.2 Intégrations
Le backend doit intégrer :
- générateur QR ;
- parseur QR ;
- moteur de présentation ;
- vérification de signatures ;
- vérification ZKP ou mock crédible ;
- corrélation présentation/paiement.

### 21.3 Abstraction nécessaire
Créer une abstraction de session transactionnelle commune reliant :
- identité ;
- preuve ;
- mandat ;
- paiement ;
- reçu ;
- fidélité.

## 22. Phasage recommandé du pilote

### Lot 1 — Base démontrable
- Retailer Terminal.
- Génération QR retailer.
- Scan wallet.
- Consentement.
- Partage minimal d’attributs.
- Lien avec AP2.
- Reçu dans wallet.

### Lot 2 — Proximité avancée
- QR wallet affiché et scanné par terminal.
- Session de proximité.
- Amélioration UX.

### Lot 3 — ZKP et divulgation sélective avancée
- preuve d’âge booléenne ;
- payloads réalistes ;
- simulation ou implémentation avancée.

### Lot 4 — Fidélité, factures, identité forte
- documents dans le wallet ;
- cartes de fidélité ;
- cas compagnie aérienne et douane.

### Lot 5 — Industrialisation future
- microservices ;
- crypto réelle ;
- mTLS ;
- interopérabilité plus stricte ;
- alignement renforcé avec les implémentations consortium.

## 23. Définition du MVP V2

Le MVP V2 doit impérativement permettre en démonstration :
- un retailer qui demande une preuve minimale ;
- un wallet qui affiche clairement ce qui est demandé ;
- un consentement utilisateur ;
- une présentation contenant uniquement le nécessaire ;
- un paiement déclenché dans la continuité ;
- un reçu/facture renvoyé dans le wallet ;
- une historisation lisible ;
- un affichage Control Room compréhensible.

Le scénario de référence recommandé pour le MVP est :
**achat réglementé avec preuve d’âge + paiement + reçu dans le wallet**.

## 24. Instructions directes à intégrer dans Antigravity

Implémenter une V2 du pilote Antigravity en conservant l’architecture existante (Identity Vault, Companion Agent, Control Room, backend Node.js, UCP, AP2, Saga Orchestrator, Receipt Engine) et en ajoutant un composant Retailer Terminal / Verifier App.

Le nouveau pilote doit permettre des transactions et contrôles fondés sur un échange minimal d’informations issues du wallet utilisateur via QR-code, dans deux sens : QR généré par le retailer et scanné par le wallet, ou QR généré par le wallet et scanné par le retailer.

Le système doit reposer sur une logique de claim policies métier afin que le retailer exprime un besoin fonctionnel (preuve d’âge, identité minimale, statut premium, mandat/paiement, réservation, fidélité, facture) et que la plateforme le traduise en attributs minimum à partager.

Le wallet doit permettre à l’utilisateur de gérer ses credentials, ses mandats, ses factures, ses cartes de fidélité et l’historique des partages, puis d’approuver ou refuser chaque demande de présentation sauf lorsqu’un mandat explicite autorise une exécution automatique.

Le système doit privilégier la divulgation sélective et, lorsque pertinent, une preuve Zero Knowledge Proof ou une simulation crédible de ZKP, notamment pour les cas de preuve de majorité (`age_over_18`) afin d’éviter la divulgation de la date de naissance complète.

La plateforme doit supporter l’agrégation, dans une même session transactionnelle, de plusieurs éléments comme une preuve d’éligibilité, un mandat de paiement et un reçu final. Si l’agrégation complète n’est pas techniquement retenue dans certains cas, l’orchestration doit rester transparente pour l’utilisateur et apparaître comme une seule interaction.

Le pilote doit intégrer les entités de données nécessaires à la gestion des attributs wallet, des sessions de présentation, des politiques de réclamation retailer, des documents post-transaction et des artefacts de fidélité.

Le composant retailer doit pouvoir générer et vérifier des demandes de présentation, déclencher AP2 lorsque le paiement est requis, puis renvoyer facture, reçu ou mise à jour fidélité vers le wallet.

Le dashboard Control Room doit être enrichi pour afficher toute la séquence : demande, consentement, preuve, vérification, paiement, émission des documents et événements de fidélité.

Le MVP V2 doit démontrer au minimum un parcours complet d’achat réglementé avec preuve d’âge minimale, paiement et reçu dans le wallet, tout en réutilisant les mandats et la résilience déjà implémentés dans le pilote existant..
