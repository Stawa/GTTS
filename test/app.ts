import {
  AudioGemini,
  GoogleGemini,
  TextToSpeech,
  VoiceRecognition,
} from "../lib";

const gemini = new GoogleGemini({ debugLog: true });
const textspeech = new TextToSpeech({ debugLog: true });

async function chat() {
  const res = await gemini.chat(
    "Halo? Bolehkah saya meminta bantuan? (Jawab dengan baik dan sederhana)"
  );
  textspeech.createSpeech({
    text: res,
    audioName: "myaudio",
    detectLanguage: true,
  });
}

// chat()

async function speech() {
  new VoiceRecognition({ debugLog: true }).voiceRecognition("myAudio");
}

// speech();

async function audio() {
  new AudioGemini({ debugLog: true }).playAudio("myaudio.mp3");
}

// audio()
