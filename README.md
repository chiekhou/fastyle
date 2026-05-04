# FaStyle — Beauté & Boutique

Application web full-stack dédiée à la gestion d'une activité beauté indépendante : réservation de prestations, boutique en ligne (cosmétiques & vêtements) et espace d'administration.

---

## Fonctionnalités

### Espace cliente
- Inscription, connexion et vérification d'adresse email
- Réservation de prestations avec paiement d'un acompte
- Boutique en ligne avec gestion du panier et des variantes produit (tailles, couleurs)
- Paiement sécurisé via PayPal
- Choix du transporteur à la commande (Mondial Relay ou Colissimo) avec calcul automatique des frais selon le poids
- Livraison offerte à partir de 60 €
- Suivi des commandes et réservations depuis le compte
- Dépôt d'avis clients
- Application installable sur mobile (PWA)

### Espace administration
- Tableau de bord avec statistiques en temps réel
- Gestion des prestations (création, modification, désactivation)
- Gestion des produits avec variantes et alertes stock bas
- Gestion des réservations (confirmation, annulation, remboursement)
- Gestion des commandes (suivi expédition et livraison)
- Modération des avis clients
- Gestion des comptes clientes (activation / désactivation / suppression)

### Pages légales
- Mentions légales
- Conditions Générales de Vente (CGV)

---

## Stack technique

### Frontend
- **React 19** avec Vite
- **Tailwind CSS** pour le style
- **React Router v7** pour la navigation
- **Zustand** pour la gestion du panier
- **Axios** pour les appels API
- **PWA** : manifest + service worker (cache-first pour les assets, network-first pour l'API)

### Backend
- **Node.js / Express**
- **PostgreSQL** avec **Sequelize** (ORM)
- **JWT** (access token 15min + refresh token 30j)
- **Bcrypt** pour le hachage des mots de passe
- Stockage des images via **Cloudinary**
- Envoi d'emails transactionnels via **Brevo**
- Paiement via l'API **PayPal**

### Infrastructure (développement)
- **Docker Compose** : PostgreSQL + API Node.js + Adminer
- Hot reload en développement

---

## Structure du projet

```
fatstyle-projet/
├── backend/          # API REST Node.js / Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── validators/
│   ├── migrations/
│   └── docker-compose.yml
└── frontend/         # Application React / Vite
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── pages/
    │   ├── store/
    │   └── utils/
    └── public/       # PWA (manifest, service worker, icônes)
```

---

## Démarrage en développement

### Prérequis
- Node.js 20+
- Docker & Docker Compose

### Backend

```bash
cd backend
cp .env.example .env
# Remplir les variables dans .env
docker-compose up -d
npm install
npx sequelize-cli db:migrate
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

L'API est disponible sur `http://localhost:5001` et le frontend sur `http://localhost:5173`.

---

## Variables d'environnement

Copier `backend/.env.example` en `backend/.env` et renseigner :

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `JWT_SECRET` | Clé secrète pour les access tokens |
| `JWT_REFRESH_SECRET` | Clé secrète pour les refresh tokens |
| `PAYPAL_CLIENT_ID` | Identifiant de l'application PayPal |
| `PAYPAL_CLIENT_SECRET` | Secret de l'application PayPal |
| `PAYPAL_MODE` | `sandbox` en dev, `production` en prod |
| `CLOUDINARY_CLOUD_NAME` | Nom du compte Cloudinary |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary |
| `BREVO_API_KEY` | Clé API Brevo pour les emails |
| `CLIENT_URL` | URL du frontend (ex: `https://fatstyle.fr`) |

---

## Sécurité

- Rate limiting sur les endpoints d'authentification
- Tokens JWT à courte durée de vie avec rotation via refresh tokens
- Mots de passe hachés avec bcrypt (12 rounds)
- Headers HTTP sécurisés via Helmet
- CORS restreint aux origines autorisées
- Validation des entrées côté serveur (express-validator)
- Transactions base de données pour les opérations critiques (commandes, réservations)
