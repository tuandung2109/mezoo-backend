const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

class TMDBService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    
    // Check if it's a Bearer token (JWT) or API key
    const isBearerToken = apiKey && apiKey.startsWith('eyJ');
    
    if (isBearerToken) {
      // Use Bearer token authentication (v4)
      this.client = axios.create({
        baseURL: TMDB_BASE_URL,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          language: 'vi-VN'
        }
      });
    } else {
      // Use API key authentication (v3)
      this.client = axios.create({
        baseURL: TMDB_BASE_URL,
        params: {
          api_key: this.apiKey,
          language: 'vi-VN'
        }
      });
    }
  }

  // Get popular movies
  async getPopularMovies(page = 1) {
    try {
      const response = await this.client.get('/movie/popular', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      throw new Error(`TMDB API Error: ${error.message}`);
    }
  }

  // Get movie details
  async getMovieDetails(tmdbId) {
    try {
      const response = await this.client.get(`/movie/${tmdbId}`, {
        params: {
          append_to_response: 'credits,videos,images'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`TMDB API Error: ${error.message}`);
    }
  }

  // Search movies
  async searchMovies(query, page = 1) {
    try {
      const response = await this.client.get('/search/movie', {
        params: { query, page }
      });
      return response.data;
    } catch (error) {
      throw new Error(`TMDB API Error: ${error.message}`);
    }
  }

  // Get trending movies
  async getTrendingMovies(timeWindow = 'week') {
    try {
      const response = await this.client.get(`/trending/movie/${timeWindow}`);
      return response.data;
    } catch (error) {
      throw new Error(`TMDB API Error: ${error.message}`);
    }
  }

  // Get movie genres
  async getGenres() {
    try {
      const response = await this.client.get('/genre/movie/list');
      return response.data.genres;
    } catch (error) {
      throw new Error(`TMDB API Error: ${error.message}`);
    }
  }

  // Get movies by genre
  async getMoviesByGenre(genreId, page = 1) {
    try {
      const response = await this.client.get('/discover/movie', {
        params: {
          with_genres: genreId,
          page
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`TMDB API Error: ${error.message}`);
    }
  }

  // Get TV series details
  async getTVDetails(tmdbId) {
    try {
      const response = await this.client.get(`/tv/${tmdbId}`, {
        params: {
          append_to_response: 'credits,videos,images'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`TMDB API Error: ${error.message}`);
    }
  }

  // Get season details
  async getSeasonDetails(tvId, seasonNumber) {
    try {
      const response = await this.client.get(`/tv/${tvId}/season/${seasonNumber}`);
      return response.data;
    } catch (error) {
      throw new Error(`TMDB API Error: ${error.message}`);
    }
  }

  // Helper: Get full image URL
  getImageUrl(path, size = 'original') {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }

  // Helper: Format movie data for database
  formatMovieData(tmdbMovie) {
    return {
      tmdbId: tmdbMovie.id,
      title: tmdbMovie.title,
      originalTitle: tmdbMovie.original_title,
      overview: tmdbMovie.overview,
      tagline: tmdbMovie.tagline,
      poster: this.getImageUrl(tmdbMovie.poster_path, 'w500'),
      backdrop: this.getImageUrl(tmdbMovie.backdrop_path, 'original'),
      releaseDate: new Date(tmdbMovie.release_date),
      runtime: tmdbMovie.runtime,
      genres: tmdbMovie.genres?.map(g => g.name) || [],
      countries: tmdbMovie.production_countries?.map(c => c.name) || [],
      originalLanguage: tmdbMovie.original_language,
      status: tmdbMovie.status,
      rating: {
        tmdb: tmdbMovie.vote_average,
        average: tmdbMovie.vote_average,
        count: tmdbMovie.vote_count
      },
      popularity: tmdbMovie.popularity,
      voteCount: tmdbMovie.vote_count,
      adult: tmdbMovie.adult,
      budget: tmdbMovie.budget,
      revenue: tmdbMovie.revenue,
      cast: tmdbMovie.credits?.cast?.slice(0, 20).map(c => ({
        name: c.name,
        character: c.character,
        profilePath: this.getImageUrl(c.profile_path, 'w185'),
        order: c.order
      })) || [],
      crew: tmdbMovie.credits?.crew?.filter(c => 
        ['Director', 'Producer', 'Writer'].includes(c.job)
      ).map(c => ({
        name: c.name,
        job: c.job,
        department: c.department,
        profilePath: this.getImageUrl(c.profile_path, 'w185')
      })) || [],
      trailer: {
        youtube: tmdbMovie.videos?.results?.find(v => 
          v.type === 'Trailer' && v.site === 'YouTube'
        )?.key || null
      }
    };
  }
}

module.exports = TMDBService;
