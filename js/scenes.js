// ============================================================
// CIRA Cinema Kiosk — Scene State Machine & Animation Engine
// ============================================================

const SCENES = {
  IDLE: 0,
  USER_DETECTED: 1,
  NAMASTE_GREETING: 2,
  LANGUAGE_SELECTION: 3,
  MOVIE_BROWSING: 4,
  MOVIE_DETAILS: 5,
  SHOWTIME_SELECTION: 6,
  TICKET_COUNT: 7,
  SEAT_SELECTION: 8,
  MOBILE_NUMBER: 9,
  FOOD_BEVERAGES: 10,
  PAYMENT: 11,
  SUCCESS: 12,
  EXIT: 13
};

const CIRA_POSES = {
  [SCENES.IDLE]: null,
  [SCENES.USER_DETECTED]: 'idle',
  [SCENES.NAMASTE_GREETING]: 'namaste',
  [SCENES.LANGUAGE_SELECTION]: 'pointing',
  [SCENES.MOVIE_BROWSING]: 'idle',
  [SCENES.MOVIE_DETAILS]: 'pointing_right',
  [SCENES.SHOWTIME_SELECTION]: 'pointing',
  [SCENES.TICKET_COUNT]: 'thinking',
  [SCENES.SEAT_SELECTION]: null,
  [SCENES.MOBILE_NUMBER]: 'idle',
  [SCENES.FOOD_BEVERAGES]: 'idle',
  [SCENES.PAYMENT]: null,
  [SCENES.SUCCESS]: 'celebrate',
  [SCENES.EXIT]: 'celebrate'
};

const VOICE_LINES = {
  [SCENES.USER_DETECTED]: null,
  [SCENES.NAMASTE_GREETING]: { en: "Hello! I am Cira, your guide. Welcome to Cinepolis.", hi: "Namaste! Main Cira hoon. Cinepolis mein aapka swagat hai." },
  [SCENES.LANGUAGE_SELECTION]: { en: "Please select your preferred language.", hi: "Kripya apni bhasha chunein." },
  [SCENES.MOVIE_BROWSING]: { en: "Swipe to explore movies and tap to continue.", hi: "Filmon ko dekhne ke liye swipe karein." },
  [SCENES.MOVIE_DETAILS]: { en: "Here are the details of your selected movie. Please choose a showtime.", hi: "Yahan aapki chuni hui film ki jankari hai. Kripya showtime chunein." },
  [SCENES.SHOWTIME_SELECTION]: { en: "Select your preferred timing.", hi: "Apna pasandida samay chunein." },
  [SCENES.TICKET_COUNT]: { en: "How many tickets would you like?", hi: "Aap kitne tickets chahte hain?" },
  [SCENES.SEAT_SELECTION]: { en: "Please select your seats.", hi: "Kripya apni seaten chunein." },
  [SCENES.MOBILE_NUMBER]: { en: "Please enter your mobile number to receive your ticket.", hi: "Apna mobile number enter karein apna ticket paane ke liye." },
  [SCENES.FOOD_BEVERAGES]: { en: "Would you like to add some snacks to your order?", hi: "Kya aap apne order mein kuch snacks add karna chahenge?" },
  [SCENES.PAYMENT]: { en: "Please complete your payment to confirm your booking.", hi: "Apni booking confirm karne ke liye payment puri karein." },
  [SCENES.SUCCESS]: { en: "Thank you! Your booking is confirmed. Enjoy your movie at Cinepolis!", hi: "Dhanyavaad! Aapki booking confirm ho gayi. Cinepolis mein film ka maza lijiye!" },
  [SCENES.EXIT]: { en: "Have a great day!", hi: "Shubh din ho!" }
};

const IDLE_PROMPTS = {
  [SCENES.SEAT_SELECTION]: { en: "You can tap on available seats to continue.", hi: "Aage badhne ke liye available seats par tap karein." },
  [SCENES.MOVIE_BROWSING]: { en: "Tap any movie to see more details.", hi: "Kisi bhi film par tap karein." }
};

