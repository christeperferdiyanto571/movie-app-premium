const API_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&page=1';
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';
const SEARCH_API = 'https://api.themoviedb.org/3/search/movie?api_key=3fd2be6f0c70a2a598f084ddfb75487c&query="';

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const navbar = document.getElementById('navbar');

// Hero Elements
const heroSection = document.getElementById('hero');
const heroTitle = document.getElementById('hero-title');
const heroOverview = document.getElementById('hero-overview');
const heroMeta = document.getElementById('hero-meta');

// Add scroll effect for navbar
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Get initial movies
getMovies(API_URL, true);

async function getMovies(url, isInitialLoad = false) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if(data.results && data.results.length > 0) {
            let moviesForGrid = data.results;
            
            if (isInitialLoad) {
                // Set first movie as Hero
                const featured = data.results[0];
                updateHero(featured);
                
                // Show the rest in the grid
                moviesForGrid = data.results.slice(1);
            }
            
            showMovies(moviesForGrid);
        } else {
            main.innerHTML = '<h2 style="color: white; grid-column: 1/-1; text-align: center;">No movies found</h2>';
        }
    } catch(err) {
        console.error("Failed to fetch movies", err);
    }
}

function updateHero(movie) {
    const { title, backdrop_path, vote_average, release_date, overview } = movie;
    
    // Fallback to poster if backdrop is missing
    const bgImage = backdrop_path ? backdrop_path : movie.poster_path;
    
    heroSection.style.backgroundImage = `url('${IMG_PATH + bgImage}')`;
    heroTitle.innerText = title;
    heroOverview.innerText = overview;
    
    const year = release_date ? release_date.split('-')[0] : 'N/A';
    heroMeta.innerHTML = `
        <span class="rating"><i class="fa-solid fa-star text-warning"></i> ${vote_average.toFixed(1)}</span>
        <span class="year">${year}</span>
    `;
}

function showMovies(movies) {
    main.innerHTML = '';

    movies.forEach((movie) => {
        const { title, poster_path, vote_average, overview } = movie;
        
        // Skip movies without poster
        if(!poster_path) return;

        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');

        movieEl.innerHTML = `
            <img src="${IMG_PATH + poster_path}" alt="${title}">
            <div class="movie-info">
          <h3>${title}</h3>
          <span class="${getClassByRate(vote_average)}">${vote_average.toFixed(1)}</span>
            </div>
            <div class="overview">
          <h3>Overview</h3>
          <p>${overview}</p>
        </div>
        `;
        main.appendChild(movieEl);
    });
}

function getClassByRate(vote) {
    if(vote >= 8) {
        return 'green';
    } else if(vote >= 5) {
        return 'orange';
    } else {
        return 'red';
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const searchTerm = search.value;

    if(searchTerm && searchTerm !== '') {
        // When searching, we don't update the hero, just the grid below.
        getMovies(SEARCH_API + searchTerm, false);
        
        // Optional: Scroll down to the grid to see results
        document.querySelector('.movie-container').scrollIntoView({ behavior: 'smooth' });
        
    } else {
        window.location.reload();
    }
});