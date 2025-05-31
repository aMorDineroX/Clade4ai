module.exports = {
  // Environnement de test
  testEnvironment: 'node',
  
  // Dossier contenant les tests
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/__tests__/**/*.js'
  ],
  
  // Couverture de code
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/database/seed.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Configuration des modules
  moduleFileExtensions: ['js', 'json'],
  
  // Variables d'environnement pour les tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Timeout par défaut
  testTimeout: 10000,
  
  // Exécution en série pour éviter les conflits de base de données
  maxWorkers: 1,
  
  // Affichage des résultats
  verbose: true,
  
  // Nettoyage automatique des mocks
  clearMocks: true,
  
  // Transformation des fichiers
  transform: {},
  
  // Ignore certains dossiers
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/'
  ]
};
