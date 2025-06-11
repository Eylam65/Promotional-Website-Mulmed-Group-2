// Global state
let currentSection = 0;
let isTransitioning = false;
let batteryLevel = 8;
let photoCount = 1;
let totalPhotos = 6;
let screenFlicker = false;
let showEntity = false;
let muted = true;
let isRecording = false;
let recordingTime = 0;
let isFlashReady = true;
let showLowBatteryWarning = false;

const sections = ['landing', 'synopsis', 'trailer', 'behind-scenes', 'cast-crew', 'curse-timeline'];

// Cast members data
const castMembers = [
    {
        name: "Brandon Alvaro Haryanto",
        role: "Brandon Alvaro Haryanto - Lead Director, Web Developer, Actor",
        image: "Cast Pictures/BrandonHuman.jpg",
        imageGhostMode: "Cast Pictures/BrandonEntity.jpg"
    },
    {
        name: "Ricky Atha Ajie Alvianto", 
        role: "Ricky Atha Ajie Alvianto - Cinematographer, Film Editor, Actor",
        image: "Cast Pictures/RickyHuman.jpg",
        imageGhostMode: "Cast Pictures/RickyEntity.jpg"
    },
    {
        name: "Ryuu Stanley Tistogondo",
        role: "Ryuu Stanley Tistogondo - Choreographer, Actor",
        image: "Cast Pictures/RyuuHuman.jpg",
        imageGhostMode: "Cast Pictures/RyuuHuman.jpg"
    },
    {
        name: "Yohanes Wenanta",
        role: "Yohanes Wenanta - Choreographer, Actor", 
        image: "Cast Pictures/YohanesHuman.jpg",
        imageGhostMode: "Cast Pictures/YohanesEntity.jpg"
    },
    {
        name: "Tandri Wibowo",
        role: "Tandri Wibowo - Web Developer, Actor",
        image: "Cast Pictures/TandriHuman.jpg",
        imageGhostMode: "Cast Pictures/TandriHuman.jpg"
    },
    {
        name: "The Entity",
        role: "Kenneth Andrew Lukita - Actor",
        image: "Cast Pictures/kennethHuman.jpg",
        imageGhostMode: "Cast Pictures/KennethEntitiy.jpeg"
    }
];

// Helper function to safely play audio
function playAudio(audioPath, volume = 0.3) {
    try {
        const audio = new Audio(audioPath);
        audio.volume = volume;
        audio.play().catch(err => {
            console.warn(`Audio play failed for ${audioPath}:`, err.message);
        });
    } catch (err) {
        console.warn(`Audio creation failed for ${audioPath}:`, err);
    }
}

// Initialize the application
function init() {
    setupEventListeners();
    updateDateTime();
    updateBatteryDisplay();
    updatePhotoCounter();
    populateCastGrid();
    
    // Ensure landing section is shown initially
    showSection(0);
    
    startIntervals();
    
    // Set initial glitch text data attribute
    const glitchText = document.getElementById('glitchText');
    if (glitchText) {
        glitchText.setAttribute('data-text', 'THE FINAL TAKE');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) prevBtn.addEventListener('click', () => navigateToSection('prev'));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateToSection('next'));
    
    // Record button
    const recordBtn = document.getElementById('recordBtn');
    if (recordBtn) recordBtn.addEventListener('click', toggleRecording);
    
    // Mute button
    const muteButton = document.getElementById('muteButton');
    if (muteButton) muteButton.addEventListener('click', toggleMute);
    
    // Do not click button
    const doNotClickBtn = document.getElementById('doNotClickBtn');
    if (doNotClickBtn) doNotClickBtn.addEventListener('click', handleDoNotClick);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyDown);
    
    // Video error handling
    const video = document.getElementById('backgroundVideo');
    if (video) {
        video.addEventListener('error', () => console.warn('Video failed to load'));
    }
}

// Handle keyboard navigation
function handleKeyDown(event) {
    if (isTransitioning || 
        event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
        return;
    }

    switch (event.key) {
        case 'ArrowLeft':
            event.preventDefault();
            navigateToSection('prev');
            break;
        case 'ArrowRight':
            event.preventDefault();
            navigateToSection('next');
            break;
    }
}

