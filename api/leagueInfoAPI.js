const { espnClient } = require("../utilities/espnClient");
const { espn_seasonId } = require("../config.json");

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

module.exports = { fetchLeagueInfo };
