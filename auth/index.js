const msal = require('@azure/msal-node');
const querystring = require('querystring');
const config = require('../shared/config');

const cca = new msal.ConfidentialClientApplication({
  auth: {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    authority: `https://login.microsoftonline.com/${config.tenantId}`
  }
});

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

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          accessToken: tokenResponse.accessToken,
          expiresOn: tokenResponse.expiresOn
        }
      };
    } catch (error) {
      return { status: 500, body: error.message };
    }
  }
};
