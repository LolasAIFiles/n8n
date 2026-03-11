import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { authSchema } from '../schemas/auth.schema.js';

const r = Router();
r.post('/register', validate(authSchema), register);
r.post('/login', validate(authSchema), login);
export default r;
