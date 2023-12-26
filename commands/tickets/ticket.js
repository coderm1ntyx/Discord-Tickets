const {
  SlashCommandBuilder,
  EmbedBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ComponentType,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sendticket")
    .setDescription("Отправить эмбед с тикетом"),
  async execute(interaction) {
    const member = interaction.member;
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) { // Если у участника нету прав Администратора
      return interaction.reply({
        content: `Эту команду могут использовать только пользователи с правами администратора.`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
    .setColor("313338") // Цвет эмбеда в HEX
    .setDescription("") // Описание для открыть тикет эмбеда
    .setImage(""); // Ссылка на изображение

    const but1 = new ButtonBuilder()
      .setCustomId("buy") 
      .setLabel("📩 Открыть тикет") // Текст на кнопке для открытия тикета
      .setStyle(ButtonStyle.Success); // Danger - красный цвет кнопки, Success - зелёный цвет, Primary - синий цвет, Secondary - серый цвет, Link - ссылка (необходимо убрать setCustomId)

    const row = new ActionRowBuilder().addComponents(but1);

    await interaction.reply({
      content: "Эмбед был успешно отправлен",
      ephemeral: true,
    });
    await interaction.channel.send({
      embeds: [embed],
      components: [row],
    });
  },
};
