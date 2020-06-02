const fight = require('../util/fightEngine')
const units = require('./units')
const dbStats = require('../../db/index')

module.exports = {
  name: 'bulk',
  description: 'calculate the number of attackers needed to kill the defender.',
  aliases: ['b'],
  shortUsage(prefix) {
    return `${prefix}b wa, de d`
  },
  longUsage(prefix) {
    return `${prefix}bulk warrior, defender d`
  },
  forceNoDelete: false,
  category: 'Advanced',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819'],
  execute(message, argsStr, embed, trashEmoji) {
    if(argsStr.length === 0 || argsStr.includes('help'))
      return 'Try `.help b` for more information on how to use this command!'

    const unitsArray = units.getBothUnitArray(argsStr, message)

    const attackerArray = unitsArray[0].split(/ +/).filter(x => x != '')
    const defenderArray = unitsArray[1].split(/ +/).filter(x => x != '')

    const attacker = units.getUnitFromArray(attackerArray, message, trashEmoji)
    const defender = units.getUnitFromArray(defenderArray, message, trashEmoji)
    fight.bulk(attacker, defender, embed)

    this.addStats(message, this.name, attacker, defender, embed, trashEmoji)
      .then().catch(err => { throw err })
    return embed
  },


  // Add to stats database
  addStats(message, commandName, attacker, defender, embed, trashEmoji) {
    const replyFields = []

    replyFields[0] = embed.fields[0].value
    if(embed.fields[1])
      replyFields[1] = embed.fields[1].value
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO stats (content, author_id, author_tag, command, attacker, defender, url, server_id, is_attacker_vet, is_defender_vet, attacker_description, defender_description, will_delete, reply_fields) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)'
      const values = [message.cleanContent.slice(process.env.PREFIX.length), message.author.id, message.author.tag, commandName, attacker.name, defender.name, message.url, message.guild.id, attacker.vetNow, defender.vetNow, attacker.description, defender.description, trashEmoji, replyFields]
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