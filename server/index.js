const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const PORT = 3000;

const app = express();

const allowedOrigins = [
        'http://127.0.0.1:5500',
];

app.use(express.json());
app.use(express.static('public'));
app.use(cors({
        origin: (origin, callback) => {
                if (allowedOrigins.includes(origin) || !origin) {
                        callback(null, true);
                } else {
                        console.log(origin)
                        callback(new Error('Not allowed by CORS'));
                }
        },
        credentials: true,
}));

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {

});

app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}.`);
});