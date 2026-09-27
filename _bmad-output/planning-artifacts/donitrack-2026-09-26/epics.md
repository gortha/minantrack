---
stepsCompleted:
  - requirement-extraction
  - epic-design
  - story-generation
inputDocuments:
  - docs/prd.md
  - docs/user_requirements_extracted.md
  - docs/architecture.md
---

# MinanTrack - Découpage des Epics et User Stories

## Vue d’ensemble

Ce document structure l'ensemble des exigences fonctionnelles (FR-1 à FR-12) et non-fonctionnelles (NFR-1 à NFR-8) de MinanTrack en **6 Epics** prêtes pour l'implémentation, avec critères d'acceptation détaillés.

---

## Matrice de Couverture des Exigences

| Code Exigence | Description Sommaire | Epic de Rattachement |
|---|---|---|
| **FR-1** | Publication des capacités transporteur (camions, conteneurs, trajets) | Epic 1, Epic 4 |
| **FR-2** | Modalités de dépôt et collecte à domicile (rayon km/géo) | Epic 1 |
| **FR-3** | Catalogue de types de colis préconfigurés & calcul devis instantané | Epic 1 |
| **FR-4** | Enregistrement du colis et confirmation de réservation | Epic 1 |
| **FR-5** | Étiquetage rapide & indirection transparente (colis <-> conteneur) | Epic 2 |
| **FR-6** | Suivi universel (public sans compte & espace client connecté) | Epic 3, Epic 5 |
| **FR-7** | Chronologie graduée en 7 jalons normalisés | Epic 3 |
| **FR-8** | Canaux de contact direct (téléphone, SMS, messagerie in-app) | Epic 5 |
| **FR-9** | Backoffice convoyeur, manifeste cargo et mise à jour groupée de statut | Epic 4 |
| **FR-10** | Historique des envois et réutilisation/fidélité convoyeur | Epic 5 |
| **FR-11** | Détection d'exceptions et alertes proactives | Epic 3, Epic 4 |
| **FR-12** | Localisation complète 100% Français | Epic 6 |
| **NFR-1 à NFR-8** | Architecture C20 .NET 10, Weft UX, SQL autonome, K8s agnostique | Epic 6 |

---

## Liste Détaillée des Epics

---

### Epic 1 : Catalogue Colis, Devis Instantané & Réservation d'Envoi
**Objectif :** Permettre aux expéditeurs de la diaspora d'estimer immédiatement le coût de leur envoi via un catalogue visuel préconfiguré (sacs 50/100kg, barils 100/200L, cartons), de choisir leur mode de collecte (dépôt ou ramassage à domicile dans un rayon km) et de réserver leur expédition en toute confiance.

#### Story 1.1 : Configuration du catalogue colis par le convoyeur
En tant que **convoyeur**,  
je veux configurer les types de colis acceptés (sacs 50/100kg, barils 100/200L, cartons diverses tailles) avec leur prix forfaitaire, dimensions et photo illustrative,  
afin d'offrir une tarification claire et sans négociation arbitraire.  
**Critères d’acceptation :**
1. L'API et l'UI permettent d'ajouter, modifier, désactiver des types de colis (`package_catalog_items`).
2. Chaque type comporte : libellé, catégorie, poids indicatif (kg), volume (litres/m3), prix unitaire (EUR/XOF), icône/photo.
3. Le convoyeur peut activer/désactiver les types selon la capacité restante.

#### Story 1.2 : Configuration de la collecte à domicile et des créneaux
En tant que **convoyeur**,  
je veux définir si je propose l'enlèvement au domicile de l'expéditeur avec mon périmètre kilométrique ou géographique d'intervention,  
afin d'organiser mes tournées de collecte.  
**Critères d’acceptation :**
1. Possibilité de définir un rayon d'enlèvement (ex. 30 km autour du dépôt) ou une liste de codes postaux/villes.
2. Définition du tarif additionnel pour collecte à domicile (ou gratuit selon volume).
3. Définition des horaires et jours de dépôt au local / points de collecte.

#### Story 1.3 : Calculateur de devis instantané pour l'expéditeur
En tant qu'**expéditeur diaspora**,  
je veux composer mon panier d'expédition en sélectionnant les articles préconfigurés ou en renseignant un colis personnalisé,  
afin de connaître immédiatement le coût total garanti avant de m'engager.  
**Critères d’acceptation :**
1. L'expéditeur sélectionne des quantités (ex. 2 sacs de 50 kg + 1 baril de 200 L).
2. L'interface affiche le total dynamique recalculé instantanément.
3. Possibilité d'ajouter des informations ou consignes spéciales (fragilité, valeur déclarée).

