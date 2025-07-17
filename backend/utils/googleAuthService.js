const { OAuth2Client } = require('google-auth-library');

class GoogleAuthService {
  constructor() {
    // Check multiple possible environment variable names
    const clientId = process.env.GOOGLE_WEB_CLIENT_ID || 
                    process.env.GOOGLE_CLIENT_ID || 
                    '10698272202-emghd3gee0eb8f548rjmush3ekfo8fc6.apps.googleusercontent.com';
    
    console.log('=== GoogleAuthService Initialization ===');
    console.log('Environment variables check:');
    console.log('GOOGLE_WEB_CLIENT_ID:', process.env.GOOGLE_WEB_CLIENT_ID ? 'SET' : 'NOT SET');
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
    console.log('Using Client ID:', clientId ? clientId.substring(0, 20) + '...' : 'NONE');
    console.log('=========================================');
    
    if (!clientId || clientId === 'undefined') {
      console.error('ERROR: No Google Client ID found in environment variables');
      console.log('Please set GOOGLE_WEB_CLIENT_ID or GOOGLE_CLIENT_ID in your .env file');
      console.log('Available environment variables:', Object.keys(process.env).filter(key => key.includes('GOOGLE')));
      
      // Don't throw error, just log warning and continue with fallback
      console.warn('Using fallback Google Client ID for development');
    }
    
    try {
      this.googleClient = new OAuth2Client(clientId);
      this.clientId = clientId;
      console.log('GoogleAuthService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google OAuth Client:', error.message);
      this.googleClient = null;
      this.clientId = null;
    }
  }

  async verifyIdToken(idToken) {
    try {
      console.log('Verifying Google ID token...');
      
      if (!this.googleClient) {
        throw new Error('Google Client not initialized');
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken: idToken,
        audience: this.clientId
      });

      const payload = ticket.getPayload();
      console.log('Google token verified successfully for:', payload?.email);
      
      if (!payload || !payload.sub) {
        throw new Error('Invalid Google token payload');
      }

      return {
        id: payload.sub,
        email: payload.email,
        given_name: payload.given_name || 'User',
        family_name: payload.family_name || 'Name',
        picture: payload.picture,
        email_verified: payload.email_verified
      };
    } catch (error) {
      console.error('Google token verification error:', error.message);
      if (error.message.includes('audience')) {
        throw new Error('Google Client ID mismatch - please check your GOOGLE_WEB_CLIENT_ID environment variable');
      }
      throw new Error('Google authentication failed: ' + error.message);
    }
  }
}

module.exports = GoogleAuthService;