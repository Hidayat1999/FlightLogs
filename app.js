const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ideally we would store these credentials in a database or environment variable
app.use(session({
    secret: '123456',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

let users = [
    { username: 'hidayat', password: '123456' },
    { username: 'veebee', password: '123456' },
];

let flightLogs = [
    { tailNumber: 'N12345', flightID: 'FL001', takeoff: '2023-10-01T10:00:00Z', landing: '2023-10-01T12:00:00Z', duration: '2h' },
    { tailNumber: 'N67890', flightID: 'FL002', takeoff: '2023-10-02T14:00:00Z', landing: '2023-10-02T16:00:00Z', duration: '2h' },
    { tailNumber: 'N12345', flightID: 'FL003', takeoff: '2023-10-03T18:00:00Z', landing: '2023-10-03T20:00:00Z', duration: '2h' },
    { tailNumber: 'N67890', flightID: 'FL004', takeoff: '2023-10-04T22:00:00Z', landing: '2023-10-05T00:00:00Z', duration: '2h' },
];

// Middleware function to check if the user is authenticated. Here we use sessions.
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route for the flight logs page
app.get('/flightLogs', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'flightLogs.html'));
});

// Handle user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        req.session.user = user;
        res.redirect('/flightLogs'); 
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Destroy the user session and redirect to the login page
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/'); 
});

// Create a new user
app.post('/users', (req, res) => {
    const { username, password } = req.body;
    users.push({ username, password });
    res.status(201).send('User created');
});

// Delete a user
app.delete('/users/:username', (req, res) => {
    const { username } = req.params;
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        res.status(200).send('User deleted');
    } else {
        res.status(404).send('User not found');
    }
});

// Retrieve all flight logs
app.get('/api/flightLogs', isAuthenticated, (req, res) => {
    res.json(flightLogs);
});

// Create a new flight log
app.post('/api/flightLogs', isAuthenticated, (req, res) => {
    const { tailNumber, flightID, takeoff, landing, duration } = req.body;
    flightLogs.push({ tailNumber, flightID, takeoff, landing, duration });
    res.status(201).send('Flight log created');
});

// Update an existing flight log
app.put('/api/flightLogs/:flightID', isAuthenticated, (req, res) => {
    const { flightID } = req.params;
    const { tailNumber, takeoff, landing, duration } = req.body;
    const log = flightLogs.find(f => f.flightID === flightID);
    if (log) {
        log.tailNumber = tailNumber;
        log.takeoff = takeoff;
        log.landing = landing;
        log.duration = duration;
        res.status(200).send('Flight log updated');
    } else {
        res.status(404).send('Flight log not found');
    }
});

// Delete a flight log
app.delete('/api/flightLogs/:flightID', isAuthenticated, (req, res) => {
    const { flightID } = req.params;
    flightLogs = flightLogs.filter(f => f.flightID !== flightID);
    res.status(200).send('Flight log deleted');
});

// Search a single flight log by flightID 
app.get('/api/flightLogs/search', isAuthenticated, (req, res) => {
    const { flightID } = req.query;
    const log = flightLogs.find(f => f.flightID === flightID);
    if (log) {
        res.json(log);
    } else {
        res.status(404).json({ message: 'Flight log not found' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});