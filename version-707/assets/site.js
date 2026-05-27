(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('.js-hero').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
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
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  });

  document.querySelectorAll('.js-filter-panel').forEach(function (panel) {
    var keyword = panel.querySelector('.js-filter-keyword');
    var year = panel.querySelector('.js-filter-year');
    var type = panel.querySelector('.js-filter-type');
    var region = panel.querySelector('.js-filter-region');
    var grid = document.querySelector('.js-filter-grid');
    var empty = document.querySelector('.js-empty-state');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.js-movie-card'));

    function norm(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var q = norm(keyword && keyword.value);
      var y = norm(year && year.value);
      var t = norm(type && type.value);
      var r = norm(region && region.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = norm([
          card.dataset.title,
          card.dataset.genre,
          card.querySelector('em') ? card.querySelector('em').textContent : ''
        ].join(' '));
        var ok = true;

        if (q && text.indexOf(q) === -1) {
          ok = false;
        }

        if (y && norm(card.dataset.year) !== y) {
          ok = false;
        }

        if (t && norm(card.dataset.type) !== t) {
          ok = false;
        }

        if (r && norm(card.dataset.region) !== r) {
          ok = false;
        }

        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keyword, year, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  });

  var searchInput = document.querySelector('.js-site-search');
  var searchResults = document.querySelector('.js-search-results');
  var searchEmpty = document.querySelector('.js-search-empty');

  if (searchInput && searchResults && Array.isArray(window.SEARCH_MOVIES)) {
    function renderResults() {
      var q = searchInput.value.trim().toLowerCase();
      searchResults.innerHTML = '';

      if (!q) {
        if (searchEmpty) {
          searchEmpty.hidden = false;
          searchEmpty.textContent = '输入关键词开始搜索';
        }
        return;
      }

      var hits = window.SEARCH_MOVIES.filter(function (movie) {
        return movie.searchText.indexOf(q) !== -1;
      }).slice(0, 80);

      hits.forEach(function (movie) {
        var item = document.createElement('a');
        var poster = document.createElement('span');
        var img = document.createElement('img');
        var gradient = document.createElement('span');
        var play = document.createElement('span');
        var year = document.createElement('span');
        var content = document.createElement('span');
        var title = document.createElement('strong');
        var line = document.createElement('em');
        var meta = document.createElement('span');
        var genre = document.createElement('span');
        var region = document.createElement('span');

        item.className = 'movie-card js-movie-card';
        item.href = movie.href;
        poster.className = 'poster-wrap';
        img.src = movie.cover;
        img.alt = movie.title;
        img.loading = 'lazy';
        gradient.className = 'poster-gradient';
        play.className = 'hover-play';
        play.textContent = '▶';
        year.className = 'year-badge';
        year.textContent = movie.year;
        content.className = 'card-content';
        title.textContent = movie.title;
        line.textContent = movie.oneLine;
        meta.className = 'card-meta';
        genre.textContent = movie.genre;
        region.textContent = movie.region;

        poster.appendChild(img);
        poster.appendChild(gradient);
        poster.appendChild(play);
        poster.appendChild(year);
        meta.appendChild(genre);
        meta.appendChild(region);
        content.appendChild(title);
        content.appendChild(line);
        content.appendChild(meta);
        item.appendChild(poster);
        item.appendChild(content);
        searchResults.appendChild(item);
      });

      if (searchEmpty) {
        searchEmpty.hidden = hits.length !== 0;
        searchEmpty.textContent = '暂无匹配影片';
      }
    }

    searchInput.addEventListener('input', renderResults);
    renderResults();
  }
})();
