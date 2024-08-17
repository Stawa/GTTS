import {
  AudioGemini,
  GoogleGemini,
  TextToSpeech,
  DeepgramVoiceSpeaker,
  SummarizeText,
} from "../lib";
import { argv } from "process";

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
const audio = new AudioGemini({ logger: true });

async function chat(text: string) {
  try {
    const res = await gemini.chat(text);
    const audioName = "output/audio_generated";

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

    if (!botAudio) {
      throw new Error("Failed to generate audio.");
    }

    audio.playAudio("ffmpeg", botAudio || audioName);
  } catch (error) {
    console.error("Error in chat function:", error);
  }
}

function main() {
  const args = argv.slice(2);
  const argsCommand = args[0];
  const argsText = args[1];

  if (argsCommand === "--text" && argsText) {
    chat(argsText);
  } else if (argsCommand === "--audio") {
    audio.playAudio("ffmpeg", "output/voice_default.mp3");
  } else {
    console.error("Invalid command or missing arguments.");
  }
}

main();
