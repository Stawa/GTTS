import {
  AudioGemini,
  GoogleGemini,
  TextToSpeech,
  DeepgramVoiceSpeaker,
  SummarizeText,
} from "../lib";
import { argv } from "process";
import "dotenv/config";

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

const audio = new AudioGemini({ logger: true });

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

    audio.playAudio("ffmpeg", botAudio);
  } catch (error) {
    console.error("Error in chat function:", error);
  }
}

async function main() {
  const [argsCommand, argsText] = argv.slice(2);

  switch (argsCommand) {
    case "--text":
      if (argsText) {
        await chat(argsText);
      } else {
        console.error("Missing text argument for --text command.");
      }
      break;
    case "--audio":
      audio.playAudio("ffmpeg", "output/voice_default.mp3");
      break;
    default:
      console.error("Invalid command or missing arguments.");
  }
}

main().catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});