// Navigate between sections
function navigateToSection(direction) {
    console.log("navigating", direction, "from section", currentSection);
    if (isTransitioning) return;

    // Simulate battery drain on navigation
    batteryLevel = Math.max(batteryLevel - 0.5, 3);
    updateBatteryDisplay();

    isTransitioning = true;

    // Play camera shutter sound
    playAudio('/sounds/camera-shutter.mp3', 0.3);

    // Flash effect
    const flashEffect = document.getElementById('flashEffect');
    if (flashEffect) {
        flashEffect.classList.add('active');
    }

    setTimeout(() => {
        if (flashEffect) {
            flashEffect.classList.remove('active');
        }
        
        // Calculate new section
        let newSection;
        if (direction === 'next') {
            newSection = currentSection < sections.length - 1 ? currentSection + 1 : 0;
            photoCount = photoCount < totalPhotos ? photoCount + 1 : 1;
        } else {
            newSection = currentSection > 0 ? currentSection - 1 : sections.length - 1;
            photoCount = photoCount > 1 ? photoCount - 1 : totalPhotos;
        }
        
        console.log("switching to section", newSection, sections[newSection]);
        
        // Update current section
        currentSection = newSection;
        
        updatePhotoCounter();
        showSection(currentSection, direction);

        // Slide effect
        const slideEffect = document.getElementById('slideEffect');
        if (slideEffect) {
            slideEffect.classList.add(direction === 'next' ? 'slide-next' : 'slide-prev');
            
            setTimeout(() => {
                slideEffect.classList.remove('slide-next', 'slide-prev');
            }, 300);
        }
        
        // Reset transition state
        setTimeout(() => {
            isTransitioning = false;
            updateButtonStates();
        }, 300);
        
    }, 100);
}

// Show specific section - FIXED VERSION
function showSection(index, direction = 'next') {
    console.log("showSection called with index:", index, "section:", sections[index]);
    
    // Hide all sections first - more aggressive approach
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('active');
            section.style.display = 'none';
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
            console.log("Hiding section:", sectionId);
        }
    });

    // Force a small delay to ensure DOM updates
    setTimeout(() => {
        // Show target section
        const targetSectionId = sections[index];
        const targetSection = document.getElementById(targetSectionId);
        
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';
            targetSection.style.opacity = '1';
            targetSection.style.visibility = 'visible';
            targetSection.style.zIndex = '10';
            console.log("Showing section:", targetSectionId);
        } else {
            console.error("Target section not found:", targetSectionId);
        }

        // Handle entity appearances on landing page
        if (index === 0) {
            startEntityAppearances();
        } else {
            stopEntityAppearances();
        }
    },  0);
}

// Update battery display
function updateBatteryDisplay() {
    const batteryLevelEl = document.getElementById('batteryLevel');
    const batteryTextEl = document.getElementById('batteryText');
    const batteryIndicator = document.getElementById('batteryIndicator');
    const lowBatteryWarning = document.getElementById('lowBatteryWarning');
    const lowBatteryEffect = document.getElementById('lowBatteryEffect');

    if (batteryLevelEl) batteryLevelEl.style.width = `${batteryLevel}%`;
    if (batteryTextEl) batteryTextEl.textContent = `${batteryLevel}%`;

    // Update battery color
    if (batteryIndicator) {
        batteryIndicator.classList.remove('battery-low', 'battery-medium', 'battery-high');
        if (batteryLevel <= 10) {
            batteryIndicator.classList.add('battery-low');
        } else if (batteryLevel <= 30) {
            batteryIndicator.classList.add('battery-medium');
        } else {
            batteryIndicator.classList.add('battery-high');
        }
    }

    // Low battery warning
    if (batteryLevel <= 15) {
        if (lowBatteryWarning) lowBatteryWarning.classList.add('show');
        if (batteryIndicator) batteryIndicator.classList.add('pulse');
        if (batteryLevel <= 10 && lowBatteryEffect) {
            lowBatteryEffect.classList.add('active');
        }
    } else {
        if (lowBatteryWarning) lowBatteryWarning.classList.remove('show');
        if (batteryIndicator) batteryIndicator.classList.remove('pulse');
        if (lowBatteryEffect) lowBatteryEffect.classList.remove('active');
    }
}

