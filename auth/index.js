const msal = require('@azure/msal-node');
const querystring = require('querystring');
const config = require('../shared/config');

// Token cache
let cachedToken = null;
let tokenExpiresAt = null;

const cca = new msal.ConfidentialClientApplication({
  auth: {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    authority: `https://login.microsoftonline.com/${config.tenantId}`
  }
});

const isTokenExpired = () => {
  if (!tokenExpiresAt) return true;
  return Date.now() >= tokenExpiresAt;
};

const getToken = async () => {
  if (cachedToken && !isTokenExpired()) {
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        accessToken: cachedToken,
        expiresOn: tokenExpiresAt
      }
    };
  }
  return { status: 401, body: 'Not authenticated' };
};

module.exports = {
  login: async function (req) {
    const authUrl = await cca.getAuthCodeUrl({
      scopes: config.scopes,
      redirectUri: config.redirectUri
    });
    return {
      status: 302,
      headers: {
        Location: authUrl
      }
    };
  },
  callback: async function (req) {
    const code = req.query.code;
    if (!code) {
      return { status: 400, body: 'No code received' };
    }

    try {
      const tokenResponse = await cca.acquireTokenByCode({
        code,
        scopes: config.scopes,
        redirectUri: config.redirectUri
      });

      // Cache the token
      cachedToken = tokenResponse.accessToken;
      tokenExpiresAt = new Date(tokenResponse.expiresOn).getTime();

      // Return the token in the response
      return {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache'
        },
        body: {
          accessToken: tokenResponse.accessToken,
          expiresOn: tokenResponse.expiresOn,
          success: true
        }
      };
    } catch (error) {
      return { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' },
        body: { 
          error: error.message,
          success: false 
        }
      };
    }
  },
  getToken
};
