const { espnClient } = require("../utilities/espnClient");
const { espn_seasonId } = require("../config.json");

const fetchLeagueTeams = async (selectedWeek) => {
    try {
        const response = await espnClient.getTeamsAtWeek({
            seasonId: espn_seasonId,
            scoringPeriodId: selectedWeek,
        });
        if (!response) {
            throw new Error("failed to fetch data");
        }
        return response;
    } catch (error) {
        console.log(`ERROR: ${error.message}`);
    }
};

module.exports = { fetchLeagueTeams };
