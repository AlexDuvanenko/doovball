const { espnClient } = require("../utilities/espnClient");
const { espn_seasonId, espn_SWID, espn_s2 } = require("../config.json");
const { ESPN_FFL_BASE_URL } = require("./leagueInfoAPI");
const axios = require("axios");

const ENDING_WEEK_ID = 18; // end of season

const fetchLeagueTeamsInfo = async () => {
    const apiURL = `${ESPN_FFL_BASE_URL}?view=modular&view=mTeam`;
    return axios
        .get(apiURL, {
            headers: {
                Cookie: `SWID=${espn_SWID}; espn_s2=${espn_s2}`,
            },
        })
        .then((response) => {
            console.info("successfully fetched league teams");
            return response.data;
        })
        .catch((error) => {
            console.error("Error fetching league teams", error);
        });
};

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
    fetchLeagueTeamsInfo,
    fetchLeagueTeams,
    formatTeamsDataForAutocomplete,
};
