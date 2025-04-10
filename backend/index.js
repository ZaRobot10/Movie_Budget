const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');


require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

app.use(cors());

// Global variable to cache total pages
let totalPages = null;



// Connect to your MongoDB Cloud instance using the connection string in your environment variable.
mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define a schema for daily movies.
const dailyMoviesSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  movies: [
    {
      id: Number,
      title: String,
      budget: Number,
      poster: String,
      tip: String,
    },
  ],
});

// Create the model from the schema.
const DailyMovies = mongoose.model('DailyMovies', dailyMoviesSchema);

// Utility function to fetch details for a given movie ID and check if it has a valid budget.
const fetchValidMovieDetails = async (movieId) => {
  try {
    const detailsResponse = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
      },
    });
    const details = detailsResponse.data;
    if (details.budget && details.budget > 0) {
      return details;
    }
  } catch (error) {
    console.error(`Error fetching details for movie ID ${movieId}: ${error.message}`);
  }
  return null;
};

// API endpoint to get a random movie with a valid (non-zero) budget
app.get('/api/movie', async (req, res) => {
  try {


    totalPages = 500;
    // Cap the maximum page to 1000 as TMDb only allows pages up to 1000
    const maxPageAllowed = Math.min(totalPages, 500);
    const randomPage = Math.floor(Math.random() * maxPageAllowed) + 1;

     // Common parameters
     let params = {
      api_key: TMDB_API_KEY,
      language: 'en-US',
      page: randomPage,
    };

    const type = req.query.type === 'discover' ? 'discover' : 'popular';
    const endpoint = type === 'discover' ? '/discover/movie' : '/movie/popular';


    if (type === 'discover') {
      // Default sort: lower popularity to get less-known movies
      params.sort_by = 'popularity.asc';
      // Add optional filters from the query string
      if (req.query.genres) {
        params.with_genres = req.query.genres; // e.g., "28,12"
      }
      if (req.query.min_rating) {
        params['vote_average.gte'] = req.query.min_rating;
      }
      if (req.query.release_before) {
        // Expecting a year, e.g., "2010" then we set primary_release_date.lte to "2010-12-31"
        params['primary_release_date.lte'] = `${req.query.release_before}-12-31`;
      }
      if (req.query.release_after) {
        // Expecting a year, e.g., "2000" then we set primary_release_date.gte to "2000-01-01"
        params['primary_release_date.gte'] = `${req.query.release_after}-01-01`;
      }
    }

    const moviesResponse = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {params});


    const movies = moviesResponse.data.results;
    // Shuffle movies to randomly select one.
    const shuffledMovies = movies.sort(() => 0.5 - Math.random());
    let movieDetails = null;

    // Loop through shuffled movies to find one with a valid (non-zero) budget.
    for (const movie of shuffledMovies) {
      const detailsResponse = await axios.get(`${TMDB_BASE_URL}/movie/${movie.id}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'en-US',
        },
      });
      const details = detailsResponse.data;
      // console.log('Movie details:', details);
      if (details.budget && details.budget > 0) {
        movieDetails = details;
        break;
      }
    }

    // console.log('Movie details:', movieDetails);

    if (!movieDetails) {
      return res.status(404).json({ error: 'No movie with a valid budget found.' });
    }

    // Prepare the movie data to return.
    const tip = movieDetails.overview || 'No tip available.';
    const movieData = {
      id: movieDetails.id,
      title: movieDetails.title,
      budget: movieDetails.budget,
      poster: movieDetails.poster_path ? TMDB_IMAGE_BASE_URL + movieDetails.poster_path : null,
      tip,
    };

    res.json(movieData);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch movie data.' });
  }
});

// Helper to fetch 5 daily movies from the popular endpoint.
const fetchDailyMovies = async () => {
  const moviesList = [];
  // Choose a random page from 1 to 500.
  const params = {
    api_key: TMDB_API_KEY,
    language: 'en-US',
    page: Math.floor(Math.random() * 500) + 1,
  };
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, { params });
    const movies = response.data.results.sort(() => 0.5 - Math.random());
    // Loop until we have 5 valid movies.
    for (const movie of movies) {
      if (moviesList.length >= 5) break;
      const details = await fetchValidMovieDetails(movie.id);
      if (details) {
        moviesList.push({
          id: details.id,
          title: details.title,
          budget: details.budget,
          poster: details.poster_path ? TMDB_IMAGE_BASE_URL + details.poster_path : null,
          tip: details.overview || "No tip available.",
        });
      }
    }
    return moviesList;
  } catch (error) {
    console.error('Error fetching daily movies:', error.message);
    return [];
  }
};

// Updated /api/daily endpoint that uses MongoDB for storage.
app.get('/api/daily', async (req, res) => {
  try {
    // Get today's date string in YYYY-MM-DD format.
    const today = new Date().toISOString().slice(0, 10);
    
    // Attempt to find a record for today.
    let record = await DailyMovies.findOne({ date: today });
    if (!record) {
      // If no record exists, fetch 5 daily movies from the API.
      const movies = await fetchDailyMovies();
      // Create a new record for today.
      record = new DailyMovies({ date: today, movies });
      await record.save();
    }
    
    // Respond with the daily movies record.
    res.json({ date: record.date, movies: record.movies });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch daily movies.' });
  }
});

// Uptime Route for UptimeRobot
app.get('/uptime', (req, res) => {
  console.log('okay');
  res.status(200).send('Service is up and running');
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
