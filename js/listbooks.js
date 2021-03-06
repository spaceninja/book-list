/* global firstBy, widont */
/* eslint-env browser */
const booklistContent = document.getElementById('booklist-content');
const booklistError = document.getElementById('booklist-error');
const booklistSort = document.getElementById('booklist-sort');
const booklistFilter = document.getElementsByName('filter');
const bookTemplate = document.getElementById('book-template');
const xhr = new XMLHttpRequest();
let books = [];
let booksBackup = [];

//
// Format Author Name
// change from Last, First to First Last
//
const reverseName = function reverseName(name) {
  const fullName = name.split(', ');
  const lastName = fullName[0];
  const firstName = fullName[fullName.length - 1];
  if (fullName.length === 1) {
    return name;
  }
  return `${firstName} ${lastName}`;
};

//
// Parse the Book Data
// apply a few modifications to the data
//
const parseBooks = function parseBooks(input) {
  const bookArray = input;

  for (let i = 0; i < bookArray.length; i += 1) {
    bookArray[i].rating = bookArray[i].rating.toFixed(1);
    bookArray[i].displayAuthor = reverseName(bookArray[i].author);
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
      t.querySelector('.book--title').innerHTML = widont(bookArray[i].title);
      t.querySelector('.book--author').innerHTML = bookArray[i].displayAuthor;
      t.querySelector('.book--rating').innerHTML = bookArray[i].rating;
      t.querySelector('.book--length').innerHTML = bookArray[i].length;
      if (bookArray[i].series) {
        t.querySelector('.book--series').innerHTML = widont(bookArray[i].series);
      }
      if (bookArray[i].textSnippet) {
        t.querySelector('.book--snippet').innerHTML = bookArray[i].textSnippet;
      }
      if (bookArray[i].source) {
        t.querySelector('.book--source').innerHTML = bookArray[i].source;
      }
      if (bookArray[i].note) {
        t.querySelector('.book--note').innerHTML = bookArray[i].note;
      }
      if (bookArray[i].source && bookArray[i].note) {
        t.querySelector('.book--source').setAttribute('data-suffix', ':');
      }
      if (!bookArray[i].source && !bookArray[i].note) {
        t.querySelector('.book--recommendation').style.display = 'none';
      }
      if (bookArray[i].purchased) {
        t.querySelector('.book').classList.add('book--purchased');
      }
      if (bookArray[i].prioritize) {
        t.querySelector('.book').classList.add('book--prioritized');
      }

      booklistContent.appendChild(t);
    }
  } else {
    const error = 'Oh no! Your browser doesn\'t support templates!';
    booklistError.innerHTML = error;
  }
};

//
// Filter Book List
// Adds an event listener to each filter checkbox
// which filters book list by chosen key
// then re-applies the current sort method
//
booklistFilter.forEach((item) => {
  item.addEventListener('change', () => {
    // restore book list to unfiltered
    books = booksBackup;

    // filter the book list
    booklistFilter.forEach((checkbox) => {
      if (checkbox.checked) {
        books = books.filter(book => book[checkbox.value]);
      }
    });

    // sort by current selection
    booklistSort.dispatchEvent(new Event('change'));
  });
});

//
// Sort Book List
// Adds event listener to select menu
// which sorts book list by chosen method
//
booklistSort.addEventListener('change', (e) => {
  // define the sort method
  const sortOption = e.target.options[e.target.selectedIndex];

  // pass the sort method to sortByKeys
  sortByKeys(
    books,
    sortOption.value,
    sortOption.dataset.sortOrder,
    sortOption.dataset.sortSecondary,
    sortOption.dataset.sortSecondaryOrder,
  );

  // rebuild the DOM
  buildHTML(books);
});

//
// Prepare and send the Ajax request, and deal with the response
//
xhr.open('GET', 'data/books.json', true);

xhr.onload = function ajaxOnLoad() {
  if (xhr.status >= 200 && xhr.status < 400) {
    books = parseBooks(JSON.parse(xhr.responseText));
    booksBackup = books;
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