// Update photo counter
function updatePhotoCounter() {
    const photoCounter = document.getElementById('photoCounter');
    if (photoCounter) {
        photoCounter.textContent = `${photoCount}/${totalPhotos}`;
    }
}

// Update date and time
function updateDateTime() {
    const dateTimeEl = document.getElementById('dateTime');
    if (dateTimeEl) {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', {
            year: '2-digit',
            month: '2-digit', 
            day: '2-digit'
        });
        const formattedTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        dateTimeEl.textContent = `${formattedDate} ${formattedTime}`;
    }
}

// Toggle recording
function toggleRecording() {
    const recordBtn = document.getElementById('recordBtn');
    const recordingIndicator = document.getElementById('recordingIndicator');
    
    isRecording = !isRecording;
    
    if (isRecording) {
        recordingTime = 0;
        if (recordBtn) recordBtn.classList.add('recording');
        if (recordingIndicator) recordingIndicator.style.display = 'flex';
        startRecordingTimer();
    } else {
        if (recordBtn) recordBtn.classList.remove('recording');
        if (recordingIndicator) recordingIndicator.style.display = 'none';
        stopRecordingTimer();
    }

    // Play camera beep sound
    playAudio('/sounds/camera-beep.mp3', 0.2);
}

// Recording timer
let recordingInterval;

function startRecordingTimer() {
    recordingInterval = setInterval(() => {
        recordingTime++;
        updateRecordingTime();
    }, 1000);
}

function stopRecordingTimer() {
    if (recordingInterval) {
        clearInterval(recordingInterval);
    }
}

function updateRecordingTime() {
    const recordingTimeEl = document.getElementById('recordingTime');
    if (recordingTimeEl) {
        const minutes = Math.floor(recordingTime / 60).toString().padStart(2, '0');
        const seconds = (recordingTime % 60).toString().padStart(2, '0');
        recordingTimeEl.textContent = `${minutes}:${seconds}`;
    }
}

// Toggle mute
function toggleMute() {
    muted = !muted;
    const video = document.getElementById('backgroundVideo');
    const muteIcon = document.getElementById('muteIcon');
    const muteText = document.getElementById('muteText');
    
    if (video) video.muted = muted;
    
    if (muteIcon && muteText) {
        if (muted) {
            muteIcon.innerHTML = `
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
            `;
            muteText.textContent = 'Disable Sound';
        } else {
            muteIcon.innerHTML = `
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            `;
            muteText.textContent = 'Enable Sound';
        }
    }
}

// Handle do not click button
const button = document.getElementById('doNotClickBtn');
  const jumpScare = document.getElementById('jumpScare');
  const jumpscareSound = document.getElementById('jumpscareSound');

  function handleDoNotClick() {
    // Show the jump scare
    jumpScare.style.display = 'block';

    // Play sound from start
    jumpscareSound.currentTime = 0;
    jumpscareSound.volume = 0.7;
    jumpscareSound.play().catch(error => {
      console.error("Audio play failed:", error);
    });

    // Disable page scroll
    document.body.style.overflow = 'hidden';

    // Hide after 3 seconds and re-enable scrolling
    setTimeout(() => {
      jumpScare.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 3000);
  }

  button.addEventListener('click', handleDoNotClick);

// Update button states
function updateButtonStates() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const recordBtn = document.getElementById('recordBtn');
    
    if (prevBtn) prevBtn.disabled = isTransitioning;
    if (nextBtn) nextBtn.disabled = isTransitioning;
    if (recordBtn) recordBtn.disabled = isTransitioning;
}

