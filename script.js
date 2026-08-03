document.addEventListener('DOMContentLoaded', () => {
    // === SELECTORS & DOM ELEMENTS ===
    const slides = document.querySelectorAll('.slide');
    const tocItems = document.querySelectorAll('.toc-item');
    const progressIndicator = document.getElementById('progress-indicator');
    const slideCountIndicator = document.getElementById('slide-count-indicator');
    
    // Navigation Buttons
    const prevBtn = document.getElementById('prev-slide-btn');
    const nextBtn = document.getElementById('next-slide-btn');
    const playBtn = document.getElementById('play-slideshow-btn');
    const playIcon = document.getElementById('play-icon');
    
    // Sidebar / Directory
    const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const navigationSidebar = document.getElementById('navigation-sidebar');
    
    // Presenter Notes
    const toggleNotesBtn = document.getElementById('toggle-notes-btn');
    const closeNotesBtn = document.getElementById('close-notes-btn');
    const notesDisplayPanel = document.getElementById('notes-display-panel');
    const notesContentText = document.getElementById('notes-content-text');
    
    // Theme Selector
    const themeMenuBtn = document.getElementById('theme-menu-btn');
    const themeDropdownMenu = document.getElementById('theme-dropdown-menu');
    const themeOpts = document.querySelectorAll('.theme-opt');
    const activeThemeDot = document.getElementById('active-theme-dot');
    
    // Extra Controls
    const toggleFullscreenBtn = document.getElementById('toggle-fullscreen-btn');
    const statusToast = document.getElementById('status-toast');
    const presentationRoot = document.getElementById('presentation-root');

    // === STATE VARIABLES ===
    let currentSlideIndex = 0;
    const totalSlides = slides.length;
    let autoplayInterval = null;
    const autoplayDuration = 6000; // 6 seconds per slide
    let isAutoplayActive = false;

    // === TOAST NOTIFICATION ===
    function showToast(message) {
        statusToast.textContent = message;
        statusToast.classList.add('show');
        setTimeout(() => {
            statusToast.classList.remove('show');
        }, 2000);
    }

    // === NAVIGATION LOGIC ===
    function updateSlideVisibility() {
        // Toggle slide active classes
        slides.forEach((slide, idx) => {
            if (idx === currentSlideIndex) {
                slide.classList.add('active-slide');
            } else {
                slide.classList.remove('active-slide');
            }
        });

        // Update indicators
        const progressPercentage = ((currentSlideIndex + 1) / totalSlides) * 100;
        progressIndicator.style.width = `${progressPercentage}%`;
        slideCountIndicator.textContent = `${currentSlideIndex + 1} / ${totalSlides}`;

        // Sync directory sidebar selection
        tocItems.forEach((item, idx) => {
            if (idx === currentSlideIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Sync presenter notes
        const activeSlideNotes = slides[currentSlideIndex].getAttribute('data-notes');
        notesContentText.innerHTML = activeSlideNotes || 'No notes available for this slide.';
    }

    function goToSlide(index) {
        if (index >= 0 && index < totalSlides) {
            currentSlideIndex = index;
            updateSlideVisibility();
        }
    }

    function showNext() {
        if (currentSlideIndex < totalSlides - 1) {
            goToSlide(currentSlideIndex + 1);
        } else {
            // Loop back to start if autoplaying, otherwise show toast
            if (isAutoplayActive) {
                goToSlide(0);
            } else {
                showToast("End of presentation");
            }
        }
    }

    function showPrev() {
        if (currentSlideIndex > 0) {
            goToSlide(currentSlideIndex - 1);
        } else {
            showToast("This is the first slide");
        }
    }

    // === AUTOPLAY (SLIDESHOW) LOGIC ===
    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        autoplayInterval = setInterval(showNext, autoplayDuration);
        isAutoplayActive = true;
        playIcon.textContent = '⏸';
        playBtn.setAttribute('aria-label', 'Pause Slideshow');
        showToast("Autoplay started (6s intervals)");
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
        isAutoplayActive = false;
        playIcon.textContent = '▶';
        playBtn.setAttribute('aria-label', 'Play Slideshow');
        showToast("Autoplay paused");
    }

    function toggleAutoplay() {
        if (isAutoplayActive) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
    }

    // === SIDEBAR DIRECTORY TOGGLE ===
    function toggleSidebar() {
        navigationSidebar.classList.toggle('open');
    }

    function closeSidebar() {
        navigationSidebar.classList.remove('open');
    }

    // === PRESENTER NOTES PANEL TOGGLE ===
    function toggleNotes() {
        notesDisplayPanel.classList.toggle('open');
    }

    function closeNotes() {
        notesDisplayPanel.classList.remove('open');
    }

    // === THEME MANAGER ===
    function selectTheme(themeName) {
        // Remove previous themes
        document.body.classList.remove('theme-forest', 'theme-cream', 'theme-minimal', 'theme-dark');
        // Add new theme
        document.body.classList.add(`theme-${themeName}`);
        
        // Sync indicator dots & active elements in menu
        themeOpts.forEach(opt => {
            if (opt.getAttribute('data-theme') === themeName) {
                opt.classList.add('active-opt');
            } else {
                opt.classList.remove('active-opt');
            }
        });

        // Hide theme dropdown menu
        themeDropdownMenu.classList.remove('show');
        showToast(`Theme changed to ${themeName}`);
    }

    // === FULLSCREEN MANAGER ===
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            presentationRoot.requestFullscreen().catch(err => {
                showToast(`Error enabling fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Handle Fullscreen UI updates
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            toggleFullscreenBtn.querySelector('.btn-text').textContent = 'Exit Screen';
            toggleFullscreenBtn.querySelector('.btn-icon').textContent = '❌';
            presentationRoot.classList.add('fullscreen-active');
        } else {
            toggleFullscreenBtn.querySelector('.btn-text').textContent = 'Fullscreen';
            toggleFullscreenBtn.querySelector('.btn-icon').textContent = '⛶';
            presentationRoot.classList.remove('fullscreen-active');
        }
    });

    // === EVENT LISTENERS ===
    
    // Navigation arrows
    prevBtn.addEventListener('click', () => {
        stopAutoplay();
        showPrev();
    });
    
    nextBtn.addEventListener('click', () => {
        stopAutoplay();
        showNext();
    });
    
    playBtn.addEventListener('click', toggleAutoplay);

    // Sidebar triggers
    toggleSidebarBtn.addEventListener('click', toggleSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);

    tocItems.forEach(item => {
        item.addEventListener('click', (e) => {
            stopAutoplay();
            const slideTarget = parseInt(item.getAttribute('data-slide'));
            goToSlide(slideTarget);
            closeSidebar();
        });
    });

    // Notes panel triggers
    toggleNotesBtn.addEventListener('click', toggleNotes);
    closeNotesBtn.addEventListener('click', closeNotes);

    // Theme Selector Button
    themeMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeDropdownMenu.classList.toggle('show');
    });

    // Close theme dropdown when clicking elsewhere
    document.addEventListener('click', () => {
        themeDropdownMenu.classList.remove('show');
    });

    // Theme selector option clicks
    themeOpts.forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            const chosenTheme = opt.getAttribute('data-theme');
            selectTheme(chosenTheme);
        });
    });

    // Fullscreen toggle
    toggleFullscreenBtn.addEventListener('click', toggleFullscreen);

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Prevent action keys from moving page scroll
        const actionKeys = ['Space', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];
        if (actionKeys.includes(e.code)) {
            // Only prevent default if we're not inside some input field
            if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        }

        switch (e.code) {
            case 'ArrowRight':
            case 'ArrowDown':
            case 'Space':
            case 'PageDown':
                stopAutoplay();
                showNext();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                stopAutoplay();
                showPrev();
                break;
            case 'Home':
                stopAutoplay();
                goToSlide(0);
                break;
            case 'End':
                stopAutoplay();
                goToSlide(totalSlides - 1);
                break;
            case 'KeyF':
                toggleFullscreen();
                break;
            case 'KeyN':
                toggleNotes();
                break;
            case 'KeyD':
                toggleSidebar();
                break;
        }
    });

    // === SWIPE TOUCH GESTURES ===
    let touchStartX = 0;
    let touchEndX = 0;

    presentationRoot.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    presentationRoot.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const threshold = 50; // swipe length in pixels
        if (touchStartX - touchEndX > threshold) {
            // Swiped left -> next slide
            stopAutoplay();
            showNext();
        } else if (touchEndX - touchStartX > threshold) {
            // Swiped right -> prev slide
            stopAutoplay();
            showPrev();
        }
    }

    // === INITIALIZATION ===
    // Update notes and active visibility for first slide on load
    updateSlideVisibility();
});
