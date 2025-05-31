const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Simulons quelques fonctions utilitaires que nous testons
const authUtils = {
  generateToken: (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token invalide');
    }
  },

  hashPassword: async (password) => {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  },

  comparePassword: async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
  },

  createSlug: (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  },

  validateEmail: (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Vérifier qu'il n'y a pas de points consécutifs
    if (email.includes('..')) return false;
    return emailRegex.test(email);
  },

  validatePassword: (password) => {
    // Au moins 8 caractères, une majuscule, une minuscule, un chiffre
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  },

  formatPrice: (price) => {
    return parseFloat(price).toFixed(2);
  },

  calculateDiscountPrice: (originalPrice, discountPercent) => {
    const discount = (originalPrice * discountPercent) / 100;
    return originalPrice - discount;
  }
};

describe('Auth Utils', () => {
  describe('generateToken', () => {
    it('devrait générer un token JWT valide', () => {
      const userId = 'test-user-id';
      const token = authUtils.generateToken(userId);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT structure
    });
  });

  describe('verifyToken', () => {
    it('devrait vérifier un token valide', () => {
      const userId = 'test-user-id';
      const token = authUtils.generateToken(userId);
      const decoded = authUtils.verifyToken(token);
      
      expect(decoded.userId).toBe(userId);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('devrait rejeter un token invalide', () => {
      expect(() => {
        authUtils.verifyToken('invalid-token');
      }).toThrow('Token invalide');
    });
  });

  describe('hashPassword', () => {
    it('devrait hasher un mot de passe', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await authUtils.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });
  });

  describe('comparePassword', () => {
    it('devrait valider un mot de passe correct', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await authUtils.hashPassword(password);
      const isValid = await authUtils.comparePassword(password, hashedPassword);
      
      expect(isValid).toBe(true);
    });

    it('devrait rejeter un mot de passe incorrect', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await authUtils.hashPassword(password);
      const isValid = await authUtils.comparePassword(wrongPassword, hashedPassword);
      
      expect(isValid).toBe(false);
    });
  });

  describe('createSlug', () => {
    it('devrait créer un slug valide', () => {
      const text = 'Drone DJI Mavic Pro 2 - Caméra 4K';
      const slug = authUtils.createSlug(text);
      
      expect(slug).toBe('drone-dji-mavic-pro-2-camra-4k');
    });

    it('devrait gérer les caractères spéciaux', () => {
      const text = 'Test@#$%^&*()_+ with Special !@#$% Characters';
      const slug = authUtils.createSlug(text);
      
      expect(slug).toBe('test-with-special-characters');
    });

    it('devrait gérer les espaces multiples', () => {
      const text = 'Multiple    Spaces    Test';
      const slug = authUtils.createSlug(text);
      
      expect(slug).toBe('multiple-spaces-test');
    });
  });

  describe('validateEmail', () => {
    it('devrait valider des emails corrects', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.org',
        'user+tag@example.co.uk'
      ];

      validEmails.forEach(email => {
        expect(authUtils.validateEmail(email)).toBe(true);
      });
    });

    it('devrait rejeter des emails incorrects', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com'
      ];

      invalidEmails.forEach(email => {
        expect(authUtils.validateEmail(email)).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    it('devrait valider des mots de passe sécurisés', () => {
      const validPasswords = [
        'Password123',
        'SecurePass1',
        'MyP@ssw0rd'
      ];

      validPasswords.forEach(password => {
        expect(authUtils.validatePassword(password)).toBe(true);
      });
    });

    it('devrait rejeter des mots de passe faibles', () => {
      const invalidPasswords = [
        'password', // Pas de majuscule ni chiffre
        'PASSWORD', // Pas de minuscule ni chiffre
        '12345678', // Pas de lettres
        'Pass1', // Trop court
        'password123' // Pas de majuscule
      ];

      invalidPasswords.forEach(password => {
        expect(authUtils.validatePassword(password)).toBe(false);
      });
    });
  });

  describe('formatPrice', () => {
    it('devrait formater les prix correctement', () => {
      expect(authUtils.formatPrice(1299)).toBe('1299.00');
      expect(authUtils.formatPrice(1299.5)).toBe('1299.50');
      expect(authUtils.formatPrice(1299.99)).toBe('1299.99');
      expect(authUtils.formatPrice('1299')).toBe('1299.00');
    });
  });

  describe('calculateDiscountPrice', () => {
    it('devrait calculer les prix avec remise', () => {
      expect(authUtils.calculateDiscountPrice(100, 10)).toBe(90);
      expect(authUtils.calculateDiscountPrice(1299.99, 15)).toBe(1104.9915);
      expect(authUtils.calculateDiscountPrice(50, 50)).toBe(25);
    });
  });
});
