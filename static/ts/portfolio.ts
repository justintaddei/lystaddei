document.addEventListener("scroll", () => {
  if (window.pageYOffset > 30) document.body.classList.add("header-filled");
  else document.body.classList.remove("header-filled");
});

document.querySelector(".nav-toggle").addEventListener("click", () => {
  document.body.classList.toggle("nav-open");
});

const imageContainer = document.querySelector("#portfolioImages");

async function loadImages() {
  const { uploads } = await fetch("/uploads/uploads.json").then(res =>
    res.json()
  );

  for (let i = 0; i < uploads.length; i++) {
    const img = document.createElement("img");
    img.addEventListener("load", () => {
      img.classList.add("loaded");
    });
    img.src = uploads[i];
    imageContainer.appendChild(img);
  }
}

loadImages();

imageContainer.addEventListener("click", e => {
  const target = e.target as HTMLElement;

  if (target.tagName !== "IMG") return;

  target.classList.toggle("big");
});
