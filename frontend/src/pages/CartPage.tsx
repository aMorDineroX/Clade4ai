import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice';
import Button from '../components/common/Button';

const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, totalPrice, totalItems } = useAppSelector(state => state.cart);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
          <p className="text-gray-600 mb-8">
            Découvrez notre sélection de drones et ajoutez vos favoris au panier
          </p>
          <Link to="/drones">
            <Button size="lg">
              Découvrir nos drones
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Panier ({totalItems} article{totalItems > 1 ? 's' : ''})
        </h1>
        <Button variant="outline" onClick={handleClearCart}>
          Vider le panier
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.drone.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center space-x-4">
                <img
                  src={item.drone.images[0]}
                  alt={item.drone.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                
                <div className="flex-1">
                  <Link 
                    to={`/drones/${item.drone.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {item.drone.name}
                  </Link>
                  <p className="text-gray-600">{item.drone.brand}</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {item.drone.price.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.drone.id, item.quantity - 1)}
                    className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.drone.id, item.quantity + 1)}
                    className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {(item.drone.price * item.quantity).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item.drone.id)}
                    className="text-red-600 hover:text-red-800 mt-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Résumé de la commande
            </h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium">
                  {totalPrice.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span className="font-medium text-green-600">Gratuite</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TVA (20%)</span>
                <span className="font-medium">
                  {(totalPrice * 0.2).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {(totalPrice * 1.2).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </span>
                </div>
              </div>
            </div>

            <Link to="/checkout">
              <Button size="lg" fullWidth>
                Procéder au paiement
              </Button>
            </Link>

            <div className="mt-4 text-center">
              <Link to="/drones" className="text-blue-600 hover:text-blue-800">
                Continuer mes achats
              </Link>
            </div>

            {/* Security Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 text-center">
                🔒 Paiement sécurisé SSL<br />
                📦 Livraison gratuite<br />
                ↩️ Retour gratuit sous 30 jours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
