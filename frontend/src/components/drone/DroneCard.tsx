import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react';
import { Drone } from '../../types';
import { useAppDispatch } from '../../hooks/redux';
import { addToCart } from '../../store/slices/cartSlice';
import Button from '../common/Button';
import Card from '../common/Card';

interface DroneCardProps {
  drone: Drone;
}

const DroneCard: React.FC<DroneCardProps> = ({ drone }) => {
  const dispatch = useAppDispatch();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ drone, quantity: 1 }));
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="group overflow-hidden" hover={true} padding="none" shadow="lg">
      <Link to={`/drones/${drone.id}`}>
        <div className="relative">
          <img
            src={drone.images[0]}
            alt={drone.name}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {!drone.inStock && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center">
              <span className="badge badge-danger text-white font-bold px-4 py-2 text-lg">Rupture de stock</span>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <span className="badge badge-primary bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 font-semibold shadow-lg">
              {drone.category.name}
            </span>
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 group-hover:scale-110"
          >
            <Heart className={`h-5 w-5 transition-colors ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {drone.name}
            </h3>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{drone.brand}</p>
          </div>

          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {renderStars(drone.rating)}
            </div>
            <span className="ml-2 text-sm text-gray-600 font-medium">
              {drone.rating} ({drone.reviewCount} avis)
            </span>
          </div>

          <p className="text-gray-700 text-sm mb-4 line-clamp-2 leading-relaxed">
            {drone.description}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Autonomie</div>
              <div className="text-sm font-semibold text-gray-900">{drone.specifications.flightTime}min</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Portée</div>
              <div className="text-sm font-semibold text-gray-900">{drone.specifications.range}km</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Vitesse</div>
              <div className="text-sm font-semibold text-gray-900">{drone.specifications.maxSpeed}km/h</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Poids</div>
              <div className="text-sm font-semibold text-gray-900">{drone.specifications.weight}kg</div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {drone.price.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              })}
            </span>
            {drone.inStock && (
              <span className="badge badge-success">En stock</span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-6 pb-6 flex gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={!drone.inStock}
          icon={ShoppingCart}
          size="md"
          className="flex-1"
          rounded="xl"
        >
          Ajouter au panier
        </Button>
        <Link to={`/drones/${drone.id}`}>
          <Button
            variant="outline"
            icon={Eye}
            size="md"
            rounded="xl"
          >
            Voir
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default DroneCard;