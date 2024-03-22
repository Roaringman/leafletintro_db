const express = require("express");
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "SpatialPlayground",
  password: "roar",
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function fetchSpatialData(query) {
  try {
    // Connect to the database
    await pool.connect();

    // Execute the query
    const res = await pool.query(query);

    // Output the query results
    return res.rows;
  } catch (err) {
    console.error("Error executing query", err.stack);
    return "Could not connect to database.";
  }
}

// Call the function to fetch data
const app = express();
const PORT = 3000;
app.use(express.static("public"));

app.get("/allData", async (req, res) => {
  let query =
    "SELECT id, navn, ST_AsGeoJSON(geom)::json AS geometry FROM biblioteker;";

  fetchSpatialData(query).then((data) => {
    res.send(data);
  });
});

app.get("/bibliotek", function (req, res) {
  let lat = req.query.lat;
  let lon = req.query.lon;
  let query = `
    SELECT id, navn, ST_AsGeoJSON(geom)::json as geometry
    FROM biblioteker
    ORDER BY geom <-> 'SRID=4326;POINT(${lon} ${lat})'::geometry
    LIMIT 1;`;
  fetchSpatialData(query).then((data) => {
    res.send(data);
  });
});

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
