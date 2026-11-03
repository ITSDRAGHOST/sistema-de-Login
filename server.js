import express from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const app = express();
app.use(express.json());

const SECRET = process.env.JWT_SECRET || 'cambia_este_secreto';
const users = []; // "base de datos" en memoria

// ---------- utilidades ----------
const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const checkPassword = (password, stored) => {
  const [salt, hash] = stored.split(':');
  const test = scryptSync(password, salt, 64);
  return timingSafeEqual(test, Buffer.from(hash, 'hex'));
};

const publicUser = ({ password, ...rest }) => rest;

// ---------- middleware JWT ----------
const verifyToken = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.headers['x-access-token'];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.user = payload;
    next();
  });
};

// ---------- /register ----------
app.post('/register', (req, res) => {
  const { nombre, password, pais } = req.body;
  if (!nombre || !password || !pais) {
    return res.status(400).json({ error: 'nombre, password y pais son obligatorios' });
  }
  if (users.some((u) => u.nombre === nombre)) {
    return res.status(409).json({ error: 'El usuario ya existe' });
  }
  const user = { id: randomUUID(), nombre, pais, password: hashPassword(password) };
  users.push(user);
  res.status(201).json(publicUser(user));
});

// ---------- /login (genera token) ----------
app.post('/login', (req, res) => {
  const { nombre, password } = req.body;
  const user = users.find((u) => u.nombre === nombre);
  if (!user || !checkPassword(password ?? '', user.password)) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }
  const token = jwt.sign({ id: user.id, nombre: user.nombre }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// ---------- /user (datos del usuario del token) ----------
const findCurrent = (req) => users.find((u) => u.id === req.user.id);

app.get('/user', verifyToken, (req, res) => {
  const user = findCurrent(req);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(publicUser(user));
});

// Opcional: actualizar
app.put('/user', verifyToken, (req, res) => {
  const user = findCurrent(req);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { nombre, password, pais } = req.body;
  if (nombre) user.nombre = nombre;
  if (pais) user.pais = pais;
  if (password) user.password = hashPassword(password);
  res.json(publicUser(user));
});

// Opcional: eliminar
app.delete('/user', verifyToken, (req, res) => {
  const i = users.findIndex((u) => u.id === req.user.id);
  if (i === -1) return res.status(404).json({ error: 'Usuario no encontrado' });
  users.splice(i, 1);
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
