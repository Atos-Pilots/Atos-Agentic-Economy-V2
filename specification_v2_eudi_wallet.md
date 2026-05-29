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

### 5.4 Check-in ou embarquement accéléré
Exemple : compagnie aérienne.
Le fournisseur peut demander :
- preuve de réservation ;
- statut premium / fidélité ;
- identité minimale si exigée ;
- aucune donnée de paiement si ce n’est pas nécessaire.

### 5.5 Contrôle d’identité ou douanier
Le système doit aussi supporter un mode avec identité complète ou renforcée lorsque la réglementation l’exige. Ce cas d’usage justifie que le wallet puisse partager une identité forte, mais seulement dans les scénarios légitimes.

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

### 17.3 Parcours “Embarquement premium”
1. La borne d’embarquement demande réservation + statut premium.
2. Le wallet partage uniquement ces éléments.
3. L’identité complète n’est pas transmise si elle n’est pas requise à cette étape.
4. Le terminal ouvre l’accès fast track.

### 17.4 Parcours “Douane”
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

Le MVP V2 doit démontrer au minimum un parcours complet d’achat réglementé avec preuve d’âge minimale, paiement et reçu dans le wallet, tout en réutilisant les mandats et la résilience déjà implémentés dans le pilote existant.
