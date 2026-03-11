import dotenv from 'dotenv';
import { createApp } from './app.js';
import { validateEnv } from '../../../packages/config/src/env.js';

dotenv.config();
const env = validateEnv(process.env);

const port = env.PORT;
createApp().listen(port, () => {
  console.log(`API listening on ${port}`);
});
