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

    // === NAMETAG GENERATOR LOGIC ===
    const openNametagBtn = document.getElementById('open-nametag-btn');
    const closeNametagBtn = document.getElementById('close-nametag-btn');
    const nametagModal = document.getElementById('nametag-modal');
    
    // Form Inputs
    const tagNameInput = document.getElementById('tag-name');
    const tagRoleInput = document.getElementById('tag-role');
    const tagGroupInput = document.getElementById('tag-group');
    const tagTemplateSelect = document.getElementById('tag-template');
    
    // Preview Elements
    const previewName = document.getElementById('preview-name');
    const previewRole = document.getElementById('preview-role');
    const previewGroup = document.getElementById('preview-group');
    const nametagPreviewCard = document.getElementById('nametag-preview-card');
    
    // Action Buttons
    const btnPrintTag = document.getElementById('btn-print-tag');
    const btnPngTag = document.getElementById('btn-png-tag');
    const btnJpgTag = document.getElementById('btn-jpg-tag');
    const nametagPrintArea = document.getElementById('nametag-print-area');

    // Open/Close Modal
    openNametagBtn.addEventListener('click', () => {
        closeSidebar();
        nametagModal.classList.add('show');
        nametagModal.setAttribute('aria-hidden', 'false');
    });

    closeNametagBtn.addEventListener('click', () => {
        nametagModal.classList.remove('show');
        nametagModal.setAttribute('aria-hidden', 'true');
    });

    // Close on overlay click
    nametagModal.addEventListener('click', (e) => {
        if (e.target === nametagModal) {
            nametagModal.classList.remove('show');
            nametagModal.setAttribute('aria-hidden', 'true');
        }
    });

    // Live Preview Update
    function updateLivePreview() {
        previewName.textContent = tagNameInput.value || 'John Doe';
        previewRole.textContent = tagRoleInput.value || 'Presenter';
        previewGroup.textContent = tagGroupInput.value || 'Group 2 BSHM3-09';
        nametagPreviewCard.setAttribute('data-theme', tagTemplateSelect.value);
    }

    tagNameInput.addEventListener('input', updateLivePreview);
    tagRoleInput.addEventListener('input', updateLivePreview);
    tagGroupInput.addEventListener('input', updateLivePreview);
    tagTemplateSelect.addEventListener('change', updateLivePreview);

    // Helpers to Draw Rounded Rectangle on Canvas
    function drawCanvasRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // Draw stylized leaf leaflets
    function drawCanvasLeaflet(ctx, x, y, size, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Draw stylized moringa leaf branch
    function drawCanvasMoringaLeaf(ctx, x, y, size, angle, color, opacity) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        
        // Draw stem
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(size * 0.3, -size * 0.15, size, 0);
        ctx.stroke();
        
        // Draw pairs of leaflets
        const pairs = 4;
        for (let i = 1; i <= pairs; i++) {
            const t = i / pairs;
            const px = t * size;
            const py = t * t * -0.15 * size;
            const leafletSize = size * 0.16 * (1 - t * 0.3);
            
            drawCanvasLeaflet(ctx, px, py, leafletSize, Math.PI / 4);
            drawCanvasLeaflet(ctx, px, py, leafletSize, -Math.PI / 4);
        }
        
        // Terminal leaflet
        drawCanvasLeaflet(ctx, size, 0, size * 0.18, 0);
        ctx.restore();
    }

    // High resolution Canvas Generator (1050x660 px for Crisp 300DPI Print)
    function generateNametagCanvas(callback) {
        const canvas = document.createElement('canvas');
        canvas.width = 1050;
        canvas.height = 660;
        const ctx = canvas.getContext('2d');

        const name = tagNameInput.value || 'John Doe';
        const role = tagRoleInput.value || 'Presenter';
        const group = tagGroupInput.value || 'Group 2 BSHM3-09';
        const template = tagTemplateSelect.value;

        // Color palettes config
        const themes = {
            forest: {
                bg: '#0b1a13',
                border: '#d4af37',
                text: '#f6f8f5',
                role: '#d4af37',
                footer: '#9cbfa5',
                leafColor: '#d4af37',
                leafOpacity: 0.08
            },
            cream: {
                bg: '#faf8f5',
                border: '#1b3327',
                text: '#1b3327',
                role: '#5a7364',
                footer: '#5a7364',
                leafColor: '#1b3327',
                leafOpacity: 0.05
            },
            sage: {
                bg: '#8fa89b',
                border: '#ffffff',
                text: '#ffffff',
                role: '#ffffff',
                footer: '#ffffff',
                leafColor: '#ffffff',
                leafOpacity: 0.12
            }
        };

        const activeTheme = themes[template];

        // 1. Fill Background
        ctx.fillStyle = activeTheme.bg;
        ctx.fillRect(0, 0, 1050, 660);

        // 2. Draw Decorative Moringa Leaf watermarks
        drawCanvasMoringaLeaf(ctx, -50, 710, 500, -Math.PI / 6, activeTheme.leafColor, activeTheme.leafOpacity);
        drawCanvasMoringaLeaf(ctx, 1100, -50, 500, Math.PI * 0.8, activeTheme.leafColor, activeTheme.leafOpacity);

        // 3. Draw Thick Styled Border
        ctx.strokeStyle = activeTheme.border;
        ctx.lineWidth = 12;
        ctx.strokeRect(6, 6, 1038, 648);

        // 4. Draw Lanyard Slot Card Clip Hole
        ctx.fillStyle = template === 'cream' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)';
        ctx.beginPath();
        drawCanvasRoundedRect(ctx, 1050 / 2 - 60, 24, 120, 20, 10);
        ctx.fill();

        // 5. Draw Header Presentation Text
        ctx.textAlign = 'center';
        
        ctx.fillStyle = activeTheme.role; // Use gold/accent color
        ctx.font = "bold 20px 'Plus Jakarta Sans', system-ui, sans-serif";
        ctx.letterSpacing = "3px";
        ctx.fillText("TITLE PROPOSAL", 1050 / 2, 95);

        ctx.fillStyle = activeTheme.text;
        ctx.font = "italic bold 25px 'Playfair Display', Georgia, serif";
        ctx.letterSpacing = "normal";
        ctx.fillText("Assessing Malunggay Leaf Extract as a Cooking Oil Replacement", 1050 / 2, 140);

        // 6. Draw Divider Line
        ctx.strokeStyle = activeTheme.border;
        ctx.lineWidth = 2;
        ctx.globalAlpha = template === 'cream' ? 0.3 : 0.4;
        ctx.beginPath();
        ctx.moveTo(150, 185);
        ctx.lineTo(900, 185);
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // 7. Draw User Name
        ctx.font = "bold 68px 'Playfair Display', Georgia, serif";
        ctx.fillText(name, 1050 / 2, 335);

        // 8. Draw User Role
        ctx.fillStyle = activeTheme.role;
        ctx.font = "bold 25px 'Plus Jakarta Sans', system-ui, sans-serif";
        ctx.letterSpacing = "4px";
        ctx.fillText(role.toUpperCase(), 1050 / 2, 400);

        // 9. Draw Footer Affiliation & Date
        ctx.fillStyle = activeTheme.footer;
        ctx.font = "600 20px 'Plus Jakarta Sans', system-ui, sans-serif";
        ctx.letterSpacing = "normal";
        
        ctx.textAlign = 'left';
        ctx.fillText(group, 70, 580);
        
        ctx.textAlign = 'right';
        ctx.fillText("August 2026", 980, 580);

        // Return canvas
        callback(canvas);
    }

    // Trigger File Download Helper
    function triggerDataDownload(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Action Event Listeners
    btnPngTag.addEventListener('click', () => {
        const name = (tagNameInput.value || 'John Doe').replace(/\s+/g, '_');
        generateNametagCanvas((canvas) => {
            const dataUrl = canvas.toDataURL('image/png');
            triggerDataDownload(dataUrl, `nametag_${name}.png`);
            showToast("PNG downloaded successfully");
        });
    });

    btnJpgTag.addEventListener('click', () => {
        const name = (tagNameInput.value || 'John Doe').replace(/\s+/g, '_');
        generateNametagCanvas((canvas) => {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            triggerDataDownload(dataUrl, `nametag_${name}.jpg`);
            showToast("JPG downloaded successfully");
        });
    });

    btnPrintTag.addEventListener('click', () => {
        generateNametagCanvas((canvas) => {
            const dataUrl = canvas.toDataURL('image/png');
            nametagPrintArea.innerHTML = `<img src="${dataUrl}" alt="Print Preview">`;
            showToast("Opening print window...");
            setTimeout(() => {
                window.print();
            }, 300);
        });
    });

    // === INITIALIZATION ===
    // Update notes and active visibility for first slide on load
    updateSlideVisibility();
});
