(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", slider);
    var dots = selectAll("[data-hero-dot]", slider);
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var value = Number(dot.getAttribute("data-hero-dot") || 0);
        show(value);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initRails() {
    selectAll("[data-scroll-target]").forEach(function (button) {
      button.addEventListener("click", function () {
        var id = button.getAttribute("data-scroll-target");
        var direction = button.getAttribute("data-scroll-direction") === "left" ? -1 : 1;
        var rail = document.getElementById(id);
        if (rail) {
          rail.scrollBy({ left: direction * 420, behavior: "smooth" });
        }
      });
    });
  }

  function getQueryValue() {
    try {
      return new URLSearchParams(window.location.search).get("q") || "";
    } catch (error) {
      return "";
    }
  }

  function initFilters() {
    selectAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var region = scope.querySelector("[data-region-filter]");
      var type = scope.querySelector("[data-type-filter]");
      var cards = selectAll("[data-movie-card]");
      var initialQuery = getQueryValue();

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function update() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var searchText = (card.getAttribute("data-search") || "").toLowerCase();
          var cardRegion = card.getAttribute("data-region") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matchQuery = !query || searchText.indexOf(query) !== -1;
          var matchRegion = !regionValue || cardRegion === regionValue;
          var matchType = !typeValue || cardType === typeValue;
          var match = matchQuery && matchRegion && matchType;
          card.hidden = !match;
          if (match) {
            visible += 1;
          }
        });

        scope.classList.toggle("empty", visible === 0);
      }

      if (input) {
        input.addEventListener("input", update);
      }
      if (region) {
        region.addEventListener("change", update);
      }
      if (type) {
        type.addEventListener("change", update);
      }
      update();
    });
  }

  function initPlayers() {
    selectAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-start");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var ready = false;
      var hls = null;

      function prepare() {
        if (ready || !stream) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          video.src = stream;
        }
        ready = true;
      }

      function playVideo() {
        prepare();
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }

      function toggleVideo() {
        prepare();
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }
      video.addEventListener("click", toggleVideo);
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });
      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
      prepare();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initRails();
    initFilters();
    initPlayers();
  });
})();
