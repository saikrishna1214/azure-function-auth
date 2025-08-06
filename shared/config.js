module.exports = {
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  tenantId: 'YOUR_TENANT_ID',
  redirectUri: 'https://<your-fn-app>.azurewebsites.net/api/auth/callback',
  scopes: ['User.Read', 'Chat.Read']
};
