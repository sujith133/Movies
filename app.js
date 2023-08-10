const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
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

  let moviesList = [];
  for (let item of movieList) {
    let movieObj = {};
    movieObj.movieName = item.movie_name;
    moviesList.push(movieObj);
  }
  response.send(moviesList);
});

//get director
app.get("/directors/", async (request, response) => {
  let getMovies = "SELECT * from director;";
  const movieList = await db.all(getMovies);
  let moviesList = [];
  for (let item of movieList) {
    let movieObj = {};
    movieObj.directorName = item.director_name;
    movieObj.directorId = item.director_id;
    moviesList.push(movieObj);
  }
  response.send(moviesList);
});

//GET MOVIE
app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let getMovies = `SELECT * from movie where movie_id = ${movieId};`;
  const movieList = await db.get(getMovies);
  let movieObj = {};
  movieObj.movieId = movieList.movie_id;
  movieObj.directorId = movieList.director_id;
  movieObj.movieName = movieList.movie_name;
  movieObj.leadActor = movieList.lead_actor;
  response.send(movieObj);
});

//GET director
app.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;
  let getMovies = `SELECT movie.movie_name 
  from movie 
  join director on director.director_id=movie.director_id
  where director.director_id = ${directorId}
  ;`;
  const movieList = await db.all(getMovies);
  let moviesList = [];
  for (let item of movieList) {
    let movieObj = {};
    movieObj.movieName = item.movie_name;
    moviesList.push(movieObj);
  }
  response.send(moviesList);
});
//post movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  let insertMovie = `
    insert into movie(director_id,movie_name,lead_actor) values(${directorId},'${movieName}','${leadActor}');`;
  const insertedMovie = await db.run(insertMovie);
  response.send("Movie Successfully Added");
});

//put movies
app.put("/movies/:movieId/", async (request, response) => {
  const movieUpdater = request.body;
  let { directorId, movieName, leadActor } = movieUpdater;
  let { movieId } = request.params;
  let insertMovie = `
    update movie set director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}' where movie_id=${movieId}`;
  const insertedMovie = await db.run(insertMovie);
  response.send("Movie Details Updated");
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
