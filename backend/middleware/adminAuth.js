require('dotenv').config();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

module.exports = function adminAuth(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ success: false, error: 'Missing Authorization header' });
  const token = auth.split(' ')[1];
  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) return res.status(403).json({ success: false, error: 'Forbidden' });
  next();
};
