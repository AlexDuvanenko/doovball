const { SlashCommandBuilder } = require("discord.js");
const { fetchLeagueTeams } = require("../../api/teamsInfoAPI");

const WEEK_ID = 18; // 18 refers to end of season

const TEAMS_EMBED = {
    title: "All teams",
    fields: [],
};

const formatLeagueTeamsData = async () => {
    try {
        const teamsData = await fetchLeagueTeams(WEEK_ID);
        if (!teamsData) {
            console.error("No data received!");
            return;
        }

        teamsData.forEach((team) => {
            TEAMS_EMBED.fields.push({
                name: team.name,
                value: `(${team.wins}-${team.losses}-${team.ties})`,
            });
        });
    } catch (error) {
        console.error("Error: ", error);
    }
};

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("league-teams")
        .setDescription("League teams"),
    async execute(interaction) {
        await interaction.deferReply();
        await formatLeagueTeamsData(WEEK_ID);
        await interaction.editReply({ embeds: [TEAMS_EMBED] });
    },
};
