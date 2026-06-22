// ============================================================
// CIRA Cinema Kiosk — Mock Data Layer (Vista-compatible)
// ============================================================

const MOCK_DATA = {
  cinema: {
    name: "Cinepolis",
    location: "Phoenix Marketcity, Mumbai",
    screens: ["Screen 1 (IMAX)", "Screen 2 (4DX)", "Screen 3 (Premium)", "Screen 4", "Screen 5"],
    address: "Kurla West, Mumbai - 400070",
    phone: "+91 22 6789 0000"
  },

  movies: [
    {
      id: "m001",
      title: "Eclipse Protocol",
      genre: ["Action", "Sci-Fi", "Thriller"],
      language: "English",
      duration: "2h 18m",
      rating: "U/A",
      imdb: 8.2,
      synopsis: "When a rogue AI threatens to plunge the world into permanent darkness, elite operative Marcus Drake must race against time in a neon-lit dystopian city to stop the Eclipse Protocol from activating.",
      cast: ["Alex Mercer", "Priya Nair", "Daniel Cross"],
      director: "Marcus Stone",
      poster: "assets/movies/eclipse_protocol.webp",
      trailer: null,
      format: ["IMAX", "2D"],
      price: { regular: 50, premium: 50, imax: 50 },
      showtimes: [
        { id: "s001a", screen: "Screen 1 (IMAX)", time: "10:30 AM", date: "Today", available: 87, total: 150 },
        { id: "s001b", screen: "Screen 3 (Premium)", time: "2:00 PM", date: "Today", available: 43, total: 80 },
        { id: "s001c", screen: "Screen 1 (IMAX)", time: "6:45 PM", date: "Today", available: 12, total: 150 },
        { id: "s001d", screen: "Screen 4", time: "10:00 PM", date: "Today", available: 67, total: 120 },
        { id: "s001e", screen: "Screen 1 (IMAX)", time: "11:00 AM", date: "Tomorrow", available: 132, total: 150 }
      ]
    },
    {
      id: "m002",
      title: "Dhadkan Se Door",
      genre: ["Romance", "Drama"],
      language: "Hindi",
      duration: "2h 45m",
      rating: "U",
      imdb: 7.8,
      synopsis: "Anjali returns to Mumbai after five years abroad, only to find her first love standing in the rain, holding an old letter she thought was lost forever. A timeless love story that spans cities, seasons, and second chances.",
      cast: ["Rahul Khan", "Anjali Sharma", "Meena Das"],
      director: "Vikram Kapoor",
      poster: "assets/movies/dhadkan_se_door.webp",
      trailer: null,
      format: ["2D"],
      price: { regular: 50, premium: 50, imax: 50 },
      showtimes: [
        { id: "s002a", screen: "Screen 2 (4DX)", time: "11:15 AM", date: "Today", available: 55, total: 100 },
        { id: "s002b", screen: "Screen 4", time: "3:30 PM", date: "Today", available: 88, total: 120 },
        { id: "s002c", screen: "Screen 5", time: "7:00 PM", date: "Today", available: 31, total: 120 },
        { id: "s002d", screen: "Screen 2 (4DX)", time: "10:30 AM", date: "Tomorrow", available: 98, total: 100 }
      ]
    },
    {
      id: "m003",
      title: "Star Nomad",
      genre: ["Sci-Fi", "Adventure"],
      language: "English",
      duration: "2h 32m",
      rating: "U",
      imdb: 8.6,
      synopsis: "Commander Elara Vance is the last survivor of humanity's most ambitious deep-space mission. Adrift between galaxies with a malfunctioning ship and an AI companion called NOVA, she must navigate impossible odds to find a way home.",
      cast: ["Elara Vance", "Kairo Shaw", "NOVA (AI)"],
      director: "Kairo Shaw",
      poster: "assets/movies/star_nomad.webp",
      trailer: null,
      format: ["IMAX", "3D", "2D"],
      price: { regular: 50, premium: 50, imax: 50 },
      showtimes: [
        { id: "s003a", screen: "Screen 1 (IMAX)", time: "9:00 AM", date: "Today", available: 120, total: 150 },
        { id: "s003b", screen: "Screen 2 (4DX)", time: "12:30 PM", date: "Today", available: 45, total: 100 },
        { id: "s003c", screen: "Screen 3 (Premium)", time: "4:15 PM", date: "Today", available: 72, total: 80 },
        { id: "s003d", screen: "Screen 1 (IMAX)", time: "8:00 PM", date: "Today", available: 8, total: 150 }
      ]
    },
    {
      id: "m004",
      title: "The Golden Lantern",
      genre: ["Animation", "Family", "Adventure"],
      language: "English/Hindi",
      duration: "1h 52m",
      rating: "U",
      imdb: 8.9,
      synopsis: "When 10-year-old Meera discovers a magical golden lantern in her grandmother's attic, she is transported to the kingdom of Akashdeep — where only the light of friendship can defeat the shadow that threatens to consume the realm.",
      cast: ["Meera (voice)", "Prince Arjun (voice)"],
      director: "Ashish Sharma",
      poster: "assets/movies/golden_lantern.webp",
      trailer: null,
      format: ["2D", "3D"],
      price: { regular: 50, premium: 50, imax: 50 },
      showtimes: [
        { id: "s004a", screen: "Screen 3 (Premium)", time: "10:00 AM", date: "Today", available: 14, total: 80 },
        { id: "s004b", screen: "Screen 5", time: "1:00 PM", date: "Today", available: 67, total: 120 },
        { id: "s004c", screen: "Screen 4", time: "5:30 PM", date: "Today", available: 91, total: 120 },
        { id: "s004d", screen: "Screen 5", time: "9:00 AM", date: "Tomorrow", available: 115, total: 120 }
      ]
    },
    {
      id: "m005",
      title: "Whisper in the Dark",
      genre: ["Horror", "Mystery", "Thriller"],
      language: "English",
      duration: "1h 48m",
      rating: "A",
      imdb: 7.4,
      synopsis: "Journalist Evelyn Reed investigates the disappearance of five children from a small coastal town, only to discover that the abandoned lighthouse on Crow's Point has been whispering their names every night at midnight.",
      cast: ["Evelyn Reed", "Maxwell Cole", "Sheriff Gray"],
      director: "Elias Thorne",
      poster: "assets/movies/whisper_in_the_dark.webp",
      trailer: null,
      format: ["2D"],
      price: { regular: 50, premium: 50, imax: 50 },
      showtimes: [
        { id: "s005a", screen: "Screen 4", time: "9:15 PM", date: "Today", available: 54, total: 120 },
        { id: "s005b", screen: "Screen 5", time: "11:30 PM", date: "Today", available: 89, total: 120 },
        { id: "s005c", screen: "Screen 4", time: "9:00 PM", date: "Tomorrow", available: 112, total: 120 }
      ]
    },
    {
      id: "m006",
      title: "Kaal Warrior",
      genre: ["Action", "Mythology", "Fantasy"],
      language: "Hindi",
      duration: "2h 58m",
      rating: "U/A",
      imdb: 8.4,
      synopsis: "When the ancient seal binding the demon lord Kaal is broken, a forgotten warrior descended from divine lineage must reclaim his powers and forge an alliance of mortals and gods to prevent the Age of Darkness from beginning.",
      cast: ["Arjun Deva", "Mira Rao", "Sage Vayudev"],
      director: "Anand Kumar",
      poster: "assets/movies/kaal_warrior.webp",
      trailer: null,
      format: ["IMAX", "4DX", "2D"],
      price: { regular: 50, premium: 50, imax: 50 },
      showtimes: [
        { id: "s006a", screen: "Screen 1 (IMAX)", time: "12:00 PM", date: "Today", available: 67, total: 150 },
        { id: "s006b", screen: "Screen 2 (4DX)", time: "3:00 PM", date: "Today", available: 29, total: 100 },
        { id: "s006c", screen: "Screen 1 (IMAX)", time: "7:30 PM", date: "Today", available: 5, total: 150 },
        { id: "s006d", screen: "Screen 1 (IMAX)", time: "10:15 AM", date: "Tomorrow", available: 145, total: 150 }
      ]
    }
  ],

  generateSeats: function(showtimeId, total) {
    const rows = ['A','B','C','D','E','F','G','H','J','K'];
    const seats = [];
    const bookedPct = Math.random() * 0.5; // 0–50% booked

    for (let r = 0; r < Math.min(rows.length, Math.ceil(total / 15)); r++) {
      for (let c = 1; c <= 15; c++) {
        if (seats.length >= total) break;
        const rand = Math.random();
        let status = 'available';
        if (rand < bookedPct * 0.8) status = 'booked';
        else if (rand < bookedPct) status = 'reserved';
        seats.push({
          id: `${showtimeId}-${rows[r]}${c}`,
          row: rows[r],
          number: c,
          label: `${rows[r]}${c}`,
          status,
          type: 'regular'
        });
      }
    }
    return seats;
  },

  fnbMenu: [
    {
      id: "f001",
      name: "Large Popcorn",
      description: "Buttered / Salted / Caramel",
      price: 280,
      category: "Popcorn",
      image: "🍿"
    },
    {
      id: "f002",
      name: "Combo Meal (L)",
      description: "Large Popcorn + 2 Large Drinks",
      price: 540,
      category: "Combos",
      image: "🎬"
    },
    {
      id: "f003",
      name: "Nachos + Dip",
      description: "Crispy Nachos with Cheese / Salsa Dip",
      price: 220,
      category: "Snacks",
      image: "🌮"
    },
    {
      id: "f004",
      name: "Large Cold Drink",
      description: "Pepsi / 7UP / Miranda / Mountain Dew",
      price: 160,
      category: "Beverages",
      image: "🥤"
    },
    {
      id: "f005",
      name: "Hot Dog",
      description: "Classic / Spicy Tandoori",
      price: 190,
      category: "Snacks",
      image: "🌭"
    },
    {
      id: "f006",
      name: "Chocolate Brownie",
      description: "Warm Choco Fudge Brownie with Ice Cream",
      price: 240,
      category: "Desserts",
      image: "🍫"
    }
  ],

  languages: [
    { code: "en", label: "English", native: "English" },
    { code: "hi", label: "Hindi", native: "हिन्दी" }
  ],

  adCreatives: (() => {
    try {
      const stored = localStorage.getItem('cira_ads');
      if (stored) return JSON.parse(stored);
    } catch(e) {
      console.warn("Failed to load stored ads", e);
    }
    return [
      { 
        id: "v001", 
        title: "Cinema Popcorn Loop", 
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-popcorn-in-a-red-and-white-striped-bucket-43187-large.mp4", 
        duration: "15s", 
        status: "active",
        aspectRatio: "cover",
        volume: "muted",
        preload: "eager",
        fileSize: "18.4 MB",
        syncedTerminals: ["Lobby-01", "Lobby-02", "Concession-01"]
      },
      { 
        id: "v002", 
        title: "Vintage Projector Loop", 
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-film-projector-in-a-dark-room-43188-large.mp4", 
        duration: "20s", 
        status: "active",
        aspectRatio: "contain",
        volume: "muted",
        preload: "eager",
        fileSize: "24.1 MB",
        syncedTerminals: ["Lobby-01", "Lobby-02", "Concession-01"]
      },
      { 
        id: "v003", 
        title: "Empty Cinema Hall Loop", 
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-movie-theater-with-empty-seats-43189-large.mp4", 
        duration: "25s", 
        status: "active",
        aspectRatio: "cover",
        volume: "muted",
        preload: "lazy",
        fileSize: "32.8 MB",
        syncedTerminals: ["Lobby-01", "Concession-01"]
      }
    ];
  })()
};

// Vista-like API simulation
const VistaAPI = {
  getMovies: () => Promise.resolve({ data: MOCK_DATA.movies, status: 200 }),
  getMovie: (id) => Promise.resolve({ data: MOCK_DATA.movies.find(m => m.id === id), status: 200 }),
  getShowtimes: (movieId) => {
    const movie = MOCK_DATA.movies.find(m => m.id === movieId);
    return Promise.resolve({ data: movie ? movie.showtimes : [], status: 200 });
  },
  getSeats: (showtimeId, total) => Promise.resolve({ data: MOCK_DATA.generateSeats(showtimeId, total), status: 200 }),
  getFnBMenu: () => Promise.resolve({ data: MOCK_DATA.fnbMenu, status: 200 }),
  bookTickets: (payload) => {
    const bookingId = 'CP' + Date.now().toString().slice(-8).toUpperCase();
    return Promise.resolve({
      data: { bookingId, ...payload, status: 'CONFIRMED', timestamp: new Date().toISOString() },
      status: 200
    });
  }
};

window.MOCK_DATA = MOCK_DATA;
window.VistaAPI = VistaAPI;
