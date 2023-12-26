const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
      .setName("ticketreset") // Название команды
      .setDescription("Сбросить статус тикета") // Описание команды
      .addUserOption((option) => // Добавить юзер опцию
          option
              .setName("user") // Название опции участника, обязательно если изменили, измените в const targetUser
              .setDescription("Пользователь, для которого сбросить тикет") // Описание опции
              .setRequired(true) // Если опция обязательна, ставьте true, если нет, ставьте false
      ),
  async execute(interaction) {
      const member = interaction.member;
      if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) { // Если у участника нету прав Администратора 
        return interaction.reply({
              content: `Эту команду могут использовать только пользователи с правами администратора.`,
              ephemeral: true,
          });
      };
      
      const targetUser = interaction.options.getUser("user"); // user - название опции участника которую Вы поставили
      // let targetUser = interaction.options.getUser("user"); Используйте если у вас опция setRequired равна к false
      // if (!targetUser) {
          // targetUser = interaction.user;
      // };
      if (!targetUser) {
          return interaction.reply({
              content: `Не удалось найти целевого пользователя.`,
              ephemeral: true,
          });
      };
      const targetUserId = targetUser.id;
      const userProfile = await profileModel.findOne( // Найти профиль участника в базе данных
        {
          userId: targetUserId,
        }
      );
      if (!userProfile) { // Если профиль не найден в базе данных
          return interaction.reply({
              content: `Профиль целевого пользователя не найден`,
              ephemeral: true,
          });
      }

      if (userProfile.ticketopen === "true") { // Если у участника в бд есть активный тикет
          await profileModel.updateOne( // Обновить профиль участника в бд и убрать что есть активный тикет
              { 
                userId: targetUserId,
              },
              { $set: 
                { 
                  ticketopen: "false",
                },
            }
          );
          return interaction.reply({
              content: `Статус тикета пользователя ${targetUser} успешно сброшен.`,
              ephemeral: true,
          });
      } else {
          return interaction.reply({
              content: `Статус тикета пользователя ${targetUser} уже сброшен или отсутствует`,
              ephemeral: true,
          });
      }
  },
};