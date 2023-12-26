const {
  Events,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Embed,
  PermissionsBitField,
  Collection,
  ChannelType,
  disableValidators,
} = require("discord.js");

const {
  ticketLogChannelId,
  ticketCategoryId,
  userTicketId,
  adminRoleId,
  ownerUserId
} = require("../config.json");

const profileModel = require("../models/profileSchema");
let openedByUserId; // Вариабл для сохранения айди юзера, который открыл тикет

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    const logChannel = interaction.guild.channels.cache.get(ticketLogChannelId); // Канал для логов
    
    if (interaction.isChatInputCommand()) { 
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(error);
      }
    } else if (interaction.isButton()) {
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
      if (interaction.customId === "buy") {
        openedByUserId = interaction.user.id; // Сохранить айди юзера кто открыл тикет
        const user = interaction.user.id;
        const userProfile = await profileModel.findOne({ // Найти профиль юзера в базе данных который открыл тикет
          userId: user,
          //guildId: interaction.guild.id, Если в profileSchema.js включено guildId
        });
        if (!userProfile) { // Если профиля нету или не найден
          await profileModel.create({ // Создать новый профиль для юзера в бд
            userId: user,
            ticketopen: false
            //guildId: interaction.guild.id, Если в profileSchema.js включено guildId
        })
        };
        const errorEmbed1 = new EmbedBuilder() // Эмбед ошибки (если у участнка уже есть открытый тикет)
          .setColor("313338") // Цвет эмбеда в HEX
          .setDescription(
            `${interaction.user}, у Вас **уже есть** открытый тикет!`
          ) // Описание эмбеда
          .setThumbnail(interaction.user.displayAvatarURL()); // Поставить аватарку участника

        var Perm = require("discord.js").PermissionsBitField.Flags;
        var ChannelType = require("discord.js").ChannelType;

        if (userProfile.ticketopen === true) { // Если у участника есть открытый тикет
          return interaction.reply({ // Отправить эмбед с ошибкой
            embeds: [errorEmbed1],
            ephemeral: true,
          });
        };

        const permissions = [ // Права на канал с тикетом
          {
            id: interaction.guild.id, // Роль @everyone 
            deny: [Perm.ViewChannel, Perm.SendMessages], // Какие права запретить
          },
          {
            id: interaction.user.id, // Участник который открыл тикет
            allow: [Perm.ViewChannel], // Какие права разрешить
            deny: [Perm.SendMessages], // Какие права запретить
          },
          {
            id: adminRoleId, // Роль админа
            allow: [Perm.ViewChannel, Perm.SendMessages], // Какие права разрешить
          },
        ];

        const category = interaction.guild.channels.cache.get(ticketCategoryId); // Категория где будут создаваться тикеты
        if (!category) { // Если категория не найдена
          return interaction.reply({
            content: "Категория тикетов не найдена! Проверьте правильный ли ID в конфиге",
            ephemeral: true,
          });
        };

        const channel = await interaction.guild.channels.create({ // Создать основной канал тикета
          name: "order-" + interaction.member.user.username, // Название основного канала тикета
          type: ChannelType.GuildText, // Тип канала, логично что будет текстовый канал :)
          parent: category, // Канал будет создан в категории для тикетов
          permissionOverwrites: permissions, // Установить права которые Вы указали выше
        });

        for (const userId of userTicketId) {
          const user = interaction.guild.members.cache.get(userId); 
          if (user) { 
            channel.permissionOverwrites.create(user, { // Установить права
              allow: [Perm.ViewChannel, Perm.SendMessages], // Разрешить
            });
          }
        };

        const thread = await channel.threads.create({
          name: `Обсуждение`, // Название ветки
          autoArchiveDuration: 1440, // Автоархив
          type: ChannelType.PrivateThread, // Тип канала, PrivateThread - приватная ветка, PublicThread - публичная ветка
          permissionOverwrites: [ // Права на ветку "Обсуждение"
            {
              id: interaction.user.id, // Участник который открыл тикет
              deny: [PermissionsBitField.Flags.SendMessages], // Какие права разрешить 
              allow: [PermissionsBitField.Flags.ViewChannel], // Какие права запретить
            },
            {
              id: adminRoleId, // Роль админа
              allow: [
                PermissionsBitField.Flags.ViewChannel, 
                PermissionsBitField.Flags.SendMessages,
              ], // Какие права разрешить
            },
          ],
        });

        const thread2 = await channel.threads.create({
          name: `Тех-задание`, // Название ветки
          autoArchiveDuration: 1440, // Автоархив
          type: ChannelType.PrivateThread, // Тип канала, PrivateThread - приватная ветка, PublicThread - публичная ветка
          permissionOverwrites: [ // Права на ветку "Тех-задание"
            {
              id: interaction.user.id, // Участник который открыл тикет
              deny: [PermissionsBitField.Flags.SendMessages], // Какие права разрешить 
              allow: [PermissionsBitField.Flags.ViewChannel], // Какие права запретить
            },
            {
              id: adminRoleId, // Роль админа
              allow: [
                PermissionsBitField.Flags.ViewChannel, 
                PermissionsBitField.Flags.SendMessages,
              ], // Какие права разрешить
            },
          ],
        });

        const embed1 = new EmbedBuilder() // Эмбед после открытия тикета
          .setColor("313338") // Цвет эмбеда в HEX
          .setTitle("Заказ") // Описание эмбеда
          .setDescription(`Открыл новый заказ: <#${channel.id}>`);

        await interaction.reply({ embeds: [embed1], ephemeral: true });

        const channelembed1 = new EmbedBuilder() // Первый эмбед в основной канал тикета
          .setColor("313338") // Цвет эмбеда в HEX
          .setDescription("") // Описание эмбеда
          .setImage(""); // Ссылка на изображение

        const channelembed2 = new EmbedBuilder() // Второй эмбед в основной канал тикета
          .setColor("313338") // Цвет эмбеда в HEX
          .setDescription(`
Канал, где Вы можете оставить свои комментарии и пожелания к заказу - ${thread2}

Канал, где Вы можете поговорить с дизайнером относительно технического задания, а также обсуждать личные вопросы - ${thread}
`) // Описание эмбеда
        .setImage(""); // Ссылка на изображение

        const but2 = new ButtonBuilder()
          .setCustomId("close")
          .setLabel("🔒 Закрыть") // Текст на кнопке
          .setStyle(ButtonStyle.Danger); // Danger - красный цвет кнопки, Success - зелёный цвет, Primary - синий цвет, Secondary - серый цвет, Link - ссылка (необходимо убрать setCustomId)

        const row = new ActionRowBuilder().addComponents(but2);

        await channel.send({
          content: `${interaction.user} <@&${adminRoleId}>`, // Пинг юзера кто открыл тикет и пинг роли админа
          embeds: [channelembed1, channelembed2],
          components: [row],
        });

        const threadembed1 = new EmbedBuilder() // Эмбед для первой ветки
          .setColor("313338") // Цвет эмбеда в HEX
          .setDescription("") // Описание эмбед
          .setImage(""); // Ссылка на изображение для эмбеда в первую ветку

        await thread.members.add(interaction.user.id); // Добавить участника в ветку который открыл тикет
        await thread.members.add(ownerUserId); // Добавить овнера в первую ветку (можно убрать)
        await thread.send({ embeds: [threadembed1] }); // Отправить эмбед в первую ветку

        const threadembed2 = new EmbedBuilder() // Эмбед для второй ветки
          .setColor("313338") // Цвет эмбеда в HEX
          .setDescription("") // Описание эмбед
          .setImage(""); // Ссылка на изображение для эмбеда во вторую ветку

        await thread2.members.add(interaction.user.id); // Добавить участника в ветку который открыл тикет
        await thread2.members.add(ownerUserId); // Добавить овнера в первую ветку (можно убрать)
        await thread2.send({ embeds: [threadembed2] }); // Отправить эмбед во вторую ветку

        const logEmbed1 = new EmbedBuilder() // Эмбед для лога 
          .setColor("313338") // Цвет эмбеда в HEX
          .setTitle("Новое открытие тикета") // Заголовок эмбеда
          .setThumbnail(interaction.user.displayAvatarURL()) // Поставить аватарку участника
          .addFields( // Поля (fields) в эмбеде
            {
              name: "> Открыл(а) тикет:",
              value: `• ${interaction.user}\n• ${interaction.user.id}`,
              inline: true, // Если хотите чтобы поля были в линии, используйте true, если не хотите, используйте false
            },
            {
              name: "> ID канала тикета:",
              value: `\`${channel.id}\``, 
              inline: true, // Если хотите чтобы поля были в линии, используйте true, если не хотите, используйте false
            }
          );

        await logChannel.send({ embeds: [logEmbed1] }); // Отправить эмбед в канал для логов
        
        await profileModel.updateOne( // Поставить ticketopen на true (Указать что у участника есть открытый тикет)
          { userId: user },
          { $set: { ticketopen: true } }
        );
      }
      if (interaction.customId === "close") { // Кнопка закрыть тикет
        const user = openedByUserId;
        const member = interaction.member;
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) { // Если у участника нету прав Администратора 
          return interaction.reply({
            content: `Эту кнопку могут использовать только пользователи с правами администратора.`,
            ephemeral: true,
          });
        };

        const channel = interaction.channel;
        const logEmbed2 = new EmbedBuilder() // Эмбед для лога о закрытии тикета
          .setColor("313338") // Цвет эмбеда в HEX
          .setTitle("Новое закрытие тикета") // Заголовок эмбеда
          .setThumbnail(interaction.user.displayAvatarURL()) // Поставить аватарку участника
          .addFields({ // Поля (fields) в эмбеде
            name: "> Закрыл(а) тикет:",
            value: `• ${interaction.user}\n• ${interaction.user.id}`,
            inline: true,
          });

        await logChannel.send({ embeds: [logEmbed2] }); // Отправить лог в logChannel
        await profileModel.updateOne( // Обновить бд участника кто открыл тикет
          { userId: user },
          { $set: { ticketopen: false } }
        );
        
        await channel.delete(); // Удалить канал с тикетом
      }
    } else if (interaction.isStringSelectMenu()) {
      const {
        SlashCommandBuilder,
        EmbedBuilder,
        StringSelectMenuOptionBuilder,
        ButtonBuilder,
        ActionRowBuilder,
        ButtonStyle,
        StringSelectMenuBuilder,
        ComponentType,
      } = require("discord.js");

      const selectedValue = interaction.values[0];
      //123 (Селект меню действия)
    }
  },
};
