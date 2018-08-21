const mongoose = require('mongoose');

const { Schema } = mongoose;

const songSchema = new Schema({
  name: String,
  artistId: String,
});

module.exports = mongoose.model('Song', songSchema);
