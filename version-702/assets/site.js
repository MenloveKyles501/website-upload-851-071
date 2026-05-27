(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function goSearch(form) {
    var input = form.querySelector("input[name='q']");
    var query = input ? input.value.trim() : "";
    if (query) {
      window.location.href = "./search.html?q=" + encodeURIComponent(query);
    } else {
      window.location.href = "./search.html";
    }
  }

  function initMenus() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function() {
      nav.classList.toggle("is-open");
      toggle.textContent = nav.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function(form) {
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        goSearch(form);
      });
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
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
      prev.addEventListener("click", function() {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        show(dotIndex);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function initCategoryTools() {
    var list = document.querySelector("[data-sort-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var search = document.querySelector("[data-category-search]");
    var sort = document.querySelector("[data-sort-select]");

    function applyFilter() {
      var keyword = search ? search.value.trim().toLowerCase() : "";
      cards.forEach(function(card) {
        var text = (card.getAttribute("data-text") || "").toLowerCase();
        var matched = keyword === "" || text.indexOf(keyword) >= 0;
        card.setAttribute("data-hidden", matched ? "false" : "true");
      });
    }

    function applySort() {
      var mode = sort ? sort.value : "default";
      var sorted = cards.slice();
      if (mode === "hot") {
        sorted.sort(function(a, b) {
          return Number(b.getAttribute("data-hot")) - Number(a.getAttribute("data-hot"));
        });
      } else if (mode === "year") {
        sorted.sort(function(a, b) {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
      } else if (mode === "title") {
        sorted.sort(function(a, b) {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        });
      } else {
        sorted.sort(function(a, b) {
          return cards.indexOf(a) - cards.indexOf(b);
        });
      }
      sorted.forEach(function(card) {
        list.appendChild(card);
      });
    }

    if (search) {
      search.addEventListener("input", applyFilter);
    }
    if (sort) {
      sort.addEventListener("change", applySort);
    }
  }

  function createResultCard(item) {
    var tags = [item.genre, item.category].filter(Boolean).slice(0, 2).map(function(tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"card-link\" href=\"" + item.file + "\" aria-label=\"" + escapeHtml(item.title) + "\">" +
      "<div class=\"card-cover\"><img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\"><span class=\"play-mark\">▶</span><span class=\"card-badge\">" + escapeHtml(item.category) + "</span></div>" +
      "<div class=\"card-body\"><h3>" + escapeHtml(item.title) + "</h3><p class=\"card-line\">" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
      "<div class=\"card-tags\">" + tags + "</div></div></a></article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initSearchPage() {
    var results = document.getElementById("searchResults");
    var form = document.querySelector("[data-search-page-form]");
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var title = document.querySelector("[data-search-title]");
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = form ? form.querySelector("input[name='q']") : null;
    if (input) {
      input.value = query;
    }

    function render(keyword) {
      var key = keyword.trim().toLowerCase();
      if (!key) {
        if (title) {
          title.textContent = "热门影片";
        }
        return;
      }
      var matched = window.SEARCH_INDEX.filter(function(item) {
        return item.text.toLowerCase().indexOf(key) >= 0;
      }).slice(0, 96);
      if (title) {
        title.textContent = matched.length ? "搜索结果" : "暂无匹配影片";
      }
      results.innerHTML = matched.length ? matched.map(createResultCard).join("") : "<div class=\"empty-state\">没有找到匹配内容，可尝试更换关键词。</div>";
    }

    if (form) {
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        var nextQuery = input ? input.value.trim() : "";
        var nextUrl = nextQuery ? "./search.html?q=" + encodeURIComponent(nextQuery) : "./search.html";
        window.history.replaceState(null, "", nextUrl);
        render(nextQuery);
      });
    }
    render(query);
  }

  ready(function() {
    initMenus();
    initSearchForms();
    initHero();
    initCategoryTools();
    initSearchPage();
  });
})();
