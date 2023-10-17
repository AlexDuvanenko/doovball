const { Client } = require("espn-fantasy-football-api/node");
const { espn_leagueId, espn_s2, espn_SWID } = require("../config.json");

const espnClient = new Client({ leagueId: espn_leagueId });
espnClient.setCookies({
    espnS2: espn_s2,
    SWID: espn_SWID,
});

module.exports = { espnClient };
