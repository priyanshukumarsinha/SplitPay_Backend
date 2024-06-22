import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import {router as userRouter} from './routes/user.routes.js'
import {router as followRouter} from './routes/follow.routes.js'
import {router as groupRouter} from './routes/group.routes.js'

const app = express();
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);


// parse application/json
app.use(express.json({ limit: '16kb' }));

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Serve static files
app.use(express.static('public'));

app.use(cookieParser())

app.use('/api', userRouter)
app.use('/api', followRouter)
app.use('/api', groupRouter)

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Hello World');
});

export { app };

