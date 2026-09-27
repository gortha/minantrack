---
title: MinanTrack PRD - Spécifications Complètes
created: 2026-09-26
updated: 2026-09-27
status: approved
---

# Product Requirements Document (PRD) : MinanTrack

## 0. Objet du document

Ce document définit les spécifications fonctionnelles, techniques et opérationnelles complètes de la plateforme **MinanTrack**. Il fait foi pour l'alignement produit, la conception d'architecture, la modélisation de base de données et l'implémentation du MVP jusqu'à sa mise en production.

---

## 1. Vision & Mission Produit

### 1.1 Contexte et Problématique
Pour la diaspora (notamment d'Afrique de l'Ouest / Mali vivant en Europe ou en Amérique du Nord), l'envoi de colis aux familles restées au pays est un rituel essentiel, mais aujourd'hui gangréné par le stress, l'opacité et l'angoisse :
- Aucune visibilité sur l'état d'avancement des expéditions maritimes, terrestres ou aériennes.
- Dépendance totale à des appels téléphoniques et échanges WhatsApp incessants avec les convoyeurs pour savoir où se trouve le colis.
- Tarification floue et souvent négociée à la tête du client faute de grille standardisée.
- Complexité logistique pour déposer ou faire enlever les colis lourds ou volumineux (sacs de voyage, fûts/barils, cartons).
- Risque de perte ou de confusion lors des changements de camion ou de conteneur en cours de route.

### 1.2 Mission de MinanTrack
**MinanTrack** apporte simplicité, transparence et confiance absolue entre les expéditeurs de la diaspora et les convoyeurs/transporteurs indépendants :
1. **Confiance & Fidélité** : Permettre à la diaspora de trouver des convoyeurs fiables, d'évaluer les prix en 2 clics via un catalogue visuel préconfiguré, et de réexpédier facilement avec leurs convoyeurs favoris.
2. **Indirection Transparente & Sérénité Logistique** : Permettre au convoyeur d'étiqueter immédiatement le colis avec un code QR/ID persistant, et de réaffecter ou consolider ses cargaisons (changer de camion ou de conteneur) de manière 100 % transparente dans le système, **sans jamais avoir à ré-étiqueter physiquement les colis**.
3. **Autonomie de Suivi Totale** : Donner à l'expéditeur et au destinataire (connectés ou invités) une visibilité temps réel sur 7 jalons clairs et précis (de l'entrepôt au dernier kilomètre en passant par 1/4, 1/2, 3/4 du trajet), éliminant le besoin d'appeler sans cesse le convoyeur.

---

## 2. Personas & Utilisateurs Cibles

### 2.1 Expéditeur Diaspora (ex. Amadou, résident en France)
- **Objectif** : Envoyer un sac de 50 kg et un baril de 100L de denrées et cadeaux à sa famille à Bamako.
- **Besoins** : Connaître immédiatement le prix exact, choisir entre dépôt en point relais ou collecte à son domicile, suivre le colis sans stress et sans devoir harceler le chauffeur.

### 2.2 Destinataire Local (ex. Fatou, à Bamako)
- **Objectif** : Réceptionner le colis dès son arrivée.
- **Besoins** : Suivre l'arrivée sans avoir besoin de créer un compte complexe, recevoir une notification claire dès que le camion arrive au dépôt de destination ou que la livraison commence.

### 2.3 Convoyeur / Transporteur Indépendant (ex. Moussa, gérant de fret conteneur/camion)
- **Objectif** : Remplir son conteneur ou camion, optimiser ses tournées d'enlèvement, gérer ses voyages et ses manifestes sans paperasse chronophage.
- **Besoins** : Étiqueter les colis en 5 secondes à la prise en charge, pouvoir basculer des colis d'un conteneur à un autre en un clic sans changer les étiquettes, mettre à jour le statut de 200 colis d'un coup en avançant le statut du conteneur.

---

## 3. Parcours Utilisateurs Clés (User Journeys)

