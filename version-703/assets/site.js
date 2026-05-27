(function () {
    var header = document.getElementById("siteHeader");
    var toggle = document.querySelector(".nav-toggle");
    var backTop = document.querySelector(".back-top");

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
        if (backTop) {
            backTop.classList.toggle("is-visible", window.scrollY > 360);
        }
    }

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();

    if (toggle && header) {
        toggle.addEventListener("click", function () {
            var open = header.classList.toggle("menu-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    if (backTop) {
        backTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    document.querySelectorAll("img").forEach(function (image) {
        image.addEventListener("error", function () {
            image.style.opacity = "0";
        });
    });

    var carousel = document.querySelector("[data-carousel='hero']");
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector(".hero-prev");
        var next = carousel.querySelector(".hero-next");
        var index = 0;
        var timer;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                restart();
            });
        }

        restart();
    }

    function bindLocalSearch(panel) {
        var input = panel.querySelector(".local-search-input");
        var section = panel.closest("section");
        var root = section || document;
        var cards = Array.prototype.slice.call(root.querySelectorAll(".search-card"));
        var empty = root.querySelector(".empty-state");

        if (!input || !cards.length) {
            return;
        }

        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
                var ok = !keyword || haystack.indexOf(keyword) !== -1;
                card.classList.toggle("is-hidden", !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-active", visible === 0);
            }
        });
    }

    document.querySelectorAll(".local-filter").forEach(bindLocalSearch);

    var searchInput = document.getElementById("searchInput");
    var regionFilter = document.getElementById("regionFilter");
    var typeFilter = document.getElementById("typeFilter");
    var yearFilter = document.getElementById("yearFilter");
    var searchGrid = document.querySelector(".search-grid");

    if (searchInput && searchGrid) {
        var searchCards = Array.prototype.slice.call(searchGrid.querySelectorAll(".search-card"));
        var searchEmpty = document.querySelector(".empty-state");

        function filterSearch() {
            var keyword = searchInput.value.trim().toLowerCase();
            var region = regionFilter ? regionFilter.value : "";
            var type = typeFilter ? typeFilter.value : "";
            var year = yearFilter ? yearFilter.value : "";
            var visible = 0;

            searchCards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
                var ok = true;
                ok = ok && (!keyword || haystack.indexOf(keyword) !== -1);
                ok = ok && (!region || card.getAttribute("data-region") === region);
                ok = ok && (!type || card.getAttribute("data-type") === type);
                ok = ok && (!year || card.getAttribute("data-year") === year);
                card.classList.toggle("is-hidden", !ok);
                if (ok) {
                    visible += 1;
                }
            });

            if (searchEmpty) {
                searchEmpty.classList.toggle("is-active", visible === 0);
            }
        }

        [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener("input", filterSearch);
                control.addEventListener("change", filterSearch);
            }
        });
    }
})();
