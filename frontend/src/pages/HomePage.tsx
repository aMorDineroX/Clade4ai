import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Headphones, Star, Zap, Camera, Gamepad2 } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-primary text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4 mr-2" />
                Nouvelle collection 2025
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
                Découvrez l'univers des
                <span className="gradient-text bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent"> drones</span>
              </h1>
              <p className="text-xl mb-10 text-blue-100 leading-relaxed">
                De la photographie aérienne aux courses de vitesse, trouvez le drone parfait
                pour vos besoins. Qualité professionnelle, prix compétitifs.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/drones">
                  <Button
                    size="xl"
                    variant="secondary"
                    rounded="xl"
                    shadow="xl"
                    className="bg-white text-blue-600 hover:bg-gray-100 font-bold"
                  >
                    Explorer nos drones
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="xl"
                  rounded="xl"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold"
                >
                  En savoir plus
                </Button>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <div className="relative">
                <img
                  src="https://via.placeholder.com/600x400"
                  alt="Drone professionnel"
                  className="rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 glass p-6 rounded-2xl shadow-xl animate-bounce-gentle">
                <div className="flex items-center space-x-3">
                  <Star className="h-6 w-6 text-yellow-400 fill-current" />
                  <div>
                    <div className="font-bold text-gray-900">4.9/5</div>
                    <div className="text-sm text-gray-600">+1000 avis</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 glass p-4 rounded-2xl shadow-xl">
                <div className="text-center">
                  <div className="font-bold text-2xl text-blue-600">500+</div>
                  <div className="text-sm text-gray-600">Modèles</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 gradient-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Pourquoi choisir <span className="gradient-text">DroneShop</span> ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Nous nous engageons à vous offrir la meilleure expérience d'achat
              et les produits de la plus haute qualité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center group" hover={true} padding="lg" shadow="lg">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Garantie qualité
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Tous nos drones sont testés et garantis. Satisfaction garantie ou remboursé.
              </p>
            </Card>

            <Card className="text-center group" hover={true} padding="lg" shadow="lg">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Livraison rapide
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Livraison gratuite en 24-48h partout en France métropolitaine.
              </p>
            </Card>

            <Card className="text-center group" hover={true} padding="lg" shadow="lg">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Headphones className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Support expert
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Notre équipe d'experts est là pour vous conseiller et vous accompagner.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Explorez nos <span className="gradient-text">catégories</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Trouvez le drone parfait selon votre usage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Drones de loisir',
                description: 'Parfaits pour débuter et s\'amuser',
                image: 'https://via.placeholder.com/300x200',
                link: '/drones?category=loisir',
                icon: Gamepad2,
                gradient: 'from-green-500 to-emerald-600'
              },
              {
                title: 'Drones professionnels',
                description: 'Pour la photographie et la vidéographie',
                image: 'https://via.placeholder.com/300x200',
                link: '/drones?category=professionnel',
                icon: Camera,
                gradient: 'from-blue-500 to-indigo-600'
              },
              {
                title: 'Drones de course',
                description: 'Vitesse et agilité pour les compétitions',
                image: 'https://via.placeholder.com/300x200',
                link: '/drones?category=course',
                icon: Zap,
                gradient: 'from-orange-500 to-red-600'
              },
            ].map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group block"
              >
                <Card className="overflow-hidden" hover={true} padding="none" shadow="xl">
                  <div className="relative">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className={`absolute top-4 right-4 bg-gradient-to-r ${category.gradient} p-3 rounded-xl shadow-lg`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {category.description}
                    </p>
                    <div className="mt-4 inline-flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                      Découvrir
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden gradient-primary text-white py-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Prêt à prendre votre <span className="gradient-text bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">envol</span> ?
            </h2>
            <p className="text-xl mb-12 text-blue-100 leading-relaxed max-w-2xl mx-auto">
              Découvrez notre sélection complète de drones et accessoires.
              Rejoignez des milliers de pilotes satisfaits !
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/drones">
                <Button
                  size="xl"
                  variant="secondary"
                  rounded="xl"
                  shadow="xl"
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold"
                >
                  Voir tous les drones
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="xl"
                rounded="xl"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold"
              >
                Contactez-nous
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
