import router from './router';
import express from 'express';
import cors from 'cors';
import registerRoute from './auth/register.js';
import loginRoute from './auth/login.js';
import refreshRoute from './routes/refresh.js';
import adminRoute from './routes/adminRoute';
import errorHandler from './middleware/errorHandling.js';
import {verifyToken} from './utils/tokenValidation.js';
import cookieParser from "cookie-parser";

const app=express();

app.use(cors({
  origin: "http://localhost:5500",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get("/user",verifyToken,(req, res) => {
  console.log("req.user:", req.user);
  res.json({ status: "OK", time: new Date().toISOString() });
});

app.use('/auth/register',registerRoute);
app.use('/auth/login',loginRoute);
app.use('/auth',refreshRoute);

app.use('/todo',verifyToken,router);
app.use('/auth/admin',adminRoute);

app.use(errorHandler);

app.listen(3000,()=>{
  console.log('Server started on port 3000');
});