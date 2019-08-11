/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
const key = '485dd1f1ee71083619712efed20ee4bb';
const body = document.querySelector('body');
const header = document.querySelector('header');
const headerText = document.querySelector('.todays-trending');
const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

window.onload = function() {
  fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${key}`)
    .then(resp => resp.json())
    .then(resp => {
      const randomTrending =
        resp.results[Math.floor(Math.random() * resp.results.length)];
      TweenMax.set(headerText, { visibility: 'visible' });
      document.querySelector(
        '.bg'
      ).style.backgroundImage = `url('https://image.tmdb.org/t/p/original${
        randomTrending.backdrop_path
      }')`;
      document.querySelector('header h2').innerHTML = randomTrending.title;
      const seeMore = document.querySelector('.todays-more');
      seeMore.dataset.key = randomTrending.id;
      seeMore.addEventListener('click', () => {
        showMore(seeMore.dataset.key);
      });

      TweenMax.set(headerText, { visibility: 'visible' });
      TweenMax.from(header, 0.35, { opacity: 0.2 });
      TweenMax.from(headerText, 0.3, { visibility: 'visible', x: '-140%' });
    });

  fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${key}`)
    .then(resp => resp.json())
    .then(resp => {
      resp.results.forEach(e => {
        document
          .querySelector('.trending-week>.movie-grid')
          .appendChild(createPoster(e));
      });
      const posters = document.querySelectorAll('.movie');
      TweenMax.staggerFrom(posters, 0.18, { opacity: 0, y: -30 }, 0.14);
      posters.forEach(movie => {
        movie.addEventListener('click', () => {
          showMore(movie.dataset.key);
        });
      });
    });
  buildWatchList();

  document.querySelector('.input-search').addEventListener(
    'keyup',
    debounce(() => {
      searchMovies(document.querySelector('.input-search').value);
    }, 80)
  );

  document.querySelector('.watchlist-link').addEventListener('click', () => {
    document.querySelector('.watchlist').classList.add('watchlist-show');

    document.querySelector('.close-watchlist').addEventListener('click', () => {
      document.querySelector('.watchlist').classList.remove('watchlist-show');
    });
  });
};

function createPoster(element) {
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

async function showMore(id) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=485dd1f1ee71083619712efed20ee4bb&language=en-US`
  );
  let wlText;
  if (search(id, watchlist)) {
    wlText = await 'Remove from watchlist';
  } else {
    wlText = await 'To watchlist';
  }
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
              <button class="close close-more"><div></div></button>
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
                  <p class="rating2">${resp.vote_count} votes</p>
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
              <div class="btn-towatchlist">${wlText}</div>
            </div>
          </div>
        </div>
      </div>`;
  body.appendChild(moviePopup);
  TweenMax.from(moviePopup, 0.2, { opacity: 0 });
  document.querySelector('.close-more').addEventListener('click', () => {
    TweenMax.to(moviePopup, 0.2, { opacity: 0 });
    setTimeout(() => {
      body.removeChild(moviePopup);
    }, 250);
  });

  document.querySelector('.btn-towatchlist').dataset.key = resp.id;
  document.querySelector('.btn-towatchlist').addEventListener('click', e => {
    switchInWatchlist(e.target.dataset.key);
    buildWatchList();
    if (search(id, watchlist)) {
      document.querySelector('.btn-towatchlist').innerHTML =
        'Remove from watchlist';
    } else {
      document.querySelector('.btn-towatchlist').innerHTML = 'To watchlist';
    }
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
          showMore(each.dataset.key);
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
    // eslint-disable-next-line prefer-rest-params
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

function search(nameKey, myArray) {
  for (let i = 0; i < myArray.length; i += 1) {
    if (myArray[i].id === nameKey) {
      return myArray[i];
    }
  }
}

function switchInWatchlist(id) {
  if (search(id, watchlist)) {
    const temp = search(id, watchlist);
    watchlist.splice(watchlist.indexOf(temp), 1);
  } else {
    const movie = {
      id,
    };
    watchlist.push(movie);
  }

  localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

function buildWatchList() {
  const wl = document.querySelector('.movies');
  wl.innerHTML = '';
  watchlist.map(async el => {
    await wl.appendChild(await createWatchlistEl(el));
    const watchlistMovie = document.querySelector(
      `.watchlist-movie[data-key="${el.id}"] `
    );
    const closeBtn = document.querySelector(
      `.watchlist-movie[data-key="${el.id}"]>.close`
    );
    watchlistMovie.addEventListener('click', e => {
      if (
        e.target.parentNode.classList[0].includes('close') ||
        e.target.classList[0].includes('close')
      )
        return;
      showMore(el.id);
    });
    closeBtn.addEventListener('click', () => {
      const temp = search(el.id, watchlist);
      watchlist.splice(watchlist.indexOf(temp), 1);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
      buildWatchList();
    });
  });
}

async function createWatchlistEl(obj) {
  if (obj.title) {
    const movieDiv = await document.createElement('div');
    await movieDiv.classList.add('watchlist-movie');
    movieDiv.dataset.key = await obj.id;
    movieDiv.innerHTML = await `
      <button class="close remove-watchlist"><div></div></button>
      <img src="https://image.tmdb.org/t/p/w200${obj.poster_path}" />
      <p class="title">${obj.title}</p>
    `;
    return movieDiv;
  }
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${
      obj.id
    }?api_key=485dd1f1ee71083619712efed20ee4bb&language=en-US`
  );
  const resp = await response.json();

  const temp = search(obj.id, watchlist);
  const newObj = temp;
  newObj.title = resp.title;
  newObj.poster_path = resp.poster_path;
  watchlist.splice(watchlist.indexOf(temp), 1, newObj);
  localStorage.setItem('watchlist', JSON.stringify(watchlist));

  const movie = await document.createElement('div');
  await movie.classList.add('watchlist-movie');
  movie.dataset.key = await resp.id;
  movie.innerHTML = await `
      <button class="close remove-watchlist"><div></div></button>
      <img src="https://image.tmdb.org/t/p/w200${resp.poster_path}" />
      <p class="title">${resp.title}</p>
    `;
  return movie;
}
