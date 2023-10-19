const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { fetchLeagueTeamsInfo } = require("../../api/teamsInfoAPI");

// TODO: Lots of code cleanup

const getLeagueTeamsInfo = async () => {
    try {
        const { teams } = await fetchLeagueTeamsInfo();
        if (!teams) {
            console.error("No data from fetchLeagueTeamsInfo");
            return null;
        }
        console.info("Got team data successfully!");
        return teams;
    } catch (error) {
        console.error("Error: ", error.message);
    }
};

const formatTeamInfoAutocomplete = async () => {
    try {
        const teamData = await getLeagueTeamsInfo();
        const teams = [];

        teamData.forEach((team) => {
            teams.push({ name: `${team.name}`, value: `${team.id}` });
        });

        return teams;
    } catch (error) {
        console.error("Error awaiting getLeagueTeamsInfo: ", error.message);
    }
};

const createTeamEmbed = async (teamId) => {
    try {
        const teams = await getLeagueTeamsInfo();
        const teamEmbed = new EmbedBuilder();

        const filteredTeam = teams.find((team) => team.id == teamId);

        if (!filteredTeam) {
            teamEmbed.setDescription("No data for selected team!");
            teamEmbed.data.fields = [];
            return teamEmbed;
        }

        const record = filteredTeam.record.overall;
        console.log(record);

        // theres a chance this could be a tie; will refactor later
        const streakType = record.streakType === "WIN" ? "W" : "L";

        const descriptionFields = `Position: **${filteredTeam.playoffSeed}**
            Record: **(${record.wins}-${record.losses}-${record.ties}) ${
            record.streakLength
        }${streakType}** \n
            Points For: **${record.pointsFor.toFixed(2)}**
            Points Against: **${record.pointsAgainst.toFixed(2)}** \n
            Current Projected Rank: **${filteredTeam.currentProjectedRank}**
            Draft Projected Rank: **${filteredTeam.draftDayProjectedRank}** \n
            Waiver Rank: **${filteredTeam.waiverRank}**
        `;
        teamEmbed.setTitle(filteredTeam.name);
        teamEmbed.setColor(0x0099ff);
        // TODO: if svg, convert image to something discord can embed
        teamEmbed.setThumbnail(filteredTeam.logo);
        teamEmbed.setDescription(descriptionFields);

        return teamEmbed;
    } catch (error) {
        console.error("failed to await getLeagueTeamsInfo ", error.message);
    }
};

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("league-team")
        .setDescription("Information about a specific team in the league")
        .addStringOption((option) =>
            option
                .setName("team")
                .setDescription("The specific team")
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const teams = await formatTeamInfoAutocomplete();
        const focusedValue = interaction.options.getFocused();
        const filtered = teams.filter((choice) =>
            choice.name.startsWith(focusedValue)
        );
        await interaction.respond(filtered);
    },
    async execute(interaction) {
        await interaction.deferReply();
        const selectedTeam = interaction.options.getString("team");
        const team = await createTeamEmbed(selectedTeam);
        await interaction.editReply({ embeds: [team] });
    },
};
