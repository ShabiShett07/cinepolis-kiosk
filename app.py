"""
==============================================================
CIRA Cinema Kiosk — Flask Backend (Vista-Compatible API)
==============================================================
Serves static files and provides REST API endpoints that
mirror the Vista Ticket Management System structure.
"""

import os
import json
import random
import string
import datetime
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='.')
CORS(app)

# ============================================================
# MOCK DATA (Vista-Compatible)
# ============================================================

MOVIES = [
    {
        "id": "m001",
        "title": "Eclipse Protocol",
        "genre": ["Action", "Sci-Fi", "Thriller"],
        "language": "English",
        "duration": "2h 18m",
        "rating": "U/A",
        "imdb": 8.2,
        "synopsis": "When a rogue AI threatens to plunge the world into permanent darkness...",
        "cast": ["Alex Mercer", "Priya Nair", "Daniel Cross"],
        "director": "Marcus Stone",
        "poster": "assets/movies/eclipse_protocol.png",
        "format": ["IMAX", "2D"],
        "price": {"regular": 350, "premium": 550, "imax": 750},
        "status": "NOW_SHOWING"
    },
    {
        "id": "m002",
        "title": "Dhadkan Se Door",
        "genre": ["Romance", "Drama"],
        "language": "Hindi",
        "duration": "2h 45m",
        "rating": "U",
        "imdb": 7.8,
        "synopsis": "Anjali returns to Mumbai after five years abroad...",
        "cast": ["Rahul Khan", "Anjali Sharma"],
        "director": "Vikram Kapoor",
        "poster": "assets/movies/dhadkan_se_door.png",
        "format": ["2D"],
        "price": {"regular": 280, "premium": 420, "imax": None},
        "status": "NOW_SHOWING"
    },
    {
        "id": "m003",
        "title": "Star Nomad",
        "genre": ["Sci-Fi", "Adventure"],
        "language": "English",
        "duration": "2h 32m",
        "rating": "U",
        "imdb": 8.6,
        "synopsis": "Commander Elara Vance is the last survivor of humanity's most ambitious deep-space mission.",
        "cast": ["Elara Vance", "Kairo Shaw"],
        "director": "Kairo Shaw",
        "poster": "assets/movies/star_nomad.png",
        "format": ["IMAX", "3D", "2D"],
        "price": {"regular": 380, "premium": 580, "imax": 800},
        "status": "NOW_SHOWING"
    },
    {
        "id": "m004",
        "title": "The Golden Lantern",
        "genre": ["Animation", "Family", "Adventure"],
        "language": "English/Hindi",
        "duration": "1h 52m",
        "rating": "U",
        "imdb": 8.9,
        "synopsis": "When 10-year-old Meera discovers a magical golden lantern...",
        "cast": ["Meera (voice)", "Prince Arjun (voice)"],
        "director": "Ashish Sharma",
        "poster": "assets/movies/golden_lantern.png",
        "format": ["2D", "3D"],
        "price": {"regular": 250, "premium": 380, "imax": None},
        "status": "NOW_SHOWING"
    },
    {
        "id": "m005",
        "title": "Whisper in the Dark",
        "genre": ["Horror", "Mystery", "Thriller"],
        "language": "English",
        "duration": "1h 48m",
        "rating": "A",
        "imdb": 7.4,
        "synopsis": "Journalist Evelyn Reed investigates the disappearance of five children...",
        "cast": ["Evelyn Reed", "Maxwell Cole"],
        "director": "Elias Thorne",
        "poster": "assets/movies/whisper_in_the_dark.png",
        "format": ["2D"],
        "price": {"regular": 300, "premium": 450, "imax": None},
        "status": "NOW_SHOWING"
    },
    {
        "id": "m006",
        "title": "Kaal Warrior",
        "genre": ["Action", "Mythology", "Fantasy"],
        "language": "Hindi",
        "duration": "2h 58m",
        "rating": "U/A",
        "imdb": 8.4,
        "synopsis": "When the ancient seal binding the demon lord Kaal is broken...",
        "cast": ["Arjun Deva", "Mira Rao"],
        "director": "Anand Kumar",
        "poster": "assets/movies/kaal_warrior.png",
        "format": ["IMAX", "4DX", "2D"],
        "price": {"regular": 380, "premium": 580, "imax": 850},
        "status": "NOW_SHOWING"
    }
]