#### Story 1.4 : Validation de la réservation et choix du mode de remise
En tant qu'**expéditeur**,  
je veux valider ma réservation en renseignant les coordonnées du destinataire au pays et en choisissant entre dépôt au local ou enlèvement à domicile,  
afin de générer mon bon de réservation et de planifier la remise physique.  
**Critères d’acceptation :**
1. Saisie du destinataire : nom, prénom, numéro de téléphone, ville de destination (ex. Bamako).
2. Choix de la remise : Dépôt sur place avec créneau, rdv téléphonique, ou adresse d'enlèvement à domicile.
3. Génération d'une référence d'expédition avec récapitulatif PDF/Web.

---

### Epic 2 : Prise en Charge, Étiquetage Rapide & Indirection Transparente
**Objectif :** Permettre au convoyeur d'étiqueter ultra-rapidement les colis physiques lors de la prise en charge, tout en garantissant une indirection totale en base de données permettant de réassigner le conteneur ou camion sans ré-étiquetage physique.

#### Story 2.1 : Génération et impression d'étiquette QR/Code unique
En tant que **convoyeur**,  
je veux imprimer ou générer en 1 clic une étiquette standardisée comportant un code de suivi persistant dès la réception physique du colis,  
afin d'identifier le paquet de manière inviolable et rapide.  
**Critères d’acceptation :**
1. L'étiquette comporte le code de suivi format court/lisible (`MT-XXXX-YYYY`) et un QR code scannable.
2. Impression compatible imprimante thermique mobile ou standard.
3. L'étiquette ne mentionne en dur aucune contrainte physique de camion/conteneur pour préserver l'indirection.

#### Story 2.2 : Rattachement dynamique à un voyage / conteneur
En tant que **convoyeur**,  
je veux associer un colis étiqueté à un voyage ou à un conteneur actif lors du chargement,  
afin qu'il intègre le manifeste cargo de ce moyen de transport.  
**Critères d’acceptation :**
1. Le scan du QR code de l'étiquette associe instantanément le colis à l'ID du conteneur/voyage en base (`container_id` / `trip_id`).
2. Le statut du colis passe automatiquement à `LOADING_STARTED`.

#### Story 2.3 : Réassignation transparente de transport sans ré-étiquetage
En tant que **convoyeur**,  
je veux pouvoir basculer un ou plusieurs colis d'un conteneur vers un camion ou un fret différent depuis mon interface,  
afin de gérer les aléas de chargement sans devoir changer physiquement les étiquettes collées sur les colis.  
**Critères d’acceptation :**
1. Le système met à jour la clé étrangère en base de données de manière transactionnelle.
2. Le code de suivi physique apposé sur le sac/baril reste strictement identique et valide.
3. Le suivi client bascule instantanément vers les coordonnées et la position du nouveau voyage sans rupture d'historique.

---

### Epic 3 : Suivi Universel & Chronologie des 7 Jalons Logistiques
**Objectif :** Offrir à l'expéditeur et au destinataire (au Mali ou ailleurs) une visibilité totale et en temps réel sur l'avancement du colis, consultable sans compte ou via l'espace connecté, le long d'une chronologie normalisée en 7 jalons clairs.

#### Story 3.1 : Consultation publique par code de suivi (sans authentification)
En tant que **destinataire au pays** ou **expéditeur non connecté**,  
je veux entrer le code de suivi ou scanner le QR code directement sur la page d'accueil,  
afin de connaître la position exacte du colis sans créer de compte ni m'identifier.  
**Critères d’acceptation :**
1. Champ de saisie public accessible sur mobile et desktop avec validation de masque de suivi.
2. Affichage immédiat du jalon actif, de la date de la dernière mise à jour, du moyen de transport et de la destination.
3. Protection rate-limit contre les attaques par force brute sur les identifiants.

