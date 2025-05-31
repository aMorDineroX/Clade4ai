# 🚁 DroneDelivery - Application de Vente de Drones de Livraison

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)

> 🌟 **La plateforme de référence pour l'achat de drones de livraison professionnels**

Bienvenue sur **DroneDelivery** ! Notre application révolutionne la vente de drones spécialisés dans la livraison rapide et efficace de colis. Que vous soyez une entreprise de logistique, un e-commerçant ou un particulier, trouvez le drone parfait pour vos besoins de livraison.

## 📋 Table des matières

- [🚀 Fonctionnalités principales](#-fonctionnalités-principales)
- [🛠️ Technologies utilisées](#️-technologies-utilisées)
- [⚡ Installation](#-installation)
- [🎯 Utilisation](#-utilisation)
- [📱 Captures d'écran](#-captures-décran)
- [🏗️ Architecture](#️-architecture)
- [🧪 Tests](#-tests)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)
- [📞 Support & Contact](#-support--contact)

## 🚀 Fonctionnalités principales
### 🎯 Pour les Clients
- 📦 **Catalogue avancé** : Fiches techniques détaillées avec spécifications complètes
- 🛒 **Panier intelligent** : Recommandations personnalisées selon vos besoins
- 💳 **Paiement sécurisé** : Support de multiples méthodes de paiement
- 📍 **Suivi en temps réel** : Notifications SMS/Email et tracking GPS
- 🔍 **Comparateur de drones** : Outils de comparaison avancés
- ⭐ **Système d'avis** : Reviews et notes des utilisateurs

### 🏢 Pour les Administrateurs
- 📊 **Dashboard analytique** : Métriques de vente et performance
- 📝 **Gestion des produits** : CRUD complet avec gestion d'images
- 👥 **Gestion des utilisateurs** : Administration des comptes clients
- 📈 **Rapports détaillés** : Exports et statistiques avancées
- 🔔 **Système de notifications** : Alertes automatisées

## 🛠️ Technologies utilisées

### Frontend
- **React.js** 18+ avec TypeScript
- **Tailwind CSS** pour le styling
- **Redux Toolkit** pour la gestion d'état
- **React Query** pour la gestion des données

### Backend
- **Node.js** avec Express.js
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- **Stripe API** pour les paiements

### DevOps & Outils
- **Docker** pour la containerisation
- **GitHub Actions** pour CI/CD
- **ESLint & Prettier** pour la qualité du code
- **Jest** pour les tests unitaires

## ⚡ Installation

### Prérequis
- Node.js 18+ 
- MongoDB 6+
- Git

### 🐳 Installation avec Docker (Recommandé)
```bash
# Cloner le repository
git clone https://github.com/votre-username/drone-delivery.git
cd drone-delivery

# Lancer avec Docker Compose
docker-compose up -d

# L'application sera disponible sur http://localhost:3000
```

### 🔧 Installation manuelle
```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/drone-delivery.git
cd drone-delivery

# 2. Installer les dépendances backend
cd backend
npm install

# 3. Installer les dépendances frontend  
cd ../frontend
npm install

# 4. Configuration de l'environnement
cp .env.example .env
# Éditer le fichier .env avec vos configurations

# 5. Lancer MongoDB (si local)
mongod

# 6. Lancer le backend
cd ../backend
npm run dev

# 7. Lancer le frontend (nouveau terminal)
cd ../frontend
npm start
```

### 🌍 Variables d'environnement
Créez un fichier `.env` avec les variables suivantes :
```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/dronedelivery
JWT_SECRET=votre_jwt_secret_très_sécurisé

# Paiements
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe

# Mode de développement
NODE_ENV=development
PORT=5000
```

## 🎯 Utilisation

### 👤 Interface Client
1. **Inscription/Connexion** : Créez votre compte ou connectez-vous
2. **Navigation** : Explorez notre catalogue de drones par catégorie
3. **Sélection** : Utilisez les filtres avancés (prix, autonomie, charge utile)
4. **Comparaison** : Comparez jusqu'à 3 drones simultanément
5. **Commande** : Ajoutez au panier et finalisez votre achat
6. **Suivi** : Suivez votre commande en temps réel

### 🔧 Interface Admin
- Accès via `/admin` avec identifiants administrateur
- Gestion complète des produits, commandes et utilisateurs
- Tableaux de bord avec métriques en temps réel

## 📱 Captures d'écran

### Page d'accueil
![Homepage](docs/images/homepage.png)

### Catalogue de drones
![Catalog](docs/images/catalog.png)

### Dashboard admin
![Admin Dashboard](docs/images/admin-dashboard.png)

## 🏗️ Architecture

```
drone-delivery/
├── frontend/                 # Application React
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── hooks/          # Hooks personnalisés
│   │   ├── store/          # Configuration Redux
│   │   └── utils/          # Utilitaires
├── backend/                 # API Node.js
│   ├── controllers/        # Logique métier
│   ├── models/            # Modèles MongoDB
│   ├── routes/            # Routes API
│   ├── middleware/        # Middlewares Express
│   └── utils/             # Utilitaires backend
├── docs/                   # Documentation
└── docker-compose.yml     # Configuration Docker
```

## 🧪 Tests

```bash
# Tests unitaires frontend
cd frontend && npm test

# Tests unitaires backend
cd backend && npm test

# Tests d'intégration
npm run test:integration

# Coverage
npm run test:coverage
```

## 🤝 Contribution
Nous accueillons chaleureusement les contributions ! Voici comment participer :

### 🔄 Processus de contribution
1. **Fork** le projet
2. **Créez** une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add: Amazing Feature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez** une Pull Request

### 📋 Guidelines
- Suivez les conventions de code existantes
- Ajoutez des tests pour les nouvelles fonctionnalités
- Mettez à jour la documentation si nécessaire
- Utilisez des commits conventionnels (feat:, fix:, docs:, etc.)

### 🐛 Signaler des bugs
Utilisez les [GitHub Issues](https://github.com/votre-username/drone-delivery/issues) avec le template de bug report.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support & Contact

### 💬 Communauté
- **Discord** : [Rejoindre notre serveur](https://discord.gg/dronedelivery)
- **Forum** : [Discussions GitHub](https://github.com/votre-username/drone-delivery/discussions)

### 📧 Support technique
- **Email** : support@dronedelivery.com
- **Documentation** : [docs.dronedelivery.com](https://docs.dronedelivery.com)

### 👨‍💻 Équipe de développement
- **Lead Developer** : [@votre-username](https://github.com/votre-username)
- **UI/UX Designer** : [@designer-username](https://github.com/designer-username)

---

<div align="center">

**⭐ Si ce projet vous plaît, n'hésitez pas à lui donner une étoile ! ⭐**

Made with ❤️ by the DroneDelivery Team

</div>