SHOWTIMES = {
    "m001": [
        {"id": "s001a", "screen": "Screen 1 (IMAX)", "time": "10:30 AM", "date": "Today", "available": 87, "total": 150},
        {"id": "s001b", "screen": "Screen 3 (Premium)", "time": "2:00 PM", "date": "Today", "available": 43, "total": 80},
        {"id": "s001c", "screen": "Screen 1 (IMAX)", "time": "6:45 PM", "date": "Today", "available": 12, "total": 150},
        {"id": "s001d", "screen": "Screen 4", "time": "10:00 PM", "date": "Today", "available": 67, "total": 120}
    ],
    "m002": [
        {"id": "s002a", "screen": "Screen 2 (4DX)", "time": "11:15 AM", "date": "Today", "available": 55, "total": 100},
        {"id": "s002b", "screen": "Screen 4", "time": "3:30 PM", "date": "Today", "available": 88, "total": 120},
        {"id": "s002c", "screen": "Screen 5", "time": "7:00 PM", "date": "Today", "available": 31, "total": 120}
    ],
    "m003": [
        {"id": "s003a", "screen": "Screen 1 (IMAX)", "time": "9:00 AM", "date": "Today", "available": 120, "total": 150},
        {"id": "s003b", "screen": "Screen 2 (4DX)", "time": "12:30 PM", "date": "Today", "available": 45, "total": 100},
        {"id": "s003c", "screen": "Screen 3 (Premium)", "time": "4:15 PM", "date": "Today", "available": 72, "total": 80},
        {"id": "s003d", "screen": "Screen 1 (IMAX)", "time": "8:00 PM", "date": "Today", "available": 8, "total": 150}
    ],
    "m004": [
        {"id": "s004a", "screen": "Screen 3 (Premium)", "time": "10:00 AM", "date": "Today", "available": 14, "total": 80},
        {"id": "s004b", "screen": "Screen 5", "time": "1:00 PM", "date": "Today", "available": 67, "total": 120},
        {"id": "s004c", "screen": "Screen 4", "time": "5:30 PM", "date": "Today", "available": 91, "total": 120}
    ],
    "m005": [
        {"id": "s005a", "screen": "Screen 4", "time": "9:15 PM", "date": "Today", "available": 54, "total": 120},
        {"id": "s005b", "screen": "Screen 5", "time": "11:30 PM", "date": "Today", "available": 89, "total": 120}
    ],
    "m006": [
        {"id": "s006a", "screen": "Screen 1 (IMAX)", "time": "12:00 PM", "date": "Today", "available": 67, "total": 150},
        {"id": "s006b", "screen": "Screen 2 (4DX)", "time": "3:00 PM", "date": "Today", "available": 29, "total": 100},
        {"id": "s006c", "screen": "Screen 1 (IMAX)", "time": "7:30 PM", "date": "Today", "available": 5, "total": 150},
        {"id": "s006d", "screen": "Screen 1 (IMAX)", "time": "10:15 AM", "date": "Tomorrow", "available": 145, "total": 150}
    ]
}

FNB_MENU = [
    {"id": "f001", "name": "Large Popcorn", "description": "Buttered / Salted / Caramel", "price": 280, "category": "Popcorn", "image": "🍿"},
    {"id": "f002", "name": "Combo Meal (L)", "description": "Large Popcorn + 2 Large Drinks", "price": 540, "category": "Combos", "image": "🎬"},
    {"id": "f003", "name": "Nachos + Dip", "description": "Crispy Nachos with Cheese / Salsa Dip", "price": 220, "category": "Snacks", "image": "🌮"},
    {"id": "f004", "name": "Large Cold Drink", "description": "Pepsi / 7UP / Miranda / Mountain Dew", "price": 160, "category": "Beverages", "image": "🥤"},
    {"id": "f005", "name": "Hot Dog", "description": "Classic / Spicy Tandoori", "price": 190, "category": "Snacks", "image": "🌭"},
    {"id": "f006", "name": "Chocolate Brownie", "description": "Warm Choco Fudge Brownie with Ice Cream", "price": 240, "category": "Desserts", "image": "🍫"}
]

# In-memory booking store (replace with DB in production)
BOOKINGS = {}

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def generate_booking_id():
    """Generate a Vista-style booking ID."""
    return "CP" + ''.join(random.choices(string.digits, k=8))

def generate_seat_layout(showtime_id: str, total: int) -> list:
    """Generate seat layout for a given showtime."""
    rows = ['A','B','C','D','E','F','G','H','J','K']
    seats = []
    # Use showtime_id as seed for consistent results
    rng = random.Random(hash(showtime_id))
    booked_pct = rng.uniform(0.1, 0.5)

    for r_idx, row in enumerate(rows):
        for col in range(1, 16):
            if len(seats) >= total:
                break
            rand = rng.random()
            status = 'available'
            if rand < booked_pct * 0.8:
                status = 'booked'
            elif rand < booked_pct:
                status = 'reserved'
            seats.append({
                "id": f"{showtime_id}-{row}{col}",
                "row": row,
                "number": col,
                "label": f"{row}{col}",
                "status": status,
                "type": "regular"
            })

    return seats

# ============================================================
# API ROUTES — Vista-Compatible
# ============================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "service": "CIRA Cinema Kiosk API",
        "version": "1.0.0",
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

@app.route('/api/cinema', methods=['GET'])
def get_cinema_info():
    """Get cinema information."""
    return jsonify({
        "data": {
            "name": "Cinepolis",
            "location": "Phoenix Marketcity, Mumbai",
            "screens": ["Screen 1 (IMAX)", "Screen 2 (4DX)", "Screen 3 (Premium)", "Screen 4", "Screen 5"],
            "address": "Kurla West, Mumbai - 400070",
            "phone": "+91 22 6789 0000",
            "opening_hours": "09:00 AM - 12:30 AM"
        }
    })

