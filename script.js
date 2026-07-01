const API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';

// API Endpoints
const reqs = {
    trending: `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`,
    topRated: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US`,
    action: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`,
    comedy: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`,
    horror: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27`,
    search: `${BASE_URL}/search/movie?api_key=${API_KEY}&query=`
};

const form = document.getElementById('form');
const search = document.getElementById('search');
const navbar = document.getElementById('navbar');

// Containers
const searchContainer = document.getElementById('search-results-container');
const searchResults = document.getElementById('search-results');
const myListContainer = document.getElementById('my-list-container');
const myList = document.getElementById('my-list');
const movieContainer = document.getElementById('movie-container');

// Modal Elements
const modal = document.getElementById('movie-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalVideo = document.getElementById('modal-video');
const modalTitle = document.getElementById('modal-title');
const modalYear = document.getElementById('modal-year');
const modalRating = document.getElementById('modal-rating');
const modalRuntime = document.getElementById('modal-runtime');
const modalGenres = document.getElementById('modal-genres');
const modalOverview = document.getElementById('modal-overview');
const modalCast = document.getElementById('modal-cast');

// Hero Elements
const heroSection = document.getElementById('hero');
const heroTitle = document.getElementById('hero-title');
const heroOverview = document.getElementById('hero-overview');
const heroMeta = document.getElementById('hero-meta');

let savedMovies = JSON.parse(localStorage.getItem('chrisflix_list')) || [];

// Scroll effect for navbar
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Initialization
init();

async function init() {
    renderMyList();
    
    // Fetch Hero & Trending
    const trendingData = await fetchMovies(reqs.trending);
    if(trendingData && trendingData.length > 0) {
        updateHero(trendingData[0]);
        renderRow(document.getElementById('trending'), trendingData.slice(1));
    }
    
    // Fetch other genres
    fetchMovies(reqs.topRated).then(data => renderRow(document.getElementById('top-rated'), data));
    fetchMovies(reqs.action).then(data => renderRow(document.getElementById('action'), data));
    fetchMovies(reqs.comedy).then(data => renderRow(document.getElementById('comedy'), data));
    fetchMovies(reqs.horror).then(data => renderRow(document.getElementById('horror'), data));
}

async function fetchMovies(url) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        return data.results;
    } catch(err) {
        console.error("Failed to fetch", err);
        return [];
    }
}

function updateHero(movie) {
    const { title, backdrop_path, poster_path, vote_average, release_date, overview } = movie;
    const bgImage = backdrop_path ? backdrop_path : poster_path;
    heroSection.style.backgroundImage = `url('${IMG_PATH + bgImage}')`;
    heroTitle.innerText = title;
    heroOverview.innerText = overview;
    const year = release_date ? release_date.split('-')[0] : 'N/A';
    heroMeta.innerHTML = `
        <span class="rating"><i class="fa-solid fa-star text-warning"></i> ${vote_average.toFixed(1)}</span>
        <span class="year">${year}</span>
    `;
    
    // Attach hero watch button to modal
    document.querySelector('.hero-buttons .btn-primary').onclick = () => openModal(movie);
    document.querySelector('.hero-buttons .btn-secondary').onclick = () => openModal(movie);
}

function renderRow(container, movies) {
    container.innerHTML = '';
    if(!movies) return;
    
    movies.forEach(movie => {
        if(!movie.poster_path) return;
        
        const isSaved = savedMovies.some(m => m.id === movie.id);
        
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        movieEl.innerHTML = `
            <img src="${IMG_PATH + movie.poster_path}" alt="${movie.title}">
            <button class="add-to-list-btn" onclick="toggleMyList(event, ${movie.id}, '${movie.title.replace(/'/g, "\\'")}', '${movie.poster_path}', '${movie.backdrop_path}', ${movie.vote_average}, '${movie.release_date}', '${movie.overview.replace(/'/g, "\\'")}')">
                <i class="fa-solid ${isSaved ? 'fa-check' : 'fa-plus'}"></i>
            </button>
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <span class="${getClassByRate(movie.vote_average)}">${movie.vote_average.toFixed(1)}</span>
            </div>
        `;
        
        // Open modal on click (but not when clicking the + button)
        movieEl.onclick = (e) => {
            if(!e.target.closest('.add-to-list-btn')) {
                openModal(movie);
            }
        };
        
        container.appendChild(movieEl);
    });
}

