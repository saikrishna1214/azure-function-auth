const express = require('express');
const authHandler = require('./auth');
const app = express();

// Configure express to use query string parsing
app.use(express.urlencoded({ extended: true }));

// Route to initiate login
app.get('/login', async (req, res) => {
    const result = await authHandler.login(req);
    res.redirect(result.headers.Location);
});

// Callback route after authentication
app.get('/auth-callback', async (req, res) => {
    const result = await authHandler.callback(req);
    
    if (result.status === 400) {
        res.status(400).send(result.body);
    } else {
        res.send('Authentication successful!');
    }
});

// Home route
app.get('/', (req, res) => {
    res.send('<a href="/login">Login with Azure</a>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