@app.route('/api/movies', methods=['GET'])
def get_movies():
    """Get all now-showing movies."""
    status = request.args.get('status', 'NOW_SHOWING')
    language = request.args.get('language')
    genre = request.args.get('genre')

    filtered = [m for m in MOVIES if m['status'] == status]
    if language:
        filtered = [m for m in filtered if language.lower() in m['language'].lower()]
    if genre:
        filtered = [m for m in filtered if any(genre.lower() in g.lower() for g in m['genre'])]

    return jsonify({"data": filtered, "total": len(filtered), "status": 200})

@app.route('/api/movies/<movie_id>', methods=['GET'])
def get_movie(movie_id):
    """Get a single movie by ID."""
    movie = next((m for m in MOVIES if m['id'] == movie_id), None)
    if not movie:
        return jsonify({"error": "Movie not found", "status": 404}), 404
    # Include showtimes
    movie_with_showtimes = {**movie, "showtimes": SHOWTIMES.get(movie_id, [])}
    return jsonify({"data": movie_with_showtimes, "status": 200})

@app.route('/api/movies/<movie_id>/showtimes', methods=['GET'])
def get_showtimes(movie_id):
    """Get showtimes for a movie."""
    date_filter = request.args.get('date', 'Today')
    showtimes = SHOWTIMES.get(movie_id, [])
    if date_filter != 'all':
        showtimes = [s for s in showtimes if s['date'] == date_filter]
    return jsonify({"data": showtimes, "status": 200})

@app.route('/api/showtimes/<showtime_id>/seats', methods=['GET'])
def get_seats(showtime_id):
    """Get seat layout for a showtime."""
    # Find showtime to get total capacity
    total = 120  # default
    for movie_id, showtimes in SHOWTIMES.items():
        for st in showtimes:
            if st['id'] == showtime_id:
                total = st['total']
                break

    seats = generate_seat_layout(showtime_id, total)
    return jsonify({"data": seats, "total": len(seats), "status": 200})

@app.route('/api/fnb', methods=['GET'])
def get_fnb_menu():
    """Get food & beverages menu."""
    return jsonify({"data": FNB_MENU, "status": 200})

@app.route('/api/book', methods=['POST'])
def create_booking():
    """Create a ticket booking (Vista-compatible)."""
    payload = request.json
    if not payload:
        return jsonify({"error": "No payload provided", "status": 400}), 400

    required = ['movie', 'showtime_id', 'seats', 'mobile', 'ticket_count']
    missing = [f for f in required if f not in payload]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}", "status": 400}), 400

    booking_id = generate_booking_id()
    booking = {
        "bookingId": booking_id,
        "movie": payload.get('movie'),
        "showtimeId": payload.get('showtime_id'),
        "screen": payload.get('screen', 'Screen 1'),
        "showtime": payload.get('showtime'),
        "seats": payload.get('seats', []),
        "ticketCount": payload.get('ticket_count', 1),
        "mobile": payload.get('mobile'),
        "fnbOrder": payload.get('fnb_order', []),
        "totalAmount": payload.get('total_amount', 0),
        "status": "CONFIRMED",
        "paymentMethod": payload.get('payment_method', 'UPI'),
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "cinema": "Cinepolis Phoenix Marketcity, Mumbai"
    }

    BOOKINGS[booking_id] = booking
    print(f"[BOOKING] Created: {booking_id} — {booking['movie']} @ {booking['showtime']}")

    return jsonify({"data": booking, "status": 200})

@app.route('/api/bookings/<booking_id>', methods=['GET'])
def get_booking(booking_id):
    """Get booking details by ID."""
    booking = BOOKINGS.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found", "status": 404}), 404
    return jsonify({"data": booking, "status": 200})

@app.route('/api/bookings', methods=['GET'])
def get_all_bookings():
    """Get all bookings (admin use)."""
    return jsonify({"data": list(BOOKINGS.values()), "total": len(BOOKINGS), "status": 200})

# ============================================================
# STATIC FILE SERVING
# ============================================================

@app.route('/')
def serve_kiosk():
    """Serve the main kiosk interface."""
    return send_from_directory('.', 'index.html')

@app.route('/admin')
def serve_admin():
    """Serve the admin dashboard."""
    return send_from_directory('.', 'admin.html')

@app.route('/marketing')
def serve_marketing():
    """Serve the marketing dashboard."""
    return send_from_directory('.', 'marketing.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static assets."""
    return send_from_directory('.', filename)

# ============================================================
# MAIN
# ============================================================

if __name__ == '__main__':
    print("""
╔══════════════════════════════════════════════════════════╗
║       CIRA Cinema Kiosk Backend — Starting Up            ║
║       Vista-Compatible API Server                        ║
╠══════════════════════════════════════════════════════════╣
║  Kiosk:     http://localhost:5050/                       ║
║  Admin:     http://localhost:5050/admin                  ║
║  Marketing: http://localhost:5050/marketing              ║
║  API Docs:  http://localhost:5050/api/health             ║
╚══════════════════════════════════════════════════════════╝
    """)
    app.run(debug=True, host='0.0.0.0', port=5050)
