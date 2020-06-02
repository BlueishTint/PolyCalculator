const fight = require('../util/fightEngine')
const units = require('./units')
const dbStats = require('../../db/index')

module.exports = {
  name: 'optim',
  description: 'returns the best order to use multiple attackers to kill one unit according to these priorities:\n\n - Kill/inflict most damage to the defending unit,\n - Minimize the number of attacker casualties,\n - Minimize the cumulative damage taken by the attackers left alive.\n - Use the least nubmer of attackers',
  aliases: ['o', 'op', 'opti'],
  // eslint-disable-next-line no-unused-vars
  shortUsage(prefix) {
    return `\`${prefix}o wa bo, wa sh, wa bs, de d\``
  },
  longUsage(prefix) {
    return `\`${prefix}optim wa bo, wa sh, wa bs, de d\``
  },
  forceNoDelete: false,
  category: 'Advanced',
  // category: 'Paid',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819'],
  execute: async function(message, argsStr, embed, trashEmoji) {
    if(argsStr.length === 0 || argsStr.includes('help'))
      return 'Try `.help o` for more information on how to use this command!'

    const unitsArray = units.getBothUnitArray(argsStr, message)

    if(unitsArray.length > 10)
      throw 'You are a greedy (or trolly) little shmuck.\nEntering more than 9 attackers is dangerous for my safety.'

    const defenderStr = unitsArray.pop()
    const defenderArray = defenderStr.split(/ +/).filter(x => x != '')
    const attackers = []

    const defender = units.getUnitFromArray(defenderArray, message, trashEmoji)
    // defender.getOverride(defenderArray)

    unitsArray.forEach(x => {
      const attackerArray = x.split(/ +/).filter(y => y != '')
      const attacker = units.getUnitFromArray(attackerArray, message, trashEmoji)
      // attacker.getOverride(attackerArray)
      if (attacker.att !== 0)
        attackers.push(attacker)
    })
    if(attackers.length === 0)
      throw 'You need to specify at least one unit with more than 0 attack.'

    try {
      embed = await fight.multi(attackers, defender, embed)
    } catch (error) {
      throw error
    }

    this.addStats(message, this.name, attackers, defender, embed, trashEmoji)
      .then().catch(err => { throw err })
    return embed
  },


  // Add to stats database
  addStats(message, commandName, attackers, defender, embed, trashEmoji) {
    const replyFields = []

    replyFields[0] = embed.fields[0].value
    if(embed.fields[1])
      replyFields[1] = embed.fields[1].value
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO stats (content, author_id, author_tag, command, attacker, defender, url, server_id, is_defender_vet, defender_description, will_delete, reply_fields) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)'
      const values = [message.cleanContent.slice(process.env.PREFIX.length), message.author.id, message.author.tag, commandName, attackers.length, defender.name, message.url, message.guild.id, defender.vetNow, defender.description, trashEmoji, replyFields]
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

