const { Events, ActivityType } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  
  execute(client) {
    console.log(`Я запустился ${client.user.tag}`);
  },
};
