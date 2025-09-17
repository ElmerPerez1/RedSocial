const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwt");
const fs = require('fs');
const path = require('path');

const register = async (req, res) => {
  try {
  console.log('[register] content-type:', req.headers['content-type']);
  console.log('[register] raw body type:', typeof req.body, 'value:', req.body && JSON.stringify(req.body));
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).send({ status: "error", message: "Body vacío o inválido" });
    }
    let { name, surname, nick, email, password } = req.body;
    if (!name || !nick || !email || !password) {
      return res.status(400).send({ status: "error", message: "Faltan datos obligatorios" });
    }
    const userExists = await User.findOne({ $or: [{ email }, { nick }] });
    if (userExists) {
      return res.status(400).send({ status: "error", message: "Usuario o email ya registrados" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, surname, nick, email, password: hashedPassword });
    await user.save();
    return res.status(200).send({ status: "success", user });
  } catch (err) {
    return res.status(500).send({ status: "error", message: "Error en el registro", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).send({ status: "error", message: "Body vacío o inválido" });
    }
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send({ status: "error", message: "Faltan datos" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ status: "error", message: "Usuario no encontrado" });
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send({ status: "error", message: "Contraseña incorrecta" });
    const token = jwt.createToken(user);
    return res.status(200).send({
      status: "success",
      message: "Login correcto",
      user: { id: user._id, name: user.name, nick: user.nick, email: user.email },
      token
    });
  } catch (err) {
    return res.status(500).send({ status: "error", message: "Error en el login", error: err.message });
  }
};

const profile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -__v");
    if (!user) return res.status(404).send({ status: "error", message: "Usuario no encontrado" });
    return res.status(200).send({ status: "success", user });
  } catch (err) {
    return res.status(500).send({ status: "error", message: "Error al obtener perfil" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { bio } = req.body || {};
    if (typeof bio !== 'string') return res.status(400).send({ status: 'error', message: 'Bio inválida' });
    const user = await User.findByIdAndUpdate(userId, { bio }, { new: true }).select('-password -__v');
    if (!user) return res.status(404).send({ status: 'error', message: 'Usuario no encontrado' });
    return res.status(200).send({ status: 'success', user });
  } catch (err) {
    return res.status(500).send({ status: 'error', message: 'Error al actualizar perfil' });
  }
};

const list = async (req, res) => {
  try {
    let page = parseInt(req.params.page) || 1;
    let itemsPerPage = 5;
    const users = await User.paginate({}, { page, limit: itemsPerPage, select: "-password -__v" });
    return res.status(200).send({
      status: "success",
      users: users.docs,
      totalDocs: users.totalDocs,
      totalPages: users.totalPages,
      page: users.page
    });
  } catch (err) {
    return res.status(500).send({ status: "error", message: "Error al listar usuarios" });
  }
};

module.exports = { register, login, profile, list, updateProfile };
// --- Avatar management ---
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send({ status: 'error', message: 'Archivo no recibido' });
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ status: 'error', message: 'Usuario no encontrado' });
    // eliminar avatar anterior si no era el default
    if (user.image && user.image !== 'default.png' && user.image.startsWith('/uploads/avatars/')) {
      try {
        const rel = user.image.replace(/^\//, '');
        fs.unlinkSync(path.join(__dirname, '..', rel));
      } catch(_) {}
    }
    user.image = `/uploads/avatars/${req.file.filename}`;
    await user.save();
    return res.status(200).send({ status: 'success', image: user.image });
  } catch (err) {
    return res.status(500).send({ status: 'error', message: 'Error al subir avatar' });
  }
};

const deleteAvatar = async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ status: 'error', message: 'Usuario no encontrado' });
    if (user.image && user.image !== 'default.png' && user.image.startsWith('/uploads/avatars/')) {
      try {
        const rel = user.image.replace(/^\//, '');
        fs.unlinkSync(path.join(__dirname, '..', rel));
      } catch(_) {}
    }
    user.image = 'default.png';
    await user.save();
    return res.status(200).send({ status: 'success', image: user.image });
  } catch (err) {
    return res.status(500).send({ status: 'error', message: 'Error al eliminar avatar' });
  }
};

module.exports.uploadAvatar = uploadAvatar;
module.exports.deleteAvatar = deleteAvatar;