function getClassByRate(vote) {
    if(vote >= 8) return 'green';
    else if(vote >= 5) return 'orange';
    else return 'red';
}

// My List Logic
function toggleMyList(e, id, title, poster_path, backdrop_path, vote_average, release_date, overview) {
    e.stopPropagation(); // prevent modal opening
    const btn = e.currentTarget;
    const icon = btn.querySelector('i');
    
    const index = savedMovies.findIndex(m => m.id === id);
    if(index === -1) {
        // Add to list
        savedMovies.push({ id, title, poster_path, backdrop_path, vote_average, release_date, overview });
        icon.classList.remove('fa-plus');
        icon.classList.add('fa-check');
    } else {
        // Remove from list
        savedMovies.splice(index, 1);
        icon.classList.remove('fa-check');
        icon.classList.add('fa-plus');
    }
    
    localStorage.setItem('chrisflix_list', JSON.stringify(savedMovies));
    renderMyList();
    
    // Refresh icons on all rows
    document.querySelectorAll('.add-to-list-btn').forEach(btn => {
        if(btn.getAttribute('onclick').includes(id)) {
            const i = btn.querySelector('i');
            if(index === -1) {
                i.className = 'fa-solid fa-check';
            } else {
                i.className = 'fa-solid fa-plus';
            }
        }
    });
}

function renderMyList() {
    if(savedMovies.length > 0) {
        myListContainer.style.display = 'block';
        renderRow(myList, savedMovies.slice().reverse()); // Show newest first
    } else {
        myListContainer.style.display = 'none';
    }
}

// Live Search
let searchTimeout;
search.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const searchTerm = e.target.value.trim();
    
    searchTimeout = setTimeout(async () => {
        if(searchTerm && searchTerm !== '') {
            searchContainer.style.display = 'block';
            const results = await fetchMovies(reqs.search + encodeURIComponent(searchTerm));
            if(results.length > 0) {
                renderRow(searchResults, results);
            } else {
                searchResults.innerHTML = '<p style="color:white; padding: 2rem;">No movies found for this search.</p>';
            }
            window.scrollTo({ top: searchContainer.offsetTop - 100, behavior: 'smooth' });
        } else {
            searchContainer.style.display = 'none';
        }
    }, 500); // 500ms debounce
});

form.addEventListener('submit', (e) => e.preventDefault());

// Modal Logic
async function openModal(movie) {
    // Basic Details
    modalTitle.innerText = movie.title;
    modalYear.innerText = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    modalRating.innerHTML = `<i class="fa-solid fa-star text-warning"></i> ${movie.vote_average.toFixed(1)}`;
    modalOverview.innerText = movie.overview;
    
    // Fetch deeper details (Trailer, Runtime, Genres, Cast)
    try {
        const res = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&append_to_response=videos,credits`);
        const data = await res.json();
        
        modalRuntime.innerText = data.runtime ? `${data.runtime} min` : 'N/A';
        
        modalGenres.innerHTML = data.genres ? data.genres.map(g => `<span>${g.name}</span>`).join('') : '';
        
        // Trailer
        const videos = data.videos?.results || [];
        const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos.find(v => v.site === 'YouTube');
        
        if(trailer) {
            modalVideo.innerHTML = `<iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        } else {
            const bg = movie.backdrop_path ? movie.backdrop_path : movie.poster_path;
            modalVideo.innerHTML = `<img src="${IMG_PATH + bg}" style="width:100%; height:450px; object-fit:cover;" />`;
        }
        
        // Cast
        const cast = data.credits?.cast || [];
        modalCast.innerHTML = cast.slice(0, 10).map(c => `
            <div class="cast-card">
                <img src="${c.profile_path ? 'https://image.tmdb.org/t/p/w185' + c.profile_path : 'https://ui-avatars.com/api/?name='+c.name}" alt="${c.name}">
                <p>${c.name}</p>
            </div>
        `).join('');
        
    } catch(err) {
        console.error('Error fetching details', err);
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent background scrolling
}

closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if(e.target === modal) closeModal();
});

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    modalVideo.innerHTML = ''; // Stop video playing
}