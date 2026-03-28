// Configuration
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
let botInterval = null;
let countdownInterval = null;
let nextRunTime = null;

// DOM Elements
const postMessage = document.getElementById('postMessage');
const groupLinks = document.getElementById('groupLinks');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const logWindow = document.getElementById('logWindow');
const countdownDisplay = document.getElementById('countdown');

// Add Log Entry
function addLog(message, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const color = type === 'success' ? 'text-green-400' : type === 'error' ? 'text-red-400' : 'text-blue-400';
    const logEntry = `<p class="${color}"><span class="text-slate-500">[${time}]</span> > ${message}</p>`;
    logWindow.innerHTML += logEntry;
    logWindow.scrollTop = logWindow.scrollHeight;
}

// Update Timer Display
function updateTimer() {
    if (!nextRunTime) return;

    const now = new Date().getTime();
    const distance = nextRunTime - now;

    if (distance < 0) {
        countdownDisplay.innerText = "00:00:00";
        return;
    }

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdownDisplay.innerText = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// The Posting Logic
async function runAutoPost() {
    const message = postMessage.value;
    const links = groupLinks.value.split('\n').filter(link => link.trim() !== '');

    if (links.length === 0 || !message) {
        addLog("Error: Missing message or group links", "error");
        stopBot();
        return;
    }

    addLog(`Starting cycle: Posting to ${links.length} groups...`, "info");

    for (const link of links) {
        // Here you would normally integrate with Facebook Graph API
        // For security/demo purposes, we simulate the request
        await simulateFbPost(link, message);
    }

    nextRunTime = new Date().getTime() + TWO_HOURS_MS;
    addLog("Cycle completed. Next run scheduled in 2 hours.", "success");
}

// Simulation of API call
function simulateFbPost(url, msg) {
    return new Promise((resolve) => {
        const groupId = url.split('groups/')[1] || 'Unknown ID';
        setTimeout(() => {
            addLog(`Successfully posted to Group: ${groupId}`, "success");
            resolve();
        }, 1500); // Simulate network delay
    });
}

function startBot() {
    if (botInterval) return;

    addLog("Bot initialized. Starting first run...", "info");
    
    // Run immediately
    runAutoPost();

    // Set intervals
    botInterval = setInterval(runAutoPost, TWO_HOURS_MS);
    countdownInterval = setInterval(updateTimer, 1000);
    
    startBtn.disabled = true;
    startBtn.classList.add('opacity-50', 'cursor-not-allowed');
    addLog("Timer set for 2-hour intervals.", "info");
}

function stopBot() {
    clearInterval(botInterval);
    clearInterval(countdownInterval);
    botInterval = null;
    countdownInterval = null;
    nextRunTime = null;
    
    countdownDisplay.innerText = "00:00:00";
    startBtn.disabled = false;
    startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    addLog("Bot stopped by user.", "error");
}

// Event Listeners
startBtn.addEventListener('click', startBot);
stopBtn.addEventListener('click', stopBot);
