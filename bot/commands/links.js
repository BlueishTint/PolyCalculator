const dbStats = require('../../db/index')

module.exports = {
  name: 'links',
  description: 'show the link to invite the bot, to the developer\'s server and to the statistic\'s webiste.',
  aliases: ['link', 'inv', 'invite', 'server'],
  shortUsage(prefix) {
    return `${prefix}inv`
  },
  longUsage(prefix) {
    return `${prefix}link`
  },
  forceNoDelete: true,
  category: 'Other',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819'],
  execute(message, argsStr, embed, trashEmoji) {
    embed.setTitle('Links!')
      .addField('Invite this bot to your server:', 'https://discordapp.com/oauth2/authorize?client_id=593507058905645057&permissions=8&scope=bot')
      .addField('PolyCalculator\'s server link:', 'https://discord.gg/rtSTmd8')
      .addField('Documentation (How-to use the bot):', 'https://docs.polycalculatorbot.com')
      .addField('Website (Stats):', 'https://polycalculatorbot.com')
    this.addStats(message, this.name, trashEmoji)
      .then().catch(err => { throw err })
    return embed
  },


  // Add to stats database
  addStats(message, commandName, trashEmoji) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO stats (content, author_id, author_tag, command, url, server_id, will_delete) VALUES ($1, $2, $3, $4, $5, $6, $7)'
      const values = [message.cleanContent.slice(process.env.PREFIX.length), message.author.id, message.author.tag, commandName, message.url, message.guild.id, trashEmoji]
      dbStats.query(sql, values, (err) => {
        if(err) {
          reject(`${commandName} stats: ${err.stack}\n${message.url}`)
        } else {
          resolve()
        }
      })
    })
  }
};