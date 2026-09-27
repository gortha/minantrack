# Notes de Livraison & Guide de Déploiement — MinanTrack

## 1. Synthèse de la Livraison

Ce document consigne les directives impératives de déploiement, de configuration et d'architecture pour la livraison du projet MinanTrack.

### 1.1 Schémas Visuels Draw.io
Deux diagrammes visuels complets et éditables sont fournis dans le dossier `docs/` :
- [Architecture Technique Draw.io](file:///d:/works/Projets/MinanTrack/docs/architecture.drawio) : Modèle C20 (.NET 10 Minimal APIs), découpage modulaire, UX Weft Next.js, Gateway Ingress et pipeline de déploiement SQL autonome.
- [Schéma BDD Relationnel Draw.io](file:///d:/works/Projets/MinanTrack/docs/database-schema.drawio) : Modélisation PostgreSQL détaillée des 8 tables métier, clés primaires UUID, clés étrangères, table d'indirection transparente `transport_assignments`, et audit des 7 statuts.

---

### 1.2 Stack Technologique Cible
* **Backend** : ASP.NET Core Minimal APIs ciblant **.NET 10 (SDK 10.0.401)**, C# 13/14, architecture modulaire C20 (*Architecting ASP.NET Core Applications 3E*).
* **Base de données** : PostgreSQL 15+ / 16+, modèle relationnel strict avec UUID natifs, contraintes `CHECK`, index partiels pour l'indirection.
* **Frontend** : Next.js 14.2+ (App Router), React 18/19, Material UI v6, TanStack Query v5, TypeScript 5, Design System Weft (`#273349`, `#5AFBC4`).
* **Conteneurisation & Orchestration** : Docker OCI multi-stage, Kubernetes agnostique (K3s, OVHcloud, Scaleway, AKS, EKS).

---

## 2. Base de Données & Processus de Déploiement SQL (Hors EF Core)

### 2.1 Directive Fondamentale : Zéro Dépendance EF pour les Migrations
> **RÈGLE DE PRODUCTION** : Entity Framework Core ne doit **jamais** avoir la responsabilité de créer ou modifier le schéma de base de données en production (`context.Database.Migrate()` est strictement proscrit en environnement de production).

Tous les changements de schéma sont matérialisés sous forme de scripts SQL ordonnés et versionnés dans le dossier `Database/migrations/`.

### 2.2 Arborescence des Scripts de Base de Données
```text
Database/
├── README.md                           # Documentation d'exécution
├── migrations/
│   ├── V001__initial_schema.sql        # Tables: users, carriers, catalog, trips, parcels, indirection, milestones, comms
│   └── V002__seed_demo_data.sql        # Données de recette et scénarios de démonstration
├── scripts/
│   ├── Deploy-Database.ps1             # Runner PowerShell Windows / CI
│   └── deploy-database.sh              # Runner Bash Linux / Docker / CI
└── k8s/
    └── database-migration-job.yaml     # Kubernetes Job pour exécution pré-rollout API
```

### 2.3 Table d'Audit `schema_migrations`
Chaque exécution est contrôlée et consignée dans la table :
```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    script_name VARCHAR(255) NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER NOT NULL,
    applied_by VARCHAR(100) NOT NULL
);
```

### 2.4 Procédure de Déploiement en Pipeline CI/CD / Kubernetes

1. **Étape 1 : Exécution du Job de migration SQL**
   Avant de déployer les nouveaux conteneurs applicatifs, déclencher le Job Kubernetes ou exécuter le script bash :
   ```bash
   # Exécution directe via le runner
   export DB_HOST="db.minantrack.internal"
   export DB_PORT="5432"
   export DB_NAME="minantrack"
   export DB_USER="minantrack_admin"
   export PGPASSWORD="<mot_de_passe_securise>"
   
   ./Database/scripts/deploy-database.sh
   ```
   *Ou via Kubernetes Job :*
   ```bash
   kubectl apply -f Database/k8s/database-migration-job.yaml -n minantrack
   kubectl wait --for=condition=complete --timeout=180s job/minantrack-db-migration -n minantrack
   ```

2. **Étape 2 : Déploiement de l'API Backend .NET 10**
   Une fois les scripts SQL appliqués avec succès, appliquer les manifests Kubernetes de l'API :
   ```bash
   kubectl apply -f k8s/backend-deployment.yaml -n minantrack
   kubectl rollout status deployment/minantrack-api -n minantrack
   ```

3. **Étape 3 : Déploiement du Frontend Next.js**
   ```bash
   kubectl apply -f k8s/frontend-deployment.yaml -n minantrack
   kubectl rollout status deployment/minantrack-front -n minantrack
   ```

---

## 3. Points Critiques d'Architecture à Vérifier

### 3.1 Mécanisme d'Indirection Transparente
* Le `tracking_code` du colis figurant sur l'étiquette physique imprimée (`parcels`) ne contient **aucun identifiant de camion ou conteneur**.
* L'association est gérée par la table `transport_assignments`.
* Pour réaffecter ou transvaser un colis vers un autre véhicule, le convoyeur passe `is_active = FALSE` sur l'ancienne affectation et crée une nouvelle ligne. **Aucun réétiquetage physique n'est nécessaire.**

### 3.2 Timeline des 7 Statuts
Vérifier que les transitions de jalons respectent la séquence 1 à 7 :
1. Réceptionné en entrepôt / chez le convoyeur
2. Chargement commencé dans conteneur, camion ou avion
3. Trajet en cours : 1/4 du parcours
4. Trajet en cours : 1/2 du parcours (mi-chemin)
5. Trajet en cours : 3/4 du parcours
6. Arrivé à destination (dédouanement / déchargement)
7. Livré / Remis au destinataire

### 3.3 Catalogue Prédéfini & Options de Collecte
* Les articles du catalogue (`package_catalog_items`) permettent de fixer des prix transparents (sacs 50/100kg, barils 100/200L, cartons).
* La collecte à domicile vérifie le rayon d'action `collection_radius_km` et applique `collection_fee`.

---

## 4. Vérification Locale & Build de Référence

```powershell
# Vérifier la version du SDK .NET
dotnet --version
# Doit renvoyer : 10.0.401

# Lancer la série de tests automatisés
dotnet test MinanTrack.sln
# Doit renvoyer 100% de succès
```
