/* eslint-disable no-use-before-define */
const key = '485dd1f1ee71083619712efed20ee4bb';
const body = document.querySelector('body');
window.onload = function() {
  fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${key}`)
    .then(resp => resp.json())
    .then(resp => {
      const randomTrending =
        resp.results[Math.floor(Math.random() * resp.results.length)];
      document.querySelector(
        '.bg'
      ).style.backgroundImage = `url('https://image.tmdb.org/t/p/original${
        randomTrending.backdrop_path
      }')`;
      document.querySelector('header h2').innerHTML = randomTrending.title;
      const seeMore = document.querySelector('.todays-more');
      seeMore.dataset.key = randomTrending.id;
      seeMore.addEventListener('click', () => {
        buildMore(seeMore.dataset.key);
      });
    });
  fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${key}`)
    .then(resp => resp.json())
    .then(resp => {
      resp.results.forEach(e => {
        document
          .querySelector('.trending-week>.movie-grid')
          .appendChild(buildPoster(e));
      });
      document.querySelectorAll('.movie').forEach(movie => {
        movie.addEventListener('click', () => {
          buildMore(movie.dataset.key);
        });
      });
    });
  document.querySelector('.input-search').addEventListener(
    'keyup',
    debounce(() => {
      searchMovies(document.querySelector('.input-search').value);
    }, 80)
  );
};

function buildPoster(element) {
  const movie = document.createElement('div');
  movie.classList.add('movie');
  movie.dataset.key = element.id;
  movie.innerHTML = `
    ${
      element.poster_path
        ? `<div class='poster'><img src='https://image.tmdb.org/t/p/w500${
            element.poster_path
          }' alt='Poster' /></div>`
        : ''
    }
    <div class="description">
      <p class="title">${element.title}</p>
      <p class="species">Realise date: ${element.release_date
        .split('-')
        .join('.')}</p>
  </div>`;
  return movie;
}

async function buildMore(id) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=485dd1f1ee71083619712efed20ee4bb&language=en-US`
  );

  const resp = await response.json();
  const moviePopup = await document.createElement('section');
  await moviePopup.classList.add('movie-popup');
  moviePopup.innerHTML = await `
      <div class="bg-popup" style='background: url("https://image.tmdb.org/t/p/w500${
        resp.backdrop_path
      }"); background-size: cover; background-position: center;'></div>
      <div class="movie-cont">
        <div class="movie-more">
          <img src="https://image.tmdb.org/t/p/w500${
            resp.poster_path
          }" alt="Here should be a poster." />
          <div class="descrpition">
            <div class="description-heading">
              <button class="close"><div></div></button>
              <p class="title">${resp.title}</p>
              <div class="generes-length">
                <p class="generes"></p>
                <div class="movie-length">
                  <p>${resp.runtime} min</p>
                </div>
              </div>
              <div class="line"></div>
              <div class="info">
                <div class="rating">
                  <p class="rating1"><b>${resp.vote_average}</b>/10</p>
                  <p class="rating2">rating</p>
                </div>
                <div class="realise">
                  <p class="realise1">${resp.release_date}</p>
                  <p class="realise2">realise date</p>
                </div>
              </div>
            </div>
            <div class="description-text">${resp.overview}</div>
            <div class="buttons">
              <div class="btn-seemore"><a href='https://www.imdb.com/title/${
                resp.imdb_id
              }' target='_blank'>See more</a></div>
              <div class="btn-towatchlist">To watchlist</div>
            </div>
          </div>
        </div>
      </div>`;
  body.appendChild(moviePopup);
  document.querySelector('.close').addEventListener('click', () => {
    body.removeChild(moviePopup);
  });
}

function searchMovies(query) {
  const searchOutputs = document.querySelector('.search-outputs');
  if (query === '') {
    searchOutputs.innerHTML = '';
    return;
  }

  fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=485dd1f1ee71083619712efed20ee4bb&language=en-US&query=${query}&page=1&include_adult=false`
  )
    .then(resp => resp.json())
    .then(resp => {
      document.querySelector('.search-outputs').innerHTML = '';
      const items = resp.results;
      items.map(each =>
        document
          .querySelector('.search-outputs')
          .appendChild(appendToOutputs(each))
      );
      document.querySelectorAll('.output').forEach(each => {
        each.addEventListener('click', () => {
          buildMore(each.dataset.key);
          document.querySelector('.search-outputs').innerHTML = '';
        });
      });
    });
}

function appendToOutputs(obj) {
  const output = document.createElement('div');
  output.classList.add('output');
  output.dataset.key = obj.id;
  output.innerHTML = `
  ${
    obj.poster_path
      ? `<img src='https://image.tmdb.org/t/p/w200${obj.poster_path}'/>`
      : ''
  }
    <p class="output-title">${obj.title} (${obj.release_date.split('-')[0]})</p>
  `;
  return output;
}

function debounce(func, wait = 20, immediate = true) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
