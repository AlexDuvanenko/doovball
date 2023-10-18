const { SlashCommandBuilder } = require("discord.js");
const { fetchLeagueTeams } = require("../../api/teamsInfoAPI");

const WEEK_ID = 18; // 18 refers to end of season

const INIITIAL_TEAM_EMBED = {
    color: 0x0099ff,
    description: "",
    fields: [],
};

const getLeagueTeamsData = async () => {
    try {
        const teamsData = await fetchLeagueTeams(WEEK_ID);
        if (!teamsData) {
            console.error("No data received!");
            return;
        }

        return teamsData;
    } catch (error) {
        console.error("Error: ", error);
    }
};

const formatTeamsDataForAutocomplete = async () => {
    const data = await getLeagueTeamsData();
    const teams = [];

    data.forEach((team) => {
        teams.push({ name: `${team.name}`, value: `${team.id}` });
    });

    return teams;
};

const createTeamEmbed = async (teamId) => {
    const teams = await getLeagueTeamsData();
    console.log("teams", teams);
    const teamEmbed = INIITIAL_TEAM_EMBED;

    const filteredTeam = teams.find((team) => team.id == teamId);

    if (!filteredTeam) {
        teamEmbed.description = "No data for selected team!";
        return teamEmbed;
    }

    const pointsFields = [
        {
            name: "Points Scored",
            value: `**${filteredTeam.regularSeasonPointsFor.toFixed(2)}**`,
            inline: true,
        },
        {
            name: "Points Against",
            value: `**${filteredTeam.regularSeasonPointsAgainst.toFixed(2)}**`,
            inline: true,
        },
    ];
    teamEmbed.title = filteredTeam.name;
    // TODO: if svg, convert image to something discord can embed
    teamEmbed.thumbnail = { url: filteredTeam.logoURL };
    teamEmbed.description = `Record: **(${filteredTeam.wins}-${filteredTeam.losses}-${filteredTeam.ties})**`;
    pointsFields.forEach((field) => teamEmbed.fields.push(field));

    return teamEmbed;
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
        const teams = await formatTeamsDataForAutocomplete();
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
