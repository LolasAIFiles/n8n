import { AuthService } from '../services/auth.service.js';
const svc = new AuthService();

export const register = async (req, res, next) => {
  try {
    const user = await svc.register(req.validated.email, req.validated.password);
    res.status(201).json({ id: user.id, email: user.email });
  } catch (e) { next(e); }
};

export const login = async (req, res, next) => {
  try {
    const token = await svc.login(req.validated.email, req.validated.password);
    res.json({ token });
  } catch (e) { next(e); }
};
