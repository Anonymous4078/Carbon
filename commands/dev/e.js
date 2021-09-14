const Discord = require('discord.js')
const {
  inspect
} = require('util')
const mongoose = require('mongoose')
const grinds = require('../../database/models/grindm')
module.exports = {
    name: 'eval',
    aliases: ['e'],
    async execute(message, args, client) {
        const allowedUser = ['598918643727990784', '455576077629259787', '619339277993639956', '772524332382945292', '450864876416401419']
        const {
            member,
            content
        } = message
        if (!allowedUser.includes(message.author.id)) return;
        const code = message.content.replace(`fh e `, '')
        try {
          if(code.includes("token")){
return message.channel.send("nope")
}
            let evaled = eval(code)
            var embed = new Discord.MessageEmbed()
                .setColor(0xfcfcfc)
                .setTitle("Evaluated")
                .addField("📥 Input", `\`\`\`${code}\`\`\``)
                .addField("📤 Output", `\`\`\`js\n${inspect(evaled, { depth: 0 })}\`\`\``)
                .addField("Type", `\`\`\`${typeof(evaled)}\`\`\``)
                .setTimestamp()
                .setFooter(`Evaluated in ${client.ws.ping}ms`)
            message.channel.send(embed)

        } catch (error) {
            var embed = new Discord.MessageEmbed()
                .setColor(0xd62424)
                .setTitle("❌ Error")
                .setDescription(`${error}`)
            message.channel.send(embed)
        }
    }
}