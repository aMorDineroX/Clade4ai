# DroneShop API Backend

API REST complète pour l'application de vente de drones DroneShop, construite avec Node.js, Express.js et PostgreSQL (Neon).

## 🚀 Fonctionnalités

- **Authentification JWT** avec inscription, connexion et vérification email
- **Gestion des utilisateurs** avec profils et rôles (customer/admin)
- **Catalogue de drones** avec filtres, recherche et pagination
- **Système de catégories** pour organiser les produits
- **Gestion des commandes** avec suivi et statuts
- **Système d'avis** avec notes et commentaires
- **API RESTful** avec validation des données
- **Base de données PostgreSQL** hébergée sur Neon
- **Sécurité** avec helmet, CORS et rate limiting

## 🛠️ Technologies

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de données (Neon)
- **JWT** - Authentification
- **Bcrypt** - Hachage des mots de passe
- **Joi** - Validation des données
- **Helmet** - Sécurité HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - Logging des requêtes

## 📦 Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env
# Modifier les variables d'environnement
```

4. **Démarrer le serveur**
```bash
# Développement
npm run dev

# Production
npm start
```

5. **Initialiser les données de test**
```bash
node src/database/seed.js
```

## 🌐 Endpoints API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/verify-email/:token` - Vérification email

### Utilisateurs
- `GET /api/users/profile` - Profil utilisateur connecté
- `PUT /api/users/profile` - Modifier le profil
- `PUT /api/users/change-password` - Changer le mot de passe
- `GET /api/users` - Liste des utilisateurs (Admin)

### Drones
- `GET /api/drones` - Liste des drones avec filtres
- `GET /api/drones/:id` - Détails d'un drone

### Catégories
- `GET /api/categories` - Liste des catégories
- `GET /api/categories/:id` - Détails d'une catégorie
- `POST /api/categories` - Créer une catégorie (Admin)
- `PUT /api/categories/:id` - Modifier une catégorie (Admin)

### Commandes
- `POST /api/orders` - Créer une commande
- `GET /api/orders` - Mes commandes
- `GET /api/orders/:id` - Détails d'une commande

### Avis
- `POST /api/reviews` - Créer un avis
- `GET /api/reviews/drone/:droneId` - Avis d'un drone
- `GET /api/reviews/user` - Mes avis

## 📊 Structure de la base de données

### Tables principales
- **users** - Utilisateurs et administrateurs
- **categories** - Catégories de drones
- **drones** - Catalogue des drones
- **orders** - Commandes des clients
- **reviews** - Avis et évaluations

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Incluez le token dans l'en-tête Authorization :

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Exemples d'utilisation

### Inscription
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

### Obtenir les drones
```bash
curl -X GET "http://localhost:5000/api/drones?page=1&limit=10&search=DJI"
```

## 🔧 Configuration

### Variables d'environnement
```env
# Base de données
DATABASE_URL=postgresql://user:password@host:port/database

# Serveur
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# URLs
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
```

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests avec couverture
npm run test:coverage
```

## 📈 Monitoring

- **Health Check** : `GET /health`
- **Logs** : Morgan pour les requêtes HTTP
- **Erreurs** : Middleware centralisé de gestion d'erreurs

## 🚀 Déploiement

1. **Variables d'environnement** de production
2. **Base de données** Neon configurée
3. **Serveur** Node.js (PM2 recommandé)

## 👥 Comptes de test

Après le seeding :
- **Admin** : admin@droneshop.com / Admin123!

## 📄 Licence

MIT License
