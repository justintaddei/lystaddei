declare const ScrollMagic: any;
declare const anime: any;

/**
 * The first frame of the video
 */
const START_FRAME = 1;
/**
 * The last frame of the video
 */
const END_FRAME = 171;

/**
 * An array of `Image` objects at
 * indexes maps to their frame number
 */
const frameBucket = [];

/**
 * Returns the path to the image for a given frame number
 * @param frame  The frame number
 */
function imgPathFromFrame(frame: number) {
  let filename: String = frame.toString();

  if (frame < 10) filename = `00${frame}`;
  else if (frame < 100) filename = `0${frame}`;

  return `/imgs/${filename}.jpg`;
}

/**
 * Loads the image at frame `frame` into the frame bucket
 * @param frame The frame number
 */
function cacheFrame(frame: number) {
  const img = new Image();
  // Wait for the file to load before
  // adding it to the bucket so that
  // the canvas never loads a blank image
  img.onload = () => {
    frameBucket[frame] = img;
  };
  img.src = imgPathFromFrame(frame);
}

// Loop over all the frames and cache them
// for (let frame = START_FRAME; frame <= END_FRAME; frame++) cacheFrame(frame);

const welcomeSection = document.querySelector("#welcome") as HTMLDivElement;
/**
 * The HTML Canvas that the video will be played on
 */
const videoCanvas = document.querySelector(
  "#scrollingVideo"
) as HTMLCanvasElement;

/**
 * HTML Canvas context
 */
const videoCanvasContext = videoCanvas.getContext("2d");

const controller = new ScrollMagic.Controller();

const scrollDuration = 500;
const videoScene = new ScrollMagic.Scene({
  duration: scrollDuration,
  triggerElement: welcomeSection,
  triggerHook: 0
})
  // .addIndicators()
  .setPin(welcomeSection)
  .addTo(controller);

/**
 * The about of the video scene that has been scrolled through
 */
let amountScrolled = 0;
videoScene.on("update", (e: { scrollPos: number }) => {
  amountScrolled = e.scrollPos / scrollDuration;
});

/**
 * Constrains a number between a min and max value
 * @param num The number to constrain
 * @param min The minimum number
 * @param max The maximum number
 */
function constrain(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num));
}

/**
 * Returns the frame (image) at the position of the playhead
 * @param position The position of the playhead
 */
function getFrameAtPlayhead(position: number) {
  // Keep the playhead between the start and end frames
  const frame = constrain(
    Math.round(position * END_FRAME),
    START_FRAME,
    END_FRAME
  );

  return frameBucket[frame];
}

/**
 * The last image rendered to the canvas.
 * Used as a fallback in case the next frame isn't loaded yet
 */
let lastImgData = null;

function drawImageProp(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x?: any,
  y?: any,
  w?: any,
  h?: any,
  offsetX?: any,
  offsetY?: any
) {
  if (arguments.length === 2) {
    x = y = 0;
    w = ctx.canvas.width;
    h = ctx.canvas.height;
  }

  // default offset is center
  offsetX = typeof offsetX === "number" ? offsetX : 0.5;
  offsetY = typeof offsetY === "number" ? offsetY : 0.5;

  // keep bounds [0.0, 1.0]
  if (offsetX < 0) offsetX = 0;
  if (offsetY < 0) offsetY = 0;
  if (offsetX > 1) offsetX = 1;
  if (offsetY > 1) offsetY = 1;

  var iw = img.width as number,
    ih = img.height as number,
    r = Math.min(w / iw, h / ih),
    nw = iw * r, // new prop. width
    nh = ih * r, // new prop. height
    cx: number,
    cy: number,
    cw: number | SVGAnimatedLength,
    ch: number | SVGAnimatedLength,
    ar = 1;

  // decide which gap to fill
  if (nw < w) ar = w / nw;
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; // updated
  nw *= ar;
  nh *= ar;

  // calc source rectangle
  cw = iw / (nw / w);
  ch = ih / (nh / h);

  cx = (iw - cw) * offsetX;
  cy = (ih - ch) * offsetY;

  // make sure source rectangle is valid
  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > iw) cw = iw;
  if (ch > ih) ch = ih;

  // fill image in dest. rectangle
  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

/**
 * Renders the frame as `playheadPosition` onto the canvas
 * @param playheadPosition The position of the playhead
 */
function updateFrame(playheadPosition: number) {
  // Make sure the position is between 0 and 1 (start and end)
  playheadPosition = constrain(playheadPosition, 0, 1);

  // Get the frame at this position
  let imgData = getFrameAtPlayhead(playheadPosition);

  // If it isn't loaded yet, use the last frame instead
  if (!imgData) imgData = lastImgData;
  // If it is loaded, update `lastImgData` so we
  // can use it next time if we need to.
  else lastImgData = imgData;

  // If the last frame wasn't loaded either then
  // we abort because there's nothing else we can do.
  if (!imgData) return;

  // Clear the canvas
  videoCanvasContext.clearRect(0, 0, videoCanvas.width, videoCanvas.height);

  // Render the frame in the middle of the canvas
  // const x = Math.floor((videoCanvas.width - imgData.naturalWidth) / 2);
  // const y = Math.floor((videoCanvas.height - imgData.naturalHeight) / 2);

  drawImageProp(videoCanvasContext, imgData);
}

// The video playhead
let playhead = 0;
// The drag applied to the video
// so smooth out the scrolling
let drag = 0.2;

