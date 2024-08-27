/**
 * IMPORTANT NOTE! - May 18, 2024
 * This example works without a command like "Hey Google" before starting to talk.
 * If you need to use a voice command, you can use Python in command.py
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

function getEnvVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const gemini = new GoogleGemini({
  apiKey: getEnvVariable("GEMINI_API_KEY"),
  model: "gemini-1.5-flash",
  enableLogging: true,
});

const textToSpeech = new TextToSpeech({
  apiToken: getEnvVariable("DEEPGRAM_API_KEY"),
  sessionId: getEnvVariable("TIKTOK_SESSION_ID"),
  logger: true,
});

const summarizeText = new SummarizeText({
  apiTokens: {
    Deepgram: getEnvVariable("DEEPGRAM_API_KEY"),
    Edenai: getEnvVariable("EDENAI_API_TOKEN"),
  },
  logger: true,
});

const voice = new VoiceRecognition({
  apiTokens: {
    Google: getEnvVariable("GOOGLE_API_TOKEN"),
    Deepgram: getEnvVariable("DEEPGRAM_API_KEY"),
  },
  logger: true,
});

const audio = new AudioGemini({ logger: true });

async function voiceRecognition() {
  const audioName = "output/record_voice";
  voice.voiceRecognition("soxWindows", audioName, async (result) => {
    if (!result) throw new Error("Error related to SoX.");

    const transcript = await voice.fetchTranscriptDeepgram({
      model: "nova-2",
      language: "en",
      audioFile: result,
    });

    if (!transcript) {
      throw new Error("No transcript available.");
    }

    const transcriptText =
      transcript.results.channels[0].alternatives[0].transcript;
    await chat(transcriptText);
  });
}

async function chat(text: string) {
  try {
    const response = await gemini.generateResponse(text);
    const audioName = "output/audio_generated";

    const summary = await summarizeText.edenai({
      text: response,
      languageCode: "en",
      providers: "openai",
      output_sentences: 3,
    });

    const botAudio = await textToSpeech.createSpeech({
      speechProvider: "Deepgram",
      components: {
        text: summary.result,
        audioName,
        encodingAudio: "mp3",
        model: DeepgramVoiceSpeaker.Asteria,
      },
    });

    if (!botAudio) {
      throw new Error("Failed to generate audio.");
    }

    await audio.playAudio("ffmpeg", botAudio);
  } catch (error) {
    console.error("Error in chat function:", error);
  }
}

async function main() {
  await chat("Hello, can you explain to me what RAM is?");
  // Uncomment the line below if you want to use voice recognition
  // await voiceRecognition();
}

main().catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});
