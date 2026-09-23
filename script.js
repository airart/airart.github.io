const API_KEY = "AQ.Ab8RN6J_PQtm_YV0G5SoqmPW_ynvR9S1E_ApjGWeWw2mPBo_FQ";

const eye = document.getElementById("eye");
const statusText = document.getElementById("status");

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();

recognition.lang = "it-IT";
recognition.continuous = false;

function startListening(){

    eye.className = "eye listening";

    statusText.innerText =
    "Sto ascoltando...";

    recognition.start();
}

recognition.onresult = function(event){

    const text =
    event.results[0][0].transcript;

    askAI(text);
};

recognition.onerror=function(){

    statusText.innerText =
    "Errore microfono";

    eye.className="eye";
};

function sendText(){

    const text =
    document.getElementById("userInput").value;

    askAI(text);
}

async function askAI(question){

    addMessage(question,"user");

    eye.className="eye";

    statusText.innerText =
    "Sto elaborando...";

    try{

        const response =
        await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                contents:[
                {
                    parts:[
                    {
text:`
Sei AIRART AI.

Parla in italiano.

Sei un assistente professionale.

Rispondi in modo chiaro e sintetico.

Domanda:
${question}
`
                    }]
                }]
            })
        });

        const data =
        await response.json();

        let answer =
        data.candidates[0]
        .content.parts[0].text;

        addMessage(answer,"ai");

        speak(answer);

    }catch(error){

        addMessage(
        "Errore durante la connessione.",
        "ai");
    }
}

function speak(text){

    eye.className="eye speaking";

    statusText.innerText=
    "Sto rispondendo...";

    const speech =
    new SpeechSynthesisUtterance(text);

    speech.lang="it-IT";

    speech.onend=function(){

        eye.className="eye";

        statusText.innerText=
        "Sistema in attesa...";
    };

    speechSynthesis.speak(speech);
}

function addMessage(text,type){

    const box =
    document.getElementById("chatbox");

    const div =
    document.createElement("div");

    div.className=type;

    div.innerHTML=text;

    box.appendChild(div);

    box.scrollTop=box.scrollHeight;
}
},
body:JSON.stringify({
contents:[
{
parts:[
{
text:`
Sei AIRART AI.
 
Parla in italiano.
 
Sei un assistente professionale.
 
Rispondi in modo chiaro e sintetico.
 
Domanda:
${question}
`
}]
}]
})
});
 
const data =
await response.json();
 
let answer =
data.candidates[0]
.content.parts[0].text;
 
addMessage(answer,"ai");
 
speak(answer);
 
}catch(error){
 
addMessage(
"Errore durante la connessione.",
"ai");
}
}
 
function speak(text){
 
eye.className="eye speaking";
 
statusText.innerText=
"Sto rispondendo...";
 
const speech =
new SpeechSynthesisUtterance(text);
 
speech.lang="it-IT";
 
speech.onend=function(){
 
eye.className="eye";
 
statusText.innerText=
"Sistema in attesa...";
};
 
speechSynthesis.speak(speech);
}
 
function addMessage(text,type){
 
const box =
document.getElementById("chatbox");
 
const div =
document.createElement("div");
 
div.className=type;
 
div.innerHTML=text;
 
box.appendChild(div);
 
box.scrollTop=box.scrollHeight;
}