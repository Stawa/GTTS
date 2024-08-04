import fs from "fs";
import axios, { type AxiosResponse } from "axios";
import translate from "@iamtraction/google-translate";
import { TikTokVoiceSpeaker, DeepgramVoiceSpeaker } from "./enums";

/**
 * Interface for the components that can be passed to the TextToSpeech constructor.
 */
interface TTSComponents {
  /**
   * Session ID for accessing the TikTok text-to-speech API.
   */
  sessionId: string;
  /**
   * API Token for accessing the Deepgram API.
   */
  apiToken: string;
  /**
   * A boolean flag indicating whether logging is enabled.
   */
  logger?: boolean;
}

/**
 * Arguments for generating speech using TikTok text-to-speech API.
 */
interface TTSArgs {
  /**
   * The text to be converted to speech.
   */
  text: string;
  /**
   * Optional name for the generated audio file.
   */
  audioName: string;
  /**
   * A boolean flag indicating whether to detect the language of the input text.
   */
  detectLanguage: boolean;
  /**
   * The voice model to be used for the generated speech.
   */
  model: TikTokVoiceSpeaker | string;
}

/**
 * Arguments for generating speech using the Deepgram text-to-speech API.
 */
interface DeepgramTTS {
  /**
   * The text to be converted to speech.
   */
  text: string;
  /**
   * Optional name for the generated audio file.
   */
  audioName: string;
  /**
   * The audio encoding format.
   */
  encodingAudio: "mp3" | "opus" | "flac" | "aac";
  /**
   * The AI model speaker to be used for the generated speech.
   */
  model: DeepgramVoiceSpeaker | string;
}

/**
 * Arguments for the createSpeech method of the TextToSpeech class.
 */
interface CreateSpeech {
  /**
   * Components containing the arguments for speech generation.
   */
  components: TTSArgs | DeepgramTTS;
  /**
   * The speech provider to be used, either Deepgram or TikTok.
   */
  SpeechProvider: "Deepgram" | "TikTok";
}

/**
 * The TextToSpeech class provides functionalities for converting text to speech using the TikTok and Deepgram APIs.
 */
export class TextToSpeech {
  /**
   * Represents the URLs of the TikTok and Deepgram APIs.
   * @private
   * @readonly
   */
  private readonly apiUrl = {
    TikTok: "https://api16-normal-v6.tiktokv.com/media/api/text/speech/invoke",
    Deepgram: {
      TTS: "https://playpi.deepgram.com/v1/speak",
    },
  };

  /**
   * The API Token required for accessing the Deepgram API.
   * @public
   */
  public apiToken: string | undefined;

  /**
   * The session ID required for accessing the TikTok text-to-speech API.
   * @public
   */
  public sessionId: string | undefined;

  /**
   * A boolean flag indicating whether logging is enabled.
   * @public
   */
  public logger: boolean;

  /**
   * Constructs a new TextToSpeech instance.
   * @param components Optional components to initialize the TextToSpeech instance.
   */
  constructor(components?: TTSComponents) {
    if (!components?.apiToken || !components?.sessionId) {
      throw new Error(
        "API key or SessionID is missing. Please provide a valid API or SessionID key."
      );
    }

    this.apiToken = components.apiToken;
    this.sessionId = components.sessionId;
    this.logger = components?.logger ?? false;
  }

  /**
   * Generates speech audio from the provided text using the specified API.
   * @param args Arguments for generating the speech.
   * @returns A Promise that resolves to the file path of the generated audio file or undefined if an error occurs.
   */
  public async createSpeech(args: CreateSpeech): Promise<string | undefined> {
    const components = {
      TikTok: async () => this.createSpeechTikTok(args.components as TTSArgs),
      Deepgram: async () =>
        this.createSpeechDeepgram(args.components as DeepgramTTS),
    };
    return await components[args.SpeechProvider]();
  }

