(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var box = document.querySelector('[data-player]');

        if (!box) {
            return;
        }

        var video = box.querySelector('video');
        var cover = box.querySelector('.player-cover');
        var stream = video ? video.getAttribute('data-stream') : '';
        var hls = null;
        var started = false;

        function begin() {
            if (!video || !stream) {
                return;
            }

            if (!started) {
                started = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            if (cover) {
                cover.classList.add('is-hidden');
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', begin);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    begin();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
