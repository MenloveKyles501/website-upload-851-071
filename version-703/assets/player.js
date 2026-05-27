(function () {
    var hlsPromise;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (!hlsPromise) {
            hlsPromise = new Promise(function (resolve, reject) {
                var script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
                script.async = true;
                script.onload = function () {
                    resolve(window.Hls);
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        return hlsPromise;
    }

    function start(shell) {
        var video = shell.querySelector("video");
        var layer = shell.querySelector(".play-layer");
        if (!video) {
            return;
        }
        var videoUrl = video.getAttribute("data-video");
        if (!videoUrl) {
            return;
        }
        if (layer) {
            layer.classList.add("is-hidden");
        }
        if (shell.getAttribute("data-ready") === "true") {
            video.play().catch(function () {});
            return;
        }
        shell.setAttribute("data-ready", "true");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoUrl;
            video.play().catch(function () {});
            return;
        }
        loadHls().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = videoUrl;
                video.play().catch(function () {});
            }
        }).catch(function () {
            video.src = videoUrl;
            video.play().catch(function () {});
        });
    }

    document.querySelectorAll(".video-shell").forEach(function (shell) {
        var layer = shell.querySelector(".play-layer");
        if (layer) {
            layer.addEventListener("click", function () {
                start(shell);
            });
        }
        shell.addEventListener("click", function (event) {
            if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === "video") {
                start(shell);
            }
        });
    });
})();
