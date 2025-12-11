import router from './router.js';
import express from 'express';
import registerRoute from './auth/register.js';
import loginRoute from './auth/login.js';
import errorHandler from './middleware/errorHandling.js';
import {verifyToken} from './utils/tokenValidation.js';

const app=express();

app.use(express.json());

app.get("/user",verifyToken,(req, res) => {
  console.log("req.user:", req.user);
  res.json({ status: "OK", time: new Date().toISOString() });
});

app.use('/auth/register',registerRoute);
app.use('/auth/login',loginRoute);

app.use('/todo',verifyToken,router);


app.use(errorHandler);

app.listen(3000,()=>{
  console.log('Server started on port 3000');
});