import Notiflix from 'notiflix';

import { PixabayAPI } from './js/fetchPhotos';

import SimpleLightbox from 'simplelightbox';

import 'simplelightbox/dist/simple-lightbox.min.css';

const lightbox = new SimpleLightbox('.gallery a', {
  captionsDelay: 250,
});

const formEl = document.querySelector('#search-form');
const divEl = document.querySelector(`.gallery`);
const loadMorebtnEl = document.querySelector('.load-more');

const pixabayAPI = new PixabayAPI();

const perPage = pixabayAPI.perPage;

formEl.addEventListener('submit', onSearch);

loadMorebtnEl.addEventListener('click', onLoadBtn);

//

async function onSearch(evt) {
  evt.preventDefault();

  pixabayAPI.q = evt.target.elements.searchQuery.value.trim();

  if (!pixabayAPI.q) {
    divEl.innerHTML = '';
    loadMorebtnEl.classList.add('is-hidden');
    Notiflix.Notify.warning(`What should we search for?`);
    return;
  }
  // loadMorebtnEl.classList.add('is-hidden');
  pixabayAPI.page = 1;

  try {
    const { data } = await pixabayAPI.fetchPhotos();

    const totalPage = Math.ceil(data.totalHits / perPage);

    if (!data.hits.length) {
      divEl.innerHTML = '';
      throw new Error();
    } else if (totalPage === pixabayAPI.page) {
      // loadMorebtnEl.classList.remove('is-hidden');

      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images`);
      divEl.innerHTML = markupImg(data.hits);
      lightbox.refresh();
      // loadMorebtnEl.classList.remove('is-hidden');
      loadMorebtnEl.classList.add('is-hidden');

      return;
    }

    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images`);
    // loadMorebtnEl.classList.remove('is-hidden');
    divEl.innerHTML = markupImg(data.hits);
    loadMorebtnEl.classList.remove('is-hidden');
    lightbox.refresh();
  } catch (err) {
    loadMorebtnEl.classList.add('is-hiden');
    Notiflix.Notify.failure(
      `Sorry, there are no images matching your search query. Please try again`
    );
  }
}

async function onLoadBtn() {
  pixabayAPI.page += 1;

  try {
    const { data } = await pixabayAPI.fetchPhotos();

    const totalPage = Math.ceil(data.totalHits / perPage);

    if (!data.hits.length) {
      divEl.innerHTML = '';
      throw new Error();
    } else if (totalPage === pixabayAPI.page) {
      divEl.insertAdjacentHTML(`beforeend`, markupImg(data.hits));
      lightbox.refresh();
      loadMorebtnEl.classList.add('is-hidden');
      return;
    }

    divEl.insertAdjacentHTML(`beforeend`, markupImg(data.hits));
    loadMorebtnEl.classList.remove('is-hidden');
    lightbox.refresh();
  } catch (err) {
    Notiflix.Notify.failure(
      `We're sorry, but you've reached the end of search results`
    );
  }
}

function markupImg(images) {
  return images
    .map(
      ({
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
        largeImageURL,
      }) =>
        `<a class="gallery__link" href="${largeImageURL}">
      <div class="photo-card">
        <img
          class="gallery__img"
          src="${webformatURL}"
          alt="${tags}"
          loading="lazy"
        />
        <div class="info">
          <p class="info-item">
            <b>Likes ${likes}</b>
          </p>
          <p class="info-item">
            <b>Views ${views}</b>
          </p>
          <p class="info-item">
            <b>Comments ${comments}</b>
          </p>
          <p class="info-item">
            <b>Downloads ${downloads}</b>
          </p>
        </div>
      </div>
    </a>`
    )
    .join('');
}
