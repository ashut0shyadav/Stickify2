const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  color: String,
  labels: [String],
  archived: { type: Boolean, default: false },
  reminders: [Date],
  userId: String,
});

const userSchema = new mongoose.Schema({
    username : String,
    password : String
});

const Note = mongoose.model('Note', noteSchema);
const User = mongoose.model('User', userSchema);

module.exports = {
    Note,
    User
};
