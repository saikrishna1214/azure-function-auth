const http = require('http');
const url = require('url');
const querystring = require('querystring');
const authHandler = require('./auth');

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;

    if (path === '/login') {
        const result = await authHandler.login({ query });
        res.writeHead(result.status, result.headers);
        res.end();
    } else if (path === '/auth-callback') {
        const result = await authHandler.callback({ query });
        
        if (result.status === 400) {
            res.writeHead(result.status, { 'Content-Type': 'text/plain' });
            res.end(result.body);
        } else {
            res.writeHead(result.status, result.headers);
            res.end('Authentication successful!');
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
