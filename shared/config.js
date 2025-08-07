module.exports = {
  clientId: process.env.AZURE_CLIENT_ID || '41487f12-4cbf-42e2-962d-85d3e29e4cf3',
  clientSecret: process.env.AZURE_CLIENT_SECRET || 'HdB8Q~q3bMG_S9XIbMv10iTX1rxV~m6qk1QDFcU2',
  tenantId: process.env.AZURE_TENANT_ID || '0012543a-073f-4274-98aa-41cf63d531ce',
  redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/auth-callback',
  scopes: ['User.Read', 'Chat.Read']
};