const SCENE_AUDIO_FILES = {
  [SCENES.NAMASTE_GREETING]: 'assets/scripts/greetings.mp3',
  [SCENES.LANGUAGE_SELECTION]: 'assets/scripts/langauge.mp3',
  [SCENES.MOVIE_BROWSING]: 'assets/scripts/movieselect.mp3',
  [SCENES.MOVIE_DETAILS]: 'assets/scripts/moviedetailsandtimings.mp3',
  [SCENES.SHOWTIME_SELECTION]: 'assets/scripts/timings.mp3',
  [SCENES.TICKET_COUNT]: 'assets/scripts/numberoftickets.mp3',
  [SCENES.SEAT_SELECTION]: 'assets/scripts/seatmap.mp3',
  [SCENES.MOBILE_NUMBER]: 'assets/scripts/mobilenumber.mp3',
  [SCENES.PAYMENT]: 'assets/scripts/payment.mp3',
  [SCENES.SUCCESS]: 'assets/scripts/thanking.mp3'
};

class CiraSceneManager {
  constructor() {
    this.currentScene = SCENES.IDLE;
    this.selectedLanguage = 'en';
    this.speechSynthesis = window.speechSynthesis;
    this.voices = [];
    this.idleTimer = null;
    this.animationQueue = [];
    this.isAnimating = false;

    this.loadVoices();
    window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
  }

  loadVoices() {
    this.voices = this.speechSynthesis.getVoices();
  }

  getPreferredVoice() {
    // Prefer female, Indian English voice
    const preferredNames = ['Veena', 'Lekha', 'Heera', 'Priya', 'Neerja', 'Google हिन्दी', 'Google UK English Female', 'Google US English'];
    for (const name of preferredNames) {
      const v = this.voices.find(v => v.name.includes(name));
      if (v) return v;
    }
    // Fallback to any female voice
    const female = this.voices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Samantha') || v.name.includes('Victoria'));
    return female || this.voices[0];
  }

  speak(text, onEnd, scene = null) {
    const enableVoice = localStorage.getItem('cira_enable_voice') !== 'false';
    
    // If voice is disabled, skip audio playback but handle transition timings gracefully
    if (!enableVoice) {
      if (scene === SCENES.NAMASTE_GREETING) {
        setTimeout(() => {
          onEnd && onEnd();
        }, 1600); // 1.6s matches greeting.mp3 duration
      } else {
        onEnd && onEnd();
      }
      return;
    }

    // If pre-recorded audio is mapped for this scene
    if (scene && SCENE_AUDIO_FILES[scene]) {
      let audioUrl = SCENE_AUDIO_FILES[scene];
      if (this.selectedLanguage === 'hi') {
        if (scene === SCENES.MOVIE_BROWSING) audioUrl = 'assets/scripts_hindi/movieselecthindi.mp3';
        else if (scene === SCENES.MOVIE_DETAILS) audioUrl = 'assets/scripts_hindi/moviedetailsandtimingshindi.mp3';
        else if (scene === SCENES.SHOWTIME_SELECTION) audioUrl = 'assets/scripts_hindi/timingshindi.mp3';
        else if (scene === SCENES.TICKET_COUNT) audioUrl = 'assets/scripts_hindi/numberofticketshindi.mp3';
        else if (scene === SCENES.SEAT_SELECTION) audioUrl = 'assets/scripts_hindi/seatmaphindi.mp3';
        else if (scene === SCENES.MOBILE_NUMBER) audioUrl = 'assets/scripts_hindi/mobilenumberhindi.mp3';
        else if (scene === SCENES.PAYMENT) audioUrl = 'assets/scripts_hindi/paymenthindi.mp3';
        else if (scene === SCENES.SUCCESS) audioUrl = 'assets/scripts_hindi/thanking.mp3';
      }
      console.log(`[CIRA Audio] Playing pre-recorded voice for scene ${scene} (Lang: ${this.selectedLanguage}): ${audioUrl}`);

      this.speechSynthesis.cancel();
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      const volume = (parseFloat(localStorage.getItem('cira_voice_volume')) || 100) / 100;
      audio.volume = volume;

      audio.onended = () => {
        onEnd && onEnd();
      };
      audio.onerror = (e) => {
        console.warn(`[CIRA Audio] Failed to play pre-recorded audio for scene ${scene}:`, e);
        if (scene === SCENES.NAMASTE_GREETING) {
          setTimeout(() => {
            onEnd && onEnd();
          }, 1600); // 1.6s matches greeting.mp3 duration
        } else {
          onEnd && onEnd();
        }
      };
      audio.play().catch(e => {
        console.warn(`[CIRA Audio] Play blocked for scene ${scene}:`, e);
        if (scene === SCENES.NAMASTE_GREETING) {
          setTimeout(() => {
            onEnd && onEnd();
          }, 1600); // 1.6s matches greeting.mp3 duration
        } else {
          onEnd && onEnd();
        }
      });
    } else {
      onEnd && onEnd();
    }
  }

