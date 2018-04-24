/* global firstBy */
/* eslint-env browser */
const booklistContent = document.getElementById('booklist-content');
const booklistError = document.getElementById('booklist-error');
const booklistSort = document.getElementById('booklist-sort');
const bookTemplate = document.getElementById('book-template');
const xhr = new XMLHttpRequest();
let books = [];

//
// Parse the Book Data
//
const parseBooks = function parseBooks(input) {
  const bookArray = input;

  for (let i = 0; i < bookArray.length; i += 1) {
    bookArray[i].rating = bookArray[i].rating.toFixed(1);
  }

  return bookArray;
};

//
// Sort an array by keys
//
const sortByKeys = function sortByKeys(array, key1, key1Sort, key2, key2Sort) {
  const s1 = {
    ignoreCase: true,
    direction: key1Sort === 'descending' ? -1 : 0,
  };
  const s2 = {
    ignoreCase: true,
    direction: key2Sort === 'descending' ? -1 : 0,
  };
  const s = firstBy(key1, s1).thenBy(key2, s2);

  return array.sort(s);
};

//
// Convert book array into HTML
//
const buildHTML = function buildHTML(bookArray) {
  if ('content' in document.createElement('template')) {
    booklistContent.innerHTML = '';

    for (let i = 0; i < bookArray.length; i += 1) {
      const t = document.importNode(bookTemplate.content, true);

      t.querySelector('.book').id = bookArray[i].isbn;
      t.querySelector('.book--title').innerHTML = bookArray[i].title;
      t.querySelector('.book--author').innerHTML = bookArray[i].author;
      t.querySelector('.book--rating').innerHTML = bookArray[i].rating;
      t.querySelector('.book--length').innerHTML = bookArray[i].length;
      if (bookArray[i].series) {
        t.querySelector('.book--series').innerHTML = bookArray[i].series;
      }
      if (bookArray[i].source) {
        t.querySelector('.book--source').innerHTML = bookArray[i].source;
      }
      if (bookArray[i].note) {
        t.querySelector('.book--note').innerHTML = bookArray[i].note;
      }
      if (bookArray[i].textSnippet) {
        t.querySelector('.book--snippet').innerHTML = bookArray[i].textSnippet;
      }

      booklistContent.appendChild(t);
    }
  } else {
    const error = 'Oh no! Your browser doesn\'t support templates!';
    booklistError.innerHTML = error;
  }
};

//
// Sort array by selected option
//
const sortBy = function sortBy() {
  const sortOption = this.options[this.selectedIndex];

  sortByKeys(
    books,
    sortOption.value,
    sortOption.dataset.sortOrder,
    sortOption.dataset.sortSecondary,
    sortOption.dataset.sortSecondaryOrder,
  );

  buildHTML(books);
};

//
// Add event listener to select menu
//
booklistSort.addEventListener('change', sortBy);

//
// Prepare and send the Ajax request, and deal with the response
//
xhr.open('GET', 'data/books.json', true);

xhr.onload = function ajaxOnLoad() {
  if (xhr.status >= 200 && xhr.status < 400) {
    books = parseBooks(JSON.parse(xhr.responseText));
    booklistSort.dispatchEvent(new Event('change'));
  } else {
    const error = 'Whoops! Something went wrong. Please try again.';
    booklistError.innerHTML = error;
  }
};

xhr.onerror = function ajaxOnError() {
  const error = 'Whoops! We couldn\'t reach the server. Please try again.';
  booklistError.innerHTML = error;
};

xhr.send();
