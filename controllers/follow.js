const Follow = require("../models/follow");
const User = require("../models/user");

const followUser = async (req, res) => {
  try {
    const follow = new Follow({ user: req.user?.id, followed: req.params.id });
    await follow.save();
    return res.status(200).send({ status: "success", follow });
  } catch (err) {
    return res.status(500).send({ status: "error", message: "No se pudo seguir", error: err.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    await Follow.findOneAndDelete({ user: req.user?.id, followed: req.params.id });
    return res.status(200).send({ status: "success", message: "Dejaste de seguir al usuario" });
  } catch (err) {
    return res.status(500).send({ status: "error", message: "Error al dejar de seguir" });
  }
};

const followers = async (req, res) => {
  try {
    const followers = await Follow.find({ followed: req.params.id }).populate("user", "-password -__v");
    return res.status(200).send({ status: "success", followers });
  } catch (err) {
    return res.status(500).send({ status: "error", message: "Error al listar seguidores" });
  }
};

const following = async (req, res) => {
  try {
    const following = await Follow.find({ user: req.params.id }).populate("followed", "-password -__v");
    return res.status(200).send({ status: "success", following });
  } catch (err) {
    return res.status(500).send({ status: "error", message: "Error al listar seguidos" });
  }
};

module.exports = { followUser, unfollowUser, followers, following };
