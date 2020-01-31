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
var videoScene = new ScrollMagic.Scene({
    duration: 1000,
    triggerElement: welcomeSection,
    triggerHook: 0
})
    .setPin(welcomeSection)
    .addTo(controller);
var amountScrolled = 0;
videoScene.on("update", function (e) {
    amountScrolled = e.scrollPos / 1000;
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
    var x = Math.floor((videoCanvas.width - imgData.naturalWidth) / 2);
    var y = Math.floor((videoCanvas.height - imgData.naturalHeight) / 2);
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
document.querySelector(".scroll-down").addEventListener("click", function () {
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
//# sourceMappingURL=index.js.map