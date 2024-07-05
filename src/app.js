import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import {router as userRouter} from './routes/user.routes.js'
import {router as followRouter} from './routes/follow.routes.js'
import {router as groupRouter} from './routes/group.routes.js'
import {router as messageRouter} from './routes/message.routes.js'

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


// Routes
// The first route is the /api/user route which is handled by the userRouter.
// This route will handle all the user-related routes.
app.use('/api/user', userRouter)

// The second route is the /api/follow route which is handled by the followRouter.
// This route will handle all the follow-related routes.
app.use('/api', followRouter)

// The third route is the /api/group route which is handled by the groupRouter.
// This route will handle all the group-related routes.
app.use('/api', groupRouter)

// The fourth route is the /api/message route which is handled by the messageRouter.
// This route will handle all the message-related routes.
app.use('/api', messageRouter)

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Hello World');
});


export { app };

