const { espnClient } = require("../utilities/espnClient");
const { espn_seasonId } = require("../config.json");

const ENDING_WEEK_ID = 18; // end of season

const fetchLeagueTeams = async (selectedWeekId) => {
    try {
        const response = await espnClient.getTeamsAtWeek({
            seasonId: espn_seasonId,
            scoringPeriodId: selectedWeekId,
        });
        if (!response) {
            throw new Error("failed to fetch data");
        }
        return response;
    } catch (error) {
        console.log(`ERROR: ${error.message}`);
    }
};

const formatTeamsDataForAutocomplete = async (selectedWeekId) => {
    try {
        const data = await fetchLeagueTeams(selectedWeekId);
        const teams = [];

        data.forEach((team) => {
            teams.push({ name: `${team.name}`, value: `${team.id}` });
        });

        return teams;
    } catch (error) {
        console.log(`ERROR: ${error.message}`);
    }
};

module.exports = {
    ENDING_WEEK_ID,
    fetchLeagueTeams,
    formatTeamsDataForAutocomplete,
};
