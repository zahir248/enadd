(function () {
  "use strict";

  /* Normalize .../index.html → .../ in the address bar (GitHub Pages quirk / redirects). */
  try {
    var path = window.location.pathname;
    if (path.endsWith("/index.html")) {
      var cleanPath = path.slice(0, -"index.html".length);
      window.history.replaceState(
        null,
        "",
        cleanPath + window.location.search + window.location.hash
      );
    }
  } catch (ignore) {}

  var nav = document.getElementById("mainNav");
  var yearEl = document.getElementById("year");
  var form = document.getElementById("contactForm");
  var formStatus = document.getElementById("formStatus");
  var heroRotate = document.getElementById("heroRotate");
  var toTopBtn = document.getElementById("toTopBtn");

  var reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // EmailJS configuration (GitHub Pages friendly)
  // Replace these with your EmailJS values:
  var EMAILJS_PUBLIC_KEY = "_KWQTjocabj0U71Mj";
  var EMAILJS_SERVICE_ID = "service_vwrwsa4";
  var EMAILJS_TEMPLATE_ID = "template_izobm9z";

  if (typeof emailjs !== "undefined" && EMAILJS_PUBLIC_KEY !== "YOUR_EMAILJS_PUBLIC_KEY") {
    try {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    } catch (err) {
      // Ignore init issues; submit handler will surface errors.
    }
  }

  /* —— Make images feel interactive (skip logo + hero plate) —— */
  document.querySelectorAll("img").forEach(function (img) {
    if (img.classList.contains("brand-logo")) return;
    if (img.hasAttribute("data-no-alive")) return;
    if (img.closest(".hero-media")) return;
    img.classList.add("img-alive");
  });

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function onScroll() {
    if (nav) {
      if (window.scrollY > 24) {
        nav.classList.add("navbar-scrolled");
      } else {
        nav.classList.remove("navbar-scrolled");
      }
    }
    if (toTopBtn) {
      if (window.scrollY > 420) {
        toTopBtn.classList.add("is-visible");
      } else {
        toTopBtn.classList.remove("is-visible");
      }
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTopBtn) {
    toTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  function showFormToast(message, kind) {
    var toastEl = document.getElementById("formToast");
    var toastBody = document.getElementById("formToastBody");
    if (!toastEl || !toastBody) return;

    toastBody.textContent = message;

    toastEl.classList.remove("text-bg-success", "text-bg-danger", "text-bg-secondary");
    if (kind === "error") toastEl.classList.add("text-bg-danger");
    else if (kind === "info") toastEl.classList.add("text-bg-secondary");
    else toastEl.classList.add("text-bg-success");

    if (typeof bootstrap !== "undefined" && bootstrap.Toast) {
      var toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 4200 });
      toast.show();
    }
  }

  /* —— Hero rotating line —— */
  var rotatePhrases = [
    "with precision.",
    "on schedule.",
    "across borders.",
    "door-to-door.",
  ];
  var rotateIndex = 0;

  function setHeroPhrase(text) {
    if (!heroRotate) return;
    heroRotate.textContent = text;
  }

  function cycleHeroPhrase() {
    if (!heroRotate || reduceMotion) return;
    heroRotate.style.opacity = "0";
    window.setTimeout(function () {
      rotateIndex = (rotateIndex + 1) % rotatePhrases.length;
      setHeroPhrase(rotatePhrases[rotateIndex]);
      heroRotate.style.opacity = "1";
    }, 220);
  }

  if (heroRotate) {
    setHeroPhrase(rotatePhrases[0]);
    if (!reduceMotion) {
      window.setInterval(cycleHeroPhrase, 3200);
    }
  }

  /* —— Parallax on hero background —— */
  var heroHeader = document.querySelector(".hero");
  var parallaxLayer = document.querySelector(".hero-parallax");

  if (heroHeader && parallaxLayer && !reduceMotion) {
    heroHeader.addEventListener(
      "pointermove",
      function (e) {
        var r = heroHeader.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        parallaxLayer.style.transform =
          "translate(" + (x * 18).toFixed(2) + "px," + (y * 14).toFixed(2) + "px)";
      },
      { passive: true }
    );
    heroHeader.addEventListener(
      "pointerleave",
      function () {
        parallaxLayer.style.transform = "translate(0,0)";
      },
      { passive: true }
    );
  }

  /* —— Scroll reveal —— */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    var revealIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealIo.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      revealIo.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* —— Stat counters —— */
  function animateCount(el, target, duration) {
    var start = performance.now();
    var from = 0;
    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }
    el.classList.add("is-counting");
    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var eased = easeOutQuart(t);
      var val = Math.round(from + (target - from) * eased);
      el.textContent = String(val);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = String(target);
        el.classList.remove("is-counting");
      }
    }
    requestAnimationFrame(frame);
  }

  var statNums = document.querySelectorAll(".stat-number");
  if (statNums.length && "IntersectionObserver" in window && !reduceMotion) {
    var statsDone = false;
    var statsIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || statsDone) return;
          statsDone = true;
          statNums.forEach(function (node) {
            var raw = node.getAttribute("data-target");
            var target = raw ? parseInt(raw, 10) : 0;
            if (!isNaN(target)) {
              var duration = Math.max(900, Math.min(1800, target * 1.2));
              animateCount(node, target, duration);
            }
          });
          statsIo.disconnect();
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );
    statNums.forEach(function (node) {
      statsIo.observe(node);
    });
  } else {
    statNums.forEach(function (node) {
      var raw = node.getAttribute("data-target");
      var target = raw ? parseInt(raw, 10) : 0;
      if (!isNaN(target)) node.textContent = String(target);
    });
  }

  /* —— Service filters —— */
  var filterBtns = document.querySelectorAll(".service-filter-btn");
  var serviceCols = document.querySelectorAll(".service-col");
  var serviceCardGrid = document.getElementById("serviceCardGrid");

  function applyServiceFilter(key) {
    serviceCols.forEach(function (col) {
      col.classList.remove("service-col--last-centered");
      var cat = col.getAttribute("data-service") || "";
      if (key === "all" || cat === key) {
        col.classList.remove("is-filtered-out");
      } else {
        col.classList.add("is-filtered-out");
      }
    });

    if (serviceCardGrid) {
      if (key === "all") {
        serviceCardGrid.classList.remove("justify-content-center");
        var visibleCols = Array.prototype.filter.call(
          serviceCardGrid.querySelectorAll(".service-col"),
          function (c) {
            return !c.classList.contains("is-filtered-out");
          }
        );
        if (visibleCols.length % 2 === 1) {
          visibleCols[visibleCols.length - 1].classList.add(
            "service-col--last-centered"
          );
        }
      } else {
        serviceCardGrid.classList.add("justify-content-center");
      }
    }

    if (key !== "all" && serviceCardGrid) {
      window.requestAnimationFrame(function () {
        var first = serviceCardGrid.querySelector(
          ".service-col:not(.is-filtered-out)"
        );
        if (first) {
          first.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      });
    }
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-filter") || "all";
      filterBtns.forEach(function (b) {
        b.classList.toggle("active", b === btn);
      });
      applyServiceFilter(key);
    });
  });

  if (filterBtns.length && serviceCols.length) {
    var initialFilter = "all";
    filterBtns.forEach(function (b) {
      if (b.classList.contains("active")) {
        initialFilter = b.getAttribute("data-filter") || "all";
      }
    });
    applyServiceFilter(initialFilter);
  }

  /* —— Tilt cards (pointer) —— */
  function setupTilt(root) {
    if (!root || reduceMotion) return;
    var max = 10;

    root.addEventListener(
      "pointermove",
      function (e) {
        var rect = root.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        root.style.transform =
          "perspective(900px) rotateY(" +
          (x * max).toFixed(2) +
          "deg) rotateX(" +
          (-y * max).toFixed(2) +
          "deg)";
      },
      { passive: true }
    );

    function reset() {
      root.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
    }

    root.addEventListener("pointerleave", reset, { passive: true });
  }

  document.querySelectorAll("[data-tilt]").forEach(setupTilt);

  /* —— Button ripple coordinates —— */
  document.querySelectorAll(".btn-ripple").forEach(function (btn) {
    btn.addEventListener("pointerdown", function (e) {
      var r = btn.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width) * 100;
      var y = ((e.clientY - r.top) / r.height) * 100;
      btn.style.setProperty("--rx", x + "%");
      btn.style.setProperty("--ry", y + "%");
    });
  });

  /* —— Contact form —— */
  if (form && formStatus) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        formStatus.textContent = "";
        return;
      }

      form.classList.add("was-validated");
      formStatus.textContent = "Sending…";
      formStatus.classList.remove("text-muted", "text-success", "text-danger");
      formStatus.classList.add("text-muted");

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute("aria-disabled", "true");
      }

      if (
        typeof emailjs === "undefined" ||
        EMAILJS_PUBLIC_KEY === "YOUR_EMAILJS_PUBLIC_KEY" ||
        EMAILJS_SERVICE_ID === "YOUR_EMAILJS_SERVICE_ID" ||
        EMAILJS_TEMPLATE_ID === "YOUR_EMAILJS_TEMPLATE_ID"
      ) {
        formStatus.textContent =
          "Email is not configured yet. Please set EmailJS keys in js/main.js.";
        formStatus.classList.remove("text-muted");
        formStatus.classList.add("text-danger");
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      emailjs
        .sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
        .then(function () {
          formStatus.textContent = "";
          formStatus.classList.remove("text-muted", "text-danger", "text-success");
          showFormToast("Sent. Thank you — we’ll get back to you shortly.", "success");
          form.reset();
          form.classList.remove("was-validated");
          if (submitBtn) submitBtn.disabled = false;
        })
        .catch(function () {
          formStatus.textContent = "";
          formStatus.classList.remove("text-muted", "text-danger", "text-success");
          showFormToast("Sorry, message failed to send. Please call (65) 6100 0430.", "error");
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  document.querySelectorAll('.navbar-collapse .nav-link[href^="#"]').forEach(
    function (link) {
      link.addEventListener("click", function () {
        var collapse = document.getElementById("navCollapse");
        if (collapse && collapse.classList.contains("show")) {
          if (typeof bootstrap !== "undefined" && bootstrap.Collapse) {
            var bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapse);
            bsCollapse.hide();
          }
        }
      });
    }
  );

  // Close mobile nav on any nav click (multi-page)
  document.querySelectorAll(".navbar-collapse .nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      var collapse = document.getElementById("navCollapse");
      if (!collapse || !collapse.classList.contains("show")) return;
      if (typeof bootstrap === "undefined" || !bootstrap.Collapse) return;
      var bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapse);
      bsCollapse.hide();
    });
  });

  var gurusoftUrl =
    typeof window !== "undefined" && window.ENADD_GURUSOFT_PORTAL_URL
      ? String(window.ENADD_GURUSOFT_PORTAL_URL).trim()
      : "";
  if (gurusoftUrl) {
    document.querySelectorAll("a[data-enadd-gurusoft]").forEach(function (a) {
      a.setAttribute("href", gurusoftUrl);
    });
  }
})();
