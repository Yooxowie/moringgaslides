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
    const tagGroupInput = document.getElementById('tag-group');
    const tagTemplateSelect = document.getElementById('tag-template');
    
    // Preview Elements
    const previewName = document.getElementById('preview-name');
    const previewGroup = document.getElementById('preview-group');
    const nametagPreviewCard = document.getElementById('nametag-preview-card');
    
    // Range Sliders
    const nameFontSlider = document.getElementById('name-font-size');
    const groupFontSlider = document.getElementById('group-font-size');
    const nameYSlider = document.getElementById('name-y-pos');
    const groupYSlider = document.getElementById('group-y-pos');
    const nameSizeVal = document.getElementById('name-size-val');
    const groupSizeVal = document.getElementById('group-size-val');
    const nameYVal = document.getElementById('name-y-val');
    const groupYVal = document.getElementById('group-y-val');

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

    nametagModal.addEventListener('click', (e) => {
        if (e.target === nametagModal) {
            nametagModal.classList.remove('show');
            nametagModal.setAttribute('aria-hidden', 'true');
        }
    });

    // Live Preview Update
    function updateLivePreview() {
        previewName.textContent = tagNameInput.value || 'John Doe';
        previewGroup.textContent = tagGroupInput.value || 'Group 2 BSHM3-09';
        nametagPreviewCard.setAttribute('data-theme', tagTemplateSelect.value);

        // Apply slider values
        const nameSize = nameFontSlider.value;
        const groupSize = groupFontSlider.value;
        const nameY = nameYSlider.value;
        const groupY = groupYSlider.value;

        previewName.style.fontSize = nameSize + 'px';
        previewName.style.top = nameY + '%';
        previewGroup.style.fontSize = groupSize + 'px';
        previewGroup.style.top = groupY + '%';

        nameSizeVal.textContent = nameSize + 'px';
        groupSizeVal.textContent = groupSize + 'px';
        nameYVal.textContent = nameY + '%';
        groupYVal.textContent = groupY + '%';
    }

    tagNameInput.addEventListener('input', updateLivePreview);
    tagGroupInput.addEventListener('input', updateLivePreview);
    tagTemplateSelect.addEventListener('change', updateLivePreview);
    nameFontSlider.addEventListener('input', updateLivePreview);
    groupFontSlider.addEventListener('input', updateLivePreview);
    nameYSlider.addEventListener('input', updateLivePreview);
    groupYSlider.addEventListener('input', updateLivePreview);

    // Initialize preview positions on load
    updateLivePreview();

    // === DRAG SUPPORT ===
    function makeDraggableY(el, ySlider) {
        let isDragging = false;
        let startMouseY = 0;
        let startTopPercent = 0;

        function getParentHeight() {
            return el.parentElement.getBoundingClientRect().height;
        }

        function onPointerDown(e) {
            isDragging = true;
            startMouseY = e.clientY;
            startTopPercent = parseFloat(ySlider.value);
            el.style.cursor = 'grabbing';
            e.preventDefault();
        }

        function onPointerMove(e) {
            if (!isDragging) return;
            const dy = e.clientY - startMouseY;
            const parentH = getParentHeight();
            const deltaPct = (dy / parentH) * 100;
            let newVal = Math.round(Math.min(95, Math.max(5, startTopPercent + deltaPct)));
            ySlider.value = newVal;
            updateLivePreview();
        }

        function onPointerUp() {
            if (!isDragging) return;
            isDragging = false;
            el.style.cursor = 'grab';
        }

        el.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    }

    makeDraggableY(previewName, nameYSlider);
    makeDraggableY(previewGroup, groupYSlider);

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

    // High resolution Canvas Generator (1050x660 px for Crisp 300DPI Print)
    function generateNametagCanvas(callback) {
        const canvas = document.createElement('canvas');
        canvas.width = 1050;
        canvas.height = 660;
        const ctx = canvas.getContext('2d');

        const name = tagNameInput.value || 'John Doe';
        const group = tagGroupInput.value || 'Group 2 BSHM3-09';
        const template = tagTemplateSelect.value;

        // Read slider values and scale to canvas coords
        const nameFontPx = Math.round(nameFontSlider.value * 2.1); // preview px → canvas px
        const groupFontPx = Math.round(groupFontSlider.value * 2.1);
        const nameYPct = nameYSlider.value / 100;
        const groupYPct = groupYSlider.value / 100;

        const nameCanvasY = Math.round(nameYPct * 660);
        const groupCanvasY = Math.round(groupYPct * 660);

        // Color palettes
        const themes = {
            forest: {
                bg: '#0b1a13',
                border: '#d4af37',
                innerBorder: 'rgba(212, 175, 55, 0.2)',
                text: '#f6f8f5',
                accent: '#d4af37',
                pillBg: 'rgba(212, 175, 55, 0.1)',
                pillBorder: 'rgba(212, 175, 55, 0.25)'
            },
            cream: {
                bg: '#faf8f5',
                border: '#1b3327',
                innerBorder: 'rgba(27, 51, 39, 0.12)',
                text: '#1b3327',
                accent: '#1b3327',
                pillBg: 'rgba(27, 51, 39, 0.06)',
                pillBorder: 'rgba(27, 51, 39, 0.15)'
            },
            sage: {
                bg: '#8fa89b',
                border: '#ffffff',
                innerBorder: 'rgba(255, 255, 255, 0.25)',
                text: '#ffffff',
                accent: '#ffffff',
                pillBg: 'rgba(255, 255, 255, 0.15)',
                pillBorder: 'rgba(255, 255, 255, 0.3)'
            }
        };

        const t = themes[template];

        // 1. Fill solid background
        ctx.fillStyle = t.bg;
        ctx.fillRect(0, 0, 1050, 660);

        // 2. Outer border
        ctx.strokeStyle = t.border;
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, 1042, 652);

        // 3. Inner border
        ctx.strokeStyle = t.innerBorder;
        ctx.lineWidth = 2;
        ctx.strokeRect(28, 28, 994, 604);

        // 4. User Name
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = t.text;
        ctx.font = `bold ${nameFontPx}px 'Playfair Display', Georgia, serif`;
        ctx.fillText(name, 525, nameCanvasY);

        // 5. Group pill badge
        ctx.font = `bold ${groupFontPx}px 'Plus Jakarta Sans', system-ui, sans-serif`;
        ctx.letterSpacing = '2px';
        const pillTextWidth = ctx.measureText(group.toUpperCase()).width;
        const pillW = Math.max(pillTextWidth + 60, 200);
        const pillH = groupFontPx + 34;
        const pillX = 525 - pillW / 2;
        const pillY = groupCanvasY - pillH / 2;

        ctx.fillStyle = t.pillBg;
        ctx.beginPath();
        drawCanvasRoundedRect(ctx, pillX, pillY, pillW, pillH, 28);
        ctx.fill();

        ctx.strokeStyle = t.pillBorder;
        ctx.lineWidth = 2;
        ctx.beginPath();
        drawCanvasRoundedRect(ctx, pillX, pillY, pillW, pillH, 28);
        ctx.stroke();

        ctx.fillStyle = t.accent;
        ctx.fillText(group.toUpperCase(), 525, groupCanvasY);

        ctx.textBaseline = 'alphabetic'; // reset
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

    // === GAME LOGIC ===
    const openGameBtn = document.getElementById('open-game-btn');
    const closeGameBtn = document.getElementById('close-game-btn');
    const gameModal = document.getElementById('game-modal');
    const gameStartBtn = document.getElementById('game-start-btn');
    const gameRestartBtn = document.getElementById('game-restart-btn');
    const gameOverScreen = document.getElementById('game-over-screen');
    const gameStartScreen = document.getElementById('game-start-screen');
    const gameScoreEl = document.getElementById('game-score');
    const gameLivesEl = document.getElementById('game-lives');
    const gameTimerEl = document.getElementById('game-timer');
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    // Ensure canvas dimensions match CSS size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const gameState = {
        score: 0,
        lives: 3,
        timeRemaining: 60,
        running: false,
        objects: [], // falling items
        player: { x: canvas.width / 2, y: canvas.height - 60, radius: 30 },
        lastSpawn: 0,
        spawnInterval: 1000, // ms
        animationId: null,
        timerId: null
    };

    // Load sprites (paths relative to project root)
    const malunggayImg = new Image();
    malunggayImg.src = 'assets/malunggay_sprite_1785748086521.jpg';
    const pandesalImg = new Image();
    pandesalImg.src = 'assets/pandesal_sprite_1785748014786.jpg';

    // Utility: random integer in [min, max]
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    function openGameModalHandler() {
        closeSidebar(); // reuse existing function
        gameModal.setAttribute('aria-hidden', 'false');
        gameModal.classList.add('show');
    }

    function closeGameModalHandler() {
        gameModal.setAttribute('aria-hidden', 'true');
        gameModal.classList.remove('show');
        // ensure any running game is halted
        endGame();
    }

    openGameBtn.addEventListener('click', openGameModalHandler);
    closeGameBtn.addEventListener('click', closeGameModalHandler);

    // Player drag (horizontal only for simplicity)
    let dragging = false;
    function onPointerDown(e) {
        const rect = canvas.getBoundingClientRect();
        const dx = e.clientX - rect.left;
        const dy = e.clientY - rect.top;
        const dist = Math.hypot(dx - gameState.player.x, dy - gameState.player.y);
        if (dist <= gameState.player.radius + 20) { // give some leeway
            dragging = true;
        }
    }
    function onPointerMove(e) {
        if (!dragging) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        // constrain within canvas width
        gameState.player.x = Math.min(canvas.width - gameState.player.radius, Math.max(gameState.player.radius, x));
    }
    function onPointerUp() { dragging = false; }
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerUp);

    function spawnObject() {
        const isMalunggay = Math.random() < 0.7; // 70% chance good
        const img = isMalunggay ? malunggayImg : pandesalImg;
        const size = randInt(40, 60);
        const x = randInt(size / 2, canvas.width - size / 2);
        const y = -size;
        const speed = randInt(2, 4) + (isMalunggay ? 0 : 1); // pandesal falls slightly faster
        gameState.objects.push({ img, x, y, size, speed, isMalunggay });
    }

    function updateObjects() {
        gameState.objects.forEach(obj => {
            obj.y += obj.speed;
        });
        // Remove off‑screen items
        gameState.objects = gameState.objects.filter(obj => obj.y - obj.size < canvas.height);
    }

    function drawObjects() {
        gameState.objects.forEach(obj => {
            ctx.drawImage(obj.img, obj.x - obj.size / 2, obj.y - obj.size / 2, obj.size, obj.size);
        });
    }

    function checkCollisions() {
        const player = gameState.player;
        gameState.objects = gameState.objects.filter(obj => {
            const dx = obj.x - player.x;
            const dy = obj.y - player.y;
            const distance = Math.hypot(dx, dy);
            if (distance < player.radius + obj.size / 2) {
                // collision!
                if (obj.isMalunggay) {
                    gameState.score += 10;
                } else {
                    gameState.lives -= 1;
                }
                return false; // remove collided object
            }
            return true; // keep
        });
    }

    function updateHUD() {
        gameScoreEl.textContent = gameState.score;
        gameLivesEl.textContent = '❤️'.repeat(gameState.lives);
        gameTimerEl.textContent = gameState.timeRemaining;
    }

    function gameLoop(timestamp) {
        if (!gameState.running) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // spawn based on interval
        if (timestamp - gameState.lastSpawn > gameState.spawnInterval) {
            spawnObject();
            gameState.lastSpawn = timestamp;
        }
        updateObjects();
        checkCollisions();
        // draw player (simple circle with gradient)
        const grad = ctx.createRadialGradient(gameState.player.x, gameState.player.y, 0, gameState.player.x, gameState.player.y, gameState.player.radius);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(1, '#4caf50');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(gameState.player.x, gameState.player.y, gameState.player.radius, 0, Math.PI * 2);
        ctx.fill();
        drawObjects();
        updateHUD();
        // check end conditions
        if (gameState.lives <= 0 || gameState.timeRemaining <= 0) {
            endGame();
            return;
        }
        gameState.animationId = requestAnimationFrame(gameLoop);
    }

    function startGame() {
        // reset state
        gameState.score = 0;
        gameState.lives = 3;
        gameState.timeRemaining = 60;
        gameState.objects = [];
        gameState.player.x = canvas.width / 2;
        gameState.running = true;
        // UI switches
        gameStartScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        // start countdown timer
        gameState.timerId = setInterval(() => {
            gameState.timeRemaining -= 1;
            if (gameState.timeRemaining <= 0) clearInterval(gameState.timerId);
        }, 1000);
        // launch loop
        gameState.lastSpawn = 0;
        gameState.animationId = requestAnimationFrame(gameLoop);
    }

    function endGame() {
        gameState.running = false;
        cancelAnimationFrame(gameState.animationId);
        clearInterval(gameState.timerId);
        // show final score
        document.getElementById('game-final-score').textContent = gameState.score;
        gameOverScreen.classList.remove('hidden');
    }

    // Button handlers
    gameStartBtn.addEventListener('click', startGame);
    gameRestartBtn.addEventListener('click', startGame);

    // Clean up when modal is closed
    closeGameBtn.addEventListener('click', closeGameModalHandler);

    // Ensure game stops if user navigates away
    window.addEventListener('beforeunload', () => {
        if (gameState.running) endGame();
    });

});
