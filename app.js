const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//get
app.get("/movies/", async (request, response) => {
  let getMovies = "SELECT movie_name from movie;";
  const movieList = await db.all(getMovies);
  response.send(movieList);
});

//get director
app.get("/directors/", async (request, response) => {
  let getMovies = "SELECT * from director;";
  const movieList = await db.all(getMovies);
  response.send(movieList);
});

//GET MOVIE
app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let getMovies = `SELECT * from movie where movie_id = ${movieId};`;
  const movieList = await db.get(getMovies);
  response.send(movieList);
});

//GET director
app.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;
  let getMovies = `SELECT movie.movie_name 
  from movie 
  join director on director.director_id=movie.director_id
  where director.director_id = ${directorId}
  ;`;
  const movieList = await db.get(getMovies);
  response.send(movieList);
});
//post movie
app.post("/movies/", async (request, response) => {
  let { director_id, movie_name, lead_actor } = request.body;
  let insertMovie = `
    insert into movie(director_id,movie_name,lead_actor) values(${director_id},${movie_name},${lead_actor})`;
  const insertedMovie = await db.run(insertMovie);
  response.send("Movie Successfully Added");
});

//put movie
app.put("/movies/:movieId/", async (request, response) => {
  let { directorId, movieName, leadActor } = request.body;
  let { movie_id } = request.params;
  let insertMovie = `
    update movie set director_id=${directorId},movie_name=${movieName},lead_actor=${leadActor} where movie_id=${movie_id}`;
  const insertedMovie = await db.run(insertMovie);
  response.send("Movie Successfully Added");
});

//delete movie
app.delete("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let deleteMovie = `
    delete from movie where movie_id = ${movieId}`;
  const deletedMovie = await db.run(deleteMovie);
  response.send("Movie Removed");
});
module.exports = app;
