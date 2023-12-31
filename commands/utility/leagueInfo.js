const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { espn_seasonId } = require("../../config.json");
const { fetchLeagueInfo } = require("../../api/leagueInfoAPI");

const createLeagueInfoEmbed = (data) => {
    return new EmbedBuilder()
        .setTitle("League Info")
        .setColor(0x0099ff)
        .addFields(
            { name: "League Name", value: `${data.name}` },
            { name: "Number of Teams", value: `${data.size}` },
            { name: "Season", value: `${espn_seasonId}` },
            { name: "Draft Date", value: `${data.draftSettings.date}` }
        );
};

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("league-info")
        .setDescription("League info"),
    async execute(interaction) {
        await interaction.deferReply();
        const data = await fetchLeagueInfo();
        await interaction.editReply({ embeds: [createLeagueInfoEmbed(data)] });
    },
};
