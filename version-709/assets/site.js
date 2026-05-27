(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initHeader() {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function updateHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 20);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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
        timer = null;
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
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initRails() {
    document.querySelectorAll("[data-rail]").forEach(function (rail) {
      var track = rail.querySelector("[data-rail-track]");
      var left = rail.querySelector("[data-rail-left]");
      var right = rail.querySelector("[data-rail-right]");

      if (!track) {
        return;
      }

      function scrollByAmount(direction) {
        track.scrollBy({
          left: direction * Math.min(430, track.clientWidth * 0.8),
          behavior: "smooth"
        });
      }

      if (left) {
        left.addEventListener("click", function () {
          scrollByAmount(-1);
        });
      }

      if (right) {
        right.addEventListener("click", function () {
          scrollByAmount(1);
        });
      }
    });
  }

  function initSearchPage() {
    var root = document.querySelector("[data-search-page]");
    if (!root) {
      return;
    }

    var input = root.querySelector("[data-search-input]");
    var category = root.querySelector("[data-filter-category]");
    var region = root.querySelector("[data-filter-region]");
    var year = root.querySelector("[data-filter-year]");
    var type = root.querySelector("[data-filter-type]");
    var reset = root.querySelector("[data-filter-reset]");
    var empty = root.querySelector("[data-search-empty]");
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
    var params = new URLSearchParams(window.location.search);

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    if (category && params.get("category")) {
      category.value = params.get("category");
    }

    function textOf(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-category"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" ").toLowerCase();
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var catValue = category ? category.value : "";
      var regionValue = region ? region.value : "";
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      var matched = 0;

      cards.forEach(function (card) {
        var ok = true;
        if (keyword && textOf(card).indexOf(keyword) === -1) {
          ok = false;
        }
        if (catValue && card.getAttribute("data-category") !== catValue) {
          ok = false;
        }
        if (regionValue && card.getAttribute("data-region") !== regionValue) {
          ok = false;
        }
        if (yearValue && card.getAttribute("data-year") !== yearValue) {
          ok = false;
        }
        if (typeValue && card.getAttribute("data-type") !== typeValue) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          matched += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", matched === 0);
      }
    }

    [input, category, region, year, type].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    });

    if (reset) {
      reset.addEventListener("click", function () {
        [input, category, region, year, type].forEach(function (control) {
          if (control) {
            control.value = "";
          }
        });
        apply();
      });
    }

    apply();
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (window.__siteHlsLoader) {
      return window.__siteHlsLoader;
    }

    window.__siteHlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error("HLS library unavailable"));
        }
      };
      script.onerror = function () {
        reject(new Error("HLS library load failed"));
      };
      document.head.appendChild(script);
    });

    return window.__siteHlsLoader;
  }

  function attachSource(video, source) {
    if (video.dataset.sourceBound === source) {
      return Promise.resolve();
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.dataset.sourceBound = source;
      return Promise.resolve();
    }

    return loadHlsLibrary().then(function (Hls) {
      if (!Hls.isSupported()) {
        throw new Error("HLS unsupported");
      }

      if (video.__hlsInstance) {
        video.__hlsInstance.destroy();
      }

      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      video.__hlsInstance = hls;
      hls.attachMedia(video);
      hls.loadSource(source);
      video.dataset.sourceBound = source;
      return Promise.resolve();
    });
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".play-overlay");
      var status = shell.querySelector("[data-player-status]");
      var source = shell.getAttribute("data-video-src");
      var loading = false;

      if (!video || !source) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function startPlayback() {
        if (loading) {
          return;
        }
        loading = true;
        setStatus("正在加载");

        video.autoplay = true;

        attachSource(video, source)
          .then(function () {
            return video.play();
          })
          .then(function () {
            shell.classList.add("is-playing");
            setStatus("正在播放");
          })
          .catch(function () {
            shell.classList.remove("is-playing");
            setStatus("请再次点击播放");
          })
          .finally(function () {
            loading = false;
          });
      }

      if (overlay) {
        overlay.addEventListener("click", function (event) {
          event.preventDefault();
          startPlayback();
        });
      }

      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
        setStatus("正在播放");
      });

      video.addEventListener("pause", function () {
        if (!video.ended) {
          setStatus("已暂停");
        }
      });

      video.addEventListener("ended", function () {
        shell.classList.remove("is-playing");
        setStatus("播放结束");
      });
    });
  }

  ready(function () {
    initHeader();
    initHero();
    initRails();
    initSearchPage();
    initPlayers();
  });
})();
