import {app} from './app.js';
// import connectDB from './db/index.js';

const PORT = process.env.PORT || 3000;

console.log(PORT)

app.listen(PORT, (req, res) => {
    console.log(`Server is Listening at Port ${PORT}`);
})

export default app;

