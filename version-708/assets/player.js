function initVideoPlayer(options) {
  var video = document.getElementById(options.videoId);
  var overlay = document.getElementById(options.overlayId);
  var stream = options.source;
  var hls = null;
  var attached = false;
  var requested = false;

  if (!video || !stream) {
    return;
  }

  function requestPlay() {
    var playResult = video.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {});
    }
  }

  function showPlayer() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.controls = true;
  }

  function begin() {
    requested = true;
    showPlayer();

    if (!attached) {
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.addEventListener("loadedmetadata", requestPlay, { once: true });
        requestPlay();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (requested) {
            requestPlay();
          }
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
        video.addEventListener("loadedmetadata", requestPlay, { once: true });
        requestPlay();
      }
    } else {
      requestPlay();
    }
  }

  if (overlay) {
    overlay.addEventListener("click", begin);
  }

  video.addEventListener("click", function () {
    if (!attached) {
      begin();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}
