const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Client } = require("espn-fantasy-football-api/node");
const {
    espn_leagueId,
    espn_seasonId,
    espn_s2,
    espn_SWID,
} = require("../../config.json");

const myClient = new Client({ leagueId: espn_leagueId });
myClient.setCookies({
    espnS2: espn_s2,
    SWID: espn_SWID,
});

const fetchLeagueInfo = async () => {
    try {
        const response = await myClient.getLeagueInfo({
            seasonId: espn_seasonId,
        });
        if (!response) {
            throw new Error("failed to fetch data");
        }
        return response;
    } catch (error) {
        console.log(`ERROR: ${error.message}`);
    }
};

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