#### Story 3.2 : Rendu visuel de la chronologie des 7 jalons
En tant qu'**utilisateur consultant un suivi**,  
je veux visualiser une barre de progression claire structurée selon les 7 étapes logistiques normalisées,  
afin de comprendre d'un seul coup d'œil l'état exact du trajet sans termes techniques obscurs.  
**Critères d’acceptation :**
1. Affichage des 7 jalons :
   - `WAREHOUSE_RECEIVED` (Réceptionné au dépôt)
   - `LOADING_STARTED` (Chargement en cours conteneur/camion/avion)
   - `IN_TRANSIT_Q1` (1/4 du trajet parcouru)
   - `IN_TRANSIT_HALF` (1/2 du trajet parcouru)
   - `IN_TRANSIT_Q3` (3/4 du trajet parcouru)
   - `ARRIVED_DESTINATION` (Arrivé au dépôt de destination au pays)
   - `DELIVERED` (Livré / remis au destinataire)
2. Chaque étape validée est horodatée avec localisation indicative.
3. Mise en valeur visuelle selon la charte Weft (Slate Blue / Mint Accent).

#### Story 3.3 : Affichage des exceptions logistiques et retards
En tant qu'**utilisateur**,  
je veux être informé clairement si le colis subit un retard ou une retenue (douane, météo, panne),  
afin d'éviter tout appel paniqué et comprendre le délai révisé.  
**Critères d’acceptation :**
1. Badge d'alerte orange/ambre distinct sur la timeline.
2. Message d'explication saisi par le convoyeur en français clair.
3. Nouvelle date prévisionnelle d'arrivée affichée.

---

### Epic 4 : Backoffice Convoyeur & Manifeste Cargo Multi-Colis
**Objectif :** Fournir au convoyeur un cockpit opérationnel complet pour piloter ses voyages, suivre sa liste de colis par voyage (manifeste) et exécuter des mises à jour groupées de statut en 1 clic.

#### Story 4.1 : Tableau de bord des voyages et conteneurs
En tant que **convoyeur**,  
je veux visualiser tous mes voyages programmés, en cours et archivés avec leur taux de remplissage,  
afin de piloter mes départs de camions et de conteneurs.  
**Critères d’acceptation :**
1. Liste des voyages avec : identifiant, moyen de transport, trajet (ex. Montreuil -> Bamako), capacité totale vs utilisée (poids/volume), statut global.
2. Possibilité de créer un nouveau voyage ou de clôturer un voyage terminé.

#### Story 4.2 : Consultation et export du manifeste cargo
En tant que **convoyeur**,  
je veux afficher le manifeste complet d'un conteneur/camion regroupant la totalité des colis chargés et leurs propriétaires,  
afin de contrôler ma cargaison au départ et aux points de contrôle/douane.  
**Critères d’acceptation :**
1. Tableau listant pour chaque colis : Code de suivi, nom client, contact destinataire, type d'article (ex. Baril 200L), poids, statut individuel.
2. Calcul automatique du poids cumulé et du nombre d'articles.
3. Export PDF / impression du manifeste de chargement.

#### Story 4.3 : Mise à jour groupée de statut du voyage (Cascade sur les colis)
En tant que **convoyeur en route**,  
je veux passer le statut de mon conteneur à l'étape suivante (ex. "1/2 trajet parcouru") en un seul clic,  
afin que l'ensemble des 150 colis du conteneur soient mis à jour instantanément sans saisie unitaire.  
**Critères d’acceptation :**
1. L'avancement du statut du voyage propage l'événement de timeline à tous les colis actifs associés via une transaction SQL atomique.
2. Création des enregistrements d'audit dans `parcel_milestone_history`.
3. Notification push/visuelle répercutée pour les clients concernés.

---

### Epic 5 : Espace Client, Fidélité Convoyeur & Canaux de Contact
**Objectif :** Donner aux expéditeurs réguliers de la diaspora un espace personnalisé pour gérer leur historique d'envois, retrouver leurs convoyeurs de confiance et communiquer directement via téléphone, SMS ou messagerie.

#### Story 5.1 : Espace client authentifié et historique complet
En tant qu'**expéditeur régulier**,  
je veux retrouver tous mes envois passés et en cours sur mon tableau de bord sécurisé,  
afin de suivre plusieurs colis simultanément et conserver mes archives.  
**Critères d’acceptation :**
1. Liste des envois avec filtrage par statut (En transit, Livré, Exception), par date et par convoyeur.
2. Recherche textuelle rapide par code de suivi, nom de destinataire ou ville.
3. Affichage du montant total dépensé et récapitulatif des articles envoyés.

