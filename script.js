
const gallery = document.querySelector("#gallery");
const searchInput = document.querySelector("#search");
const count = document.querySelector("#count");
const empty = document.querySelector("#empty");

const viewer = document.querySelector("#viewer");
const viewerImage = document.querySelector("#viewer-image");
const caption = document.querySelector("#caption");
const download = document.querySelector("#download");

let images = [];
let visibleImages = [];
let activeIndex = 0;

document.querySelector("#year").textContent =
  new Date().getFullYear();

function filename(path) {
  return decodeURIComponent(path.split("/").pop());
}

function render(list) {
  visibleImages = list;
  gallery.replaceChildren();

  count.textContent = `${images.length} / 100`;
  empty.hidden = list.length !== 0;

  if (!list.length) {
    gallery.innerHTML =
      '<p class="status">No images found.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  list.forEach((src, index) => {
    const button = document.createElement("button");
    button.className = "photo";
    button.type = "button";

    const img = document.createElement("img");
    img.src = src;
    img.alt = filename(src);
    img.loading = "lazy";
    img.decoding = "async";

    button.append(img);

    button.addEventListener("click", () => {
      openViewer(index);
    });

    fragment.append(button);
  });

  gallery.append(fragment);
}

function openViewer(index) {
  if (!visibleImages.length) return;

  activeIndex =
    (index + visibleImages.length) % visibleImages.length;

  const src = visibleImages[activeIndex];

  viewerImage.src = src;
  viewerImage.alt = filename(src);
  caption.textContent = filename(src);

  download.href = src;
  download.download = filename(src);

  if (!viewer.open) {
    viewer.showModal();
  }
}

function moveViewer(step) {
  openViewer(activeIndex + step);
}

// Viewer controls

document.querySelector("#close").addEventListener(
  "click",
  () => viewer.close()
);

document.querySelector("#prev").addEventListener(
  "click",
  () => moveViewer(-1)
);

document.querySelector("#next").addEventListener(
  "click",
  () => moveViewer(1)
);

viewer.addEventListener("click", event => {
  if (event.target === viewer) {
    viewer.close();
  }
});

// Keyboard navigation

document.addEventListener("keydown", event => {
  if (!viewer.open) return;

  if (event.key === "ArrowLeft") {
    moveViewer(-1);
  }

  if (event.key === "ArrowRight") {
    moveViewer(1);
  }
});

// Search

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = images.filter(src =>
    filename(src).toLowerCase().includes(query)
  );

  render(filtered);
});

// Load image list

async function loadGallery() {
  try {
    const response = await fetch(
      `gallery.json?v=${Date.now()}`
    );

    if (!response.ok) {
      throw new Error("Gallery JSON unavailable");
    }

    const data = await response.json();

    if (!Array.isArray(data.images)) {
      throw new Error("Invalid gallery format");
    }

    images = data.images.slice(0, 100);

    render(images);

  } catch (error) {
    gallery.innerHTML =
      '<p class="status">Unable to load gallery. Please try again later.</p>';

    console.error(error);
  }
}

loadGallery();
