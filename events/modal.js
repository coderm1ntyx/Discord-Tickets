const { Events, EmbedBuilder } = require("discord.js");
const ms = require("ms");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isModalSubmit()) return; 
    //123 (Действие для модулей)
  },
};
