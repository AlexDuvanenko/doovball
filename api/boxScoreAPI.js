const { espnClient } = require("../utilities/espnClient");
const { espn_seasonId } = require("../config.json");

const fetchBoxScores = async (weekId) => {
    try {
        const response = await espnClient.getBoxscoreForWeek({
            seasonId: espn_seasonId,
            matchupPeriodId: weekId,
            scoringPeriodId: weekId,
        });
        if (!response) {
            throw new Error("failed to fetch data");
        }
        return response;
    } catch (error) {
        console.log(`ERROR: ${error.message}`);
    }
};

const fetchBoxScoresWithTeamNames = async (weekId) => {
    try {
        const promises = [
            espnClient.getBoxscoreForWeek({
                seasonId: espn_seasonId,
                matchupPeriodId: weekId,
                scoringPeriodId: weekId,
            }),
            espnClient.getTeamsAtWeek({
                seasonId: espn_seasonId,
                scoringPeriodId: weekId,
            }),
        ];

        const responses = await Promise.all(promises);

        const mergedResponses = responses[0].map((boxScore) => {
            const matchingHomeInfo = responses[1].find(
                (teamObj) => teamObj.id === boxScore.homeTeamId
            );
            const matchingAwayInfo = responses[1].find(
                (teamObj) => teamObj.id === boxScore.awayTeamId
            );

            return {
                homeTeamId: boxScore.homeTeamId,
                awayTeamId: boxScore.awayTeamId,
                homeScore: boxScore.homeScore,
                awayScore: boxScore.awayScore,
                homeName: matchingHomeInfo ? matchingHomeInfo.name : null,
                awayName: matchingAwayInfo ? matchingAwayInfo.name : null,
            };
        });

        return mergedResponses;
    } catch (error) {
        console.error(error);
        return null;
    }
};

module.exports = { fetchBoxScores, fetchBoxScoresWithTeamNames };
