/* global firstBy */
/* eslint-env browser */
const booklistContent = document.getElementById('booklist-content');
const booklistError = document.getElementById('booklist-error');
const initialSortButton = document.getElementById('btn-sort-rating');
const sortButtons = document.querySelectorAll('[data-sort-by]');
const sortButtonsArray = Array.from(sortButtons);
const xhr = new XMLHttpRequest();
let books;

//
// Sort an array by keys
//
const sortByKey = function sortByKey(array, key1, key2, sortOrder) {
  let s = '';

  if (sortOrder === 'descending') {
    s = firstBy(key1, { ignoreCase: true, direction: -1 })
      .thenBy(key2, { ignoreCase: true, direction: -1 });
  } else {
    s = firstBy(key1, { ignoreCase: true })
      .thenBy(key2, { ignoreCase: true });
  }

  return array.sort(s);
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
      `<td>${bookArray[i].series || ''}</td></tr>\n`;
  }

  return content;
};

//
// Sort the book array and rebuild the HTML using the new sort
//
const sortBy = function sortBy() {
  sortByKey(
    books,
    this.dataset.sortBy,
    this.dataset.sortSecondary,
    this.dataset.sortOrder,
  );
  if (this.dataset.sortActive === 'true') {
    if (this.dataset.sortReverse === 'true') {
      booklistContent.innerHTML = buildHTML(books);
      this.dataset.sortReverse = false;
    } else {
      booklistContent.innerHTML = buildHTML(books.reverse());
      this.dataset.sortReverse = true;
    }
  } else {
    booklistContent.innerHTML = buildHTML(books);
    sortButtonsArray.forEach((e) => {
      e.dataset.sortActive = 'false';
      e.dataset.sortReverse = 'false';
    });
    this.dataset.sortActive = 'true';
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
    books = JSON.parse(xhr.responseText);
    sortByKey(
      books,
      initialSortButton.dataset.sortBy,
      initialSortButton.dataset.sortSecondary,
      initialSortButton.dataset.sortOrder,
    );
    booklistContent.innerHTML = buildHTML(books);
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
