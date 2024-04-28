/**
 * IMPORTANT NOTE! - April 28, 2024
 * This example is not finished yet. An error may or may not show up.
 * Please be patient and wait until we update them.
 */

import {
  AudioGemini,
  GoogleGemini,
  TextToSpeech,
  VoiceRecognition,
} from "../lib";

const gemini = new GoogleGemini({ debugLog: true });
const textspeech = new TextToSpeech({ debugLog: true });
const voice = new VoiceRecognition({ debugLog: true });
const audio = new AudioGemini({ debugLog: true });

async function chat() {
  const res = await gemini.chat(
    "Could you explain what is Honkai Star Rail? (max 300 length)" // Long answer takes a while.
  );
  const botAudio = await textspeech.createSpeech({
    text: res,
    audioName: "myaudio",
    detectLanguage: true,
  });
  audio.playAudio(botAudio || "");
}

chat();
