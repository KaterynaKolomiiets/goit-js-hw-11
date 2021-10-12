import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';


const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '23803222-9b3ffdbc29f05e2c5cc8bf419';
const ITEMS_PER_PAGE = 40;

let currentPage = 1;

const sendServerRequest = async function () {
  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: formEl.elements.searchQuery.value,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: ITEMS_PER_PAGE,
    page: currentPage,
  });
  const url = `${BASE_URL}?${searchParams}`;
  try {
    const response = await axios.get(url);
    if (response.status >= 400 && response.status < 500) {
      throw new Error ("Oops, something went wrong")
    }
    return response;
  } catch (error) {
    Notify.failure('Something went terribly wrong.. Better luck next time!');
  }
};
const fetchImages = async function (e) {
  e.preventDefault();
  clearGallery();
  currentPage = 1;

  if (!loadMoreBtn.classList.contains('visually-hidden')) {
    loadMoreBtn.classList.add('visually-hidden');
  }

  const serverResponse = await sendServerRequest();
  if (serverResponse.data.hits.length === 0) {
    Notify.warning('Sorry, there are no images matching your search query. Please try again.');
    return;
  }

  const {
    data: { totalHits, hits },
  } = await sendServerRequest();
  renderMarkup(hits);

  loadMoreBtn.classList.remove('visually-hidden');

  checkRemainingItems(totalHits);
};
function renderMarkup(hits) {
  let markup = hits
    .map(item => {
      return `<div class="photo-card">
          <div class="image" style="background-image:url('${item.webformatURL}')" alt="${item.tags}" loading="lazy" ></div>
          <div class="info">
            <p class="info-item">
              <b>Likes</b><span>${item.likes}</span>
            </p>
            <p class="info-item">
              <b>Views</b><span>${item.views}</span>
            </p>
            <p class="info-item">
              <b>Comments</b><span>${item.comments}</span>
            </p>
            <p class="info-item">
              <b>Downloads</b><span>${item.downloads}</span>
            </p>
          </div>
        </div>`;
    })
    .join('');
  galleryEl.insertAdjacentHTML('beforeend', markup);
}
const clearGallery = function () {
  galleryEl.innerHTML = '';
};
const onLoadMore = async function () {
  currentPage += 1;
  const {
    data: { totalHits, hits },
  } = await sendServerRequest();
  renderMarkup(hits);
  checkRemainingItems(totalHits);
};
const checkRemainingItems = function (totalHits) {
  if (document.querySelectorAll('.photo-card').length >= totalHits) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    loadMoreBtn.classList.add('visually-hidden');
  }
};

formEl.addEventListener('submit', fetchImages);
loadMoreBtn.addEventListener('click', onLoadMore);