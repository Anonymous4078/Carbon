const { Client, Message, MessageEmbed } = require('discord.js');
const { MessageButton, MessageActionRow } = require("discord-buttons");
const { before } = require('lodash');
module.exports = {
    name: 'battlegrounds',
    aliases: ['pubg', 'fortnite', 'bg', 'arena'],
    fhOnly: false,
    disabledChannels: [],
    /** 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    async execute(message, args, client) {

        if (!message.member.permissions.has("ADMINISTRATOR")) {
            message.channel.send("Admin only command lol")
            return
        }

        const joinBut = new MessageButton()
            .setLabel("Join")
            .setEmoji("⚔️")
            .setID("join-bg")
            .setStyle('green')

        const joinMessage = await message.channel.send({
            embed: new MessageEmbed()
                .setTitle("Battlegrounds")
                .setDescription("Click the button to join the game.\nThe game starts in **30 seconds**.")
                .setColor("YELLOW"),
            component: joinBut
        })

        const joinCollector = joinMessage.createButtonCollector(
            b => b,
            {
                time: 30 * 1000,
            }
        );
        let joined = [];
        let gamedata = [];

        joinCollector.on("collect", async button => {
            if (joined.includes(button.clicker.user.id)) {
                button.reply.send("You have already joined the game.", true)
                return
            }
            if (joined.length > 20) {
                button.reply.send("The game is full (20)", true)
                return
            }
            joined.push(button.clicker.user.id)

            gamedata.push({
                member: button.clicker.member,
                id: Math.random().toString(36).substring(2),
                hp: 100,
                dead: false,
                gun: {
                    dmg: 35
                },
                inv: {
                    shield: {
                        count: 0
                    }
                }
            })
            button.reply.send("You have joined the game!", true)
        });

        joinCollector.on("end", async () => {
            await message.channel.send(
                new MessageEmbed()
                    .setColor("RED")
                    .setTitle("Game Information")
                    .setDescription("The game will start soon, you may read the instructions till then.")
                    .addField("How it works", "The bot will randomly choose a player, and the player has to decide what they have to do.")
                    .addField("Actions", "1) **Defense Up**\n> This will increase HP (default: 100).\n2) **Upgrade Weapon**\n> This will increase the damage of your Gun (default: 35)\n3) **Search**\n> Try your luck and search for something")
                    .addField("Searching", "You can search for buffs, or get bit by a snake.\n**BUFFS:**\n1) Shield: You're immune to all incoming damage for 1 turn. (Can stack)")
                    .setTimestamp()
                    .setFooter("The game will start soon...", client.user.displayAvatarURL())
            )
            /**
             * Init game
             */
            let row1 = new MessageActionRow()
            let row2 = new MessageActionRow()
            let row3 = new MessageActionRow()
            let row4 = new MessageActionRow()

            let i;

            for (i = 0; i < joined.length; i++) {
                if (i < 5) {
                    row1 = row1.addComponent(
                        new MessageButton()
                            .setLabel(gamedata[i].member.user.username)
                            .setStyle("grey")
                            .setID(gamedata[i].id)
                    )
                } else if (i < 10) {
                    row2 = row2.addComponent(
                        new MessageButton()
                            .setLabel(gamedata[i].member.user.username)
                            .setStyle("grey")
                            .setID(gamedata[i].id)
                    )
                } else if (i < 15) {
                    row3 = row3.addComponent(
                        new MessageButton()
                            .setLabel(gamedata[i].member.user.username)
                            .setStyle("grey")
                            .setID(gamedata[i].id)
                    )
                } else {
                    row4 = row4.addComponent(
                        new MessageButton()
                            .setLabel(gamedata[i].member.user.username)
                            .setStyle("grey")
                            .setID(gamedata[i].id)
                    )
                }
            }
            let components = [];
            if (i < 4) components.push(row1)
            if (i > 4) components.push(row1, row2)
            if (i > 9) components.push(row3)
            if (i > 14) components.push(row4)
            let row5 = new MessageActionRow().addComponent(
                new MessageButton()
                    .setStyle("green")
                    .setLabel("Actions")
                    .setID("actions-bg")
            )
            components.push(row5)


            // if(i > )

            /**
             * Init game
             */
            await sleep(5000)
            const mainMessage = await message.channel.send({
                embed: new MessageEmbed()
                    .setTitle("Battlegrounds")
                    .setDescription("Click on the user to see their stats!\nEveryone has **15 seconds** to do **1** action."),
                components,
            })
            const infoCollector = mainMessage.createButtonCollector(
                b => b,
                {
                    time: 15 * 1000
                }
            )

            infoCollector.on("collect", async button => {
                if (button.id === 'actions-bg') {

                    const searchButton = new MessageButton()
                        .setLabel("Search")
                        .setID("search-bg")
                        .setEmoji("🔍")
                        .setStyle("blurple")
                    const upgradeButton = new MessageButton()
                        .setLabel("Upgrade Weapon")
                        .setID("upgrade-bg")
                        .setEmoji("⚒")
                        .setStyle("blurple")
                    const defendButton = new MessageButton()
                        .setLabel("Defend")
                        .setID("defend-bg")
                        .setEmoji('🛡️')
                        .setStyle("blurple")
                    const actionComponents = new MessageActionRow().addComponents([searchButton, upgradeButton, defendButton])

                    const acMsg = await button.reply.send({
                        content: "Use the buttons to do something.",
                        components: actionComponents,
                        ephemeral: true
                    })
                    const actionCollector = acMsg.component.message.createButtonCollector(b => b)

                    actionCollector.on("collect", async button => {
                        const buttonId = button.id
                        const gameUser = gamedata.filter(va => va.member.id === button.clicker.user.id)[0]
                        if (buttonId === 'search-bg') {
                            const gotShield = [1, 0, 0, 0][Math.floor(Math.random() * 4)] == 1

                            await button.reply.send("You start searching... you have a **25% chance** to get the shield.", true)

                            await sleep(500)

                            if (gotShield) {
                                button.reply.edit("You found a 🛡️ Shield! You are now immune to **1** incoming attack.", true)
                                gameUser.inv.shield.count++
                                return
                            } else {
                                const randomDamage = Math.floor(Math.random() * 50) + 30

                                button.reply.edit(`You tried searching for a shield, but you end up finding a SNAKE. You were poisoned and lost **${randomDamage}** HP!`, true)
                                gameUser.hp -= randomDamage
                            }
                        }
                    })


                } else {
                    const buttonId = button.id
                    const userInfo = gamedata.filter(val => val.id === buttonId)[0]

                    await button.reply.send(`${userInfo.member}'s stats:\n   HP: **${userInfo.hp}**\n   Gun Damage: **${userInfo.gun.dmg}**`, true)
                }
            })
        })
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}