#### Story 5.2 : Fidélité et réexpédition avec un convoyeur favori
En tant qu'**expéditeur**,  
je veux voir avec quels convoyeurs mes envois précédents ont été menés avec succès et pouvoir relancer un envoi directement avec eux,  
afin de privilégier la relation de confiance établie.  
**Critères d’acceptation :**
1. Fiche convoyeur accessible depuis l'historique d'un envoi terminé avec indicateur de succès.
2. Bouton "Réexpédier avec ce convoyeur" pré-remplissant le convoyeur sur le prochain envoi.

#### Story 5.3 : Canaux de contact direct (Téléphone, SMS & In-App)
En tant qu'**expéditeur**,  
je veux pouvoir joindre facilement le convoyeur en cas de besoin (fixer l'heure exacte de passage ou poser une question),  
afin de convenir des détails de la remise sans friction.  
**Critères d’acceptation :**
1. Boutons d'action directs sur la réservation et le suivi : "Appeler le convoyeur" (`tel:`) et "Envoyer un SMS" (`sms:`).
2. Module de messagerie texte direct intégré dans l'application pour garder une trace écrite de la coordination.

---

### Epic 6 : Socle Technique C20 .NET 10, Découplage SQL & Design System Weft
**Objectif :** Garantir une fondation d'ingénierie logicielle d'entreprise, modulaire, hautement testée, basée sur .NET 10 LTS (Minimal APIs C20), Next.js avec Design System Weft, une base PostgreSQL avec migrations SQL strictement découplées d'EF Core, et un déploiement Kubernetes universel.

#### Story 6.1 : Backend C20 Minimal APIs sous .NET 10 LTS
En tant que **développeur backend**,  
je veux implémenter les endpoints selon le pattern C20 de *Architecting ASP.NET Core Applications 3E*,  
afin de garantir un découplage rigoureux, une maintenabilité exemplaire et des performances optimales sous .NET 10.  
**Critères d’acceptation :**
1. Le projet cible `<TargetFramework>net10.0</TargetFramework>` et compile sans warning avec le SDK `10.0.401`.
2. Organisation C20 : Endpoints indépendants, Request/Response DTOs dédiés, injection de dépendances modulaire.
3. Tests d'intégration automatisés avec `WebApplicationFactory` et xUnit exécutés via `dotnet test`.

#### Story 6.2 : Découplage strict de la BDD et Scripts SQL autonomes
En tant que **Tech Lead / DevOps**,  
je veux que toutes les migrations de schéma SQL soient écrites dans `Database/migrations/` et appliquées par un script de déploiement indépendant d'EF Core,  
afin de bannir toute modification de structure automatique par EF Core en production.  
**Critères d’acceptation :**
1. Répertoire `Database/migrations/` avec scripts ordonnés `V001__...sql`, `V002__...sql`.
2. Scripts d'application `Deploy-Database.ps1` et `deploy-database.sh` créant et contrôlant la table `schema_migrations`.
3. Manifeste `Database/k8s/database-migration-job.yaml` prêt pour l'intégration continue.
4. EF Core configuré uniquement pour le requêtage objet sans appel à `Database.Migrate()`.

#### Story 6.3 : Design System Weft & Ergonomie Mobile-First
En tant que **développeur frontend**,  
je veux intégrer les composants MUI stylisés selon la charte Weft (`#273349`, `#5AFBC4`, typographies Rubik et Kodchasan),  
afin d'offrir une interface moderne, intuitive et réactive sur tous les smartphones.  
**Critères d’acceptation :**
1. Palette de couleurs et tokens typographiques conformes au guide de marque Weft.
2. Interface 100% responsive et tactilement fluide sur smartphone (mobile-first).
3. Intégration de TanStack Query pour la mise en cache et les mises à jour optimistes.

#### Story 6.4 : Déploiement Kubernetes Agnostique et Facilité Locale
En tant qu'**ingénieur infrastructure**,  
je veux des manifests Kubernetes standards et un environnement Docker Compose local,  
afin que l'application tourne indifféremment sur PC de dev, VPS OVH/Hetzner, ou clusters managés (AWS/GCP/Azure).  
**Critères d’acceptation :**
1. Manifests Kubernetes (Deployments, Services, ConfigMaps, Secrets, Ingress) sans dépendance cloud propriétaire.
2. Fichier Docker Compose permettant de monter l'ensemble de la stack (PostgreSQL + API + Frontend) en 1 commande.
