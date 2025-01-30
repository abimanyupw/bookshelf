const storageKey = "STORAGE_KEY";

const formAddingBook = document.getElementById("bookForm");
const formSearchingBook = document.getElementById("searchBook");

function CheckForStorage() {
  return typeof Storage !== "undefined";
}

formAddingBook.addEventListener("submit", function (event) {
  event.preventDefault();
  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = parseInt(document.getElementById("bookFormYear").value);
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const idTemp = document.getElementById("bookFormTitle").name;
  if (idTemp !== "") {
    const bookData = GetBookList();
    for (let index = 0; index < bookData.length; index++) {
      if (bookData[index].id == idTemp) {
        bookData[index].title = title;
        bookData[index].author = author;
        bookData[index].year = year;
        bookData[index].isComplete = isComplete;
      }
    }
    localStorage.setItem(storageKey, JSON.stringify(bookData));
    ResetAllForm();
    RenderBookList(bookData);
    return;
  }

  const id = JSON.parse(localStorage.getItem(storageKey)) === null ? 0 + Date.now() : JSON.parse(localStorage.getItem(storageKey)).length + Date.now();
  const newBook = {
    id: id,
    title: title,
    author: author,
    year: year,
    isComplete: isComplete,
  };

  PutBookList(newBook);

  const bookData = GetBookList();
  RenderBookList(bookData);
});

function PutBookList(data) {
  if (CheckForStorage()) {
    let bookData = [];

    if (localStorage.getItem(storageKey) !== null) {
      bookData = JSON.parse(localStorage.getItem(storageKey));
    }

    bookData.push(data);
    localStorage.setItem(storageKey, JSON.stringify(bookData));
  }
}

function RenderBookList(bookData) {
  if (bookData === null) {
    return;
  }

  const containerIncomplete = document.getElementById("incompleteBookList");
  const containerComplete = document.getElementById("completeBookList");

  containerIncomplete.innerHTML = "";
  containerComplete.innerHTML = "";
  for (let book of bookData) {
    const id = book.id;
    const title = book.title;
    const author = book.author;
    const year = book.year;
    const isComplete = book.isComplete;

    //create isi item
    let bookItem = document.createElement("div");
    bookItem.classList.add("book_item");
    bookItem.setAttribute("data-bookid", id);
    bookItem.setAttribute("data-testid", "bookItem");

    let bookItemTitle = document.createElement("h3");
    bookItemTitle.setAttribute("data-testid", "bookItemTitle");
    bookItemTitle.innerText = title;

    let bookItemAuthor = document.createElement("p");
    bookItemAuthor.setAttribute("data-testid", "bookItemAuthor");
    bookItemAuthor.innerText = "Penulis: " + author;

    let bookItemYear = document.createElement("p");
    bookItemYear.setAttribute("data-testid", "bookItemYear");
    bookItemYear.innerText = "Tahun: " + year;

    //container action item
    let containerActionItem = document.createElement("div");

    //green button
    const greenButton = CreateGreenButton(book, function (event) {
      isCompleteBookHandler(event.target.parentElement.parentElement);

      const bookData = GetBookList();
      ResetAllForm();
      RenderBookList(bookData);
    });
    greenButton.setAttribute("data-testid", "bookItemIsCompleteButton");

    //red button
    const redButton = CreateRedButton(function (event) {
      DeleteAnItem(event.target.parentElement.parentElement);

      const bookData = GetBookList();
      ResetAllForm();
      RenderBookList(bookData);
    });
    redButton.setAttribute("data-testid", "bookItemDeleteButton");

    //yellow button (tombol edit)
    const yellowButton = CreateYellowButton(function (event) {
      UpdateAnItem(event.target.parentElement.parentElement);
    });
    yellowButton.setAttribute("data-testid", "bookItemEditButton");

    containerActionItem.append(greenButton, redButton, yellowButton);

    bookItem.append(bookItemTitle, bookItemAuthor, bookItemYear, containerActionItem);

    //incomplete book
    if (isComplete === false) {
      containerIncomplete.append(bookItem);
      bookItem.childNodes[0].addEventListener("click", function (event) {
        UpdateAnItem(event.target.parentElement);
      });

      continue;
    }

    //complete book
    containerComplete.append(bookItem);

    bookItem.childNodes[0].addEventListener("click", function (event) {
      UpdateAnItem(event.target.parentElement);
    });
  }
}

