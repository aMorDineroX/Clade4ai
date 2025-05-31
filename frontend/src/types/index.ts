export interface Drone {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  description: string;
  specifications: {
    maxSpeed: number; // km/h
    flightTime: number; // minutes
    maxPayload: number; // kg
    range: number; // km
    battery: string;
    camera: string;
    gps: boolean;
    weight: number; // kg
  };
  images: string[];
  category: DroneCategory;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  features: string[];
}

export interface DroneCategory {
  id: string;
  name: string;
  description: string;
}

export interface CartItem {
  drone: Drone;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: Address;
  role: 'user' | 'admin';
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
