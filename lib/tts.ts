import fs from "fs";
import axios, { type AxiosResponse } from "axios";
import translate from "@iamtraction/google-translate";
import { TikTokVoiceSpeaker, DeepgramVoiceSpeaker } from "./enums";

/**
 * Interface for the components that can be passed to the TextToSpeech constructor.
 */
interface TTSComponents {
  /** Session ID for accessing the TikTok text-to-speech API. */
  sessionId: string;
  /** API Token for accessing the Deepgram API. */
  apiToken: string;
  /** A boolean flag indicating whether logging is enabled. */
  logger?: boolean;
}

/**
 * Arguments for generating speech using TikTok text-to-speech API.
 */
interface TTSArgs {
  /** The text to be converted to speech. */
  text: string;
  /** Name for the generated audio file. */
  audioName: string;
  /** Whether to detect the language of the input text. */
  detectLanguage: boolean;
  /** The voice model to be used for the generated speech. */
  model: TikTokVoiceSpeaker | string;
}

/**
 * Arguments for generating speech using the Deepgram text-to-speech API.
 */
interface DeepgramTTS {
  /** The text to be converted to speech. */
  text: string;
  /** Name for the generated audio file. */
  audioName: string;
  /** The audio encoding format. */
  encodingAudio: "mp3" | "opus" | "flac" | "aac";
  /** The AI model speaker to be used for the generated speech. */
  model: DeepgramVoiceSpeaker | string;
}

/**
 * Arguments for the createSpeech method of the TextToSpeech class.
 */
interface CreateSpeech {
  /** Components containing the arguments for speech generation. */
  components: TTSArgs | DeepgramTTS;
  /** The speech provider to be used, either Deepgram or TikTok. */
  speechProvider: "Deepgram" | "TikTok";
}

/**
 * The TextToSpeech class provides functionalities for converting text to speech using the TikTok and Deepgram APIs.
 */
export class TextToSpeech {
  /**
   * API endpoints for different text-to-speech services.
   * @private
   * @readonly
   */
  private readonly apiUrl = {
    /** TikTok text-to-speech API endpoint */
    TikTok: "https://api16-normal-v6.tiktokv.com/media/api/text/speech/invoke",
    Deepgram: {
      /** Deepgram text-to-speech API endpoint */
      TTS: "https://playpi.deepgram.com/v1/speak",
    },
  };

  /** API token for authentication with the text-to-speech services */
  public apiToken: string;

  /** Session ID for TikTok text-to-speech API */
  public sessionId: string;

  /** Flag to enable or disable logging */
  public logger: boolean;

  /**
   * Constructs a new TextToSpeech instance.
   * @param components Components to initialize the TextToSpeech instance.
   * @throws {Error} If API key or SessionID is missing.
   */
  constructor(components: TTSComponents) {
    if (!components.apiToken || !components.sessionId) {
      throw new Error(
        "API key or SessionID is missing. Please provide valid credentials."
      );
    }

    this.apiToken = components.apiToken;
    this.sessionId = components.sessionId;
    this.logger = components.logger ?? false;
  }

  /**
   * Generates speech audio from the provided text using the specified API.
   * @param args Arguments for generating the speech.
   * @returns A Promise that resolves to the file path of the generated audio file or undefined if an error occurs.
   */
  public async createSpeech(args: CreateSpeech): Promise<string | undefined> {
    const speechGenerators = {
      TikTok: () => this.createSpeechTikTok(args.components as TTSArgs),
      Deepgram: () => this.createSpeechDeepgram(args.components as DeepgramTTS),
    };
    return speechGenerators[args.speechProvider]();
  }

