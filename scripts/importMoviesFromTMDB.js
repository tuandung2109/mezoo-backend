const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('../models/Movie');
const Genre = require('../models/Genre');
const TMDBService = require('../utils/tmdb');

dotenv.config();

// Initialize TMDB service
const tmdb = new TMDBService(process.env.TMDB_API_KEY);

const importMovies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...\n');

    // Get genres from database
    const genres = await Genre.find();
    if (genres.length === 0) {
      console.log('❌ No genres found. Please run seedGenres.js first!');
      process.exit(1);
    }

    console.log('📥 Importing movies from TMDB...\n');

    // Popular movies to search
    const searchTerms = [
      'Avengers', 'Spider-Man', 'Batman', 'Joker', 'Inception',
      'Interstellar', 'The Dark Knight', 'Pulp Fiction', 'Forrest Gump',
      'The Matrix', 'Fight Club', 'The Godfather', 'Titanic', 'Avatar',
      'Star Wars', 'Harry Potter', 'Lord of the Rings', 'Jurassic Park',
      'Iron Man', 'Captain America', 'Thor', 'Black Panther', 'Deadpool',
      'Guardians of the Galaxy', 'Doctor Strange', 'Ant-Man', 'Shang-Chi'
    ];

    let importedCount = 0;
    let skippedCount = 0;

    for (const term of searchTerms) {
      try {
        console.log(`🔍 Searching for: ${term}`);
        const searchResult = await tmdb.searchMovies(term);
        const results = searchResult.results;
        
        if (results && results.length > 0) {
          // Get first result
          const tmdbMovie = results[0];
          
          // Check if movie already exists
          const existingMovie = await Movie.findOne({ tmdbId: tmdbMovie.id });
          if (existingMovie) {
            console.log(`   ⏭️  Already exists: ${tmdbMovie.title}`);
            skippedCount++;
            continue;
          }

          // Get full movie details
          const details = await tmdb.getMovieDetails(tmdbMovie.id);
          
          // Map TMDB genres to our genres
          const movieGenres = [];
          if (details.genres) {
            for (const tmdbGenre of details.genres) {
              const genre = genres.find(g => 
                g.name.toLowerCase() === tmdbGenre.name.toLowerCase() ||
                g.tmdbId === tmdbGenre.id
              );
              if (genre) {
                movieGenres.push(genre._id);
              }
            }
          }

          // Prepare cast
          const cast = details.credits?.cast?.slice(0, 10).map((c, index) => ({
            name: c.name,
            character: c.character,
            profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
            order: index
          })) || [];

          // Prepare crew
          const crew = details.credits?.crew?.slice(0, 5).map(c => ({
            name: c.name,
            job: c.job,
            department: c.department,
            profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
          })) || [];

          // Create movie
          await Movie.create({
            title: details.title,
            originalTitle: details.original_title,
            overview: details.overview || 'No description available',
            tagline: details.tagline,
            releaseDate: details.release_date || new Date(),
            runtime: details.runtime || 120,
            rating: {
              average: details.vote_average || 0,
              count: details.vote_count || 0,
              tmdb: details.vote_average
            },
            poster: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster',
            backdrop: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null,
            trailer: details.videos?.results?.[0] ? {
              youtube: details.videos.results[0].key,
              url: `https://www.youtube.com/watch?v=${details.videos.results[0].key}`
            } : {},
            genres: movieGenres.length > 0 ? movieGenres : [],
            countries: details.production_countries?.map(c => c.name) || [],
            languages: details.spoken_languages?.map(l => ({ code: l.iso_639_1, name: l.name })) || [],
            originalLanguage: details.original_language,
            cast: cast,
            crew: crew,
            budget: details.budget,
            revenue: details.revenue,
            popularity: details.popularity,
            voteCount: details.vote_count,
            tmdbId: details.id,
            isPublished: true,
            featured: importedCount < 5,
            trending: importedCount < 10
          });

          console.log(`   ✅ Imported: ${details.title}`);
          importedCount++;
        }

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.log(`   ❌ Error with ${term}: ${error.message}`);
      }
    }

    console.log('\n✅ ========================================');
    console.log('✅ IMPORT COMPLETED!');
    console.log('✅ ========================================\n');
    console.log(`📊 Summary:`);
    console.log(`   - Imported: ${importedCount} movies`);
    console.log(`   - Skipped: ${skippedCount} movies (already exist)`);
    console.log(`   - Total in database: ${await Movie.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

importMovies();
