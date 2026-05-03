# CleanMatrix-Sustainathon-
SUSTAIN-A-THON 2026 is a sustainability-focused offline hackathon organized by the School of Computer &amp; Information Science at UKF College of Engineering &amp; Technology, in association with PORT : 80, bringing together innovators, developers, and designers to build impactful solutions for real-world environmental challenges

# 🗑️ CleanMatrix

> **🏆 1st Prize Winner — Sustainathon Hackathon**
> Organized by UKF College of Engineering and Technology

CleanMatrix is an AI-powered smart waste management system that uses real-time YOLO-based waste detection, IoT bin monitoring, and intelligent route optimization to help waste collectors work faster and smarter.

---

## 📸 Overview

Traditional waste collection is inefficient — trucks follow fixed routes regardless of whether bins are full or empty. CleanMatrix solves this by combining computer vision, real-time bin monitoring, and dynamic route planning into a single unified platform.

---

## ✨ Features

### 🤖 AI Waste Detection (YOLO)
- A Python-based YOLOv8 model detects waste objects in real time via camera feed
- Detected waste count is automatically sent to the corresponding dustbin entry in the backend
- Keeps bin fill levels accurate without any manual input

### 🗺️ Admin Dashboard
- Live map view of all registered dustbins
- Add / Remove / Reset bins directly on the map
- Route to the **nearest bin**
- Route to the **highest occupancy bin**
- **Total optimized route** across all bins with fill ≥ 50% (nearest-neighbor algorithm)
- Color-coded bin markers: 🟢 OK · 🟡 Moderate · 🔴 Critical

### 📱 Collector Dashboard
- Simplified view for field collectors
- Same routing features: Nearest, Highest Occupancy, Total Route
- Live bin status with fill level indicators

### 📊 Real-time Stats
- Total bins registered
- Critical bins (≥ 75% full)
- Average fill level across all bins
- Bins within safe threshold

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Leaflet, Leaflet Routing Machine |
| Backend | Node.js / Express (REST API) |
| Database | MongoDB |
| AI / Detection | Python, YOLOv8 (Ultralytics) |
| Map & Routing | OpenStreetMap, OSRM |
| Styling | Plus Jakarta Sans, Bricolage Grotesque |

---

## 🧠 How It Works

```
Camera Feed
    │
    ▼
YOLO Model (Python)
    │  Detects waste objects in frame
    │  Counts waste quantity
    ▼
PUT /api/bins/:id  ──►  MongoDB
                              │
                              ▼
                     React Frontend (polls every 5s)
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
             Admin Dashboard     Collector Dashboard
             (manage bins)       (optimized routes)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Python 3.9+
- MongoDB
- A webcam or IP camera for YOLO detection

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/cleanmatrix.git
cd cleanmatrix
```

### 2. Start the backend
```bash
cd backend
npm install
node server.js
```

### 3. Start the frontend
```bash
cd frontend
npm install
npm start
```

### 4. Run the YOLO detection model
```bash
cd ai
python -m venv venv
venv\Scripts\activate
pip install ultralytics opencv-python requests torch torchvision
python waste_detection.py
```

> Make sure the `BINS_API_URL` in `detect.py` points to your running backend.

---

## 📁 Project Structure

```
cleanmatrix/
├── frontend/                  # React frontend
│   └── src/
│       ├── pages/
│       │   ├── Home.js     # Admin dashboard
│       │   └── UHome.js    # Collector dashboard
│       └── api/
│           └── bins.js      # API base URL config
│
├── backend/                  # Express backend
│   ├── routes/
│   │   └── binRoutes.js          # CRUD + reset endpoints
│   └── models/
│       └── Bin.js           # MongoDB bin schema
│
└── ai/               # Python YOLO model
    ├── waste_detection.py            # Main detection script
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/bins` | Fetch all bins |
| POST | `/api/bins` | Register a new bin |
| DELETE | `/api/bins/:id` | Remove a bin |
| PUT | `/api/bins/reset/:id` | Reset bin fill to 0 |
| PUT | `/api/bins/:id` | Update bin quantity (used by YOLO) |

---

## 🏆 Achievement

> **1st Place — Sustainathon Hackathon**
> UKF College of Engineering and Technology
>
> CleanMatrix was recognized for its innovative approach to sustainable urban waste management, combining AI-driven detection with real-time IoT monitoring and smart route optimization to reduce fuel consumption and improve collection efficiency.

---

## 👨‍💻 Author

**Abin Babu** — B.Tech CSE, MBITS

---

## 📄 License

MIT License — feel free to use, modify, and build upon this project.
