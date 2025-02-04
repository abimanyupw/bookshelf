const storageKey = "STORAGE_KEY";
const formAddingBook = document.getElementById("bookForm");
const formSearchingBook = document.getElementById("searchBook");

let currentImageURL = null; // Variabel untuk menyimpan URL gambar sementara

// Menangani preview gambar
document
  .getElementById("bookFormImage")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        currentImageURL = e.target.result; // Menyimpan URL gambar sementara
        document.getElementById("imagePreview").src = e.target.result;
        document.getElementById("imagePreviewContainer").style.display =
          "block"; // Menampilkan preview
      };
      reader.readAsDataURL(file);
    }
  });

// Menambahkan buku baru atau mengedit buku
formAddingBook.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = parseInt(document.getElementById("bookFormYear").value);
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const idTemp = document.getElementById("bookFormTitle").name;

  // Update buku jika sudah ada
  if (idTemp !== "") {
    const bookData = GetBookList();
    for (let index = 0; index < bookData.length; index++) {
      if (bookData[index].id == idTemp) {
        bookData[index].title = title;
        bookData[index].author = author;
        bookData[index].year = year;
        bookData[index].isComplete = isComplete;
        bookData[index].imageURL = currentImageURL; // Menyimpan URL gambar
      }
    }
    localStorage.setItem(storageKey, JSON.stringify(bookData));
    ResetAllForm(); // Reset form after updating a book
    RenderBookList(bookData);
    return;
  }

  // Menambahkan buku baru
  const id =
    JSON.parse(localStorage.getItem(storageKey)) === null
      ? 0 + Date.now()
      : JSON.parse(localStorage.getItem(storageKey)).length + Date.now();
  const newBook = {
    id: id,
    title: title,
    author: author,
    year: year,
    isComplete: isComplete,
    imageURL: currentImageURL, // Menyimpan URL gambar
  };

  PutBookList(newBook);
  ResetAllForm(); // Reset form after adding a new book
  const bookData = GetBookList();
  RenderBookList(bookData);
});

// Fungsi untuk menambahkan buku ke dalam localStorage
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

// Fungsi untuk menampilkan daftar buku
function RenderBookList(bookData) {
  if (!bookData || bookData.length === 0) {
    console.log("Tidak ada buku untuk ditampilkan.");
    return;
  }

  const containerIncomplete = document.getElementById("incompleteBookList");
  const containerComplete = document.getElementById("completeBookList");

  containerIncomplete.innerHTML = "";
  containerComplete.innerHTML = "";

  for (let book of bookData) {
    const { id, title, author, year, isComplete, imageURL } = book;

    let bookItem = document.createElement("div");
    bookItem.classList.add("book_item");
    bookItem.setAttribute("data-bookid", id);
    bookItem.setAttribute("data-testid", "bookItem");

    // Menampilkan gambar jika ada
    const imgElement = document.createElement("img");
    imgElement.src = imageURL || "img/default-image.jpg"; // Menampilkan gambar, atau gambar default jika tidak ada
    imgElement.alt = "Cover Buku";
    imgElement.style.maxWidth = "100px"; // Gaya untuk gambar

    let bookItemTitle = document.createElement("h3");
    bookItemTitle.setAttribute("data-testid", "bookItemTitle");
    bookItemTitle.innerText = title;

    let bookItemAuthor = document.createElement("p");
    bookItemAuthor.setAttribute("data-testid", "bookItemAuthor");
    bookItemAuthor.innerText = "Penulis: " + author;

    let bookItemYear = document.createElement("p");
    bookItemYear.setAttribute("data-testid", "bookItemYear");
    bookItemYear.innerText = "Tahun: " + year;

    let containerActionItem = document.createElement("div");

    const greenButton = CreateGreenButton(book, function () {
      isCompleteBookHandler(bookItem);
      const bookData = GetBookList();
      RenderBookList(bookData);
    });

    const redButton = CreateRedButton(function () {
      DeleteAnItem(bookItem);
      const bookData = GetBookList();
      RenderBookList(bookData);
    });

    const yellowButton = CreateYellowButton(function () {
      UpdateAnItem(bookItem);
    });

    containerActionItem.append(greenButton, redButton, yellowButton);
    bookItem.append(
      imgElement,
      bookItemTitle,
      bookItemAuthor,
      bookItemYear,
      containerActionItem
    );

    if (isComplete) {
      containerComplete.append(bookItem);
    } else {
      containerIncomplete.append(bookItem);
    }
  }
}