  /**
   * Creates a speech audio file using the Deepgram TTS API.
   * @param args The arguments for the Deepgram TTS request.
   * @returns A Promise that resolves to the file path of the generated audio file or undefined if an error occurs.
   */
  public async createSpeechDeepgram(
    args: DeepgramTTS
  ): Promise<string | undefined> {
    try {
      const postRequest = await axios.post(
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
      const audioWriter = fs.createWriteStream(audioFilename);
      postRequest.data.pipe(audioWriter);

      return new Promise((resolve, reject) => {
        audioWriter.on("finish", () => {
          this.createLog(`Saved Audio with Name: ${audioFilename}`);
          resolve(audioFilename);
        });

        audioWriter.on("error", (err) => {
          console.error("Error writing file", err);
          reject(undefined);
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
  public async createSpeechTikTok(args: TTSArgs): Promise<string | undefined> {
    try {
      const detectedLanguage = args.detectLanguage
        ? await this.detectLanguage(args.text)
        : TikTokVoiceSpeaker.Jessie;

      const formattedText = this.formatText(args.text);
      const headers = {
        "User-Agent":
          "com.zhiliaoapp.musically/2022600030 (Linux; U; Android 7.1.2; es_ES; SM-G988N; Build/NRD90M;tt-ok/3.12.13.1)",
        Cookie: `sessionid=${this.sessionId}`,
        "Accept-Encoding": "gzip,deflate,compress",
      };

      this.createLog([
        `Audio Language: ${detectedLanguage}`,
        `Auto Detect Language: ${args.detectLanguage}`,
        `Formatted Text: ${formattedText.join(" ")}`,
      ]);

      const audioChunks: Buffer[] = [];
      for (const textChunk of formattedText) {
        const fullUrl = `${this.apiUrl.TikTok}/?text_speaker=${
          args.model ?? detectedLanguage
        }&req_text=${textChunk}&speaker_map_type=0&aid=1233`;
        const result: AxiosResponse<any> = await axios.post(fullUrl, null, {
          headers,
        });
        const { status_code: statusCode, data } = result.data;

        if (statusCode !== 0) {
          throw new Error(this.handleError(statusCode));
        }

        const audioChunk = Buffer.from(data.v_str, "base64");
        audioChunks.push(audioChunk);
      }

      const audioBuffer = Buffer.concat(audioChunks);
      const audioFilename = `${args.audioName ?? "gemini-speech"}.mp3`;
      fs.writeFileSync(audioFilename, audioBuffer);
      this.createLog(`Saved Audio with Name: ${audioFilename}`);
      return audioFilename;
    } catch (error) {
      console.error("Error generating TikTok speech:", error);
      return undefined;
    }
  }

  /**
   * Formats the provided text for the TikTok text-to-speech API.
   * @param text The text to be formatted.
   * @returns An array of formatted text chunks.
   */
  private formatText(text: string): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += 20) {
      chunks.push(words.slice(i, i + 20).join(" "));
    }

    return chunks.map((chunk) => {
      const cleanedChunk = chunk.replace(/[^a-zA-Z0-9 ]/g, "");
      const spaceReplaced = cleanedChunk.replace(/\s+/g, "+");
      return spaceReplaced.replace(/[-*]/g, "");
    });
  }

  /**
   * Handles errors based on the status code returned by the TikTok text-to-speech API.
   * @param statusCode The status code returned by the API.
   * @returns The error message corresponding to the status code.
   */
  private handleError(statusCode: number): string {
    const errorMessages: { [key: number]: string } = {
      1: "Session ID is no longer valid. Attempt to obtain a new one.",
      2: "The provided content is too long.",
      4: "The speaker is invalid. Refer to the list of acceptable speaker values.",
      5: "Failed to locate the session ID.",
    };

    return errorMessages[statusCode] ?? `Unknown status code: ${statusCode}`;
  }

  /**
   * Creates a log entry with the provided information if logging is enabled.
   * @param info Information to be logged. Can be a string or an array of strings.
   */
  private createLog(info: string[] | string): void {
    if (!this.logger) return;

    const prefix =
      typeof info === "string"
        ? `* ${info}`
        : info.map((line) => `* ${line}`).join("\n");
    console.log(`[DEBUG TextToSpeech]\n${prefix}`);
  }

  /**
   * Detects the language of the provided text using Google Translate.
   * @param text The text for language detection.
   * @returns A Promise that resolves with the detected language code.
   */
  private async detectLanguage(text: string): Promise<string> {
    const lang = {
      EN: TikTokVoiceSpeaker.Jessie,
      ES: TikTokVoiceSpeaker.SpanishMXMale,
      FR: TikTokVoiceSpeaker.FrenchMale1,
      PT: TikTokVoiceSpeaker.PortugueseBRFemale1,
      DE: TikTokVoiceSpeaker.GermanFemale,
      ID: TikTokVoiceSpeaker.IndonesianFemale,
      JP: TikTokVoiceSpeaker.JapaneseFemale1,
      KR: TikTokVoiceSpeaker.KoreanMale1,
      VN: TikTokVoiceSpeaker.VietnameseFemale,
    };
    const res = await translate(text);
    const detectedLanguageKey = Object.keys(lang).find(
      (key) => key === res.from.language.iso.toUpperCase()
    );
    const detectedLanguage = detectedLanguageKey ?? "EN";
    return lang[detectedLanguage as keyof typeof lang];
  }
}
