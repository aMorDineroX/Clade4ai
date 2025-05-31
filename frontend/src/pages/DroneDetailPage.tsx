import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, Camera, Clock, Navigation, Zap } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchDroneById } from '../store/slices/droneSlice';
import { addToCart } from '../store/slices/cartSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';

const DroneDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  
  const dispatch = useAppDispatch();
  const { currentDrone: drone, loading, error } = useAppSelector(state => state.drones);

  useEffect(() => {
    if (id) {
      dispatch(fetchDroneById(id));
    }
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (drone) {
      dispatch(addToCart({ drone, quantity }));
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !drone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Drone non trouvé</h2>
          <p className="text-gray-600">{error || 'Ce drone n\'existe pas'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={drone.images[selectedImage]}
              alt={drone.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {drone.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {drone.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-md overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${drone.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {drone.category.name}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {drone.name}
          </h1>
          
          <p className="text-xl text-gray-600 mb-4">
            {drone.brand} - {drone.model}
          </p>

          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {renderStars(drone.rating)}
            </div>
            <span className="ml-2 text-gray-600">
              {drone.rating}/5 ({drone.reviewCount} avis)
            </span>
          </div>

          <div className="mb-6">
            <span className="text-3xl font-bold text-blue-600">
              {drone.price.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              })}
            </span>
          </div>

          <p className="text-gray-700 mb-6">
            {drone.description}
          </p>

          {/* Key Features */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-700">{drone.specifications.camera}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">{drone.specifications.flightTime} min</span>
            </div>
            <div className="flex items-center space-x-2">
              <Navigation className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-gray-700">{drone.specifications.range} km</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-gray-700">{drone.specifications.maxSpeed} km/h</span>
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-600 hover:text-gray-800"
              >
                -
              </button>
              <span className="px-4 py-2 border-l border-r border-gray-300">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800"
              >
                +
              </button>
            </div>
            
            <Button
              onClick={handleAddToCart}
              disabled={!drone.inStock}
              icon={ShoppingCart}
              size="lg"
              className="flex-1"
            >
              {drone.inStock ? 'Ajouter au panier' : 'Rupture de stock'}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mb-8">
            <Button variant="outline" icon={Heart} className="flex-1">
              Favoris
            </Button>
            <Button variant="outline" icon={Share2} className="flex-1">
              Partager
            </Button>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {drone.inStock ? (
              <span className="text-green-600 font-medium">✓ En stock</span>
            ) : (
              <span className="text-red-600 font-medium">✗ Rupture de stock</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-16">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'description', label: 'Description' },
              { key: 'specs', label: 'Spécifications' },
              { key: 'reviews', label: 'Avis' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Description détaillée</h3>
              <p className="text-gray-700 mb-4">{drone.description}</p>
              <h4 className="text-lg font-semibold mb-2">Fonctionnalités principales</h4>
              <ul className="list-disc list-inside space-y-1">
                {drone.features.map((feature, index) => (
                  <li key={index} className="text-gray-700">{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'specs' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Spécifications techniques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Performance</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Vitesse maximale:</dt>
                      <dd>{drone.specifications.maxSpeed} km/h</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Autonomie:</dt>
                      <dd>{drone.specifications.flightTime} minutes</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Portée:</dt>
                      <dd>{drone.specifications.range} km</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Charge utile:</dt>
                      <dd>{drone.specifications.maxPayload} kg</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Caractéristiques</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Poids:</dt>
                      <dd>{drone.specifications.weight} kg</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Batterie:</dt>
                      <dd>{drone.specifications.battery}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Caméra:</dt>
                      <dd>{drone.specifications.camera}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">GPS:</dt>
                      <dd>{drone.specifications.gps ? 'Oui' : 'Non'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Avis clients</h3>
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  {renderStars(drone.rating)}
                </div>
                <span className="ml-2 text-xl font-semibold">{drone.rating}/5</span>
                <span className="ml-2 text-gray-600">({drone.reviewCount} avis)</span>
              </div>
              <p className="text-gray-600">
                Les avis clients seront bientôt disponibles.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DroneDetailPage;
