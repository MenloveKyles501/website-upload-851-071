(function () {
  function init(videoId, buttonId, streamUrl) {
    document.addEventListener('DOMContentLoaded', function () {
      const video = document.getElementById(videoId);
      const button = document.getElementById(buttonId);
      let ready = false;

      if (!video || !button || !streamUrl) {
        return;
      }

      function playVideo() {
        if (ready) {
          video.play();
          button.classList.add('is-hidden');
          return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.addEventListener('loadedmetadata', function () {
            video.play();
          }, { once: true });
        } else if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({ enableWorker: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play();
          });
        } else {
          video.src = streamUrl;
          video.play();
        }

        button.classList.add('is-hidden');
      }

      button.addEventListener('click', playVideo);
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
    });
  }

  window.CinemaPlayer = {
    init: init
  };
})();