// Populate cast grid
function populateCastGrid() {
    const castGrid = document.getElementById('castGrid');
    if (!castGrid) return;

    castMembers.forEach((member, index) => {
        const castMemberEl = document.createElement('div');
        castMemberEl.className = 'cast-member';

        const imageEl = document.createElement('img');
        imageEl.src = member.image;
        imageEl.alt = member.name;
        imageEl.className = 'cast-member-image';

        // Append image first
        castMemberEl.innerHTML = `
            <div class="cast-member-image-container">
                <div class="cast-member-overlay"></div>
                <div class="cast-member-info">
                    <h3 class="cast-member-name">${member.name}</h3>
                    <p class="cast-member-role">${member.role}</p>
                </div>
                ${index === 5 ? '<div class="entity-scan-line"></div>' : ''}
            </div>
        `;
        castMemberEl.querySelector('.cast-member-image-container').prepend(imageEl);
        castGrid.appendChild(castMemberEl);

        // Auto-glitch only if the ghost image is different
        if (member.image !== member.imageGhostMode) {
            setInterval(() => {
                const shouldGlitch = Math.random() < 0.75; // 30% chance every cycle
                if (shouldGlitch) {
                    imageEl.classList.add('glitch');
                    imageEl.src = member.imageGhostMode;

                    setTimeout(() => {
                        imageEl.src = member.image;
                        imageEl.classList.remove('glitch');
                    }, 500 + Math.random() * 1000); // 0.5–1.5s glitch
                }
            }, 5000 + Math.random() * 5000); // every 5–10 seconds
        }



        // castMemberEl.innerHTML = `
        //     <div class="cast-member-image-container">
        //         <div class="cast-member-overlay"></div>
        //         <div class="cast-member-info">
        //             <h3 class="cast-member-name">${member.name}</h3>
        //             <p class="cast-member-role">${member.role}</p>
        //         </div>
        //         ${index === 5 ? '<div class="entity-scan-line"></div>' : ''}
        //     </div>
        // `;

        // castMemberEl.querySelector('.cast-member-image-container').prepend(imageEl);
        // castGrid.appendChild(castMemberEl);
    });
}

// Entity appearances
let entityInterval;

function startEntityAppearances() {
    stopEntityAppearances(); // Clear any existing interval
    
    entityInterval = setInterval(() => {
        // 10% chance to show entity every 8-15 seconds
        if (Math.random() < 0.1) {
            showEntityBriefly();
        }
    }, 8000 + Math.random() * 7000);
}

function stopEntityAppearances() {
    if (entityInterval) {
        clearInterval(entityInterval);
        entityInterval = null;
    }
}

function showEntityBriefly() {
    const entity = document.getElementById('slendermanEntity');
    if (!entity) return;
    
    const entityFigure = entity.querySelector('.entity-figure');
    
    // Randomize position
    const positions = [
        { x: Math.random() * 20, y: Math.random() * 20 }, // top left
        { x: 80 + Math.random() * 20, y: Math.random() * 20 }, // top right
        { x: Math.random() * 20, y: 80 + Math.random() * 20 }, // bottom left
        { x: 80 + Math.random() * 20, y: 80 + Math.random() * 20 }, // bottom right
    ];
    
    // Occasionally place in center areas
    let position;
    if (Math.random() < 0.2) {
        position = {
            x: 20 + Math.random() * 60,
            y: 20 + Math.random() * 60
        };
    } else {
        position = positions[Math.floor(Math.random() * positions.length)];
    }
    
    entity.style.left = `${position.x}%`;
    entity.style.top = `${position.y}%`;
    
    // Set random distortion level
    if (entityFigure) {
        const distortionLevel = Math.floor(Math.random() * 3) + 1;
        entityFigure.className = `entity-figure distortion-${distortionLevel}`;
    }
    
    // Show entity
    entity.classList.add('visible');
    
    // Play static sound
    playAudio('/sounds/static-burst.mp3', 0.2);
    
    // Hide after brief moment
    setTimeout(() => {
        entity.classList.remove('visible');
    }, 200 + Math.random() * 300);
}

// Glitch text effect
function startGlitchEffect() {
    const glitchText = document.getElementById('glitchText');
    if (!glitchText) return;
    
    setInterval(() => {
        glitchText.classList.add('glitch-active');
        
        // 30% chance to show entity during text glitch
        if (Math.random() < 0.3 && currentSection === 0) {
            showEntityBriefly();
        }
        
        setTimeout(() => {
            glitchText.classList.remove('glitch-active');
        }, 150);
    }, Math.random() * 5000 + 2000);
}

// Screen flicker for low battery
function startScreenFlicker() {
    setInterval(() => {
        if (batteryLevel <= 15 && Math.random() > 0.7) {
            const screenFlickerEl = document.getElementById('screenFlicker');
            if (screenFlickerEl) {
                screenFlickerEl.classList.add('active');
                setTimeout(() => {
                    screenFlickerEl.classList.remove('active');
                }, 100 + Math.random() * 200);
            }
        }
    }, 5000);
}

