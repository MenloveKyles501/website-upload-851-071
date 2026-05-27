(function () {
  function attachPlayer(video, cover, sourceUrl) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    video.src = sourceUrl;
    return Promise.resolve();
  }

  window.initMoviePlayer = function (videoId, coverId, sourceUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    if (!video || !cover || !sourceUrl) {
      return;
    }

    var ready = false;
    var starting = false;

    function start() {
      if (starting) {
        return;
      }
      starting = true;
      cover.classList.add('is-hidden');
      var done = ready ? Promise.resolve() : attachPlayer(video, cover, sourceUrl);
      ready = true;
      done.then(function () {
        return video.play();
      }).catch(function () {
        starting = false;
      });
      window.setTimeout(function () {
        starting = false;
      }, 900);
    }

    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  };
})();
