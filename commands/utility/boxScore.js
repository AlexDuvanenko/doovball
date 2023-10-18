const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
    fetchBoxScores,
    fetchBoxScoresWithTeamNames,
} = require("../../api/boxScoreAPI");
const { formatTeamsDataForAutocomplete } = require("../../api/teamsInfoAPI");

// TODO: Lots of code cleanup

const getBoxScoresData = async (weekId) => {
    try {
        const scores = await fetchBoxScores(weekId);
        if (!scores) {
            console.error("No data received!");
            return;
        }

        return scores;
    } catch (error) {
        console.error("Error: ", error);
    }
};

const formatAllBoxScores = async (weekId) => {
    try {
        const data = await getBoxScoresData(weekId);
        if (!data) {
            console.error("No data!");
            return;
        }

        const scoresEmbed = new EmbedBuilder();
        scoresEmbed.setTitle(`Box Scores - Week ${weekId}`);
        scoresEmbed.data.fields = [];

        data.forEach((d, index) => {
            scoresEmbed.addFields({
                name: `${index + 1} - ${d.homeTeamId} vs ${d.awayTeamId}`,
                value: `${d.homeScore} - ${d.awayScore}`,
            });
        });

        return scoresEmbed;
    } catch (error) {
        console.error("Error: ", error);
    }
};

const formatSpecificTeamBoxScore = async (week, teamId) => {
    try {
        const boxScoreTeams = await fetchBoxScoresWithTeamNames(week);
        if (!boxScoreTeams) {
            console.error("No data could be received!");
            return;
        }
        const teamEmbed = new EmbedBuilder();

        const selectedBoxScore = boxScoreTeams.find(
            (team) => team.homeTeamId == teamId || team.awayTeamId == teamId
        );

        if (!selectedBoxScore) {
            teamEmbed.setDescription(
                "No data for selected team! Likely a typo!"
            );
            teamEmbed.data.fields = [];
            return teamEmbed;
        }

        teamEmbed.setTitle(
            `${selectedBoxScore.homeName} vs ${selectedBoxScore.awayName}`
        );
        teamEmbed.setDescription(`Box Score - Week ${week}`);

        const pointFields = [
            {
                name: `${selectedBoxScore.homeName}`,
                value: `${selectedBoxScore.homeScore}`,
                inline: true,
            },
            {
                name: `${selectedBoxScore.awayName}`,
                value: `${selectedBoxScore.awayScore}`,
                inline: true,
            },
        ];

        pointFields.forEach((field) => teamEmbed.addFields(field));

        return teamEmbed;
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("box-scores")
        .setDescription("Get box scores for the specific week")
        .addIntegerOption((option) =>
            option
                .setName("week")
                .setDescription(
                    "The week to get the box scores (between 1 and 18)"
                )
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(18)
        )
        .addStringOption((option) =>
            option
                .setName("team")
                .setDescription(
                    "Optional team field. Leaving blank will return all box scores"
                )
                .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const selectedWeek = await interaction.options.getInteger("week");
        const teams = await formatTeamsDataForAutocomplete(selectedWeek);

        const focusedValue = interaction.options.getFocused();
        const filteredTeam = teams.filter((team) =>
            team.name.startsWith(focusedValue)
        );
        await interaction.respond(filteredTeam);
    },
    async execute(interaction) {
        const week = interaction.options.getInteger("week");
        const team = (await interaction.options.getString("team")) || null;
        if (!team) {
            await interaction.deferReply();
            const boxScores = await formatAllBoxScores(week);
            await interaction.editReply({ embeds: [boxScores] });
        } else {
            await interaction.deferReply();
            const specificTeamEmbed = await formatSpecificTeamBoxScore(
                week,
                team
            );
            await interaction.editReply({ embeds: [specificTeamEmbed] });
        }
    },
};