const tl1 = anime.timeline({
  autoplay: false,
  duration: 1000
});

tl1
  .add({
    targets: ".js-lystaddei-text-animation",
    translateY: "-100px",
    opacity: 0,
    easing: "linear",
    delay: anime.stagger(80, { from: "center" }),
    duration: 680
  })
  .add(
    {
      targets: ".scroll-down",
      opacity: 0,
      duration: 500
    },
    0
  )
  .add(
    {
      targets: "#scrollingLine",
      strokeDashoffset: [0.95, 0],
      easing: "linear"
    },
    0
  )
  .add(
    {
      targets: "#scrollingLineContainer",
      translateY: [0, "-100%"],
      easing: "easeOutSine"
    },
    0
  );

// The animation loop
function updatePlayhead() {
  requestAnimationFrame(updatePlayhead);

  // Apply the drag to the playhead
  playhead += (amountScrolled - playhead) * drag;

  // We need to update the canvas size to the DOM canvas size
  // To avoid issues with address bars on mobile devices
  const rect = videoCanvas.getBoundingClientRect();

  videoCanvas.width = rect.width;
  videoCanvas.height = rect.height;

  // updateFrame(playhead);
  tl1.seek(tl1.duration * playhead);
}

// Start the animation loop
updatePlayhead();

document.querySelector(".scroll-down").addEventListener("click", e => {
  e.preventDefault();
  e.stopImmediatePropagation();
  const targetY = document.querySelector("#portfolio").getBoundingClientRect()
    .top;
  const targets = { currentY: window.pageYOffset };
  anime({
    targets,
    currentY: [targets.currentY, targetY],
    duration: 1700,
    easing: "cubicBezier(0.980, 0.635, 0.530, 1.000)",
    update: function() {
      window.scrollTo(0, targets.currentY);
    }
  });
});

const nav = document.querySelector(".nav");

document.addEventListener("scroll", () => {
  if (window.pageYOffset > 30) document.body.classList.add("header-filled");
  else document.body.classList.remove("header-filled");
});

const imageSlider = document.querySelector("#imageSliderContainer");
const imageCount = document.querySelector(".image-count");

let [activeImage, standbyImage] = (imageSlider.querySelectorAll(
  ".slider-image"
) as unknown) as HTMLElement[];

function setImage(img: HTMLElement, url: string) {
  img.style.backgroundImage = `url("${url}")`;
}

function setActiveDot(index: number) {
  document.querySelector("[id*=imageDot].active")?.classList.remove("active");

  document.querySelector(`#imageDot${index}`).classList.add("active");
}

let currentImage = 0;
let totalImages: number;
let imagesArray = [];

function getIndex(index: number) {
  if (index < 0) return totalImages - 1;
  else if (index < totalImages) return index;
  return 0;
}

function setCurrentImage(index: number) {
  currentImage = getIndex(index);

  setActiveDot(currentImage);

  setImage(standbyImage, imagesArray[currentImage]);

  activeImage.classList.add("hide");
  standbyImage.classList.remove("hide");

  [activeImage, standbyImage] = [standbyImage, activeImage];
}

async function initImageSlider() {
  const { uploads } = await fetch("/uploads/uploads.json").then(res =>
    res.json()
  );
  imagesArray = uploads.slice(0, 5);
  totalImages = imagesArray.length;

  for (let i = 0; i < totalImages; i++) {
    const dot = document.createElement("div");
    dot.id = `imageDot${i}`;
    dot.dataset.index = i.toString();
    imageCount.appendChild(dot);
  }

  setImage(activeImage, imagesArray[0]);
  setImage(standbyImage, imagesArray[1]);

  setCurrentImage(0);

  imageSlider.addEventListener("touchstart", onTouchStart);
  imageSlider.addEventListener("touchmove", onTouchMove);
  imageSlider.addEventListener("touchend", onTouchEnd);

  document
    .querySelector(".next")
    .addEventListener("click", () => setCurrentImage(currentImage + 1));
  document
    .querySelector(".prev")
    .addEventListener("click", () => setCurrentImage(currentImage - 1));

  imageCount.addEventListener("click", e => {
    const index = (e.target as HTMLElement)?.dataset?.index;

    if (index) setCurrentImage(parseInt(index, 10));
  });
}

function onTouchStart(e) {}
function onTouchMove(e) {}
function onTouchEnd(e) {}

initImageSlider();

document.querySelector(".nav-toggle").addEventListener("click", () => {
  document.body.classList.toggle("nav-open");
});

document.addEventListener("click", e => {
  const elem = e.target as HTMLElement;
  if (!("closest" in elem)) return;
  const targetId = elem.closest("a")?.getAttribute("href");
  if (!targetId) return;
  if (targetId.charAt(0) !== "#") return;

  e.preventDefault();
  e.stopImmediatePropagation();
  scrollToElement(targetId);
});

function scrollToElement(id: string) {
  document.body.classList.remove("nav-open");
  const targetY =
    document.querySelector(id)?.getBoundingClientRect().top +
    window.pageYOffset;
  const targets = { currentY: window.pageYOffset };

  anime({
    targets,
    currentY: [targets.currentY, id === "#welcome" ? 0 : targetY],
    duration: 500,
    easing: "easeInOutSine",
    update: function() {
      window.scrollTo(0, targets.currentY);
    }
  });
}
