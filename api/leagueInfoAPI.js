const { espnClient } = require("../utilities/espnClient");
const {
    espn_seasonId,
    espn_leagueId,
    espn_SWID,
    espn_s2,
} = require("../config.json");
const axios = require("axios");

const ESPN_FFL_BASE_URL = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${espn_seasonId}/segments/0/leagues/${espn_leagueId}`;
// need to pass old season id
const ESPN_FFL_URL = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/`;

const TEAM_URL = "mTeam";
const ROSTER_URL = "mRoster";

const fetchLeagueEndpoint = async () => {
    const apiURL = `${ESPN_FFL_BASE_URL}?rosterForTeamId=5&view=${TEAM_URL}&view=${ROSTER_URL}`;
    return axios
        .get(apiURL, {
            headers: {
                Cookie: `SWID=${espn_SWID}; espn_s2=${espn_s2}`,
            },
        })
        .then((response) => {
            console.info("successfully fetched league endpoint");
            return response.data;
        })
        .catch((error) => {
            console.error("Error fetching league endpoint", error);
        });
};

/* ----- OLD ----- */

const fetchLeagueInfo = async () => {
    try {
        const response = await espnClient.getLeagueInfo({
            seasonId: espn_seasonId,
        });
        if (!response) {
            throw new Error("failed to fetch data");
        }
        return response;
    } catch (error) {
        console.log(`ERROR: ${error.message}`);
    }
};

module.exports = {
    fetchLeagueEndpoint,
    fetchLeagueInfo,
    ESPN_FFL_BASE_URL,
    ESPN_FFL_URL,
};
