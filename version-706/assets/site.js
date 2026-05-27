(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var header = document.querySelector("[data-header]");
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (header) {
      var updateHeader = function () {
        header.classList.toggle("scrolled", window.scrollY > 18);
      };
      updateHeader();
      window.addEventListener("scroll", updateHeader, { passive: true });
    }

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var slideIndex = 0;

    function showSlide(index) {
      if (!slides.length) return;
      slideIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === slideIndex);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === slideIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(slideIndex + 1);
      }, 5200);
    }

    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q") || "";
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-search]"));
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var emptyState = document.querySelector("[data-empty-state]");

    if (queryValue && searchInputs.length) {
      searchInputs.forEach(function (input) {
        input.value = queryValue;
      });
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function matchCard(card, filters) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year
      ].join(" "));
      if (filters.q && haystack.indexOf(filters.q) === -1) return false;
      if (filters.type && normalize(card.dataset.type).indexOf(filters.type) === -1) return false;
      if (filters.region && normalize(card.dataset.region).indexOf(filters.region) === -1) return false;
      if (filters.year && normalize(card.dataset.year) !== filters.year) return false;
      return true;
    }

    function applyFilters() {
      if (!cards.length) return;
      var filters = { q: "", type: "", region: "", year: "" };
      searchInputs.forEach(function (input) {
        filters.q = normalize(input.value);
      });
      selects.forEach(function (select) {
        filters[select.dataset.filterSelect] = normalize(select.value);
      });
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matchCard(card, filters);
        card.style.display = ok ? "" : "none";
        if (ok) visible += 1;
      });
      if (emptyState) {
        emptyState.classList.toggle("show", visible === 0);
      }
    }

    searchInputs.forEach(function (input) {
      input.addEventListener("input", applyFilters);
    });
    selects.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });
    applyFilters();

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play-button]");
      var message = box.querySelector("[data-player-message]");
      var streamUrl = box.getAttribute("data-stream");
      var hlsInstance = null;
      var connected = false;

      function showMessage(text) {
        if (!message) return;
        message.textContent = text;
        message.classList.add("show");
      }

      function connect() {
        if (connected || !video || !streamUrl) return;
        connected = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                showMessage("播放暂时不可用，请稍后重试");
              }
            }
          });
        } else {
          video.src = streamUrl;
        }
      }

      function playVideo() {
        if (!video) return;
        connect();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            showMessage("点击视频区域可继续播放");
          });
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          playVideo();
        });
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            playVideo();
          } else {
            video.pause();
          }
        });
        video.addEventListener("play", function () {
          box.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          box.classList.remove("is-playing");
        });
        video.addEventListener("ended", function () {
          box.classList.remove("is-playing");
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
