(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var backTop = document.querySelector('[data-back-top]');
    if (backTop) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 420) {
          backTop.classList.add('is-visible');
        } else {
          backTop.classList.remove('is-visible');
        }
      });
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }
    if (slides.length) {
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
        });
      });
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterType = document.querySelector('[data-filter-type]');
    var filterYear = document.querySelector('[data-filter-year]');
    var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var empty = document.querySelector('[data-search-empty]');
    function runFilters() {
      var keyword = normalize(filterInput && filterInput.value);
      var type = normalize(filterType && filterType.value);
      var year = normalize(filterYear && filterYear.value);
      var visible = 0;
      filterCards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-keywords'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matched = (!keyword || text.indexOf(keyword) !== -1) && (!type || cardType === type) && (!year || cardYear === year);
        card.classList.toggle('hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    [filterInput, filterType, filterYear].forEach(function (element) {
      if (element) {
        element.addEventListener('input', runFilters);
        element.addEventListener('change', runFilters);
      }
    });

    var jump = document.querySelector('[data-category-jump]');
    if (jump) {
      jump.addEventListener('change', function () {
        if (jump.value) {
          window.location.href = jump.value;
        }
      });
    }

    var searchRoot = document.querySelector('[data-search-page]');
    if (searchRoot && filterInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      filterInput.value = query;
      runFilters();
    }
  });
})();
