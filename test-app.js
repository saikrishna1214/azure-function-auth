const http = require('http');
const url = require('url');
const querystring = require('querystring');
const authHandler = require('./auth');

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;

    console.log('Request received:', { path, query, headers: req.headers });

    if (path === '/login') {
        console.log('Handling login request');
        const result = await authHandler.login({ query });
        res.writeHead(result.status, result.headers);
        res.end();
    } else if (path === '/auth-callback') {
        console.log('Handling auth callback with query:', query);
        const result = await authHandler.callback({ query });
        
        if (result.status === 400) {
            console.error('Callback error:', result.body);
            res.writeHead(result.status, { 'Content-Type': 'text/plain' });
            res.end(result.body);
        } else if (result.status === 200) {
            console.log('Callback successful, redirecting to ServiceNow');
            // Redirect to ServiceNow with token
            const serviceNowUrl = 'https://firebender.service-now.com/now/my-tasks-planner/home';
            res.writeHead(302, {
                'Location': `${serviceNowUrl}`
            });
            res.end();
        } else {
            console.error('Callback failed:', result.body);
            res.writeHead(result.status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                status: 'error',
                error: result.body 
            }));
        }
    } else if (path === '/token') {
        try {
            console.log('Handling token request');
            const result = await authHandler.getToken();
            
            if (result.status === 200) {
                console.log('Returning token:', {
                    accessToken: result.body.accessToken.substring(0, 20) + '...',
                    expiresOn: result.body.expiresOn
                });
                res.writeHead(200, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                });
                res.end(JSON.stringify(result.body));
            } else {
                console.log('Token request failed:', result.body);
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    status: 'error',
                    error: result.body 
                }));
            }
        } catch (error) {
            console.error('Error in token request:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                status: 'error',
                error: error.message 
            }));
        }
    } else if (path === '/api/callback') {
        // Handle API callback
        try {
            const result = await authHandler.callback({ query });
            
            if (result.status === 200) {
                res.writeHead(200, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                });
                res.end(JSON.stringify(result.body));
            } else {
                res.writeHead(result.status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    status: 'error',
                    error: result.body 
                }));
            }
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                status: 'error',
                error: error.message 
            }));
        }
    } else if (path === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<a href="/login">Login with Azure</a>');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
