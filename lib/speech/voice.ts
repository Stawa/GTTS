import { exec, type ChildProcess } from "child_process";
import { createClient, type SyncPrerecordedResponse } from "@deepgram/sdk";
import fs from "fs";
import axios from "axios";
import querystring from "querystring";

/**
 * Interface for the components that can be passed to the VoiceRecognition constructor.
 */
interface STTComponents {
  /**
   * A boolean flag indicates whether debug logging is enabled.
   */
  debugLog?: boolean;
  apiKey?: string;
}

/**
 * Interface for Google Speech components.
 */
interface GoogleSpeechComponents {
  language: string;
  audioFile: string;
  apiKey: string;
}

/**
 * Interface for Deepgram Speech to Text components.
 */
interface DeepgramSpeechComponents {
  language: string;
  model: "nova-2" | "nova" | "enhanced" | "base";
  apiKey: string;
  audioFile: string;
}

/**
 * Represents a transcript result containing transcribed text and a confidence level.
 */
interface TranscriptResult {
  alternative: { transcript: string; confidence?: number }[];
  final: boolean;
}

/**
 * The VoiceRecognition class provides functionalities for performing voice recognition.
 */
export class VoiceRecognition {
  /**
   * A boolean flag indicating whether debug logs are enabled.
   * @public
   */
  public debugLog: boolean;
  /**
   * A boolean flag indicates whether debug logs have been created to prevent double logs.
   * If set to true, debug logs have already been created for the current instance.
   * @private
   */
  private debugLogged: boolean;
  /**
   * API key for accessing the Google Speech service.
   */
  apiKey: string | undefined;

  /**
   * Constructs a new VoiceRecognition instance.
   * @param components Optional components to initialize the VoiceRecognition instance.
   * @constructor
   */
  constructor(components?: STTComponents) {
    this.debugLog = components?.debugLog ?? false;
    this.debugLogged = false;
  }

  /**
   * Performs voice recognition on the audio file specified by the filename.
   * @param filename The filename of the audio file for voice recognition.
   */
  public voiceRecognition(filename: string): void {
    const command: ChildProcess = exec(
      `sox -t waveaudio default --encoding signed-integer --bits 16 --rate 16000 ${filename}.wav silence 1 0.1 5% 1 3.0 5%`
    );

    command.stderr?.on("data", (data) => {
      if (this.debugLog && !this.debugLogged) {
        const lines = data.toString().split("\n");
        if (lines.length) {
          this.createLog(lines);
        }
      }
    });

    command.on("exit", (code) => {
      this.createLog(`VoiceRecognition Closed with Code: ${code}`);
      if (code == 0) return true;
    });
  }

  /**
   * Fetch transcript from the Google Speech-to-Text API.
   * @param components - Object containing Google Speech components.
   * @returns {Promise<TranscriptResult | null>} - Promise containing the AxiosResponse.
   */
  public async fetchTranscriptGoogle(
    components: GoogleSpeechComponents
  ): Promise<TranscriptResult | null> {
    const apiUrl = "https://www.google.com/speech-api/v2/recognize";
    const apiKey = components.apiKey || process.env.GOOGLE_SPEECH_API_KEY;
    const params = querystring.stringify({
      output: "json",
      lang: components.language,
      key: apiKey,
    });
    const headers = { "Content-Type": "audio/x-flac; rate=16000;" };
    const audioData = fs.readFileSync(components.audioFile);
    const url = `${apiUrl}?${params}`;
    const response = await axios.post(url, audioData, { headers });
    return this.parseResponse(response.data);
  }

  /**
   * Fetch transcript from the Deepgram Speech-to-Text API.
   * @param components - Object containing Deepgram components.
   * @returns {Promise<SyncPrerecordedResponse>} - Returns the transcribed result.
   * @throws {Error} - Throws an error if there's an issue with the API key or transcription process.
   */
  public async fetchTrascriptDeepgram(
    components: DeepgramSpeechComponents
  ): Promise<SyncPrerecordedResponse> {
    const apiKey = components.apiKey || process.env.DEEPGRAM_API_KEY;
    const client = apiKey
      ? createClient(apiKey)
      : (() => {
          throw new Error(
            "Deepgram API key is missing. Please provide a valid API key."
          );
        })();
    const { result, error } = await client.listen.prerecorded.transcribeFile(
      fs.readFileSync(components.audioFile),
      {
        language: components.language,
        model: components.model,
        smart_format: true,
      }
    );
    if (error) throw error;
    return result;
  }

  /**
   * Parses the response text and extracts transcript results.
   * @param {string} responseText - The response text to parse.
   * @returns {TranscriptResult | null} The parsed transcript result, or null if no result is found.
   */
  private parseResponse(responseText: string): TranscriptResult | null {
    const lines = responseText.split("\n");
    for (const line of lines) {
      if (!line) continue;

      const result: TranscriptResult[] = JSON.parse(line).result;

      if (result.length !== 0) {
        if (result[0].alternative.length === 0) {
          throw new Error("No transcribed text found in the response.");
        }
        return result[0];
      }
    }

    return null;
  }

  /**
   * Creates debug logs with the provided information about the voice recognition process.
   * @param info Information to be logged.
   */
  private createLog(info: string[] | string): void {
    let logMessage = "[DEBUG VoiceRecognition]\n";
    const logPrefixRegex =
      /^(Input File|Channels|Sample Rate|Precision|Sample Encoding).*/;

    if (typeof info === "string") {
      logMessage += `* ${info}\n`;
    }

    if (!this.debugLogged && typeof info === "object") {
      info
        .filter((line) => logPrefixRegex.test(line))
        .forEach((line) => {
          const match = logPrefixRegex.exec(line);
          match && (logMessage += `* ${match[0]}\n`);
        });
      this.debugLogged = true;
    }

    console.log(logMessage);
  }
}
