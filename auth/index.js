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

module.exports = async function (context, req) {
  const path = req.params.path;

  if (path === 'login') {
    const authUrl = await cca.getAuthCodeUrl({
      scopes: config.scopes,
      redirectUri: config.redirectUri
    });
    context.res = {
      status: 302,
      headers: {
        Location: authUrl
      }
    };
  } else if (path === 'callback') {
    const code = req.query.code;
    if (!code) {
      context.res = { status: 400, body: 'No code received' };
      return;
    }

    try {
      const tokenResponse = await cca.acquireTokenByCode({
        code,
        scopes: config.scopes,
        redirectUri: config.redirectUri
      });

      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          accessToken: tokenResponse.accessToken,
          expiresOn: tokenResponse.expiresOn
        }
      };
    } catch (err) {
      context.log('Token error:', err);
      context.res = {
        status: 500,
        body: `Auth failed: ${err.message}`
      };
    }
  } else {
    context.res = { status: 404, body: 'Route not found' };
  }
};
