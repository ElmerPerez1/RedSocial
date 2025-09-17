const Publication = require("../models/publication");
const Follow = require("../models/follow");

const createPublication = async (req, res) => {
  try {
    const publication = new Publication({
      user: req.user?.id,
      text: req.body.text,
      file: req.body.file || null
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
    const follows = await Follow.find({ user: req.user?.id }).select("followed");
    const followedIds = follows.map(f => f.followed);
    const publications = await Publication.find({ user: { $in: followedIds } })
      .sort("-created_at")
      .populate("user", "-password -__v");
    return res.status(200).send({ status: "success", publications });
  } catch (err) {
    return res.status(500).send({ status: "error", message: "Error al cargar el feed" });
  }
};

module.exports = { createPublication, userPublications, feed };
