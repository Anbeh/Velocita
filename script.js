let watchId = null;
let startTime = null;
let positions = [];
let totalDistance = 0;
let timerInterval = null;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const distanceElement = document.getElementById('distance').querySelector('span');
const speedElement = document.getElementById('speed').querySelector('span');
const timeElement = document.getElementById('time').querySelector('span');

// Function to calculate distance between two coordinates (in meters)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Function to update the timer
function updateTimer() {
    const elapsed = Date.now() - startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    timeElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Function to handle position updates
function handlePosition(position) {
    const { latitude, longitude } = position.coords;

    if (positions.length > 0) {
        const lastPosition = positions[positions.length - 1];
        const distance = calculateDistance(
            lastPosition.latitude,
            lastPosition.longitude,
            latitude,
            longitude
        );
        totalDistance += distance;

        // Calculate speed (in km/h)
        const timeDiff = (position.timestamp - lastPosition.timestamp) / 1000; // in seconds
        const speed = (distance / timeDiff) * 3.6; // Convert m/s to km/h
        speedElement.textContent = `${speed.toFixed(1)} km/h`;
    }

    positions.push({ latitude, longitude, timestamp: position.timestamp });
    distanceElement.textContent = `${(totalDistance / 1000).toFixed(2)} km`;
}

// Start tracking
startBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    startTime = Date.now();
    positions = [];
    totalDistance = 0;
    distanceElement.textContent = '0.00 km';
    speedElement.textContent = '0.0 km/h';
    timeElement.textContent = '00:00:00';

    watchId = navigator.geolocation.watchPosition(
        handlePosition,
        (error) => console.error(error),
        { enableHighAccuracy: true, maximumAge: 0 }
    );

    timerInterval = setInterval(updateTimer, 1000);
    startBtn.disabled = true;
    stopBtn.disabled = false;
});

// Stop tracking
stopBtn.addEventListener('click', () => {
    if (watchId) navigator.geolocation.clearWatch(watchId);
    if (timerInterval) clearInterval(timerInterval);
    startBtn.disabled = false;
    stopBtn.disabled = true;
});
