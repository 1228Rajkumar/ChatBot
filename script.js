const CHATSENDBTN = document.querySelector(".chat-input #send-btn");
const RECORDBTNON = document.querySelector(".chat-input #record-on");
// const TEXTCOPY = document.getElementById("text-copy");
const CHATAREA = document.querySelector(".chat-input textarea");
const CHATBOX = document.querySelector(".chatBox");


let Usermessage;
// const API_KEY = "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";
// const API_KEY = "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";
// const API_KEY = "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";//hasher
const API_KEY = "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";//zoho
// const INPUTINITHEIGHT = CHATAREA.scrollHeight;

let count = 0;
const createChatLi = (message, className) => {
    // create li tag
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span id="person" class="material-symbols-outlined">person</span><div><p></p><div class="incomeMessageFeatures"><span onclick="TextCopy(this)" id='text-copy' class="material-symbols-outlined">content_copy</span> <span onclick="startSpeech(this)" class="material-symbols-outlined volume">volume_off</span></div></div>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}


var i = 0;
function typeWriter(mes, ele) { 
  if (i < mes.length) {
    ele.textContent += mes.charAt(i);
    i++;
    setTimeout(function (){
        typeWriter(mes,ele);
    } , 8);
  }
}

const generateResponse = (incomingChatLi) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const messageElment = incomingChatLi.querySelector('p');
    count++;
    const messageDivElment = incomingChatLi.querySelector('div');
    const requestOption = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`

        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: Usermessage
                }
            ]
        })
    }

    fetch(API_URL, requestOption).then(res => res.json()).then(data => {
      var  APIResponse = data.choices[0].message.content;
      if(APIResponse != undefined){
        messageElment.innerHTML ="";
        console.log(APIResponse);
        typeWriter(APIResponse,messageElment);
      }        
    // messageElment.textContent = APIResponse;
    }).catch((error) => {
        messageDivElment.classList.add("error")
        messageElment.textContent = "Oops! something went wrong. please record-ontry again.";
    }).finally(() =>
        CHATBOX.scrollTo(0, CHATBOX.scrollHeight)
    );
}
const handleChat = () => {
    CHATAREA.style.height = `55px`;
    Usermessage = CHATAREA.value.trim();
    if (!Usermessage) return;
    CHATAREA.value = "";
    //Append the user message to the chat box 
    CHATBOX.appendChild(createChatLi(Usermessage, "outgoing"));
    CHATBOX.scrollTo(0, CHATBOX.scrollHeight);

    setTimeout(() => {
        const incomingChatLi = createChatLi("...", "incoming");
        CHATBOX.appendChild(incomingChatLi);
        CHATBOX.scrollTo(0, CHATBOX.scrollHeight);
        generateResponse(incomingChatLi);
    }, 60)
}

CHATAREA.addEventListener("input", () => {
    CHATAREA.style.height = `${CHATAREA.scrollHeight}px`;
})

CHATSENDBTN.addEventListener("click", handleChat);


function TextCopy(e){
    var subparentDiv = e.parentNode;
    var parentDiv = subparentDiv.parentNode;
    const incomingMessage = parentDiv.querySelector('p');
    if (incomingMessage) {
    const intext = incomingMessage.textContent; 
    navigator.clipboard.writeText(intext)
    .then(() => {
      e.innerHTML = "check";
      setTimeout(()=>{
        e.innerHTML = "content_copy"
      },5000)
    })
    .catch(error => {
      console.error('Error copying text:', error);
    });
} else {
  console.error('Could not find the <p> tag.');
}
}

//speech to Text convert
let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
let recording = false;
const recognition = new speechRecognition();
recognition.lang = "en-IN";

RECORDBTNON.addEventListener("click", (event) => {
    event.preventDefault();
    if (!recording) {
        // CHATAREA.innerHTML = "";
        speechToText();
    }
    else {
        stopRecording();
    }
});

const speechToText = () => {
    try {
        RECORDBTNON.innerHTML = "mic";
        CHATAREA.placeholder = 'Listening...';
        recognition.start();
        recording = true;
        // recognition.continuous = true;
        recognition.onresult = (event) => {
            var speechResult = event.results[event.results.length - 1][0].transcript;
                CHATAREA.value = speechResult;
                CHATAREA.style.height = `${CHATAREA.scrollHeight}px`;
        }
        recognition.onspeechend = function() {
            stopRecording();
        };
    } catch (error) {
        console.log(error);
    }
}

// recognition.onstart = function() {
    
// };



recognition.onerror = (event) => {
    alert("Error ouccred :" + event.error);
}
const stopRecording = () => {
    recognition.stop();
    RECORDBTNON.innerHTML = "mic_off"
    CHATAREA.placeholder = "Enter a message...";
    recording = false;
}

// Text to speech convert
let isSpeaking = true;
let voices;

async function TextToSpeech(text, btn) {
    let utterance = new SpeechSynthesisUtterance(text);
    // voices = synth.getVoices();
    // utterance.lang = voices[5].lang;

    window.speechSynthesis.cancel()
    //  utterance.voice = voices[2];
    window.speechSynthesis.speak(utterance);
    // utterance.volume = 100;
    utterance.onend = function () {
        isSpeaking = true;
        btn.innerHTML = "volume_off";
    };
}
const startSpeech = (e) => {
    var subparentDiv = e.parentNode;
    var parentDiv = subparentDiv.parentNode;
    const incomingMessage = parentDiv.querySelector('p');

    if (incomingMessage.textContent != "") {
        if (!window.speechSynthesis.speaking) {
            e.innerHTML = "volume_up";
            const message = incomingMessage.textContent.split("\n\n");
            // for (const mes of message) {
            //     console.log(mes);
            // }
            TextToSpeech(incomingMessage.textContent, e);
        } else {
            if (!isSpeaking) {
                window.speechSynthesis.pause();
                isSpeaking = true;
                e.innerHTML = "volume_off";
            } else {
                window.speechSynthesis.resume();
                isSpeaking = false;
                e.innerHTML = "volume_up";
            }
        }
    }
}