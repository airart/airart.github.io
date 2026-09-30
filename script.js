const eye = document.getElementById("eye");
const statusText = document.getElementById("status");
const glare = document.getElementById("glare");

const MAX_HISTORY = 10; // numero massimo di messaggi ricordati (5 scambi)
const history = [];
let busy = false;

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;

/* --------------------------
   MICROFONO
--------------------------- */

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "it-IT";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = function (event) {
        const text = event.results[0][0].transcript;
        askAI(text);
    };

    recognition.onerror = function () {
        statusText.innerText = "Microfono non disponibile";
        eye.className = "eye";
    };

    recognition.onend = function () {
        // se non è arrivato nessun risultato, torna allo stato normale
        if (eye.className === "eye listening") {
            eye.className = "eye";
            statusText.innerText = "Sistema in attesa...";
        }
    };
}

function startListening() {

    if (!recognition) {
        alert("Riconoscimento vocale non disponibile.");
        return;
    }

    if (busy) return;

    try {
        eye.className = "eye listening";
        statusText.innerText = "Sto ascoltando...";
        recognition.start();
    } catch (err) {
        // start() genera errore se il microfono è già attivo
        console.error(err);
    }
}

/* --------------------------
   INVIO TESTO
--------------------------- */

function sendText() {

    const input = document.getElementById("userInput");
    const question = input.value.trim();

    if (!question) return;

    input.value = "";

    askAI(question);
}

const inputEl = document.getElementById("userInput");

if (inputEl) {
    inputEl.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendText();
        }
    });
}

/* --------------------------
   CHIAMATA AL BACKEND (CLAUDE)
--------------------------- */

async function askAI(question) {

    if (busy) return;
    busy = true;

    speechSynthesis.cancel();

    addMessage(question, "user");

    eye.className = "eye";
    statusText.innerText = "Sto elaborando...";

    history.push({ role: "user", content: question });

    try {

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: history })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.error || "Errore AI");
        }

        const answer = data.reply || "Nessuna risposta ricevuta.";

        history.push({ role: "assistant", content: answer });

        // mantieni la cronologia corta, sempre a coppie utente/assistente
        while (history.length > MAX_HISTORY) {
            history.splice(0, 2);
        }

        addMessage(answer, "ai");
        speak(answer);

    } catch (error) {

        console.error(error);

        history.pop(); // rimuovi la domanda fallita

        addMessage("Errore AI: " + error.message, "ai");

        eye.className = "eye";
        statusText.innerText = "Errore, riprova";

    } finally {
        busy = false;
    }
}

/* --------------------------
   VOCE
--------------------------- */

function speak(text) {

    eye.className = "eye speaking";
    statusText.innerText = "Sto rispondendo...";

    // toglie i simboli markdown per non farli leggere ad alta voce
    const clean = text.replace(/[*_#`>]/g, "");

    const speech = new SpeechSynthesisUtterance(clean);

    speech.lang = "it-IT";
    speech.rate = 0.95;
    speech.pitch = 0.8;

    speech.onend = function () {
        eye.className = "eye";
        statusText.innerText = "Sistema in attesa...";
    };

    speech.onerror = speech.onend;

    speechSynthesis.speak(speech);
}

/* --------------------------
   CHAT
--------------------------- */

function addMessage(text, type) {

    const box = document.getElementById("chatbox");

    const div = document.createElement("div");

    div.className = type;
    div.textContent = text;

    box.appendChild(div);

    box.scrollTop = box.scrollHeight;
}

/* --------------------------
   GIROSCOPIO
--------------------------- */

function moveReflection(beta, gamma) {

    const x = Math.max(-25, Math.min(25, gamma));
    const y = Math.max(-25, Math.min(25, beta / 3));

    glare.style.transform = `translate(${x}px,${y}px)`;
}

function onOrientation(event) {
    moveReflection(event.beta || 0, event.gamma || 0);
}

async function enableMotion() {

    try {

        if (
            typeof DeviceOrientationEvent !== "undefined" &&
            typeof DeviceOrientationEvent.requestPermission === "function"
        ) {

            const permission = await DeviceOrientationEvent.requestPermission();

            if (permission === "granted") {
                window.addEventListener("deviceorientation", onOrientation);
            }

        } else {
            window.addEventListener("deviceorientation", onOrientation);
        }

    } catch (err) {
        console.error(err);
    }
}
