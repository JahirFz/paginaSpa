/* ═══════════════════════════════════════════════════
   DE LAS FLORES SPA — Main JavaScript
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Elements ──
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const catTabs = document.querySelectorAll('.cat-tab');
    const catPanels = document.querySelectorAll('.category-panel');

    // ═══════════════════ NAVBAR SCROLL ═══════════════════
    let lastScroll = 0;

    function handleNavbarScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = scrollY;
    }

    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll();

    // ═══════════════════ MOBILE MENU ═══════════════════
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ═══════════════════ ACTIVE NAV LINK ON SCROLL ═══════════════════
    const sections = document.querySelectorAll('section[id], footer[id]');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 120;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // ═══════════════════ CATEGORY TABS ═══════════════════
    catTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;

            // Update tabs
            catTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update panels
            catPanels.forEach(panel => panel.classList.remove('active'));
            const targetPanel = document.getElementById(`cat-${category}`);
            if (targetPanel) {
                targetPanel.classList.add('active');

                // Re-trigger reveal animations for new panel
                requestAnimationFrame(() => {
                    const revealElements = targetPanel.querySelectorAll('.reveal');
                    revealElements.forEach(el => {
                        el.classList.remove('visible');
                        void el.offsetWidth; // force reflow
                    });
                    // Observe them
                    revealElements.forEach(el => revealObserver.observe(el));
                });
            }

            // Scroll to services section if not visible
            const servicesSection = document.getElementById('servicios');
            const rect = servicesSection.getBoundingClientRect();
            if (rect.top < -100) {
                servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ═══════════════════ SUB TABS ═══════════════════
    document.addEventListener('click', (e) => {
        const subTab = e.target.closest('.sub-tab');
        if (!subTab) return;

        const subId = subTab.dataset.sub;
        const parentPanel = subTab.closest('.category-panel');

        // Update sub tabs  
        const siblingTabs = parentPanel.querySelectorAll('.sub-tab');
        siblingTabs.forEach(t => t.classList.remove('active'));
        subTab.classList.add('active');

        // Update sub panels
        const siblingPanels = parentPanel.querySelectorAll('.sub-panel');
        siblingPanels.forEach(p => p.classList.remove('active'));
        const targetSub = document.getElementById(`sub-${subId}`);
        if (targetSub) {
            targetSub.classList.add('active');

            // Re-trigger reveal animations
            requestAnimationFrame(() => {
                const revealElements = targetSub.querySelectorAll('.reveal');
                revealElements.forEach(el => {
                    el.classList.remove('visible');
                    void el.offsetWidth;
                });
                revealElements.forEach(el => revealObserver.observe(el));
            });
        }
    });

    // ═══════════════════ SCROLL REVEAL ═══════════════════
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger delay for grid items
                const card = entry.target;
                const parent = card.parentElement;
                let delay = 0;

                if (parent && parent.classList.contains('services-grid')) {
                    const siblings = Array.from(parent.querySelectorAll('.reveal'));
                    const idx = siblings.indexOf(card);
                    delay = idx * 60;
                }

                setTimeout(() => {
                    card.classList.add('visible');
                }, delay);

                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // ═══════════════════ COUNTER ANIMATION ═══════════════════
    const stats = document.querySelectorAll('.stat-number[data-target]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target, 10);
                animateCounter(el, target);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => counterObserver.observe(stat));

    function animateCounter(el, target) {
        const duration = 2000;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);
            el.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ═══════════════════ SMOOTH SCROLL FOR ANCHORS ═══════════════════
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ═══════════════════ PARALLAX HERO (subtle) ═══════════════════
    const heroImg = document.querySelector('.hero-img');

    if (heroImg && window.matchMedia('(min-width: 768px)').matches) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight) {
                heroImg.style.transform = `scale(1.05) translateY(${scrollY * 0.15}px)`;
            }
        }, { passive: true });
    }

});
