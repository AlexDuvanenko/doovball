const { SlashCommandBuilder } = require("discord.js");
const { fetchLeagueTeams } = require("../../api/teamsInfoAPI");
const { Global } = require("espn-fantasy-football-api/node");

const WEEK_ID = 18; // 18 refers to end of season
const SELECTED_TEAM_ID = 1;

const TEAM_EMBED = {
    color: 0x0099ff,
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
            if (team.id === SELECTED_TEAM_ID) {
                console.log(Global);
                TEAM_EMBED.title = team.name;
                TEAM_EMBED.thumbnail = { url: team.logoURL };
                TEAM_EMBED.description = `(${team.wins}-${team.losses}-${team.ties})`;
                let possibleInactiveCount = 0;

                team.roster.forEach((player) => {
                    if (
                        player.injuryStatus &&
                        player.injuryStatus !== "ACTIVE"
                    ) {
                        possibleInactiveCount++;
                    }
                });

                TEAM_EMBED.fields.push({
                    name: "Possible Inactives",
                    value: `${possibleInactiveCount}`,
                });
            }
        });
    } catch (error) {
        console.error("Error: ", error);
    }
};

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("league-team")
        .setDescription("League team"),
    async execute(interaction) {
        await interaction.deferReply();
        await formatLeagueTeamsData(WEEK_ID);
        await interaction.editReply({ embeds: [TEAM_EMBED] });
    },
};
