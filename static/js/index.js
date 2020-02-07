var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var START_FRAME = 1;
var END_FRAME = 171;
var frameBucket = [];
function imgPathFromFrame(frame) {
    var filename = frame.toString();
    if (frame < 10)
        filename = "00" + frame;
    else if (frame < 100)
        filename = "0" + frame;
    return "/imgs/" + filename + ".jpg";
}
function cacheFrame(frame) {
    var img = new Image();
    img.onload = function () {
        frameBucket[frame] = img;
    };
    img.src = imgPathFromFrame(frame);
}
var welcomeSection = document.querySelector("#welcome");
var videoCanvas = document.querySelector("#scrollingVideo");
var videoCanvasContext = videoCanvas.getContext("2d");
var controller = new ScrollMagic.Controller();
var scrollDuration = 500;
var videoScene = new ScrollMagic.Scene({
    duration: scrollDuration,
    triggerElement: welcomeSection,
    triggerHook: 0
})
    .setPin(welcomeSection)
    .addTo(controller);
var amountScrolled = 0;
videoScene.on("update", function (e) {
    amountScrolled = e.scrollPos / scrollDuration;
});
function constrain(num, min, max) {
    return Math.max(min, Math.min(max, num));
}
function getFrameAtPlayhead(position) {
    var frame = constrain(Math.round(position * END_FRAME), START_FRAME, END_FRAME);
    return frameBucket[frame];
}
var lastImgData = null;
function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {
    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;
    if (offsetX < 0)
        offsetX = 0;
    if (offsetY < 0)
        offsetY = 0;
    if (offsetX > 1)
        offsetX = 1;
    if (offsetY > 1)
        offsetY = 1;
    var iw = img.width, ih = img.height, r = Math.min(w / iw, h / ih), nw = iw * r, nh = ih * r, cx, cy, cw, ch, ar = 1;
    if (nw < w)
        ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h)
        ar = h / nh;
    nw *= ar;
    nh *= ar;
    cw = iw / (nw / w);
    ch = ih / (nh / h);
    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;
    if (cx < 0)
        cx = 0;
    if (cy < 0)
        cy = 0;
    if (cw > iw)
        cw = iw;
    if (ch > ih)
        ch = ih;
    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}
function updateFrame(playheadPosition) {
    playheadPosition = constrain(playheadPosition, 0, 1);
    var imgData = getFrameAtPlayhead(playheadPosition);
    if (!imgData)
        imgData = lastImgData;
    else
        lastImgData = imgData;
    if (!imgData)
        return;
    videoCanvasContext.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
    drawImageProp(videoCanvasContext, imgData);
}
var playhead = 0;
var drag = 0.2;
var tl1 = anime.timeline({
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
    .add({
    targets: ".scroll-down",
    opacity: 0,
    duration: 500
}, 0)
    .add({
    targets: "#scrollingLine",
    strokeDashoffset: [0.95, 0],
    easing: "linear"
}, 0)
    .add({
    targets: "#scrollingLineContainer",
    translateY: [0, "-100%"],
    easing: "easeOutSine"
}, 0);
function updatePlayhead() {
    requestAnimationFrame(updatePlayhead);
    playhead += (amountScrolled - playhead) * drag;
    var rect = videoCanvas.getBoundingClientRect();
    videoCanvas.width = rect.width;
    videoCanvas.height = rect.height;
    tl1.seek(tl1.duration * playhead);
}
updatePlayhead();
document.querySelector(".scroll-down").addEventListener("click", function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    var targetY = document.querySelector("#portfolio").getBoundingClientRect()
        .top;
    var targets = { currentY: window.pageYOffset };
    anime({
        targets: targets,
        currentY: [targets.currentY, targetY],
        duration: 1700,
        easing: "cubicBezier(0.980, 0.635, 0.530, 1.000)",
        update: function () {
            window.scrollTo(0, targets.currentY);
        }
    });
});
var nav = document.querySelector(".nav");
document.addEventListener("scroll", function () {
    if (window.pageYOffset > 30)
        document.body.classList.add("header-filled");
    else
        document.body.classList.remove("header-filled");
});
var imageSlider = document.querySelector("#imageSliderContainer");
var imageCount = document.querySelector(".image-count");
var _a = imageSlider.querySelectorAll(".slider-image"), activeImage = _a[0], standbyImage = _a[1];
function setImage(img, url) {
    img.style.backgroundImage = "url(\"" + url + "\")";
}
function setActiveDot(index) {
    var _a;
    (_a = document.querySelector("[id*=imageDot].active")) === null || _a === void 0 ? void 0 : _a.classList.remove("active");
    document.querySelector("#imageDot" + index).classList.add("active");
}
var currentImage = 0;
var totalImages;
var imagesArray = [];
function getIndex(index) {
    if (index < 0)
        return totalImages - 1;
    else if (index < totalImages)
        return index;
    return 0;
}
function setCurrentImage(index) {
    var _a;
    currentImage = getIndex(index);
    setActiveDot(currentImage);
    setImage(standbyImage, imagesArray[currentImage]);
    activeImage.classList.add("hide");
    standbyImage.classList.remove("hide");
    _a = [standbyImage, activeImage], activeImage = _a[0], standbyImage = _a[1];
}
function initImageSlider() {
    return __awaiter(this, void 0, void 0, function () {
        var uploads, i, dot;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, fetch("/uploads.json").then(function (res) { return res.json(); })];
                case 1:
                    uploads = (_a.sent()).uploads;
                    imagesArray = uploads.slice(0, 5);
                    totalImages = imagesArray.length;
                    for (i = 0; i < totalImages; i++) {
                        dot = document.createElement("div");
                        dot.id = "imageDot" + i;
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
                        .addEventListener("click", function () { return setCurrentImage(currentImage + 1); });
                    document
                        .querySelector(".prev")
                        .addEventListener("click", function () { return setCurrentImage(currentImage - 1); });
                    imageCount.addEventListener("click", function (e) {
                        var _a, _b;
                        var index = (_b = (_a = e.target) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.index;
                        if (index)
                            setCurrentImage(parseInt(index, 10));
                    });
                    return [2];
            }
        });
    });
}
function onTouchStart(e) { }
function onTouchMove(e) { }
function onTouchEnd(e) { }
initImageSlider();
document.querySelector(".nav-toggle").addEventListener("click", function () {
    document.body.classList.toggle("nav-open");
});
document.addEventListener("click", function (e) {
    var _a;
    var elem = e.target;
    if (!("closest" in elem))
        return;
    var targetId = (_a = elem.closest("a")) === null || _a === void 0 ? void 0 : _a.getAttribute("href");
    if (!targetId)
        return;
    if (targetId.charAt(0) !== "#")
        return;
    e.preventDefault();
    e.stopImmediatePropagation();
    scrollToElement(targetId);
});
function scrollToElement(id) {
    var _a;
    document.body.classList.remove("nav-open");
    var targetY = ((_a = document.querySelector(id)) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect().top) +
        window.pageYOffset;
    var targets = { currentY: window.pageYOffset };
    anime({
        targets: targets,
        currentY: [targets.currentY, id === "#welcome" ? 0 : targetY],
        duration: 500,
        easing: "easeInOutSine",
        update: function () {
            window.scrollTo(0, targets.currentY);
        }
    });
}
//# sourceMappingURL=index.js.map