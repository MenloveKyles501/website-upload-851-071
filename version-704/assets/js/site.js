(function () {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showHero(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  function applyCardFilter(scope) {
    const input = scope.querySelector('[data-filter-input]');
    const year = scope.querySelector('[data-year-filter]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const query = input ? input.value.trim().toLowerCase() : '';
    const yearValue = year ? year.value : '';

    cards.forEach(function (card) {
      const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
      const cardYear = card.getAttribute('data-year') || '';
      const matchesQuery = !query || keywords.indexOf(query) !== -1;
      const matchesYear = !yearValue || cardYear === yearValue;
      card.style.display = matchesQuery && matchesYear ? '' : 'none';
    });
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const input = scope.querySelector('[data-filter-input]');
    const year = scope.querySelector('[data-year-filter]');
    const reset = scope.querySelector('[data-filter-reset]');

    if (input) {
      input.addEventListener('input', function () {
        applyCardFilter(scope);
      });
    }

    if (year) {
      year.addEventListener('change', function () {
        applyCardFilter(scope);
      });
    }

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (year) {
          year.value = '';
        }
        applyCardFilter(scope);
      });
    }
  });

  const searchForm = document.querySelector('[data-search-form]');
  const searchResults = document.querySelector('[data-search-results]');
  const searchMeta = document.querySelector('[data-search-meta]');

  function renderSearch(query) {
    if (!searchResults || !window.CINEMA_INDEX) {
      return;
    }

    const text = (query || '').trim().toLowerCase();
    const items = text
      ? window.CINEMA_INDEX.filter(function (item) {
          return item.keywords.toLowerCase().indexOf(text) !== -1;
        }).slice(0, 160)
      : [];

    searchResults.innerHTML = items.map(function (item) {
      const title = escapeHtml(item.title);
      const url = escapeHtml(item.url);
      const poster = escapeHtml(item.poster);
      const oneLine = escapeHtml(item.oneLine);
      const year = escapeHtml(item.year);
      const region = escapeHtml(item.region);
      const type = escapeHtml(item.type);
      const genre = escapeHtml(item.genre);

      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + url + '">',
        '    <img src="' + poster + '" alt="' + title + '" loading="lazy">',
        '    <span class="poster-shade"></span>',
        '    <span class="play-chip">播放</span>',
        '  </a>',
        '  <div class="movie-info">',
        '    <h3><a href="' + url + '">' + title + '</a></h3>',
        '    <p>' + oneLine + '</p>',
        '    <div class="meta-row"><span>' + year + '</span><span>' + region + '</span><span>' + type + '</span></div>',
        '    <div class="tag-row"><span>' + genre + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');

    if (searchMeta) {
      searchMeta.textContent = text ? '找到 ' + items.length + ' 个匹配结果' : '输入关键词后显示匹配影片。';
    }
  }

  if (searchForm) {
    const input = searchForm.querySelector('input[name="q"]');
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';

    if (input) {
      input.value = initial;
      renderSearch(initial);
    }

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const query = input ? input.value : '';
      const url = new URL(window.location.href);
      if (query.trim()) {
        url.searchParams.set('q', query.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState(null, '', url.toString());
      renderSearch(query);
    });
  }
})();
