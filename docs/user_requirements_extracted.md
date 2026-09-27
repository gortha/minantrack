# Expression des Besoins Utilisateur — MinanTrack (Extrait Dédupliqué)

> **Source** : Expression de besoins directe de l'utilisateur (nettoyée de la télémétrie de saisie JSON, sans aucune duplication et avec préservation intégrale de la structure et de la formulation d'origine).

---

## Fonctionnalités majeures de l'application :

- **Mission & Cible :**
  L'application est pour permettre à la diaspora d'envoyer des colis à la famille au pays africain/Mali en toute simplicité et en toute confiance avec la visibilité depuis la recherche de convoyeur disponible, ou par fidélité suite à d'autres envois bien réussis par le convoyeur/transporteur, en passant par la mise à disposition du colis, un parcours UX/UI efficace et des types de colis préconfigurés avec prix/taille/poids/exemple/image, puis un suivi depuis le code/identifiant du colis à tout moment connecté ou pas, et si connecté avoir aussi l'historique de ses envois, pouvoir chercher/filtrer/trier sur les infos liées aux envois, savoir la position du colis (chez convoyeur/transporteur - chargé - en cours de livraison - 1/4, 1/2, 3/4 déjà parcouru - arrivée destination - livré), différents statuts clairs sur l'état de livraison du colis, possibilité d'amener le colis chez le convoyeur/transporteur avec une méthode simple et efficace (1- transporteur précise lieu et horaire de dépôt des colis, 2- téléphone pour convenir d'un lieu de rdv où déposer le colis) ou indiquer lieu et horaire pour que le transporteur vienne chercher le colis.

- **Capacités convoyeur, collecte à domicile & catalogue de colis :**
  Permettre au convoyeur de proposer de la disponibilité d'un conteneur ou camion pour prendre en charge des colis des clients, et aussi indiquer s'il se déplace pour récupérer le colis chez le client avec un périmètre défini soit zone géographique ou par kilométrage ou les deux, et permettre aux clients de donner, proposer leur colis et voir le prix de la livraison en donnant la possibilité aux clients de donner des infos sur le colis pour évaluation du prix, l'appli doit permettre aux convoyeurs de configurer des types de colis avec leur prix, par exemple un sac de voyage de 50 ou 100kg, un baril de 100, 200l, un carton de différente taille et poids, etc.. permettant au client de savoir rapidement et simplement le prix de la prise en charge de son colis.

- **Étiquetage rapide & Indirection transparente :**
  Permettre aux convoyeurs d'étiqueter les colis rapidement lors de la prise en charge, avec sur l'étiquette un code permettant d'avoir les infos sur le camion ou conteneur qui va transporter le colis, et donner la possibilité au convoyeur de pouvoir changer ces infos sans avoir à aller changer ses étiquettes sur les colis, le changement d'infos doit être transparent, l'étiquette doit aussi avoir un numéro ou code permettant aux clients de savoir à tout moment la position et les infos sur la livraison de son colis (exemple : toujours dans l'entrepôt, chargement dans le conteneur ou camion ou avion commencé, chemin parcouru : 1/4, 1/2, 3/4 de la route, arrivée à destination, livré).

- **Canaux de contact :**
  Le client doit pouvoir contacter le convoyeur via tel ou échange sur l'application.

- **Autonomie de suivi client :**
  Le client doit surtout pouvoir à tout moment savoir l'état de la livraison, le suivi, la position du colis pour éviter de contacter le convoyeur.

- **Espace client & Fidélité :**
  Le client doit voir sur son compte l'historique de ses envois et avec quel convoyeur.

- **Backoffice convoyeur :**
  L'application doit avoir un backoffice pour les configurations du convoyeur : l'historique de ses voyages/livraisons de conteneur ou camions, chaque livraison contient une liste de plusieurs colis et chaque colis appartient à un client et à un code/identifiant unique.

- **Mobile-first & Multiplateforme :**
  L'application doit être mobile first, application web/mobile compliance multi-plateforme/browsers à prévoir, appli mobile sur iPhone, Android et autre.

- **Qualité Entreprise, Tests & Sécurité :**
  L'application doit être pour entreprise, avec rigueur, évolutive, bien designée, des tests de la qualité de code avec des tests sur les fonctionnalités clés, une bonne couverture de code, une attention sur la sécurité.

- **Arborescence & Architecture technique :**
  L'application doit avoir un backend et un frontend :
  - Dossier `src` avec à l'intérieur un dossier `back` et un dossier `front`.
  - **Backend** : C# .NET dernière version (.NET 10), Minimal API, utilisant le concept dans *Architecting-ASP.NET-Core-Applications-3E* Chapitre C20 (exemple d'implémentation : `D:\works\Archi\achi_net_core_app_3e\Architecting-ASP.NET-Core-Applications-3E\C20`).
  - **Frontend** : Responsive React / TypeScript / Next.js / TanStack Query / style MUI (avec possibilité de customiser facilement les composants) pour suivre notre design system. Prévoir une partie design system pour UI/UX, pour un début s'inspirer un peu de `Weft_branding_file.pdf` (`D:\works\Projets\Weft\docs\Weft_branding_file.pdf`).

- **Facilité locale & Déploiement Kubernetes agnostique :**
  - Faire en sorte que le développement en local sur PC de développeur soit facile.
  - Déploiement via Kubernetes indépendamment du provider, donc facile à déployer chez n'importe quel cloud provider ou VPS.
