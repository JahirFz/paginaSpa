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
    const serviceCategoryLinks = document.querySelectorAll('[data-service-category]');

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
    function setMobileMenu(open) {
        navToggle.classList.toggle('active', open);
        navMenu.classList.toggle('active', open);
        navToggle.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('menu-open', open);
        document.body.style.overflow = open ? 'hidden' : '';
    }

    navToggle.addEventListener('click', () => {
        setMobileMenu(!navMenu.classList.contains('active'));
    });

    document.body.addEventListener('click', (e) => {
        if (e.target === document.body && document.body.classList.contains('menu-open')) {
            setMobileMenu(false);
        }
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            setMobileMenu(false);
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
    function setCategory(category, options = {}) {
        const targetTab = document.querySelector(`.cat-tab[data-category="${category}"]`);
        const targetPanel = document.getElementById(`cat-${category}`);
        if (!targetTab || !targetPanel) return;

        // Update tabs
        catTabs.forEach(t => {
            const selected = t === targetTab;
            t.classList.toggle('active', selected);
            t.setAttribute('aria-selected', String(selected));
        });

        // Update panels
        catPanels.forEach(panel => {
            const selected = panel === targetPanel;
            panel.classList.toggle('active', selected);
            panel.setAttribute('aria-hidden', String(!selected));
        });

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

        if (options.scroll) {
            const servicesSection = document.getElementById('servicios');
            const rect = servicesSection.getBoundingClientRect();
            if (rect.top < -100) {
                servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    catTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            setCategory(tab.dataset.category, { scroll: true });
        });
    });

    serviceCategoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            setCategory(link.dataset.serviceCategory, { scroll: true });
            document.getElementById('servicios').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // ═══════════════════ SUB TABS ═══════════════════
    document.querySelectorAll('.sub-tabs').forEach((tabList, listIndex) => {
        tabList.setAttribute('role', 'tablist');
        tabList.setAttribute('aria-label', 'Subcategorías de servicios');

        const parentPanel = tabList.closest('.category-panel');
        const tabs = tabList.querySelectorAll('.sub-tab');
        tabs.forEach((tab, index) => {
            const subId = tab.dataset.sub;
            const panel = parentPanel.querySelector(`#sub-${subId}`);
            const tabId = tab.id || `subtab-${listIndex}-${subId}`;

            tab.id = tabId;
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', String(tab.classList.contains('active')));
            if (panel) {
                tab.setAttribute('aria-controls', panel.id);
                panel.setAttribute('role', 'tabpanel');
                panel.setAttribute('aria-labelledby', tabId);
                panel.setAttribute('aria-hidden', String(!panel.classList.contains('active')));
            }
        });
    });

    function setSubTab(subTab) {
        const subId = subTab.dataset.sub;
        const parentPanel = subTab.closest('.category-panel');

        // Update sub tabs
        const siblingTabs = parentPanel.querySelectorAll('.sub-tab');
        siblingTabs.forEach(t => {
            const selected = t === subTab;
            t.classList.toggle('active', selected);
            t.setAttribute('aria-selected', String(selected));
        });

        // Update sub panels
        const siblingPanels = parentPanel.querySelectorAll('.sub-panel');
        siblingPanels.forEach(p => {
            const selected = p.id === `sub-${subId}`;
            p.classList.toggle('active', selected);
            p.setAttribute('aria-hidden', String(!selected));
        });

        const targetSub = document.getElementById(`sub-${subId}`);
        if (targetSub) {
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
    }

    document.addEventListener('click', (e) => {
        const subTab = e.target.closest('.sub-tab');
        if (!subTab) return;

        setSubTab(subTab);
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

    // ═══════════════════ HERO CAROUSEL ═══════════════════
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const progressBar = document.getElementById('carousel-progress-bar');
    const totalSlides = slides.length;
    let currentSlide = 0;
    let autoPlayInterval = null;
    let progressInterval = null;
    const SLIDE_DURATION = 6000; // 6 seconds per slide
    const PROGRESS_STEP = 30; // update every 30ms
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function syncCarouselState() {
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
            slide.setAttribute('aria-hidden', String(index !== currentSlide));
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
            if (index === currentSlide) {
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.removeAttribute('aria-current');
            }
        });
    }

    function goToSlide(index) {
        currentSlide = (index + totalSlides) % totalSlides;
        syncCarouselState();

        // Reset progress
        resetProgress();
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    // Progress bar
    function resetProgress() {
        if (progressInterval) clearInterval(progressInterval);
        if (prefersReducedMotion) {
            progressBar.style.width = '0%';
            return;
        }

        let elapsed = 0;
        progressBar.style.width = '0%';

        progressInterval = setInterval(() => {
            elapsed += PROGRESS_STEP;
            const pct = (elapsed / SLIDE_DURATION) * 100;
            progressBar.style.width = `${pct}%`;

            if (elapsed >= SLIDE_DURATION) {
                clearInterval(progressInterval);
            }
        }, PROGRESS_STEP);
    }

    // Auto-play
    function startAutoPlay() {
        stopAutoPlay();
        if (prefersReducedMotion) return;
        autoPlayInterval = setInterval(nextSlide, SLIDE_DURATION);
        resetProgress();
    }

    function stopAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        if (progressInterval) clearInterval(progressInterval);
    }

    // Arrow events
    prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoPlay();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoPlay();
    });

    // Dot events
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const idx = parseInt(dot.dataset.slide, 10);
            goToSlide(idx);
            startAutoPlay();
        });
    });

    // Pause on hover
    const heroSection = document.getElementById('inicio');
    heroSection.addEventListener('mouseenter', () => {
        stopAutoPlay();
    });
    heroSection.addEventListener('mouseleave', () => {
        startAutoPlay();
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    heroSection.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroSection.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            startAutoPlay();
        }
    }, { passive: true });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Only when hero is in view
        const heroRect = heroSection.getBoundingClientRect();
        if (heroRect.bottom < 0) return;

        if (e.key === 'ArrowLeft') {
            prevSlide();
            startAutoPlay();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            startAutoPlay();
        }
    });

    // Start carousel
    syncCarouselState();
    startAutoPlay();

});
