const Publication = require("../models/publication");
const Follow = require("../models/follow");
const path = require('path');

// Crea publicación, soporta tanto JSON (text + file:string) como multipart (req.file)
const createPublication = async (req, res) => {
  try {
    const filePath = req.file ? `/uploads/publications/${req.file.filename}` : (req.body.file || null);
    const publication = new Publication({
      user: req.user?.id,
      text: req.body.text,
      file: filePath
    });
    await publication.save();
    return res.status(200).send({ status: "success", publication });
  } catch (err) {
    return res.status(500).send({ status: "error", message: "Error al crear publicación" });
  }
};

const userPublications = async (req, res) => {
  try {
    const publications = await Publication.find({ user: req.params.id }).sort("-created_at");
    return res.status(200).send({ status: "success", publications });
  } catch (err) {
    return res.status(500).send({ status: "error", message: "Error al listar publicaciones" });
  }
};

const feed = async (req, res) => {
  try {
    const userId = req.user?.id;
    const follows = await Follow.find({ user: userId }).select("followed");
    const followedIds = follows.map(f => f.followed);

    // Si el usuario no sigue a nadie -> fallback global
    if (followedIds.length === 0) {
      const publications = await Publication.find({})
        .sort("-created_at")
        .limit(25)
        .populate("user", "-password -__v");
      return res.status(200).send({ status: "success", mode: "global_fallback", publications });
    }

    // Incluir también las publicaciones propias siempre
    const criteriaIds = [...followedIds, userId];
    const publications = await Publication.find({ user: { $in: criteriaIds } })
      .sort("-created_at")
      .limit(100)
      .populate("user", "-password -__v");
    return res.status(200).send({ status: "success", mode: "following", publications });
  } catch (err) {
    return res.status(500).send({ status: "error", message: "Error al cargar el feed" });
  }
};

module.exports = { createPublication, userPublications, feed };
