function initMoviePlayer(source, videoId, overlayId, buttonId) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var button = document.getElementById(buttonId);
  var hls = null;
  var loaded = false;

  if (!video || !source) {
    return;
  }

  function load() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  }

  function start() {
    load();
    hideOverlay();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function() {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }
  if (button) {
    button.addEventListener("click", function(event) {
      event.stopPropagation();
      start();
    });
  }
  video.addEventListener("play", hideOverlay);
  video.addEventListener("click", function() {
    if (video.paused) {
      start();
    }
  });
  window.addEventListener("beforeunload", function() {
    if (hls) {
      hls.destroy();
    }
  });
}
