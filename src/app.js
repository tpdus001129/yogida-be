import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import v1Router from './routers/index.js';
import connectDB from './db/mongoose.js';

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', v1Router);

app.listen(config.host.port, () => {
  console.log(`Server is running on port : ${config.host.port}`);
});
