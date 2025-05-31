// Mock pour les utilitaires email
const sendEmail = jest.fn().mockResolvedValue({
  success: true,
  messageId: 'mock-message-id'
});

const sendVerificationEmail = jest.fn().mockResolvedValue({
  success: true,
  messageId: 'mock-verification-email-id'
});

const sendPasswordResetEmail = jest.fn().mockResolvedValue({
  success: true,
  messageId: 'mock-reset-email-id'
});

const sendWelcomeEmail = jest.fn().mockResolvedValue({
  success: true,
  messageId: 'mock-welcome-email-id'
});

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};
