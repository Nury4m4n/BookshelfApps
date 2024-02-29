const bookshelfApps = [];
const RENDER_EVENT = 'render-bookshelf';
const SAVED_EVENT = 'saved-bookshelf';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year: parseInt(year),
    isComplete,
  };
}

function findBook(bookId) {
  for (const bookItem of bookshelfApps) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in bookshelfApps) {
    if (bookshelfApps[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof Storage === 'undefined') {
    alert('Browser tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(bookshelfApps);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      bookshelfApps.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const textTitle = document.createElement('h2');
  textTitle.innerText = title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = 'Penulis: ' + author;

  const textYear = document.createElement('p');
  textYear.innerText = 'Tahun: ' + year;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement('div');
  container.classList.add('book_item', 'shadow');
  container.append(textContainer);
  container.setAttribute('id', `book-${id}`);

  if (isComplete) {
    const markIncompleteButton = document.createElement('button');
    markIncompleteButton.classList.add('green');
    markIncompleteButton.innerText = 'Belum Selesai dibaca';
    markIncompleteButton.addEventListener('click', () => markIncomplete(id));

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('red');
    deleteButton.innerText = 'Hapus buku';
    deleteButton.addEventListener('click', () => deleteBook(id));

    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action');
    actionContainer.append(markIncompleteButton, deleteButton);

    container.append(actionContainer);
  } else {
    const markCompleteButton = document.createElement('button');
    markCompleteButton.classList.add('green');
    markCompleteButton.innerText = 'Selesai dibaca';
    markCompleteButton.addEventListener('click', () => markComplete(id));

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('red');
    deleteButton.innerText = 'Hapus buku';
    deleteButton.addEventListener('click', () => deleteBook(id));

    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action');
    actionContainer.append(markCompleteButton, deleteButton);

    container.append(actionContainer);
  }

  return container;
}

function addBook() {
  const title = document.querySelector('#inputBookTitle').value;
  const author = document.querySelector('#inputBookAuthor').value;
  const year = document.querySelector('#inputBookYear').value;
  const isComplete = document.querySelector('#inputBookIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
  bookshelfApps.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  document.querySelector('#inputBookTitle').value = '';
  document.querySelector('#inputBookAuthor').value = '';
  document.querySelector('#inputBookYear').value = '';
}

function markComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  const confirmMessage = confirm("Apakah Anda yakin ingin memindahkan buku ini ke 'Selesai dibaca'?");

  if (confirmMessage) {
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function markIncomplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  const confirmMessage = confirm("Apakah Anda yakin ingin memindahkan buku ini ke 'Belum selesai dibaca'?");

  if (confirmMessage) {
    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function deleteBook(bookId) {
  const bookTargetIndex = findBookIndex(bookId);

  if (bookTargetIndex === -1) return;

  const confirmMessage = confirm('Apakah Anda yakin ingin menghapus buku ini?');

  if (confirmMessage) {
    bookshelfApps.splice(bookTargetIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  const searchForm = document.getElementById('searchBook');
  const saveCheckbox = document.getElementById('inputBookIsComplete');

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const query = document.getElementById('searchBookTitle').value;
    query ? renderBooks(filterBooks(query)) : renderBooks(bookshelfApps);
  });

  saveCheckbox.addEventListener('change', function () {
    if (saveCheckbox.checked) {
      addBook();
      saveCheckbox.checked = false;
    }
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, () => {
  console.log('Data berhasil di simpan.');
});

document.addEventListener(RENDER_EVENT, function () {
  renderBooks(bookshelfApps);
});

function renderBooks(books) {
  const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  const completeBookshelfList = document.getElementById('completeBookshelfList');

  incompleteBookshelfList.innerHTML = '';
  completeBookshelfList.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      completeBookshelfList.append(bookElement);
    } else {
      incompleteBookshelfList.append(bookElement);
    }
  }
}

function filterBooks(query) {
  return bookshelfApps.filter(function (book) {
    return book.title.toLowerCase().includes(query.toLowerCase());
  });
}
