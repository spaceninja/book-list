/* eslint-env browser */
const booklistContent = document.getElementById('booklist-content');
const booklistError = document.getElementById('booklist-error');
const initialSortButton = document.getElementById('btn-sort-rating');
const sortButtons = document.querySelectorAll('[data-sort-by]');
const sortButtonsArray = Array.from(sortButtons);
const xhr = new XMLHttpRequest();
let books;

//
// Remove articles from strings for sorting
//
// https://stackoverflow.com/a/34347138
//
function removeArticles(str) {
  const words = str.split(' ');
  if (words.length <= 1) return str;
  if (words[0] === 'a' || words[0] === 'the' || words[0] === 'an') {
    return words.splice(1).join(' ');
  }
  return str;
}

//
// Sort an array by key
//
// https://stackoverflow.com/a/14463464
//
const sortByKey = function sortByKey(array, key) {
  return array.sort((a, b) => {
    let x = a[key];
    let y = b[key];

    if (typeof x === 'string') {
      x = removeArticles(x.toLowerCase());
    }
    if (typeof y === 'string') {
      y = removeArticles(y.toLowerCase());
    }
    if (x < y) {
      return -1;
    } else if (x > y) {
      return 1;
    }
    return 0;
  });
};

//
// Parse the book array and add new keys for sorting
//
const parseBooks = function parseBooks(input) {
  const bookArray = input;
  return bookArray;
};

//
// Convert book array into HTML
//
const buildHTML = function buildHTML(bookArray) {
  let content = '';

  // add a table row for each item in the book array
  for (let i = 0; i < bookArray.length; i += 1) {
    content +=
      `<tr><td>${bookArray[i].title}</td>` +
      `<td>${bookArray[i].author}</td>` +
      `<td class="num">${bookArray[i].rating}</td>` +
      `<td class="num">${bookArray[i].length}</td>` +
      `<td>${bookArray[i].series}</td></tr>`;
  }

  return content;
};

//
// Sort the book array and rebuild the HTML using the new sort
//
const sortBy = function sortBy() {
  sortByKey(books, this.dataset.sortBy);
  if (this.dataset.sortActive === 'true') {
    if (this.dataset.sortOrder === 'ascending') {
      booklistContent.innerHTML = buildHTML(books.reverse());
      this.dataset.sortOrder = 'descending';
    } else {
      booklistContent.innerHTML = buildHTML(books);
      this.dataset.sortOrder = 'ascending';
    }
  } else {
    sortButtonsArray.forEach((e) => {
      e.dataset.sortActive = 'false';
    });
    booklistContent.innerHTML = buildHTML(books);
    this.dataset.sortActive = 'true';
    this.dataset.sortOrder = 'ascending';
  }
};

//
// Add event listeners to sort buttons
//
sortButtonsArray.forEach((e) => {
  e.addEventListener('click', sortBy);
});

//
// Prepare and send the Ajax request, and deal with the response
//
xhr.open('GET', 'data/books.json', true);

xhr.onload = function ajaxOnLoad() {
  if (xhr.status >= 200 && xhr.status < 400) {
    books = parseBooks(JSON.parse(xhr.responseText));
    sortByKey(books, initialSortButton.dataset.sortBy);
    booklistContent.innerHTML = buildHTML(books.reverse());
    initialSortButton.dataset.sortOrder = 'descending';
    initialSortButton.dataset.sortActive = 'true';
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
