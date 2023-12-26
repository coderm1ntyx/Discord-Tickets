const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    //guildId: { type: String, required: true }, Айди сервера, полезно если бот будет стоять не на одном сервере
    ticketopen: { type: Boolean, default: false },
});

const model = mongoose.model("Tickets", ProfileSchema);

module.exports = model;