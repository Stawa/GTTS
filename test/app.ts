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
  DeepgramVoiceSpeaker,
  SummarizeText,
} from "../lib";
import dotenv from "dotenv";
dotenv.config();

const gemini = new GoogleGemini({
  apiKey: "GEMINI_API_KEY", // GEMINI_API_KEY
  models: "gemini-1.5-flash", // Can pick any models of Gemini
  logger: true,
});
const textspeech = new TextToSpeech({
  apiToken: "DEEPGRAM_API_TOKEN", // DEEPGRAM_API_TOKEN
  sessionId: "TIKTOK_SESSION_ID", // TIKTOK_SESSION_ID
  logger: true,
});
const summarizeText = new SummarizeText({
  apiTokens: {
    Deepgram: "DEEPGRAM_API_TOKEN", // Required if you use Deepgram API; if not, leave blank.
    Edenai: "EDENAI_API_TOKEN", // Required if you use Edenai API; if not, leave blank.
  },
  logger: true,
});
const voice = new VoiceRecognition({ logger: true });
const audio = new AudioGemini({ logger: true });

async function voiceRecognition() {
  const audioName = "output/record_voice";
  voice.voiceRecognition("soxWindows", audioName, async (result) => {
    if (!result) throw Error("Error related with SoX.");
    const test = await voice.fetchTrascriptDeepgram({
      model: "nova-2",
      language: "id",
      audioFile: result,
      apiKey: "API_KEY",
    });
    console.log(test.results.channels[0].alternatives[0].transcript);
    await chat(test.results.channels[0].alternatives[0].transcript);
  });
}

async function chat(text: string) {
  const res = await gemini.chat(text);
  const audioName = "output/audio_generated";
  // const summarize = await summarizeText.deepgram(res, "en");
  // OR
  const summarize = await summarizeText.edenai({
    text: res,
    languageCode: "en",
    providers: "openai",
    output_sentences: 3,
  });
  const botAudio = await textspeech.createSpeech({
    SpeechProvider: "Deepgram",
    components: {
      text: summarize.result,
      audioName: audioName,
      encodingAudio: "mp3",
      model: DeepgramVoiceSpeaker.Asteria,
    },
  });
  audio.playAudio("ffmpeg", botAudio || audioName);
}

chat("Hello, can you explain to me what is a RAM?");
// voiceRecognition(); // Enable if you want to use voice recognition