  speakForScene(scene, onEnd) {
    const lines = VOICE_LINES[scene];
    if (!lines) { onEnd && onEnd(); return; }
    const text = lines[this.selectedLanguage] || lines['en'];
    this.speak(text, onEnd, scene);
  }

  transitionTo(scene, data, onVoiceEnd) {
    this.clearIdleTimer();
    const prev = this.currentScene;
    this.currentScene = scene;
    this.updateCiraState(scene);
    this.speakForScene(scene, onVoiceEnd);
    this.setupIdlePrompt(scene);
    document.dispatchEvent(new CustomEvent('sceneChange', { detail: { scene, prev, data } }));
  }

  updateCiraState(scene) {
    const ciraEl = document.getElementById('cira-character');
    if (!ciraEl) return;

    const pose = CIRA_POSES[scene];

    // Remove all pose classes
    ciraEl.classList.remove('pose-idle', 'pose-namaste', 'pose-pointing', 'pose-pointing-right', 'pose-thinking', 'pose-celebrate', 'cira-hidden');

    if (scene === SCENES.USER_DETECTED || scene === SCENES.NAMASTE_GREETING) {
      ciraEl.classList.add('cira-centered');
    } else {
      ciraEl.classList.remove('cira-centered');
    }

    if (scene === SCENES.MOVIE_DETAILS) {
      ciraEl.classList.add('cira-right');
    } else {
      ciraEl.classList.remove('cira-right');
    }

    if (pose === null) {
      ciraEl.classList.add('cira-hidden');
      return;
    }

    // Update image source
    const img = ciraEl.querySelector('img.cira-img');
    if (img) {
      if (pose === 'namaste') {
        img.src = 'assets/cira/cira_namaste.webp';
      } else if (pose === 'pointing') {
        img.src = 'assets/cira/cira_pointing.webp';
      } else if (pose === 'pointing_right') {
        img.src = 'assets/cira/cira_pointing_right.webp';
      } else if (pose === 'thinking') {
        img.src = 'assets/cira/cira_thinking.webp';
      } else if (pose === 'celebrate') {
        img.src = 'assets/cira/cira_celebrate.webp';
      } else {
        img.src = 'assets/cira/cira_idle.webp';
      }
    }

    // Add transition animation class
    ciraEl.classList.add('cira-transition');
    setTimeout(() => {
      ciraEl.classList.remove('cira-transition');
      ciraEl.classList.add(`pose-${pose}`);
    }, 100);
  }

  setupIdlePrompt(scene) {
    if (IDLE_PROMPTS[scene]) {
      this.idleTimer = setTimeout(() => {
        const prompt = IDLE_PROMPTS[scene];
        const text = prompt[this.selectedLanguage] || prompt['en'];
        this.speak(text);
        this.idleTimer = setTimeout(() => this.transitionTo(SCENES.EXIT), 60000);
      }, 5000);
    }
  }

  clearIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  setLanguage(lang) {
    this.selectedLanguage = lang;
  }
}

window.CiraSceneManager = CiraSceneManager;
window.SCENES = SCENES;
window.VOICE_LINES = VOICE_LINES;
