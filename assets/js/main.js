const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const navLinks = document.querySelectorAll(".nav__link");
const themeButton = document.getElementById("theme-button");
const scrollTopButton = document.getElementById("scroll-top");
const sections = document.querySelectorAll("section[id]");
const allNavLinks = document.querySelectorAll(".nav__menu a.nav__link");

const footerYear = document.getElementById("footer-year");
if (footerYear) footerYear.textContent = new Date().getFullYear();

let isNavigating = false;
let scrollEndTimer = null;

function closeMenu() {
  if (!navMenu || !navToggle) return;
  navMenu.classList.remove("show-menu");
  document.body.classList.remove("menu-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.innerHTML = '<i class="bx bx-menu"></i>';
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("show-menu");
    document.body.classList.toggle("menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.innerHTML = isOpen ? '<i class="bx bx-x"></i>' : '<i class="bx bx-menu"></i>';
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    closeMenu();
    isNavigating = true;
    allNavLinks.forEach((nav) => nav.classList.remove("active-link"));
    this.classList.add("active-link");
  });
});

function updateActiveLink() {
  if (isNavigating) return;

  const headerH = document.getElementById("header")?.offsetHeight || 72;
  // FIX: offset must exceed scroll-margin-top (headerH + 28px = ~100px) to correctly
  // detect which section is active after the browser finishes scrolling to it.
  const scrollY = window.scrollY + headerH + 32;
  const pageBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 80;

  let activeId = null;

  if (pageBottom) {
    activeId = sections[sections.length - 1]?.getAttribute("id") || null;
  } else {
    sections.forEach((section) => {
      if (section.offsetTop <= scrollY) {
        activeId = section.getAttribute("id");
      }
    });
  }

  allNavLinks.forEach((link) => {
    link.classList.toggle("active-link", link.getAttribute("href") === `#${activeId}`);
  });
}

// Waits until scrolling fully stops (150ms silence) before re-enabling spy
window.addEventListener("scroll", () => {
  if (isNavigating) {
    if (scrollEndTimer) clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(() => {
      isNavigating = false;
      updateActiveLink();
    }, 150);
    return;
  }
  updateActiveLink();
}, { passive: true });

window.addEventListener("load", updateActiveLink);

function updateScrollTopButton() {
  if (!scrollTopButton) return;
  scrollTopButton.classList.toggle("show-scroll", window.scrollY >= 520);
}

window.addEventListener("scroll", updateScrollTopButton, { passive: true });
window.addEventListener("load", updateScrollTopButton);

/* ── Theme logic (Hardcoded Dark Default) ── */

const darkTheme = "dark-theme";
const iconTheme = "bx-sun";

if (document.body.classList.contains(darkTheme)) {
  const icon = themeButton?.querySelector("i");
  if (icon) icon.className = `bx ${iconTheme}`;
}

themeButton?.addEventListener("click", () => {
  document.body.classList.add("theme-transitioning");

  const isDark = document.body.classList.toggle(darkTheme);
  const icon = themeButton.querySelector("i");

  if (icon) {
    icon.className = isDark ? `bx ${iconTheme}` : 'bx bx-moon';
  }

  localStorage.setItem("selected-theme", isDark ? "dark" : "light");

  setTimeout(() => {
    document.body.classList.remove("theme-transitioning");
  }, 420);
});

/* ── Project Filters ── */

const filterButtons = document.querySelectorAll(".project-filter");
const projectCards = document.querySelectorAll(".project-card[data-category]");
let filterTimeouts = [];

projectCards.forEach((card) => {
  card.style.opacity = "1";
  card.style.transform = "translateY(0)";
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) return;

    filterTimeouts.forEach(clearTimeout);
    filterTimeouts = [];

    filterButtons.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");

    const filter = btn.dataset.filter;
    const visible = Array.from(projectCards).filter((c) => !c.classList.contains("is-hidden"));

    visible.forEach((card) => {
      card.style.transition = "opacity 160ms ease, transform 160ms ease";
      card.style.opacity = "0";
      card.style.transform = "translateY(6px)";
    });

    const t1 = setTimeout(() => {
      projectCards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        if (match) {
          card.classList.remove("is-hidden");
          card.style.opacity = "0";
          card.style.transform = "translateY(8px)";
        } else {
          card.classList.add("is-hidden");
        }
      });

      void document.body.offsetWidth;

      const t2 = setTimeout(() => {
        projectCards.forEach((card) => {
          if (!card.classList.contains("is-hidden")) {
            card.style.transition = "opacity 240ms ease, transform 240ms ease, border-color 240ms ease, box-shadow 240ms ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }
        });

        setTimeout(() => {
          projectCards.forEach((card) => {
            card.style.transition = "";
            card.style.opacity = "";
            card.style.transform = "";
          });
        }, 250);

      }, 20);
      filterTimeouts.push(t2);
    }, 170);
    filterTimeouts.push(t1);
  });
});

document.querySelectorAll('.button, .project-filter').forEach(btn => {
  btn.addEventListener('pointerup', function (e) {
    setTimeout(() => {
      this.blur();
    }, 150);
  });
});