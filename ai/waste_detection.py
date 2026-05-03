import os
import cv2
import requests
import time
import winsound
from ultralytics import YOLO

# =========================
# CONFIGURATION (demo)
# =========================
# Backend must be running (e.g. Node on :5000). Change BIN_ID to match the bin # you placed on the map for this presentation.
bin_id = 63 # change this to the bin id you placed on the map for this presentation
API_URL = os.environ.get("BINS_API_URL", "http://localhost:5000/api/bins")
BIN_ID = int(os.environ.get("BIN_ID", bin_id))
BIN_CAPACITY = 50   # counts toward 100% fill
REQUEST_TIMEOUT_S = 10

# Load YOLO model
model = YOLO("yolov8n.pt")

# Waste categories (matched case-insensitively to YOLO COCO class names)
BIODEGRADABLE = {"banana", "apple", "orange", "sandwich", "carrot"}
NON_DEGRADABLE = {"bottle", "cup", "plastic", "can"}
E_WASTE = {"cell phone", "laptop", "tv", "keyboard", "mouse"}

# Counters
counts = {
    "biodegradable": 0,
    "non_degradable": 0,
    "e_waste": 0
}

# Count each tracked object once (bbox x,y jitter every frame; label_x_y was never stable)
counted_track_ids = set()

# Timing control (avoid spamming API)
last_sent = time.time()

# =========================
# HELPER FUNCTIONS
# =========================

def calculate_percentage():
    total = (
        counts["biodegradable"] +
        counts["non_degradable"] +
        counts["e_waste"]
    )
    percentage = (total / BIN_CAPACITY) * 100
    return min(int(percentage), 100)


def send_to_backend():
    try:
        percentage = calculate_percentage()

        base = API_URL.rstrip("/")
        # Re-send map position if this bin already exists (keeps markers where you dropped them)
        payload = {"quantity": percentage}
        try:
            lst = requests.get(base + "/", timeout=REQUEST_TIMEOUT_S).json()
            if isinstance(lst, list):
                row = next(
                    (b for b in lst if int(b.get("id")) == BIN_ID),
                    None,
                )
                if row is not None:
                    plat, plng = row.get("lat"), row.get("lng")
                    if plat is not None and plng is not None:
                        payload["lat"] = float(plat)
                        payload["lng"] = float(plng)
        except (requests.RequestException, TypeError, ValueError):
            pass

        url = f"{base}/{BIN_ID}"
        resp = requests.put(url, json=payload, timeout=REQUEST_TIMEOUT_S)
        resp.raise_for_status()

        print(f"📡 Updated Bin {BIN_ID} → {percentage}% ({resp.status_code})")

    except requests.HTTPError as e:
        body = e.response.text if e.response is not None else ""
        print("❌ API error:", e, body[:300] if body else "")
    except requests.RequestException as e:
        print("❌ Error sending data:", e)
    except Exception as e:
        print("❌ Error sending data:", e)


# =========================
# MAIN PROGRAM
# =========================

cap = cv2.VideoCapture(0)

print("🎥 Press 'q' to stop...")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model.track(frame, persist=True, verbose=False)[0]

    for box in results.boxes:
        cls_id = int(box.cls[0])
        label = model.names[cls_id]
        conf = float(box.conf[0])
        x1, y1, x2, y2 = map(int, box.xyxy[0])

        if label.lower() == "person":
            continue

        track_id = int(box.id[0]) if box.id is not None else None

        # Only increment when tracker has a stable id (bbox pixel keys change every frame)
        if track_id is not None and track_id not in counted_track_ids:
            counted_track_ids.add(track_id)
            name = label.lower()
            if name in BIODEGRADABLE:
                counts["biodegradable"] += 1
                winsound.Beep(1000, 150)
            elif name in NON_DEGRADABLE:
                counts["non_degradable"] += 1
                winsound.Beep(800, 150)
            elif name in E_WASTE:
                counts["e_waste"] += 1
                winsound.Beep(1200, 150)

        color = (0, 255, 0)
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        label_text = f"{label} {conf:.2f}"
        cv2.putText(frame, label_text, (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    # Display counts
    cv2.putText(frame, f"Bio: {counts['biodegradable']}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    cv2.putText(frame, f"Non-Bio: {counts['non_degradable']}", (10, 70),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    cv2.putText(frame, f"E-Waste: {counts['e_waste']}", (10, 110),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)

    # Send to backend every 3 seconds
    if time.time() - last_sent > 3:
        send_to_backend()
        last_sent = time.time()

    cv2.imshow("Waste Detection", frame)

    if cv2.waitKey(33) & 0xFF == ord('q'):
        break

# Cleanup
cap.release()
cv2.destroyAllWindows()