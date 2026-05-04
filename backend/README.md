# Beauty App — Backend API

API REST complète pour l'application de réservation et boutique beauté.

## Stack

- **Runtime** : Node.js 18+
- **Framework** : Express.js
- **ORM** : Sequelize + PostgreSQL
- **Auth** : JWT (access 15min) + Refresh tokens (30j)
- **Paiement** : PayPal Orders API v2
- **Images** : Cloudinary
- **Emails** : Brevo (SMTP)
- **Hébergement** : Render.com

---

## Installation

```bash
npm install
cp .env.example .env
# Remplir le .env avec vos clés
```

## Base de données

```bash
npm run db:migrate   # Lancer toutes les migrations
npm run db:seed      # Insérer les données initiales
npm run db:reset     # Tout réinitialiser
```

## Démarrage

```bash
npm run dev    # Développement (nodemon)
npm start      # Production
```

---

## Déploiement sur Render.com

1. Créer un Web Service → connecter le repo GitHub
2. **Build Command** : `npm install`
3. **Start Command** : `npm start`
4. Ajouter toutes les variables d'env du `.env.example`
5. Créer une base PostgreSQL sur Render → copier `DATABASE_URL`
6. Lancer les migrations depuis le shell Render : `npm run db:migrate && npm run db:seed`
