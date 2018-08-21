const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const artistSchema = new Schema({
  name: String,
  age: Number,
});

module.exports = mongoose.model('Artist', artistSchema);
