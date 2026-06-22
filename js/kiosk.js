// ============================================================
// CIRA Cinema Kiosk — Main Kiosk Controller
// ============================================================

class CinemaKiosk {
  constructor() {
    this.sceneManager = new CiraSceneManager();
    this.state = {
      selectedMovie: null,
      selectedShowtime: null,
      ticketCount: 1,
      selectedSeats: [],
      mobileNumber: '',
      fnbOrder: [],
      selectedPayment: null,
      bookingId: null,
      currentSeats: []
    };
    this.adInterval = null;
    this.currentAdIndex = 0;
    this.inactivityTimer = null;
    this.paymentSimulationTimers = [];
    this.init();
  }

  init() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
    this.startIdleAds();
    this.setupEventListeners();
    this.showScreen('idle');
  }

  updateClock() {
    const now = new Date();
    const timeEl = document.getElementById('kiosk-time');
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    const dateEl = document.getElementById('kiosk-date');
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    }
  }

  // ===================== AD ROTATION =====================
  startIdleAds() {
    const ads = MOCK_DATA.adCreatives;
    const container = document.getElementById('idle-ad-track');
    if (!container) return;

    container.style.opacity = '1';

    container.innerHTML = ads.map((ad, i) => `
      <div class="idle-ad-slide ${i === 0 ? 'active' : ''}" id="ad-slide-${i}">
        <div style="position:absolute;inset:0;background:linear-gradient(135deg, #ffffff 0%, #f4f5f8 60%, ${ad.color}15 100%);"></div>
        <div class="idle-overlay">
          <div class="idle-tap-prompt">
            <div style="font-family:'Outfit',sans-serif;font-size:clamp(32px,5vw,72px);font-weight:900;text-align:center;color:var(--text-primary);margin-bottom:8px;">${ad.title}</div>
            <div style="font-size:clamp(16px,2vw,24px);color:var(--text-secondary);text-align:center;margin-bottom:40px;">${ad.subtitle}</div>
            <div class="idle-tap-ring" onclick="window.kiosk.onUserDetected()">
              <div class="idle-tap-inner">👆</div>
            </div>
            <div class="idle-tap-text" style="color:var(--text-primary);text-shadow:none;">Tap to Start</div>
            <div class="idle-tap-sub" style="color:var(--text-secondary);">Touch anywhere to begin booking</div>
          </div>
        </div>
      </div>
    `).join('');

    this.adInterval = setInterval(() => {
      const slides = container.querySelectorAll('.idle-ad-slide');
      slides[this.currentAdIndex].classList.remove('active');
      this.currentAdIndex = (this.currentAdIndex + 1) % ads.length;
      slides[this.currentAdIndex].classList.add('active');
    }, 5000);
  }

  stopIdleAds() {
    if (this.adInterval) {
      clearInterval(this.adInterval);
      this.adInterval = null;
    }
  }

  // ===================== SCREEN MANAGEMENT =====================
  showScreen(screenId, data) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
      target.classList.add('active');
      this.renderScreen(screenId, data);
    }
  }

  renderScreen(screenId, data) {
    switch (screenId) {
      case 'idle': this.renderIdle(); break;
      case 'language': this.renderLanguage(); break;
      case 'movies': this.renderMovies(); break;
      case 'movie-detail': this.renderMovieDetail(data); break;
      case 'showtimes': this.renderShowtimes(data); break;
      case 'ticket-count': this.renderTicketCount(); break;
      case 'seat-selection': this.renderSeatSelection(); break;
      case 'mobile-number': this.renderMobileInput(); break;
      case 'food-beverages': this.renderFnB(); break;
      case 'payment': this.renderPayment(); break;
      case 'success': this.renderSuccess(); break;
    }
  }

  // ===================== SCENE TRANSITIONS =====================
  onUserDetected() {
    this.stopIdleAds();
    const container = document.getElementById('idle-ad-track');
    if (container) {
      container.style.transition = 'opacity 0.6s ease';
      container.style.opacity = '0';
    }
    this.sceneManager.transitionTo(SCENES.USER_DETECTED);
    this.resetInactivityTimer();
    setTimeout(() => {
      this.sceneManager.transitionTo(SCENES.NAMASTE_GREETING, null, () => {
        this.showScreen('language');
        this.sceneManager.transitionTo(SCENES.LANGUAGE_SELECTION);
      });
    }, 1000);
  }

  onLanguageSelected(lang) {
    this.sceneManager.setLanguage(lang);
    this.sceneManager.transitionTo(SCENES.MOVIE_BROWSING);
    this.showScreen('movies');
  }

  onMovieSelected(movieId) {
    VistaAPI.getMovie(movieId).then(res => {
      this.state.selectedMovie = res.data;
      this.sceneManager.transitionTo(SCENES.MOVIE_DETAILS);
      this.showScreen('movie-detail', res.data);
    });
  }

  onShowMovieShowtimes(movieId) {
    this.sceneManager.transitionTo(SCENES.SHOWTIME_SELECTION);
    this.showScreen('showtimes', this.state.selectedMovie);
  }

  onShowtimeSelected(showtimeId) {
    const showtime = this.state.selectedMovie.showtimes.find(s => s.id === showtimeId);
    this.state.selectedShowtime = showtime;
    this.sceneManager.transitionTo(SCENES.TICKET_COUNT);
    this.showScreen('ticket-count');
  }

  onTicketCountConfirmed() {
    this.sceneManager.transitionTo(SCENES.SEAT_SELECTION);
    this.showScreen('seat-selection');
  }

  onSeatsConfirmed() {
    this.sceneManager.transitionTo(SCENES.PAYMENT);
    this.showScreen('payment');
  }

  onMobileSubmitted() {
    const payload = {
      movie: this.state.selectedMovie?.title,
      showtime: this.state.selectedShowtime?.time,
      screen: this.state.selectedShowtime?.screen,
      seats: this.state.selectedSeats.map(s => s.label).join(', '),
      mobile: this.state.mobileNumber,
      tickets: this.state.ticketCount,
      fnb: this.state.fnbOrder,
      total: this.calculateTotal()
    };
    VistaAPI.bookTickets(payload).then(res => {
      this.state.bookingId = res.data.bookingId;
      this.sceneManager.transitionTo(SCENES.SUCCESS);
      this.showScreen('success');
      setTimeout(() => this.onExit(), 15000);
    });
  }

  onFnBDone() {
    this.sceneManager.transitionTo(SCENES.PAYMENT);
    this.showScreen('payment');
  }

  onPaymentComplete() {
    this.clearPaymentSimulation();
    this.sceneManager.transitionTo(SCENES.MOBILE_NUMBER);
    this.showScreen('mobile-number');
  }

  onExit() {
    this.clearInactivityTimer();
    this.clearPaymentSimulation();
    this.sceneManager.transitionTo(SCENES.EXIT);
    this.resetState();
    setTimeout(() => {
      this.showScreen('idle');
      this.startIdleAds();
      this.sceneManager.transitionTo(SCENES.IDLE);
    }, 3000);
  }

  resetState() {
    this.clearPaymentSimulation();
    this.state = {
      selectedMovie: null, selectedShowtime: null, ticketCount: 1,
      selectedSeats: [], mobileNumber: '', fnbOrder: [],
      selectedPayment: null, bookingId: null, currentSeats: []
    };
    this.updateOrderBar(false);
  }

  clearPaymentSimulation() {
    if (this.paymentSimulationTimers && this.paymentSimulationTimers.length > 0) {
      this.paymentSimulationTimers.forEach(timer => clearTimeout(timer));
      this.paymentSimulationTimers = [];
    }
  }

  handlePaymentBack() {
    this.clearPaymentSimulation();
    this.showScreen('seat-selection');
    this.sceneManager.transitionTo(SCENES.SEAT_SELECTION);
  }

  calculateTotal() {
    if (!this.state.selectedMovie || !this.state.selectedShowtime) return 0;
    const pricePerTicket = 50;
    const ticketTotal = pricePerTicket * this.state.ticketCount;
    const fnbTotal = this.state.fnbOrder.reduce((sum, item) => sum + item.price * item.qty, 0);
    return ticketTotal + fnbTotal;
  }

  updateOrderBar(show, opts = {}) {
    const bar = document.getElementById('order-summary-bar');
    if (!bar) return;
    if (!show) { bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden');
    bar.innerHTML = `
      <div class="order-summary-info">
        ${opts.movie ? `<div class="order-summary-item"><span class="order-summary-label">Movie</span><span class="order-summary-value">${opts.movie}</span></div>` : ''}
        ${opts.time ? `<div class="order-summary-item"><span class="order-summary-label">Showtime</span><span class="order-summary-value">${opts.time}</span></div>` : ''}
        ${opts.seats ? `<div class="order-summary-item"><span class="order-summary-label">Seats</span><span class="order-summary-value">${opts.seats}</span></div>` : ''}
        ${opts.tickets ? `<div class="order-summary-item"><span class="order-summary-label">Tickets</span><span class="order-summary-value">${opts.tickets}</span></div>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:16px;">
        ${opts.total ? `<span class="order-summary-price">₹${opts.total}</span>` : ''}
        ${opts.nextBtn ? `<button class="btn btn-primary" onclick="${opts.nextBtn.action}">${opts.nextBtn.label}</button>` : ''}
      </div>
    `;
  }

  // ===================== RENDER FUNCTIONS =====================
  renderIdle() {
    this.updateOrderBar(false);
  }

  renderLanguage() {
    const container = document.getElementById('language-grid');
    if (!container) return;
    container.innerHTML = MOCK_DATA.languages.map(lang => `
      <div class="lang-card animate-fade-in-up" onclick="window.kiosk.onLanguageSelected('${lang.code}')" id="lang-${lang.code}">
        <span class="lang-native">${lang.native}</span>
        <span class="lang-english">${lang.label}</span>
      </div>
    `).join('');
  }

  renderMovies() {
    const container = document.getElementById('movies-list');
    if (!container) return;
    container.innerHTML = MOCK_DATA.movies.map((movie, i) => `
      <div class="movie-card animate-fade-in-up" style="animation-delay:${i * 0.08}s" onclick="window.kiosk.onMovieSelected('${movie.id}')" id="movie-${movie.id}">
        <div class="movie-poster-wrap">
          <img class="movie-poster" src="${movie.poster}" alt="${movie.title}" loading="lazy" onerror="this.style.background='linear-gradient(135deg,#1E0A3C,#3D1A7A)';this.style.minHeight='200px'">
        </div>
        <div class="movie-card-details">
          <div class="movie-card-title">${movie.title}</div>
          <div class="movie-card-meta">
            <span class="movie-imdb">⭐ ${movie.imdb}</span>
            <span>${movie.genre[0]}</span>
            <span>•</span>
            <span>${movie.duration}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderMovieDetail(movie) {
    if (!movie) return;
    const container = document.getElementById('movie-detail-content');
    if (!container) return;

    const todayShowtimes = movie.showtimes.filter(s => s.date === 'Today');
    const tomorrowShowtimes = movie.showtimes.filter(s => s.date === 'Tomorrow');

    const showtimeCard = (st) => {
      const seatsClass = st.available <= 15 ? 'critical' : st.available <= 40 ? 'low' : 'good';
      const seatsLabel = st.available <= 15 ? '🔴 Almost Full' : st.available <= 40 ? '🟡 Filling Fast' : `🟢 ${st.available} Available`;
      return `
        <div class="showtime-card ${st.available <= 15 ? 'almost-full' : ''}" onclick="window.kiosk.onShowtimeSelected('${st.id}')" id="showtime-${st.id}">
          <div>
            <div class="showtime-time">${st.time}</div>
            <div class="showtime-screen">${st.screen}</div>
          </div>
          <div class="showtime-availability">
            <div class="showtime-seats ${seatsClass}">${seatsLabel}</div>
          </div>
        </div>
      `;
    };

    container.innerHTML = `
      <div class="detail-layout animate-fade-in">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <button class="btn btn-ghost btn-sm" onclick="window.kiosk.showScreen('movies')">← Back</button>
          <div style="font-family:'Outfit',sans-serif; font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Movie Details & Timings</div>
        </div>

        <div>
          <img class="detail-poster" src="${movie.poster}" alt="${movie.title}" onerror="this.style.background='linear-gradient(135deg,#1E0A3C,#3D1A7A)';this.style.minHeight='380px'">
        </div>

        <div>
          <div class="detail-title">${movie.title}</div>
          <div class="detail-meta-row">
            <span class="badge badge-accent">${movie.rating}</span>
            ${movie.genre.map(g => `<span class="badge badge-info">${g}</span>`).join('')}
            <span class="badge badge-success">IMDb ${movie.imdb}</span>
          </div>
          <div style="display:flex;gap:24px;margin-bottom:16px;color:var(--text-secondary);font-size:15px;">
            <span>🕐 ${movie.duration}</span>
            <span>🎬 ${movie.language}</span>
            <span>🎭 ${movie.director}</span>
          </div>
          <p class="detail-synopsis">${movie.synopsis}</p>
          <div style="margin-bottom:16px;">
            <div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Cast</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">${movie.cast.map(c => `<span class="badge badge-accent">${c}</span>`).join('')}</div>
          </div>
          <div style="margin-bottom:24px;">
            <div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Formats Available</div>
            <div style="display:flex;gap:8px;">${movie.format.map(f => `<span class="badge badge-success">${f}</span>`).join('')}</div>
          </div>
        </div>

        <!-- Timings Section -->
        <div class="divider" style="margin:24px 0 16px;"></div>
        
        <div>
          <h3 class="screen-title" style="font-size:18px; margin-bottom:4px;">Select Showtime</h3>
          <p class="screen-subtitle" style="font-size:12px; margin-bottom:16px;">Choose a timing to begin booking</p>
        </div>

        ${todayShowtimes.length ? `
          <div style="margin-bottom:16px;">
            <div style="font-family:'Outfit',sans-serif;font-size:12px;letter-spacing:2px;color:var(--text-muted);text-transform:uppercase;margin-bottom:12px;">Today</div>
            <div class="showtime-grid">${todayShowtimes.map(showtimeCard).join('')}</div>
          </div>
        ` : ''}

        ${tomorrowShowtimes.length ? `
          <div style="margin-bottom:24px;">
            <div style="font-family:'Outfit',sans-serif;font-size:12px;letter-spacing:2px;color:var(--text-muted);text-transform:uppercase;margin-bottom:12px;">Tomorrow</div>
            <div class="showtime-grid">${tomorrowShowtimes.map(showtimeCard).join('')}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderShowtimes(movie) {
    if (!movie) return;
    const container = document.getElementById('showtimes-content');
    if (!container) return;

    const todayShowtimes = movie.showtimes.filter(s => s.date === 'Today');
    const tomorrowShowtimes = movie.showtimes.filter(s => s.date === 'Tomorrow');

    const showtimeCard = (st) => {
      const pct = ((st.total - st.available) / st.total) * 100;
      const seatsClass = st.available <= 15 ? 'critical' : st.available <= 40 ? 'low' : 'good';
      const seatsLabel = st.available <= 15 ? '🔴 Almost Full' : st.available <= 40 ? '🟡 Filling Fast' : `🟢 ${st.available} Available`;
      return `
        <div class="showtime-card ${st.available <= 15 ? 'almost-full' : ''}" onclick="window.kiosk.onShowtimeSelected('${st.id}')" id="showtime-${st.id}">
          <div>
            <div class="showtime-time">${st.time}</div>
            <div class="showtime-screen">${st.screen}</div>
          </div>
          <div class="showtime-availability">
            <div class="showtime-seats ${seatsClass}">${seatsLabel}</div>
          </div>
        </div>
      `;
    };

    container.innerHTML = `
      <div>
        <h2 class="screen-title">${movie.title}</h2>
        <p class="screen-subtitle">Select a showtime — ${new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</p>
      </div>
      ${todayShowtimes.length ? `
        <div>
          <div style="font-family:'Outfit',sans-serif;font-size:13px;letter-spacing:2px;color:var(--text-muted);text-transform:uppercase;margin-bottom:12px;">Today</div>
          <div class="showtime-grid">${todayShowtimes.map(showtimeCard).join('')}</div>
        </div>
      ` : ''}
      ${tomorrowShowtimes.length ? `
        <div>
          <div style="font-family:'Outfit',sans-serif;font-size:13px;letter-spacing:2px;color:var(--text-muted);text-transform:uppercase;margin-bottom:12px;">Tomorrow</div>
          <div class="showtime-grid">${tomorrowShowtimes.map(showtimeCard).join('')}</div>
        </div>
      ` : ''}
      <button class="btn btn-ghost" onclick="window.kiosk.showScreen('movie-detail', window.kiosk.state.selectedMovie)">← Back</button>
    `;
  }

  renderTicketCount() {
    const container = document.getElementById('ticket-count-content');
    if (!container) return;

    this.state.isDefaultTicketCount = true;
    this.state.ticketInputStr = this.state.ticketCount.toString();

    container.innerHTML = `
      <div style="text-align:center;max-width:500px;margin:0 auto;">
        <h2 class="screen-title">How many tickets?</h2>
        <p class="screen-subtitle">Enter the number of tickets</p>
        <div class="numpad-display" id="ticket-numpad-display" style="margin:24px auto 12px;min-height:60px;">
          ${this.state.ticketInputStr}
        </div>
        <div id="ticket-keypad" style="margin-bottom:20px;">
          <div class="numpad-grid" style="margin:0 auto;">
            ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k => `
              <button class="numpad-btn" onclick="window.kiosk.ticketNumpadPress('${k}')" ${k === '' ? 'style="visibility:hidden"' : ''}>${k}</button>
            `).join('')}
          </div>
        </div>
        <div style="text-align:center;margin-bottom:20px;">
          <div id="ticket-price-info" style="font-family:'Outfit',sans-serif;font-size:var(--text-xl);color:var(--accent);font-weight:700;">₹${this.calculateTotal()} total</div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:4px;">${this.state.selectedShowtime?.screen || ''} · ${this.state.selectedShowtime?.time || ''}</div>
        </div>
        <div style="display:flex;gap:12px;justify-content:center;align-items:center;">
          <button class="btn btn-ghost btn-xl" onclick="window.kiosk.showScreen('movie-detail', window.kiosk.state.selectedMovie)">← Back</button>
          <button class="btn btn-primary btn-xl" id="btn-confirm-tickets" onclick="window.kiosk.onTicketCountConfirmed()" ${this.state.ticketCount < 1 ? 'disabled' : ''}>Select Seats →</button>
        </div>
      </div>
    `;
  }

  ticketNumpadPress(key) {
    let currentStr = this.state.ticketInputStr || '';
    
    // If it's the first key press and the current string is the default '1', overwrite it
    if (this.state.isDefaultTicketCount && key !== '⌫') {
      currentStr = '';
      this.state.isDefaultTicketCount = false;
    }

    if (key === '⌫') {
      currentStr = currentStr.slice(0, -1);
      this.state.isDefaultTicketCount = false;
    } else if (key !== '') {
      if (currentStr.length >= 3) return; // limit to 3 digits
      if (currentStr === '0') {
        currentStr = key;
      } else {
        currentStr += key;
      }
    }
    
    this.state.ticketInputStr = currentStr;
    const parsedVal = parseInt(currentStr, 10);
    this.state.ticketCount = isNaN(parsedVal) ? 0 : parsedVal;

    // Update display
    const displayEl = document.getElementById('ticket-numpad-display');
    if (displayEl) {
      displayEl.textContent = currentStr || '0';
    }

    // Update price
    const priceEl = document.getElementById('ticket-price-info');
    if (priceEl) {
      priceEl.textContent = `₹${this.calculateTotal()} total`;
    }

    // Enable/Disable confirm button
    const confirmBtn = document.getElementById('btn-confirm-tickets');
    if (confirmBtn) {
      confirmBtn.disabled = this.state.ticketCount < 1;
    }
  }

  renderSeatSelection() {
    const container = document.getElementById('seat-selection-content');
    if (!container) return;

    VistaAPI.getSeats(this.state.selectedShowtime.id, this.state.selectedShowtime.total).then(res => {
      this.state.currentSeats = res.data;
      this.state.selectedSeats = [];
      this.renderSeatMap(container);
    });
  }

  renderSeatMap(container) {
    const seats = this.state.currentSeats;
    const rows = [...new Set(seats.map(s => s.row))];
    const needed = this.state.ticketCount;

    const seatsByRow = {};
    rows.forEach(r => seatsByRow[r] = seats.filter(s => s.row === r));

    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;width:100%;">
        <button class="btn btn-ghost btn-sm" onclick="window.kiosk.showScreen('ticket-count')" style="padding:6px 12px;font-size:12px;">← Back</button>
        <div style="text-align:right;">
          <h2 class="screen-title" style="font-size:16px;">Select Your Seats</h2>
          <p class="screen-subtitle" style="font-size:11px;margin-top:2px;">Choose ${needed} seat${needed > 1 ? 's' : ''} · ${this.state.selectedShowtime.screen}</p>
        </div>
      </div>
      <div class="seat-map-container">
        <div class="seat-screen-label">SCREEN THIS WAY</div>
        <div class="seat-screen-bar"></div>
        <div class="seat-grid" id="seat-grid">
          ${rows.map(row => `
            <div class="seat-row">
              <span class="seat-row-label">${row}</span>
              ${seatsByRow[row].map(seat => `
                <div class="seat ${seat.status} ${seat.type}"
                     id="seat-${seat.id.replace(/[^a-zA-Z0-9]/g,'_')}"
                     data-seat-id="${seat.id}"
                     data-label="${seat.label}"
                     onclick="window.kiosk.toggleSeat('${seat.id}', '${seat.status}', '${seat.label}')"
                     title="${seat.label}">
                  ${seat.status === 'selected' ? '✓' : ''}
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
        <div class="seat-legend">
          <div class="legend-item"><div class="legend-dot" style="background:#E5E7EB;border:1px solid #D1D5DB"></div> Available</div>
          <div class="legend-item"><div class="legend-dot" style="background:#10B981"></div> Selected</div>
          <div class="legend-item"><div class="legend-dot" style="background:#EF4444;border:1px solid #DC2626"></div> Booked</div>
        </div>
      </div>
      <div style="margin-top:16px; display:flex; flex-direction:column; align-items:center;">
        <div id="seat-status" style="font-family:'Outfit',sans-serif;font-size:var(--text-base);color:var(--text-secondary);margin-bottom:12px;text-align:center;">Select ${needed} seat${needed > 1 ? 's' : ''}</div>
        <div style="display:flex;gap:12px;justify-content:center;align-items:center;width:100%;">
          <button class="btn btn-ghost btn-xl" id="btn-back-seats" onclick="window.kiosk.showScreen('ticket-count')">← Back</button>
          <button class="btn btn-primary btn-xl" id="btn-confirm-seats" disabled onclick="window.kiosk.onSeatsConfirmed()">Confirm Seats →</button>
        </div>
        <div id="cira-seats-character" style="margin-top:16px; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none;">
          <img src="assets/cira/cira_pointing_up.webp" style="height:220px; width:auto; object-fit:contain; animation: breathe 4s ease-in-out infinite; display:block;" alt="Cira Pointing Up">
        </div>
      </div>
    `;
  }

  toggleSeat(seatId, status, label) {
    const seat = this.state.currentSeats.find(s => s.id === seatId);
    if (!seat) return;
    if (seat.status === 'booked' || seat.status === 'reserved') return;

    const needed = this.state.ticketCount;

    if (seat.status === 'selected') {
      // Manual Deselection: Just deselect this single seat
      seat.status = 'available';
      this.state.selectedSeats = this.state.selectedSeats.filter(s => s.id !== seatId);
    } else {
      // Selection:
      // If we have selected 0 seats, OR if we have already reached the needed count (BookMyShow style reset)
      if (this.state.selectedSeats.length === 0 || this.state.selectedSeats.length === needed) {
        // Clear all previous selected seats
        this.state.selectedSeats.forEach(sel => {
          const s = this.state.currentSeats.find(curr => curr.id === sel.id);
          if (s) s.status = 'available';
        });
        this.state.selectedSeats = [];

        // Find consecutive seats starting from the clicked seat
        const rowSeats = this.state.currentSeats
          .filter(s => s.row === seat.row)
          .sort((a, b) => a.number - b.number);
        
        const pivotIndex = rowSeats.findIndex(s => s.id === seatId);
        if (pivotIndex !== -1) {
          let selectedList = [rowSeats[pivotIndex]];

          // Expand right
          let lastCol = rowSeats[pivotIndex].number;
          for (let i = pivotIndex + 1; i < rowSeats.length; i++) {
            if (selectedList.length >= needed) break;
            const s = rowSeats[i];
            if (s.status === 'available' && s.number === lastCol + 1) {
              selectedList.push(s);
              lastCol = s.number;
            } else {
              break;
            }
          }

          // Expand left if needed
          if (selectedList.length < needed) {
            let firstCol = rowSeats[pivotIndex].number;
            for (let i = pivotIndex - 1; i >= 0; i--) {
              if (selectedList.length >= needed) break;
              const s = rowSeats[i];
              if (s.status === 'available' && s.number === firstCol - 1) {
                selectedList.unshift(s); // Prepend to keep ordered
                firstCol = s.number;
              } else {
                break;
              }
            }
          }

          // Apply selection
          selectedList.forEach(s => {
            s.status = 'selected';
            this.state.selectedSeats.push({ id: s.id, label: s.label });
          });
        }
      } else {
        // Manual Refinement: Just add this seat to the selection
        seat.status = 'selected';
        this.state.selectedSeats.push({ id: seatId, label });
      }
    }

    // Update DOM for all seats to reflect current status
    this.state.currentSeats.forEach(s => {
      const seatEl = document.getElementById(`seat-${s.id.replace(/[^a-zA-Z0-9]/g,'_')}`);
      if (seatEl) {
        seatEl.className = `seat ${s.status} ${s.type}`;
        seatEl.innerHTML = s.status === 'selected' ? '✓' : '';
      }
    });

    const count = this.state.selectedSeats.length;
    const statusEl = document.getElementById('seat-status');
    if (statusEl) {
      statusEl.textContent = count === needed
        ? `✓ ${count} seat${count > 1 ? 's' : ''} selected: ${this.state.selectedSeats.map(s => s.label).join(', ')}`
        : `${count}/${needed} seats selected`;
      statusEl.style.color = count === needed ? 'var(--success)' : 'var(--text-secondary)';
    }

    const confirmBtn = document.getElementById('btn-confirm-seats');
    if (confirmBtn) confirmBtn.disabled = count !== needed;

    this.updateOrderBar(true, {
      movie: this.state.selectedMovie?.title,
      time: this.state.selectedShowtime?.time,
      seats: count > 0 ? this.state.selectedSeats.map(s => s.label).join(', ') : '-',
      tickets: `${needed} ticket${needed > 1 ? 's' : ''}`,
      total: this.calculateTotal()
    });
  }

  renderMobileInput() {
    const container = document.getElementById('mobile-input-content');
    if (!container) return;

    container.innerHTML = `
      <div style="text-align:center;max-width:500px;margin:0 auto;">
        <h2 class="screen-title">Enter Mobile Number</h2>
        <p class="screen-subtitle">Your ticket will be sent via SMS & WhatsApp</p>
        <div class="mobile-input-wrapper" style="margin:32px auto;">
          <span class="mobile-prefix">+91</span>
          <input type="tel" class="input-field mobile-input" id="mobile-input" 
                 placeholder="XXXXXXXXXX" maxlength="10"
                 oninput="window.kiosk.onMobileInput(this.value)"
                 value="${this.state.mobileNumber}">
        </div>
        <div id="mobile-keypad">
          <div class="numpad-grid" style="margin:0 auto;">
            ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k => `
              <button class="numpad-btn" onclick="window.kiosk.numpadPress('${k}')" ${k === '' ? 'style="visibility:hidden"' : ''}>${k}</button>
            `).join('')}
          </div>
        </div>
        <div style="margin-top:24px;display:flex;gap:12px;justify-content:center;">
          <button class="btn btn-ghost btn-xl" onclick="window.kiosk.showScreen('payment'); window.kiosk.sceneManager.transitionTo(window.SCENES.PAYMENT);">← Back</button>
          <button class="btn btn-primary btn-xl" id="btn-submit-mobile" onclick="window.kiosk.onMobileSubmitted()" disabled>Continue →</button>
        </div>
      </div>
    `;
  }

  onMobileInput(val) {
    this.state.mobileNumber = val.replace(/\D/g, '').slice(0, 10);
    const input = document.getElementById('mobile-input');
    if (input) input.value = this.state.mobileNumber;
    const btn = document.getElementById('btn-submit-mobile');
    if (btn) btn.disabled = this.state.mobileNumber.length !== 10;
  }

  numpadPress(key) {
    if (key === '⌫') {
      this.state.mobileNumber = this.state.mobileNumber.slice(0, -1);
    } else if (key !== '' && this.state.mobileNumber.length < 10) {
      this.state.mobileNumber += key;
    }
    const input = document.getElementById('mobile-input');
    if (input) input.value = this.state.mobileNumber;
    const btn = document.getElementById('btn-submit-mobile');
    if (btn) btn.disabled = this.state.mobileNumber.length !== 10;
  }

  renderFnB() {
    const container = document.getElementById('fnb-content');
    if (!container) return;

    container.innerHTML = `
      <div>
        <h2 class="screen-title">🍿 Add Snacks & Drinks</h2>
        <p class="screen-subtitle">Enhance your experience with our premium F&B menu</p>
      </div>
      <div class="fnb-grid">
        ${MOCK_DATA.fnbMenu.map(item => `
          <div class="fnb-card" id="fnb-${item.id}">
            <span class="fnb-emoji">${item.image}</span>
            <div class="fnb-name">${item.name}</div>
            <div class="fnb-desc">${item.description}</div>
            <div class="fnb-price">₹${item.price}</div>
            <div class="fnb-counter">
              <button class="fnb-counter-btn" onclick="window.kiosk.adjustFnB('${item.id}', -1)">−</button>
              <span class="fnb-count" id="fnb-count-${item.id}">0</span>
              <button class="fnb-counter-btn" onclick="window.kiosk.adjustFnB('${item.id}', 1)">+</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:16px;">
        <button class="btn btn-ghost btn-xl" onclick="window.kiosk.showScreen('mobile-number')">← Back</button>
        <button class="btn btn-primary btn-xl" onclick="window.kiosk.onFnBDone()">Proceed to Payment →</button>
        <button class="btn btn-ghost btn-xl" onclick="window.kiosk.onFnBDone()">Skip</button>
      </div>
    `;
  }

  adjustFnB(itemId, delta) {
    const item = MOCK_DATA.fnbMenu.find(i => i.id === itemId);
    if (!item) return;
    let existing = this.state.fnbOrder.find(i => i.id === itemId);
    if (!existing) {
      existing = { ...item, qty: 0 };
      this.state.fnbOrder.push(existing);
    }
    existing.qty = Math.max(0, existing.qty + delta);
    if (existing.qty === 0) this.state.fnbOrder = this.state.fnbOrder.filter(i => i.id !== itemId);

    const countEl = document.getElementById(`fnb-count-${itemId}`);
    if (countEl) countEl.textContent = existing.qty;

    const card = document.getElementById(`fnb-${itemId}`);
    if (card) card.classList.toggle('selected', existing.qty > 0);

    this.updateOrderBar(true, {
      movie: this.state.selectedMovie?.title,
      time: this.state.selectedShowtime?.time,
      seats: this.state.selectedSeats.map(s => s.label).join(', '),
      tickets: `${this.state.ticketCount}T`,
      total: this.calculateTotal(),
      nextBtn: { label: 'Pay Now', action: 'window.kiosk.onFnBDone()' }
    });
  }

  renderPayment() {
    const container = document.getElementById('payment-content');
    if (!container) return;
    const total = this.calculateTotal();

    container.innerHTML = `
      <div>
        <h2 class="screen-title">Complete Payment</h2>
        <p class="screen-subtitle">Secure payment · Instant confirmation</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;align-items:stretch;">
        <div>
          <div style="font-family:'Outfit',sans-serif;font-size:13px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Order Summary</div>
          <div class="glass" style="border-radius:var(--radius-lg);padding:14px;margin-bottom:12px;">
            <div style="display:flex;flex-direction:column;gap:8px;">
              <div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">${this.state.selectedMovie?.title}</span><span>${this.state.ticketCount}x</span></div>
              <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--text-muted);"><span>${this.state.selectedShowtime?.screen} · ${this.state.selectedShowtime?.time}</span><span>${this.state.selectedSeats.map(s=>s.label).join(', ')}</span></div>
              ${this.state.fnbOrder.length > 0 ? `
                <div class="divider" style="margin:8px 0;"></div>
                <div style="font-size:12px;color:var(--text-muted)">F&B Items:</div>
                ${this.state.fnbOrder.map(i => `<div style="display:flex;justify-content:space-between;font-size:13px;"><span>${i.name} x${i.qty}</span><span>₹${i.price * i.qty}</span></div>`).join('')}
              ` : ''}
              <div class="divider" style="margin:8px 0;"></div>
              <div style="display:flex;justify-content:space-between;font-family:'Outfit',sans-serif;font-size:var(--text-md);font-weight:800;"><span>Total</span><span style="color:var(--accent);">₹${total}</span></div>
            </div>
          </div>
          <div class="payment-methods" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="payment-method-card" id="pm-qr" onclick="window.kiosk.selectPayment('qr')">
              <span class="payment-icon">🔳</span>
              <div class="payment-label">QR Code</div>
              <div class="payment-sub">Scan and Pay</div>
            </div>
            <div class="payment-method-card" id="pm-card" onclick="window.kiosk.selectPayment('card')">
              <span class="payment-icon">💳</span>
              <div class="payment-label">Card</div>
              <div class="payment-sub">Debit / Credit</div>
            </div>
          </div>
        </div>
        <div id="payment-right" style="text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center;">
          <div id="payment-right-content" style="min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <!-- Rendered dynamically by selectPayment -->
          </div>
          <div id="cira-payment-character" style="margin-top:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none;">
            <img src="assets/cira/cira_pointing_up.webp" style="height:170px; width:auto; object-fit:contain; animation: breathe 4s ease-in-out infinite; display:block;" alt="Cira Pointing Up">
          </div>
          <div style="margin-top:16px;">
            <button class="btn btn-ghost btn-xl" onclick="window.kiosk.handlePaymentBack()">← Back</button>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      this.selectPayment('qr');
    }, 50);
  }

  selectPayment(method) {
    this.clearPaymentSimulation();
    this.state.selectedPayment = method;
    document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('selected'));
    const card = document.getElementById(`pm-${method}`);
    if (card) card.classList.add('selected');

    const rightPanel = document.getElementById('payment-right-content');
    if (rightPanel) {
      if (method === 'qr') {
        rightPanel.innerHTML = `
          <div style="font-family:'Outfit',sans-serif;font-size:12px;color:var(--text-muted);margin-bottom:8px;">Scan to pay with any UPI app</div>
          <div class="qr-code-box" style="max-width:180px;margin:0 auto 12px;padding:8px;background:#fff;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.06);">
            <img src="assets/qr_code.png" style="width:140px;height:140px;display:block;" alt="Scan to pay">
          </div>
          <div style="font-size:13px;color:var(--text-secondary);font-weight:600;display:flex;align-items:center;gap:6px;justify-content:center;">
            <div class="skeleton" style="width:14px;height:14px;border-radius:50%;border:2px solid var(--accent);border-top-color:transparent;animation:spin 1s linear infinite;"></div>
            <span>Waiting for payment...</span>
          </div>
        `;
      } else if (method === 'card') {
        rightPanel.innerHTML = `
          <div style="font-family:'Outfit',sans-serif;font-size:12px;color:var(--text-muted);margin-bottom:12px;">Insert, swipe, or tap card on the terminal</div>
          <div style="font-size:72px;margin:16px 0;">💳</div>
          <div style="font-size:14px;color:var(--text-secondary);font-weight:600;display:flex;align-items:center;gap:6px;justify-content:center;">
            <div class="skeleton" style="width:14px;height:14px;border-radius:50%;border:2px solid var(--accent);border-top-color:transparent;animation:spin 1s linear infinite;"></div>
            <span>Waiting for card insertion...</span>
          </div>
        `;
      }
    }

    const t1 = setTimeout(() => {
      if (rightPanel) {
        rightPanel.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;min-height:180px;">
            <div class="skeleton" style="width:40px;height:40px;border-radius:50%;border:4px solid var(--accent);border-top-color:transparent;animation:spin 1s linear infinite;"></div>
            <div style="font-family:'Outfit',sans-serif;font-size:16px;font-weight:700;color:var(--text-primary);">
              ${method === 'qr' ? 'Checking QR payment status...' : 'Processing Card transaction...'}
            </div>
            <div style="font-size:12px;color:var(--text-muted);">Please wait, contacting payment gateway</div>
          </div>
        `;
      }

      const t2 = setTimeout(() => {
        if (rightPanel) {
          rightPanel.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;min-height:180px;">
              <div style="width:60px;height:60px;border-radius:50%;background:rgba(0,212,170,0.15);border:3px solid var(--success);display:flex;align-items:center;justify-content:center;font-size:28px;color:var(--success);box-shadow:0 0 20px rgba(0,212,170,0.2);">✓</div>
              <div style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:800;color:var(--success);">
                ${method === 'qr' ? 'QR Payment Verified!' : 'Card Payment Approved!'}
              </div>
              <div style="font-size:12px;color:var(--text-muted);">Redirecting to confirmation...</div>
            </div>
          `;
        }

        const t3 = setTimeout(() => {
          this.onPaymentComplete();
        }, 1500);
        this.paymentSimulationTimers.push(t3);
      }, 3000);
      this.paymentSimulationTimers.push(t2);
    }, 4000);
    this.paymentSimulationTimers.push(t1);
  }

  renderSuccess() {
    const container = document.getElementById('success-content');
    if (!container) return;

    this.spawnConfetti();

    container.innerHTML = `
      <div style="text-align:center;max-width:600px;margin:0 auto;animation:fadeInUp 0.7s var(--ease-spring) forwards;">
        <div class="success-icon">✓</div>
        <h2 class="screen-title" style="color:var(--success);margin-bottom:8px;">Booking Confirmed!</h2>
        <div class="booking-id" style="margin-bottom:24px;">${this.state.bookingId}</div>
        <div class="glass" style="border-radius:var(--radius-xl);padding:32px;margin-bottom:24px;text-align:left;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div><div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">MOVIE</div><div style="font-family:'Outfit',sans-serif;font-weight:700;">${this.state.selectedMovie?.title}</div></div>
            <div><div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">SCREEN</div><div style="font-family:'Outfit',sans-serif;font-weight:700;">${this.state.selectedShowtime?.screen}</div></div>
            <div><div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">SHOWTIME</div><div style="font-family:'Outfit',sans-serif;font-weight:700;">${this.state.selectedShowtime?.time}</div></div>
            <div><div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">SEATS</div><div style="font-family:'Outfit',sans-serif;font-weight:700;">${this.state.selectedSeats.map(s=>s.label).join(', ')}</div></div>
            <div><div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">MOBILE</div><div style="font-family:'Outfit',sans-serif;font-weight:700;">+91 ${this.state.mobileNumber}</div></div>
            <div><div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">TOTAL PAID</div><div style="font-family:'Outfit',sans-serif;font-weight:700;color:var(--accent);">₹${this.calculateTotal()}</div></div>
          </div>
        </div>
        <div style="background:rgba(0,212,170,0.1);border:1px solid rgba(0,212,170,0.3);border-radius:var(--radius-lg);padding:16px;margin-bottom:24px;font-size:15px;color:var(--success);">
          📱 Your e-ticket has been sent to +91 ${this.state.mobileNumber}
        </div>
        <div style="font-family:'Outfit',sans-serif;font-size:var(--text-lg);font-weight:700;color:var(--text-secondary);">Enjoy your movie at Cinepolis! 🎬</div>
        <div style="margin-top:24px;font-size:13px;color:var(--text-muted);">This screen will reset in a few seconds...</div>
      </div>
    `;
  }

  spawnConfetti() {
    const colors = ['#F5A623','#00D4AA','#FF6B35','#7C3AED','#54A0FF','#FF4757'];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.cssText = `
        left: ${Math.random() * 100}vw;
        top: -20px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        width: ${6 + Math.random() * 10}px;
        height: ${6 + Math.random() * 10}px;
        animation-delay: ${Math.random() * 2}s;
        animation-duration: ${2 + Math.random() * 2}s;
      `;
      document.getElementById('kiosk-root').appendChild(piece);
      setTimeout(() => piece.remove(), 4000);
    }
  }

  showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    const colors = { info: 'var(--info)', warning: 'var(--warning)', error: 'var(--error)', success: 'var(--success)' };
    toast.style.cssText = `
      position:fixed;top:80px;right:24px;z-index:999;
      background:rgba(10,6,16,0.95);border:1px solid ${colors[type]};
      color:#fff;padding:12px 20px;border-radius:12px;font-family:'Outfit',sans-serif;font-size:15px;
      backdrop-filter:blur(20px);box-shadow:0 8px 30px rgba(0,0,0,0.4);
      animation:fadeInLeft 0.3s var(--ease-spring) forwards;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  setupEventListeners() {
    // Global user interaction listener to reset inactivity timer
    const resetTimer = () => {
      if (this.sceneManager.currentScene !== SCENES.IDLE) {
        this.resetInactivityTimer();
      }
    };
    document.addEventListener('pointerdown', resetTimer);
    document.addEventListener('keypress', resetTimer);
    document.addEventListener('click', resetTimer);

    // Global touch anywhere on idle screen
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.sceneManager.currentScene !== SCENES.IDLE) {
          this.onExit();
        }
      }
    });
  }

  resetInactivityTimer() {
    this.clearInactivityTimer();
    const autoReset = localStorage.getItem('cira_auto_reset') !== 'false';
    if (!autoReset) return;

    this.inactivityTimer = setTimeout(() => {
      console.log("[Kiosk] Inactivity timeout reached. Resetting to idle.");
      this.showToast("⚠️ Kiosk reset due to inactivity", "warning");
      this.onExit();
    }, 60000); // 60 seconds (1 minute)
  }

  clearInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }
}

// Initialize kiosk on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.kiosk = new CinemaKiosk();
});