  /**
   * Creates a speech audio file using the Deepgram TTS API.
   * @param args The arguments for the Deepgram TTS request.
   * @returns A Promise that resolves to the file path of the generated audio file or undefined if an error occurs.
   */
  private async createSpeechDeepgram(
    args: DeepgramTTS
  ): Promise<string | undefined> {
    try {
      const response = await axios.post(
        `${this.apiUrl.Deepgram.TTS}?model=${args.model}&encoding=${args.encodingAudio}`,
        { text: args.text },
        {
          headers: {
            Authorization: `Token ${this.apiToken}`,
            "Content-Type": "application/json",
          },
          responseType: "stream",
        }
      );

      const audioFilename = `${args.audioName}.${args.encodingAudio}`;
      const writer = fs.createWriteStream(audioFilename);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          this.log(`Saved Audio: ${audioFilename}`);
          resolve(audioFilename);
        });
        writer.on("error", (err) => {
          console.error("Error writing file:", err);
          reject(new Error("Failed to write audio file"));
        });
      });
    } catch (error) {
      console.error("Error creating Deepgram speech:", error);
      return undefined;
    }
  }

  /**
   * Creates a speech audio file using the TikTok TTS API.
   * @param args The arguments for the TikTok TTS request.
   * @returns A Promise that resolves to the file path of the generated audio file or undefined if an error occurs.
   */
  private async createSpeechTikTok(args: TTSArgs): Promise<string | undefined> {
    try {
      const language = args.detectLanguage
        ? await this.detectLanguage(args.text)
        : TikTokVoiceSpeaker.FemaleEnglishUS1;
      const formattedText = this.formatText(args.text);
      const headers = {
        "User-Agent":
          "com.zhiliaoapp.musically/2022600030 (Linux; U; Android 7.1.2; es_ES; SM-G988N; Build/NRD90M;tt-ok/3.12.13.1)",
        Cookie: `sessionid=${this.sessionId}`,
        "Accept-Encoding": "gzip,deflate,compress",
      };

      this.log([
        `Audio Language: ${language}`,
        `Auto Detect Language: ${args.detectLanguage}`,
        `Formatted Text: ${formattedText.join(" ")}`,
      ]);

      const audioChunks = await Promise.all(
        formattedText.map((chunk) =>
          this.fetchAudioChunk(chunk, args.model ?? language, headers)
        )
      );
      const audioBuffer = Buffer.concat(audioChunks);
      const audioFilename = `${args.audioName ?? "gemini-speech"}.mp3`;
      fs.writeFileSync(audioFilename, audioBuffer);
      this.log(`Saved Audio: ${audioFilename}`);
      return audioFilename;
    } catch (error) {
      console.error("Error generating TikTok speech:", error);
      return undefined;
    }
  }

  /**
   * Fetches an audio chunk from the TikTok API.
   * @param textChunk The text chunk to convert to speech.
   * @param model The voice model to use.
   * @param headers The headers for the API request.
   * @returns A Promise that resolves to a Buffer containing the audio data.
   */
  private async fetchAudioChunk(
    textChunk: string,
    model: string,
    headers: any
  ): Promise<Buffer> {
    const url = `${this.apiUrl.TikTok}/?text_speaker=${model}&req_text=${textChunk}&speaker_map_type=0&aid=1233`;
    const result: AxiosResponse<any> = await axios.post(url, null, { headers });
    const { status_code: statusCode, data } = result.data;

    if (statusCode !== 0) {
      throw new Error(this.handleError(statusCode));
    }

    return Buffer.from(data.v_str, "base64");
  }

  /**
   * Formats the provided text for the TikTok text-to-speech API.
   * @param text The text to be formatted.
   * @returns An array of formatted text chunks.
   */
  private formatText(text: string): string[] {
    return text
      .split(/\s+/)
      .reduce((chunks: string[], word, index) => {
        const chunkIndex = Math.floor(index / 20);
        chunks[chunkIndex] = (chunks[chunkIndex] || "") + " " + word;
        return chunks;
      }, [])
      .map((chunk) =>
        chunk
          .trim()
          .replace(/[^a-zA-Z0-9 ]/g, "")
          .replace(/\s+/g, "+")
      );
  }

  /**
   * Handles errors based on the status code returned by the TikTok text-to-speech API.
   * @param statusCode The status code returned by the API.
   * @returns The error message corresponding to the status code.
   */
  private handleError(statusCode: number): string {
    const errorMessages: { [key: number]: string } = {
      1: "Session ID is invalid. Please obtain a new one.",
      2: "The provided content is too long.",
      4: "Invalid speaker. Please use a valid speaker value.",
      5: "Session ID not found.",
    };
    return (
      errorMessages[statusCode] ?? `Unknown error: status code ${statusCode}`
    );
  }

  /**
   * Logs information if logging is enabled.
   * @param info Information to be logged. Can be a string or an array of strings.
   */
  private log(info: string[] | string): void {
    if (!this.logger) return;
    const message = Array.isArray(info)
      ? info.map((line) => `* ${line}`).join("\n")
      : `* ${info}`;
    console.log(`[DEBUG TextToSpeech]\n${message}`);
  }

  /**
   * Detects the language of the provided text using Google Translate.
   * @param text The text for language detection.
   * @returns A Promise that resolves with the detected TikTok voice speaker.
   */
  private async detectLanguage(text: string): Promise<string> {
    const languageMap: { [key: string]: TikTokVoiceSpeaker } = {
      EN: TikTokVoiceSpeaker.FemaleEnglishUS1,
      ES: TikTokVoiceSpeaker.SpanishMXMale,
      FR: TikTokVoiceSpeaker.FrenchMale1,
      PT: TikTokVoiceSpeaker.PortugueseBRFemale1,
      DE: TikTokVoiceSpeaker.GermanFemale,
      ID: TikTokVoiceSpeaker.IndonesianFemale,
      JP: TikTokVoiceSpeaker.JapaneseFemale1,
      KR: TikTokVoiceSpeaker.KoreanMale1,
      VN: TikTokVoiceSpeaker.VietnameseFemale,
    };
    const result = await translate(text);
    const detectedLanguage = result.from.language.iso.toUpperCase();
    return languageMap[detectedLanguage] || TikTokVoiceSpeaker.FemaleEnglishUS1;
  }
}
