/**
 * IMPORTANT NOTE! - May 18, 2024
 * This examples works without command like "Hey Google" and then we start talking.
 * If you need to use a voice command, you can use python on command.py
 */

import {
  AudioGemini,
  GoogleGemini,
  TextToSpeech,
  VoiceRecognition,
} from "../lib";

const gemini = new GoogleGemini({ apiKey: "XXXXXXXXXXXXX", debugLog: true });
const textspeech = new TextToSpeech({ debugLog: true });
const voice = new VoiceRecognition({ debugLog: true });
const audio = new AudioGemini({ debugLog: true });

async function voiceRecognition() {
  voice.voiceRecognition("Test", async (result) => {
    const test = await voice.fetchTrascriptDeepgram({
      model: "nova-2",
      language: "id",
      audioFile: result,
      apiKey: "XXXXXXXXXXXXXXXXX",
    });
    console.log(test.results.channels[0].alternatives[0].transcript);
    await chat(test.results.channels[0].alternatives[0].transcript);
  });
}

async function chat(text: string) {
  const res = await gemini.chat(text);
  const botAudio = await textspeech.createSpeech({
    text: res,
    audioName: "myaudio",
    detectLanguage: true,
  });
  audio.playAudio(botAudio);
}

voiceRecognition();
