const { Schema, model } = require("mongoose");

const FollowSchema = new Schema({
  user: { type: Schema.ObjectId, ref: "User", required: true }, // el que sigue
  followed: { type: Schema.ObjectId, ref: "User", required: true }, // el seguido
  created_at: { type: Date, default: Date.now }
});

// Evitar duplicados
FollowSchema.index({ user: 1, followed: 1 }, { unique: true });

module.exports = model("Follow", FollowSchema, "follows");