- **UJ-1 : Découverte, Devis instantané & Réservation d'envoi**
  L'expéditeur consulte les convoyeurs disponibles sur son trajet (ex. Paris -> Bamako). Il sélectionne des articles dans le catalogue visuel (1 sac 50kg à 80€ + 1 carton moyen à 35€). Il choisit l'option de collecte à domicile (disponible car il est dans le rayon de 30 km du convoyeur) ou le dépôt au local du convoyeur. Il valide et reçoit son bon d'expédition.

- **UJ-2 : Enlèvement, Prise en charge & Étiquetage immédiat**
  Le convoyeur réceptionne le colis (au dépôt ou au domicile de l'expéditeur). Il colle une étiquette avec un code de suivi unique (ex. `MT-2026-X892`). Le colis est immédiatement scanné et rattaché au voyage actif. Si le convoyeur décide plus tard de charger le colis dans le Conteneur B au lieu du Camion A, il modifie l'assignation dans son backoffice : **l'étiquette reste inchangée**, et le client voit toujours son suivi actualisé sans coupure.

- **UJ-3 : Suivi autonome et Jalonnement graduel**
  Le client (ou le destinataire au pays) saisit le numéro de suivi sur le portail web/mobile sans avoir besoin de se connecter. Il voit la jauge d'avancement : *En entrepôt* -> *Chargement conteneur* -> *1/4 trajet parcouru* -> *1/2 trajet parcouru* -> *3/4 trajet parcouru* -> *Arrivé à destination* -> *Livré*.

- **UJ-4 : Gestion de Manifeste & Mises à jour groupées par le Convoyeur**
  Depuis son backoffice mobile/bureau, le convoyeur sélectionne son conteneur `TC-40-MALI-01`. Lorsqu'il franchit une étape clé de son voyage, il bascule le statut du voyage sur "1/2 de la route parcouru". Automatiquement, les 150 colis associés au conteneur héritent du jalon horodaté, déclenchant les notifications appropriées.

- **UJ-5 : Contact direct et coordination**
  En cas de besoin spécifique sur le lieu de rendez-vous pour la remise du colis, le client et le convoyeur peuvent s'appeler directement par téléphone ou s'envoyer des messages via l'application.

- **UJ-6 : Fidélité et historique multi-envois**
  L'utilisateur connecté consulte son tableau de bord, visualise tous ses envois passés, filtre par convoyeur ou par statut, et peut renouveler un envoi directement avec un convoyeur dont il a apprécié le service.

---

## 4. Glossaire Métier

- **Convoyeur (Carrier / Transporter)** : Prestataire logistique indépendant ou société organisant des expéditions par conteneurs, camions ou fret aérien.
- **Voyage / Déplacement (Trip / Shipment Run)** : Opération de transport planifiée par un convoyeur entre une zone d'origine et une destination, associée à un moyen de transport (conteneur, camion, avion).
- **Manifeste Cargo (Cargo Manifest)** : Liste des colis consolidés et chargés au sein d'un même voyage/moyen de transport.
- **Type de Colis Préconfiguré (Package Catalog Item)** : Modèle d'article standardisé défini par le convoyeur avec dénomination, dimensions, poids indicatif, prix unitaire forfaitaire et visuel (ex. Sac 50 kg, Baril 200 L).
- **Indirection d'Étiquetage (Transparent Indirection)** : Principe architectural garantissant que le code de suivi physique apposé sur le colis est un identifiant invariant lié logiquement au conteneur/voyage via un pointeur en base de données, permettant la réaffectation sans ré-étiquetage.
- **Jalon de suivi (Milestone)** : Étape clé normalisée du cycle de vie logistique.

---

## 5. Exigences Fonctionnelles (FR)

### FR-1 : Publication et gestion des capacités de transport (Convoyeur)
- Le système doit permettre au convoyeur de publier des offres de transport avec type de véhicule/contenant (camion, conteneur 20/40 pieds, fret aérien), villes d'origine et de destination, dates limites de dépôt et date prévisionnelle de départ/arrivée.
- Le convoyeur peut définir et ajuster la capacité volumétrique et pondérale disponible.

### FR-2 : Gestion des modalités de prise en charge et collecte à domicile
- Le système doit permettre au convoyeur d'activer et configurer la collecte à domicile :
  - Définition d'un périmètre d'éligibilité (rayon kilométrique ou zone géographique/villes desservies).
  - Frais additionnels éventuels pour la collecte.
  - Créneaux horaires d'enlèvement.
- Le système doit permettre les modalités alternatives : dépôt sur place au local du convoyeur avec horaires fixes, ou prise de rendez-vous téléphonique pour convenir d'un point de rencontre.

### FR-3 : Catalogue de colis préconfigurés & Évaluation instantanée des prix
- Le système doit permettre à chaque convoyeur de configurer son catalogue de colis avec tarifs forfaitaires et caractéristiques :
  - Exemples types : Sac de voyage 50 kg, Sac 100 kg, Baril / Fût plastique 100 L, Baril 200 L, Cartons (Petit, Moyen, Grand), Vélo, Téléviseur, etc.
  - Attributs : Nom, catégorie, poids max, volume/dimensions, prix, image/icône illustrative.
- L'expéditeur peut composer son panier de colis en sélectionnant des types prédéfinis ou en saisissant un colis sur-mesure (dimensions, poids personnalisé) pour obtenir instantanément le montant total chiffré avant confirmation.

### FR-4 : Enregistrement et réservation de colis
- L'expéditeur peut enregistrer son envoi avec : expéditeur, destinataire (nom, téléphone, ville de retrait/livraison), liste des articles/colis du panier, choix du mode de prise en charge (dépôt ou collecte à domicile avec adresse).
- Le système génère une pré-commande avec récapitulatif complet et devis verrouillé.

### FR-5 : Étiquetage rapide & Indirection transparente (Colis <-> Conteneur/Camion)
- À la réception physique du colis, le convoyeur génère et imprime une étiquette standardisée comportant un identifiant unique / QR code lisible.
- **Exigence d'indirection transparente** : L'identifiant du colis est découplé de l'identifiant physique du camion ou conteneur. Le convoyeur peut, à tout moment depuis son backoffice, réassigner un colis d'un conteneur A à un camion B :
  - L'opération ne requiert aucune réimpression ni modification physique d'étiquette.
  - Toutes les requêtes de suivi client sont redirigées de manière instantanée et transparente vers le nouveau contenant/voyage.

### FR-6 : Suivi universel (Public invité & Espace client authentifié)
- **Accès public invité** : Toute personne (expéditeur ou destinataire au pays) disposant du code de suivi peut consulter l'état d'avancement sans créer de compte ni se connecter.
- **Espace client authentifié** : L'utilisateur connecté dispose d'un tableau de bord affichant la totalité de ses envois en cours et archivés, avec moteur de recherche, filtres par convoyeur, date, destination ou statut.

### FR-7 : Chronologie graduée des jalons de livraison (7 étapes standardisées)
Le système doit supporter et afficher une chronologie d'avancement claire basée sur les 7 jalons normalisés suivants :
1. `WAREHOUSE_RECEIVED` : Réceptionné à l'entrepôt / chez le convoyeur.
2. `LOADING_STARTED` : Chargement commencé dans le conteneur, camion ou avion.
3. `IN_TRANSIT_Q1` : En cours de route — 1/4 du trajet parcouru.
4. `IN_TRANSIT_HALF` : En cours de route — 1/2 du trajet parcouru (mi-parcours).
5. `IN_TRANSIT_Q3` : En cours de route — 3/4 du trajet parcouru.
6. `ARRIVED_DESTINATION` : Arrivé au pays / entrepôt de destination (ex. Bamako).
7. `DELIVERED` : Colis remis au destinataire final.

### FR-8 : Canaux de contact direct (Téléphone, SMS, Messagerie in-app)
- Le client doit pouvoir contacter directement le convoyeur par appel téléphonique (bouton click-to-call) ou par SMS pour fixer un point de rencontre ou poser une question sur le dépôt.
- Le système doit également intégrer un fil de discussion direct in-app rattaché à l'envoi pour conserver l'historique écrit des échanges entre l'expéditeur et le convoyeur.

### FR-9 : Backoffice Convoyeur & Manifeste Cargo (Mises à jour groupées)
- Le convoyeur dispose d'un backoffice dédié pour :
  - Visualiser l'ensemble de ses voyages (historique et actifs).
  - Consulter le manifeste cargo de chaque voyage (liste complète des colis consolidés, détails clients, poids total).
  - Réaliser des mises à jour groupées : changer le statut du voyage (ex. passage à "1/2 de la route") met à jour automatiquement et simultanément l'ensemble des colis du manifeste.

### FR-10 : Historique des envois et Fidélité Convoyeur
- Le profil client conserve l'historique complet des convoyeurs avec lesquels des expéditions réussies ont été réalisées.
- Le client peut recommander ou réitérer une réservation directement avec un convoyeur favori.

### FR-11 : Détection d'exceptions et notifications proactives
- Le système permet au convoyeur de signaler une exception (retard météo, douane, incident logistique) avec message explicatif en français clair.
- Les utilisateurs concernés reçoivent une alerte visuelle sur l'interface de suivi afin de prévenir toute incompréhension ou anxiété.

### FR-12 : Localisation et cohérence linguistique (100% Français opérationnel)
- Tous les écrans, libellés, statuts, messages d'erreur et notifications visibles par l'utilisateur doivent être rédigés en français impeccable et adapté au vocabulaire logistique de la communauté ouest-africaine.

---

## 6. Exigences Non Fonctionnelles (NFR)

### NFR-1 : Performance et réactivité
- Les requêtes API de consultation de suivi (publiques ou privées) doivent répondre en moins de 300 ms en conditions standard.
- Le calcul de devis instantané doit s'exécuter côté client ou en moins de 100 ms.

### NFR-2 : Architecture Backend C20 Minimal API .NET 10
- Le backend doit être bâti en C# .NET 10 LTS, en utilisant le style Minimal APIs et le partitionnement modulaire décrit dans *Architecting-ASP.NET-Core-Applications-3E* Chapitre C20.
- Respect strict de la séparation entre couche API (`Endpoints`), couche Domaine/Application, et infrastructure d'accès aux données.

### NFR-3 : Frontend Responsive, Mobile-First & Design System Weft
- Le frontend doit être développé en Next.js (React / TypeScript), TanStack Query pour la synchronisation serveur, et Material UI (MUI).
- Respect du thème graphique inspiré de Weft (`Weft_branding_file.pdf`) : palette colorimétrique Premium Slate Blue (`#273349`), Mint Accent (`#5AFBC4`), typographies Rubik et Kodchasan, ergonomie pensée pour l'usage smartphone sur réseaux mobiles à bande passante variable.

### NFR-4 : Découplage de la Base de Données & Déploiement SQL Indépendant d'EF Core
- **Règle absolue** : La responsabilité des migrations de schéma SQL en production ne doit **JAMAIS** être déléguée à Entity Framework Core.
- L'ensemble des scripts DDL et de migration doivent être centralisés dans le répertoire racine `Database/migrations/` (`V001__...sql`, `V002__...sql`, etc.).
- Le déploiement SQL doit être assuré par un runner autonome (`Database/scripts/Deploy-Database.ps1`, `Database/scripts/deploy-database.sh` ou Job Kubernetes) s'appuyant sur une table d'audit `schema_migrations`.
- EF Core est utilisé exclusivement comme ORM d'exécution (requêtage LINQ et persistance objet).

### NFR-5 : Déploiement Kubernetes Agnostique (Multi-Cloud & VPS)
- L'infrastructure applicative doit être conteneurisée (Docker) et déployable via des manifestes Kubernetes standard sans dépendance propriétaire à un cloud spécifique (compatible K3s, bare-metal VPS, AWS EKS, GCP GKE, Azure AKS, Scaleway).
- Configuration externalisée via ConfigMaps et Secrets Kubernetes.

### NFR-6 : Facilité de Développement Local
- Tout développeur doit pouvoir lancer l'environnement complet en local en moins de 2 commandes (via Docker Compose ou script CLI local).
- SDK .NET 10 supporté et configuré avec `global.json`.

### NFR-7 : Sécurité, Rôles & Intégrité
- Authentification JWT sécurisée avec RBAC (Rôles : `Sender`, `Carrier`, `Admin`).
- Accès au suivi public protégé contre le brute-force et le scraping abusif par rate-limiting.
- Chiffrement des données sensibles en transit (HTTPS/TLS) et au repos (PostgreSQL).

### NFR-8 : Qualité de Code, Rigueur & Couverture de Tests
- Codebase professionnelle avec tests unitaires et d'intégration automatisés (xUnit, FluentAssertions, WebApplicationFactory pour les API .NET 10).
- Suite de tests exécutable par `dotnet test MinanTrack.sln` sans régression.

---

## 7. Non-objectifs (Exclus de la v1)

- Rapprochement bancaire complexe ou émission automatisée de devises multizones intégrée en v1 (les paiements se font selon les modalités convenues entre client et convoyeur).
- Algorithme d'optimisation de tournée par intelligence artificielle prédictive.
- Gestion douanière transfrontalière dématérialisée avec les administrations portuaires.

---

## 8. Portée du MVP

| Fonctionnalité | Dans le MVP v1 | Phase ultérieure (v2) |
|---|:---:|:---:|
| Publication capacité camion/conteneur par le convoyeur | ✅ | |
| Collecte à domicile avec périmètre géographique/km | ✅ | |
| Catalogue de colis préconfigurés (sacs 50/100kg, barils 100/200L, cartons) | ✅ | |
| Calculateur de devis instantané avant validation | ✅ | |
| Étiquetage avec QR/Code & Indirection transparente (colis <-> conteneur) | ✅ | |
| Suivi universel par code (public sans compte) | ✅ | |
| Espace client authentifié avec historique et fidélité convoyeur | ✅ | |
| Chronologie d'avancement sur 7 jalons normalisés | ✅ | |
| Backoffice convoyeur avec Manifeste cargo et mise à jour de statut groupée | ✅ | |
| Contact direct client-convoyeur (téléphone, SMS, chat in-app) | ✅ | |
| Backend C20 Minimal API .NET 10 | ✅ | |
| Déploiement BDD SQL autonome hors EF Core (`Database/`) | ✅ | |
| Manifestes Kubernetes agnostiques | ✅ | |
| Paiement en ligne intégré par carte / Mobile Money | | 🔄 v2 |
| Tracking GPS temps réel par balise satellite connectée | | 🔄 v2 |
| Application mobile native iOS/Android (Store) | | 🔄 v2 (v1 est PWA/Responsive) |

---

## 9. Indicateurs Clés de Succès (Success Metrics)

- **SM-1 (Confiance de suivi)** : 90 % des destinataires et expéditeurs consultent l'avancement de leur colis sans nécessiter d'appel téléphonique au convoyeur pour demander la position.
- **SM-2 (Efficacité étiquetage)** : Un convoyeur étiquette et associe un colis à un voyage en moins de 30 secondes chrono.
- **SM-3 (Flexibilité opérationnelle)** : 100 % des réassignations de colis entre conteneurs/camions sont réalisées sans réimpression physique d'étiquettes grâce à l'indirection.
- **SM-4 (Satisfaction devis)** : 100 % des expéditeurs visualisent un prix transparent et garanti avant validation de leur dépôt/collecte.
- **SM-5 (Qualité & Fiabilité technique)** : Zéro échec de migration SQL en production grâce à la séparation stricte du runner SQL autonome vis-à-vis d'EF Core.

---

## 10. Résolution des Questions Initiales du Scaffold

1. *Tarification dynamique vs catalogue préconfiguré ?* **Résolu** : Catalogue d'articles forfaitaires préconfigurés par convoyeur (sacs, barils, cartons) complété par un calculateur sur-mesure au kilo/volume.
2. *Quels sont les statuts requis ?* **Résolu** : 7 jalons normalisés (`WAREHOUSE_RECEIVED`, `LOADING_STARTED`, `IN_TRANSIT_Q1`, `IN_TRANSIT_HALF`, `IN_TRANSIT_Q3`, `ARRIVED_DESTINATION`, `DELIVERED`).
3. *Rôle d'EF Core dans la base de données ?* **Résolu** : Découplé à 100 % pour les migrations DDL, gérées exclusivement par les scripts autonomes dans `Database/migrations/`.
4. *Version du framework .NET ?* **Résolu** : Dernière version stable supportée .NET 10 (`net10.0`, SDK `10.0.401`).
