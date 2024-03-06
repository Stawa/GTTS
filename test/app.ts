import { GoogleGemini, TextToSpeech, VoiceSpeaker } from "../lib";

const gemini = new GoogleGemini({ debugLog: true });
const textspeech = new TextToSpeech({ debugLog: true });

async function chat() {
  const res = await gemini.chat(
    "Who is the creator of Facebook? (Provide a short and clear answer.)"
  );
  textspeech.createSpeech({
    text: res,
    audioName: "myaudio",
    voice: VoiceSpeaker.Jessie,
  });
}

chat();
