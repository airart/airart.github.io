async function sendMessage() {
 
const input = document.getElementById("userInput");
const message = input.value.trim();
 
if(!message) return;
 
const chatBox = document.getElementById("chat-box");
 
chatBox.innerHTML += `
<div class="user-message">
${message}
</div>
`;
 
input.value = "";
 
try {
 
const response = await fetch(
"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=LA_TUA_API_KEY",
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
text:`Sei AirArt Assistant.
Rispondi come assistente commerciale AirArt.
Domanda: ${message}`
}
]
}
]
})
});
 
const data = await response.json();
 
let reply =
data.candidates?.[0]?.content?.parts?.[0]?.text ||
"Non sono riuscito a rispondere.";
 
chatBox.innerHTML += `
<div class="bot-message">
${reply}
</div>
`;
 
chatBox.scrollTop = chatBox.scrollHeight;
 
} catch(error){
 
chatBox.innerHTML += `
<div class="bot-message">
Errore di connessione.
</div>
`;
}
}