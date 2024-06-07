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
  VoiceSpeaker,
} from "../lib";
import dotenv from "dotenv";
dotenv.config();

const gemini = new GoogleGemini({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
  debugLog: true,
});
const textspeech = new TextToSpeech({
  sessionId: process.env.TEXT_TO_SPEECH_SESSION_ID,
  debugLog: true,
});
const voice = new VoiceRecognition({
  apiKey: process.env.VOICE_RECOGNITION_API_KEY,
  debugLog: true,
});
const audio = new AudioGemini({ debugLog: true });

async function voiceRecognition() {
  voice.voiceRecognition("soxWindows", "Test", async (result) => {
    if (!result) throw Error("Error related with SoX.")
    const test = await voice.fetchTrascriptDeepgram({
      model: "nova-2",
      language: "id",
      audioFile: result,
      apiKey: process.env.DEEPGRAM_API_KEY,
    });
    console.log(test.results.channels[0].alternatives[0].transcript);
    await chat(test.results.channels[0].alternatives[0].transcript);
  });
}

async function chat(text: string) {
  const res = await gemini.chat(text);
  const audioName = "myaudio";
  const botAudio = await textspeech.createSpeech({
    text: res,
    audioName: audioName,
    voice: VoiceSpeaker.FemaleEnglishUS, // or etectLanguage: true,
  });
  audio.playAudio("ffmpeg", botAudio || audioName);
}

voiceRecognition();
