const API_KEY = "AQ.Ab8RN6IuTArkLseFUISFtESUnMqjFrub1zZFRxuqO8qGH7Vi1Q";

const eye = document.getElementById("eye");
const statusText = document.getElementById("status");
const glare = document.getElementById("glare");

let MODEL_NAME = null;

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;

/* --------------------------
   CARICA ELENCO MODELLI
--------------------------- */

async function loadModel() {

    try {

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );

        const data = await response.json();

        console.log("MODELS:", data);

        const model = data.models.find(m =>
            m.supportedGenerationMethods &&
            m.supportedGenerationMethods.includes("generateContent")
        );

        if (!model) {

            throw new Error(
                "Nessun modello compatibile trovato"
            );
        }

        MODEL_NAME = model.name;

        console.log(
            "MODELLO SELEZIONATO:",
            MODEL_NAME
        );

    } catch (err) {

        console.error(err);

        statusText.innerText =
            "Errore caricamento modelli";
    }
}

/* --------------------------
   MICROFONO
--------------------------- */

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "it-IT";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = function (event) {

        const text =
            event.results[0][0].transcript;

        askAI(text);
    };

    recognition.onerror = function () {

        statusText.innerText =
            "Microfono non disponibile";

        eye.className = "eye";
    };
}

function startListening() {

    if (!recognition) {

        alert(
            "Riconoscimento vocale non disponibile."
        );

        return;
    }

    eye.className = "eye listening";

    statusText.innerText =
        "Sto ascoltando...";

    recognition.start();
}

/* --------------------------
   INVIO TESTO
--------------------------- */

function sendText() {

    const input =
        document.getElementById("userInput");

    const question =
        input.value.trim();

    if (!question)
        return;

    input.value = "";

    askAI(question);
}

/* --------------------------
   CHIAMATA GEMINI
--------------------------- */

async function askAI(question) {

    if (!MODEL_NAME) {

        addMessage(
            "Modello AI non inizializzato.",
            "ai"
        );

        return;
    }

    addMessage(question, "user");

    eye.className = "eye";

    statusText.innerText =
        "Sto elaborando...";

    try {

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${MODEL_NAME}:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `
Sei AIRART AI.

Rispondi sempre in italiano.

Mantieni uno stile professionale.

Domanda:
${question}
`
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data =
            await response.json();

        console.log(
            "RISPOSTA GEMINI:",
            data
        );

        if (!response.ok) {

            throw new Error(
                data?.error?.message ||
                "Errore AI"
            );
        }

        const answer =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Nessuna risposta ricevuta.";

        addMessage(answer, "ai");

        speak(answer);

    } catch (error) {

        console.error(error);

        addMessage(
            "Errore AI: " + error.message,
            "ai"
        );
    }
}

/* --------------------------
   VOCE
--------------------------- */

function speak(text) {

    eye.className = "eye speaking";

    statusText.innerText =
        "Sto rispondendo...";

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.lang = "it-IT";
    speech.rate = 0.95;
    speech.pitch = 0.8;

    speech.onend = function () {

        eye.className = "eye";

        statusText.innerText =
            "Sistema in attesa...";
    };

    speechSynthesis.speak(speech);
}

/* --------------------------
   CHAT
--------------------------- */

function addMessage(text, type) {

    const box =
        document.getElementById("chatbox");

    const div =
        document.createElement("div");

    div.className = type;
    div.textContent = text;

    box.appendChild(div);

    box.scrollTop =
        box.scrollHeight;
}

/* --------------------------
   GIROSCOPIO
--------------------------- */

function moveReflection(beta, gamma) {

    const x =
        Math.max(-25,
            Math.min(25, gamma));

    const y =
        Math.max(-25,
            Math.min(25, beta / 3));

    glare.style.transform =
        `translate(${x}px,${y}px)`;
}

async function enableMotion() {

    try {

        if (
            typeof DeviceOrientationEvent !== "undefined" &&
            typeof DeviceOrientationEvent.requestPermission === "function"
        ) {

            const permission =
                await DeviceOrientationEvent
                    .requestPermission();

            if (permission === "granted") {

                window.addEventListener(
                    "deviceorientation",
                    event => {

                        moveReflection(
                            event.beta || 0,
                            event.gamma || 0
                        );
                    }
                );
            }

        } else {

            window.addEventListener(
                "deviceorientation",
                event => {

                    moveReflection(
                        event.beta || 0,
                        event.gamma || 0
                    );
                }
            );
        }

    } catch (err) {

        console.error(err);
    }
}

/* --------------------------
   AVVIO
--------------------------- */

loadModel();