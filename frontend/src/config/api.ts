// Configuration de l'API
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
};

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationResponse<T> {
  success: boolean;
  data: {
    drones?: T[];
    categories?: T[];
    orders?: T[];
    reviews?: T[];
    users?: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface SingleItemResponse<T> {
  success: boolean;
  data: {
    drone?: T;
    category?: T;
    order?: T;
    review?: T;
    user?: T;
  };
}

// Configuration des en-têtes par défaut
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fonction utilitaire pour les requêtes API
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur API');
    }

    return data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

// Services API spécialisés
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getProfile: () => apiRequest('/auth/me'),

  verifyEmail: (token: string) =>
    apiRequest(`/auth/verify-email/${token}`, {
      method: 'POST',
    }),
};

export const dronesAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: string;
    inStock?: boolean;
  }) => {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    return apiRequest<PaginationResponse<any>>(`/drones${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id: string) => apiRequest<SingleItemResponse<any>>(`/drones/${id}`),
};

export const categoriesAPI = {
  getAll: (includeInactive = false) =>
    apiRequest(`/categories${includeInactive ? '?includeInactive=true' : ''}`),

  getById: (id: string) => apiRequest(`/categories/${id}`),

  create: (categoryData: {
    name: string;
    description?: string;
    imageUrl?: string;
  }) =>
    apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    }),

  update: (id: string, categoryData: {
    name?: string;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
  }) =>
    apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    }),
};

export const ordersAPI = {
  create: (orderData: {
    items: Array<{
      droneId: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress: {
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
      phone?: string;
    };
    paymentMethod: 'card' | 'paypal';
  }) =>
    apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    return apiRequest(`/orders${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id: string) => apiRequest(`/orders/${id}`),
};

export const reviewsAPI = {
  create: (reviewData: {
    droneId: string;
    rating: number;
    title: string;
    comment: string;
  }) =>
    apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),

  getByDrone: (droneId: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    return apiRequest(`/reviews/drone/${droneId}${queryString ? `?${queryString}` : ''}`);
  },

  getUserReviews: (params?: {
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        // @ts-ignore - Temporary fix for type checking
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    return apiRequest(`/reviews/user${queryString ? `?${queryString}` : ''}`);
  },
};

export const usersAPI = {
  getProfile: () => apiRequest('/users/profile'),

  updateProfile: (userData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  }) =>
    apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  changePassword: (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) =>
    apiRequest('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    }),

  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) => {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    return apiRequest(`/users${queryString ? `?${queryString}` : ''}`);
  },
};