// Battery drain over time
function startBatteryDrain() {
    setInterval(() => {
        batteryLevel = Math.max(batteryLevel - 1, 3);
        updateBatteryDisplay();
    }, 60000); // Every minute
}

// Update date/time periodically
function startDateTimeUpdates() {
    setInterval(updateDateTime, 60000); // Every minute
}

// Flash indicator management
function updateFlashIndicator() {
    const flashIndicator = document.getElementById('flashIndicator');
    if (!flashIndicator) return;
    
    const flashDot = flashIndicator.querySelector('.flash-dot');
    const flashText = flashIndicator.querySelector('.flash-text');
    
    if (isTransitioning) {
        isFlashReady = false;
        flashIndicator.classList.add('charging');
        if (flashText) flashText.textContent = 'CHARGING';
        
        setTimeout(() => {
            isFlashReady = true;
            flashIndicator.classList.remove('charging');
            if (flashText) flashText.textContent = 'FLASH READY';
        }, 2000);
    }
}

// Start all intervals
function startIntervals() {
    startGlitchEffect();
    startScreenFlicker();
    startBatteryDrain();
    startDateTimeUpdates();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause intervals when page is hidden
        stopEntityAppearances();
        stopRecordingTimer();
    } else {
        // Resume when page becomes visible
        if (currentSection === 0) {
            startEntityAppearances();
        }
        if (isRecording) {
            startRecordingTimer();
        }
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    // Update any responsive elements if needed
    updateDateTime();
});

// Prevent context menu on images
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

// Add smooth scrolling for content sections
document.addEventListener('wheel', (e) => {
    if (e.target.closest('.camera-content-container')) {
        e.stopPropagation();
    }
}, { passive: true });


    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const pageSound = document.getElementById('pageSound');

    function playPageSound() {
        if (pageSound) {
            pageSound.currentTime = 0; // rewind sound
            pageSound.play();
        }
    }

    nextBtn.addEventListener('click', () => {
        playPageSound();
        // Your logic to go to the next page
    });

    prevBtn.addEventListener('click', () => {
        playPageSound();
        // Your logic to go to the previous page
    });


    //////////////

  const ambientSound = document.getElementById('ambientSound');
    const muteButton = document.getElementById('muteButton');
    const muteText = document.getElementById('muteText');

    ambientSound.volume = 0.2; // Initial volume
    let isMuted = false;

    // Ensure audio plays after user interaction
    window.addEventListener('DOMContentLoaded', () => {
        document.body.addEventListener('click', () => {
            if (ambientSound.paused) {
                ambientSound.play().catch(err => console.warn('Autoplay failed:', err));
            }
        });
    });

    // Mute/unmute logic
    muteButton.addEventListener('click', () => {
        if (isMuted) {
            ambientSound.volume = 0.2;
            muteText.textContent = 'Enable Sound';
        } else {
            ambientSound.volume = 0.0;
            muteText.textContent = 'Disable Sound';
        }
        isMuted = !isMuted;
    });

///////jumpscare page noise
// const button = document.getElementById('doNotClickBtn');
// const jumpscare = document.getElementById('jumpScare');
// const jumpscareSound = document.getElementById('jumpscareSound');

// button.addEventListener('click', () => {
//   jumpscare.style.display = 'block';
//   jumpscareSound.currentTime = 0;
//   jumpscareSound.play().catch((error) => {
//     console.error("Audio play failed:", error);
//   });
// });

const playTrailerBtn = document.getElementById('playTrailerBtn');
const trailerContainer = document.getElementById('trailerContainer');

if (playTrailerBtn && trailerContainer) {
    playTrailerBtn.addEventListener('click', () => {
        trailerContainer.innerHTML = `
            <iframe width="100%" height="100%" 
                src="https://www.youtube.com/embed/GSK7PR6iheI?autoplay=1&rel=0&modestbranding=1&controls=1" 
                title="The Final Take - Official Trailer" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    });
}

const trailerHomeButton = document.getElementById('trailerHomeButton');
if (trailerHomeButton) {
    trailerHomeButton.addEventListener('click', () => {
        window.open("https://youtu.be/GSK7PR6iheI", "_blank");
    });
}