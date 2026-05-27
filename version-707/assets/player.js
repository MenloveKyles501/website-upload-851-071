(function () {
  var hlsScript = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
  var hlsLoading = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoading) {
      return hlsLoading;
    }

    hlsLoading = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = hlsScript;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsLoading;
  }

  function attach(video, url) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return Promise.resolve();
    }

    return loadHls().then(function (Hls) {
      return new Promise(function (resolve, reject) {
        if (!Hls || !Hls.isSupported()) {
          reject(new Error('unsupported'));
          return;
        }

        if (video._hls) {
          video._hls.destroy();
        }

        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        video._hls = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            reject(new Error('fatal'));
          }
        });
      });
    });
  }

  document.querySelectorAll('.js-watch').forEach(function (panel) {
    var video = panel.querySelector('.watch-video');
    var cover = panel.querySelector('.watch-cover');
    var url = panel.getAttribute('data-url');
    var ready = false;

    function start() {
      if (!video || !url) {
        return;
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      var begin = ready ? Promise.resolve() : attach(video, url).then(function () {
        ready = true;
      });

      begin.then(function () {
        var play = video.play();
        if (play && typeof play.catch === 'function') {
          play.catch(function () {});
        }
      }).catch(function () {
        video.src = url;
        var play = video.play();
        if (play && typeof play.catch === 'function') {
          play.catch(function () {});
        }
      });
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    panel.addEventListener('click', function (event) {
      if (event.target === panel) {
        start();
      }
    });
  });
})();