// Fungsi untuk mengambil data buku dari localStorage
function GetBookList() {
  if (CheckForStorage()) {
    const bookData = JSON.parse(localStorage.getItem(storageKey));
    console.log("Data Buku yang diambil:", bookData);
    return bookData || [];
  }
  return [];
}

// Fungsi untuk memeriksa apakah Storage didukung
function CheckForStorage() {
  return typeof Storage !== "undefined";
}

// Fungsi untuk menghapus buku dari list
function DeleteAnItem(itemElement) {
  const bookData = GetBookList();
  const id = itemElement.getAttribute("data-bookid");
  const updatedData = bookData.filter((book) => book.id != id);
  localStorage.setItem(storageKey, JSON.stringify(updatedData));
}

// Fungsi untuk mengedit buku
function UpdateAnItem(itemElement) {
  const bookData = GetBookList();
  const id = itemElement.getAttribute("data-bookid");
  const book = bookData.find((book) => book.id == id);

  document.getElementById("bookFormTitle").value = book.title;
  document.getElementById("bookFormAuthor").value = book.author;
  document.getElementById("bookFormYear").value = book.year;
  document.getElementById("bookFormIsComplete").checked = book.isComplete;
  document.getElementById("bookFormTitle").name = book.id;
  currentImageURL = book.imageURL; // Set gambar yang ada

  // Menampilkan gambar yang sudah diupload sebelumnya
  if (book.imageURL) {
    document.getElementById("imagePreview").src = book.imageURL;
    document.getElementById("imagePreviewContainer").style.display = "block";
  }
}

// Fungsi untuk mengubah status selesai dibaca
function isCompleteBookHandler(itemElement) {
  const bookData = GetBookList();
  const id = itemElement.getAttribute("data-bookid");
  const book = bookData.find((book) => book.id == id);
  book.isComplete = !book.isComplete;
  localStorage.setItem(storageKey, JSON.stringify(bookData));
}

// Fungsi reset form
function ResetAllForm() {
  document.getElementById("bookFormTitle").value = "";
  document.getElementById("bookFormAuthor").value = "";
  document.getElementById("bookFormYear").value = "";
  document.getElementById("bookFormIsComplete").checked = false;
  document.getElementById("imagePreviewContainer").style.display = "none";
  document.getElementById("bookFormTitle").name = "";
  currentImageURL = null;
}

// Fungsi untuk membuat tombol "Selesai Dibaca"
function CreateGreenButton(book, onClickCallback) {
  const greenButton = document.createElement("button");
  greenButton.classList.add("green");
  greenButton.innerText = book.isComplete ? "Belum Dibaca" : "Selesai dibaca"; // Update button text based on completion status
  greenButton.addEventListener("click", function () {
    onClickCallback(book);
  });
  return greenButton;
}

// Fungsi untuk membuat tombol "Hapus Buku"
function CreateRedButton(onClickCallback) {
  const redButton = document.createElement("button");
  redButton.classList.add("red");
  redButton.innerText = "Hapus Buku";
  redButton.addEventListener("click", function () {
    onClickCallback();
  });
  return redButton;
}

// Fungsi untuk membuat tombol "Edit Buku"
function CreateYellowButton(onClickCallback) {
  const yellowButton = document.createElement("button");
  yellowButton.classList.add("yellow");
  yellowButton.innerText = "Edit Buku";
  yellowButton.addEventListener("click", function () {
    onClickCallback();
  });
  return yellowButton;
}

// Menangani pencarian buku berdasarkan judul
formSearchingBook.addEventListener("submit", function (event) {
  event.preventDefault();

  const searchTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();

  // Mengambil data buku yang ada
  const bookData = GetBookList();

  // Memfilter buku berdasarkan judul
  const filteredBooks = bookData.filter((book) => {
    return book.title.toLowerCase().includes(searchTitle);
  });

  // Menampilkan buku yang sesuai dengan pencarian
  RenderBookList(filteredBooks);

  // User feedback if no books found
  if (filteredBooks.length === 0) {
    alert("Tidak ada buku yang ditemukan dengan judul tersebut.");
  }
});

// Menampilkan buku pada saat pertama kali halaman dimuat
window.addEventListener("load", function () {
  if (CheckForStorage() && localStorage.getItem(storageKey)) {
    const bookData = GetBookList();
    RenderBookList(bookData);
  }
});
