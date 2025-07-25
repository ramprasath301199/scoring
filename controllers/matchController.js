const { DB } = require("../models/connection");

// GET all matches
exports.getallMatch = async (req, res) => {
  try {
    const [matches] = await DB.query("SELECT * FROM matches");

    const teamIds = [
      ...new Set(matches.flatMap((m) => [m.team1, m.team2])),
    ];

    const squadIds = [
      ...new Set(
        matches.flatMap((m) => {
          try {
            return [...JSON.parse(m.team1Squad), ...JSON.parse(m.team2Squad)];
          } catch (e) {
            return [];
          }
        })
      ),
    ];

    // Fetch teams
    const [teams] = teamIds.length
      ? await DB.query("SELECT * FROM teams WHERE ID IN (?)", [teamIds])
      : [[]];

    // Fetch squads safely
    const [squads] = squadIds.length
      ? await DB.query("SELECT * FROM teamsquad WHERE playerId IN (?)", [squadIds])
      : [[]];

    const teamMap = Object.fromEntries(teams.map((t) => [t.ID, t]));
    const squadMap = Object.fromEntries(squads.map((s) => [s.playerId, s]));

    const enrichedMatches = matches.map((match) => {
      let team1Squad = [];
      let team2Squad = [];

      try {
        team1Squad = JSON.parse(match.team1Squad)
          .map((pid) => squadMap[pid])
          .filter(Boolean);
        team2Squad = JSON.parse(match.team2Squad)
          .map((pid) => squadMap[pid])
          .filter(Boolean);
      } catch (e) {
        // JSON parse failed, fallback to empty squads
      }

      return {
        ...match,
        team1_info: {
          team: teamMap[match.team1] || null,
          squad: team1Squad,
        },
        team2_info: {
          team: teamMap[match.team2] || null,
          squad: team2Squad,
        },
      };
    });

    res.json({ data: enrichedMatches, status: 1 });
  } catch (err) {
    console.error("❌ Match fetch failed:", err);
    res.status(500).json({ error: err.message, status: 0 });
  }
};


// CREATE match
exports.createMatch = async (req, res) => {
  const {
    team1,
    team1Squad,
    team2,
    team2Squad,
    overs,
    balltype,
    ground,
    datetime,
  } = req.body;

  if (!team1 || !team2 || !Array.isArray(team1Squad) || !Array.isArray(team2Squad)) {
    return res.status(400).json({ error: "Invalid match data", status: 0 });
  }

  const formattedDatetime = datetime.replace("T", " ") + ":00";

  try {
    const [result] = await DB.query(
      "INSERT INTO matches (team1, team1Squad, team2, team2Squad, overs, balltype, ground, datetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        team1,
        JSON.stringify(team1Squad),
        team2,
        JSON.stringify(team2Squad),
        overs,
        balltype,
        ground,
        formattedDatetime,
      ]
    );

    res.status(201).json({ message: "Match created", status: 1 });
  } catch (err) {
    console.error("❌ Match insert failed:", err);
    res.status(500).json({ error: err.message, status: 0 });
  }
};