function CreateGreenButton(book, eventListener) {
  const isSelesai = book.isComplete ? "Belum selesai" : "Selesai";

  const greenButton = document.createElement("button");
  greenButton.classList.add("green");
  greenButton.innerText = isSelesai + " di Baca";
  greenButton.addEventListener("click", function (event) {
    eventListener(event);
  });
  return greenButton;
}

function CreateRedButton(eventListener) {
  const redButton = document.createElement("button");
  redButton.classList.add("red");
  redButton.innerText = "Hapus buku";
  redButton.addEventListener("click", function (event) {
    eventListener(event);
  });
  return redButton;
}

// Menambahkan tombol kuning untuk edit
function CreateYellowButton(eventListener) {
  const yellowButton = document.createElement("button");
  yellowButton.classList.add("yellow");
  yellowButton.innerText = "Edit Buku";
  yellowButton.addEventListener("click", function (event) {
    eventListener(event);
  });
  return yellowButton;
}

function isCompleteBookHandler(itemElement) {
  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }

  const title = itemElement.childNodes[0].innerText;
  const titleNameAttribut = itemElement.getAttribute("data-bookid");
  for (let index = 0; index < bookData.length; index++) {
    if (bookData[index].title === title && bookData[index].id == titleNameAttribut) {
      bookData[index].isComplete = !bookData[index].isComplete;
      break;
    }
  }
  localStorage.setItem(storageKey, JSON.stringify(bookData));
}

function SearchBookList(title) {
  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }

  const bookList = [];

  for (let index = 0; index < bookData.length; index++) {
    const tempTitle = bookData[index].title.toLowerCase();
    const tempTitleTarget = title.toLowerCase();
    if (bookData[index].title.includes(title) || tempTitle.includes(tempTitleTarget)) {
      bookList.push(bookData[index]);
    }
  }
  return bookList;
}

function GreenButtonHandler(parentElement) {
  let book = isCompleteBookHandler(parentElement);
  book.isComplete = !book.isComplete;
}

function GetBookList() {
  if (CheckForStorage) {
    return JSON.parse(localStorage.getItem(storageKey));
  }
  return [];
}

function DeleteAnItem(itemElement) {
  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }

  const titleNameAttribut = itemElement.getAttribute("data-bookid");
  for (let index = 0; index < bookData.length; index++) {
    if (bookData[index].id == titleNameAttribut) {
      bookData.splice(index, 1);
      break;
    }
  }

  localStorage.setItem(storageKey, JSON.stringify(bookData));
}

function UpdateAnItem(itemElement) {
  if (itemElement.id === "incompleteBookList" || itemElement.id === "completeBookList") {
    return;
  }

  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }

  const title = itemElement.childNodes[0].innerText;
  const author = itemElement.childNodes[1].innerText.slice(9, itemElement.childNodes[1].innerText.length);
  const getYear = itemElement.childNodes[2].innerText.slice(7, itemElement.childNodes[2].innerText.length);
  const year = parseInt(getYear);

  const isComplete = itemElement.childNodes[3].childNodes[0].innerText.length === "Selesai di baca".length ? false : true;

  const id = itemElement.getAttribute("data-bookid");
  document.getElementById("bookFormTitle").value = title;
  document.getElementById("bookFormTitle").name = id;
  document.getElementById("bookFormAuthor").value = author;
  document.getElementById("bookFormYear").value = year;
  document.getElementById("bookFormIsComplete").checked = isComplete;

  for (let index = 0; index < bookData.length; index++) {
    if (bookData[index].id == id) {
      bookData[index].id = id;
      bookData[index].title = title;
      bookData[index].author = author;
      bookData[index].year = year;
      bookData[index].isComplete = isComplete;
    }
  }
  localStorage.setItem(storageKey, JSON.stringify(bookData));
}

searchBook.addEventListener("submit", function (event) {
  event.preventDefault();
  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }

  const title = document.getElementById("searchBookTitle").value;
  if (title === null) {
    RenderBookList(bookData);
    return;
  }
  const bookList = SearchBookList(title);
  RenderBookList(bookList);
});

function ResetAllForm() {
  document.getElementById("bookFormTitle" ).value = "";
  document.getElementById("bookFormAuthor").value = "";
  document.getElementById("bookFormYear").value = "";
  document.getElementById("bookFormIsComplete").checked = false;

  document.getElementById("searchBookTitle").value = "";
}

window.addEventListener("load", function () {
  if (CheckForStorage) {
    if (localStorage.getItem(storageKey) !== null) {
      const bookData = GetBookList();
      RenderBookList(bookData);
    }
  } else {
    alert("Browser yang Anda gunakan tidak mendukung Web Storage");
  }
});