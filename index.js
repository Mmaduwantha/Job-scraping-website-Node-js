import express from 'express';
import dotenv from 'dotenv';
import pool from './db.js';
import userRouter from './routes/userRoutes.js';
import morgan from 'morgan';
import approuter from './routes/application-route.js';
import adminrouter from './routes/admin-route.js'; 


dotenv.config();

const app = express();
const port = process.env.PORT;

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
    } else {
        console.log('Connected to PostgreSQL database successfully!');
        release();
    }
});

app.use(express.json());
app.use(morgan('dev'))


app.use('/users',userRouter)
app.use('/application',approuter)
app.use('/admin',adminrouter)


app.listen(port, () => {
    console.log(`Server started on port ${port} successfully!`);
});
