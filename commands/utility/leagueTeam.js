const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
    fetchLeagueTeams,
    fetchSpecifiedTeamData,
} = require("../../api/testAPI");

const getLeagueTeamsInfo = async () => {
    try {
        const { teams } = await fetchLeagueTeams();
        if (!teams) {
            console.error("No data from fetchLeagueTeamsInfo");
            return null;
        }

        return teams;
    } catch (error) {
        console.error("Error: ", error.message);
    }
};

const formatTeamsAutocomplete = async () => {
    try {
        const teams = await getLeagueTeamsInfo();

        const listOfTeams = [];
        teams.forEach((team) => {
            listOfTeams.push({ name: `${team.name}`, value: `${team.id}` });
        });

        return listOfTeams;
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

const getSpecifiedTeamData = async (teamId) => {
    if (!teamId) {
        console.error("No team id provided");
        return;
    }

    try {
        const { teams } = await fetchSpecifiedTeamData(teamId);

        if (!teams) {
            console.error("didn't get any team data!");
            return;
        }

        const specificTeamData = teams.find((team) => team.id == teamId);

        return createTeamEmbed(specificTeamData);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

const createTeamEmbed = (teamData) => {
    const embed = new EmbedBuilder();
    embed.data.fields = [];

    if (!teamData) {
        embed.setTitle("No Team");
        embed.setDescription("No team was provided; try again!");
        return embed;
    }

    const teamRecord = teamData.record.overall;
    // theres a chance this could be a tie; will refactor later
    const streakType = teamRecord.streakType === "WIN" ? "W" : "L";
    const embedDescriptionField = `Position: **${teamData.playoffSeed}**
        Record: **(${teamRecord.wins}-${teamRecord.losses}-${
        teamRecord.ties
    }) ${teamRecord.streakLength}${streakType}** \n
        Points For: **${teamRecord.pointsFor.toFixed(2)}**
        Points Against: **${teamRecord.pointsAgainst.toFixed(2)}** \n
        Current Projected Rank: **${teamData.currentProjectedRank}**
        Draft Projected Rank: **${teamData.draftDayProjectedRank}** \n
        Waiver Rank: **${teamData.waiverRank}** \n \n
        **__Roster__** 
    `;

    embed.setTitle(teamData.name);
    embed.setColor(0x0099ff);
    embed.setThumbnail(teamData.logo);
    embed.setDescription(embedDescriptionField);

    const players = teamData.roster.entries.map((item) => {
        const {
            playerPoolEntry: {
                player: { fullName, injured, injuryStatus },
            },
        } = item;

        return {
            fullName,
            injured,
            injuryStatus,
        };
    });

    players.forEach((player) =>
        embed.addFields({
            name: `${player.fullName}`,
            value: `${player.injuryStatus || "ACTIVE"}`,
            inline: true,
        })
    );

    return embed;
};

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("league-team")
        .setDescription("testing slash")
        .addStringOption((option) =>
            option
                .setName("team")
                .setDescription("The specific team")
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const teams = await formatTeamsAutocomplete();
        const focusedValue = interaction.options.getFocused();
        const filteredTeam = teams.filter((choice) =>
            choice.name.startsWith(focusedValue)
        );
        await interaction.respond(filteredTeam);
    },
    async execute(interaction) {
        await interaction.deferReply();
        const selectedTeamId = interaction.options.getString("team");
        const team = await getSpecifiedTeamData(selectedTeamId);
        await interaction.editReply({ embeds: [team] });
    },
};
