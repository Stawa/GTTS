import { exec, type ChildProcess } from "child_process";
import { createClient, type SyncPrerecordedResponse } from "@deepgram/sdk";
import fs from "fs";
import axios from "axios";
import querystring from "querystring";

/**
 * Defines the type for the player.
 */
type Player = "soxWindows" | "soxLinux";

/**
 * Interface for the components that can be passed to the VoiceRecognition constructor.
 */
interface STTComponents {
  /**
   * API Token for accessing the Deepgram and Google APIs.
   */
  apiTokens: {
    Deepgram: string;
    Google: string;
  };
  /**
   * A boolean flag indicates whether logger is enabled.
   */
  logger?: boolean;
}

/**
 * Interface for Google Speech components.
 */
interface GoogleSpeechComponents {
  language: string;
  audioFile: string;
}

/**
 * Interface for Deepgram Speech to Text components.
 */
interface DeepgramSpeechComponents {
  language: string;
  model: "nova-2" | "nova" | "enhanced" | "base";
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
   * A boolean flag indicating whether logger are enabled.
   * @public
   */
  public logger: boolean;
  /**
   * A boolean flag indicates whether logger have been created to prevent double logs.
   * If set to true, logger have already been created for the current instance.
   * @private
   */
  private logSent: boolean;
  /**
   * The API tokens for accessing the Deepgram and Google APIs.
   * @public
   */
  public apiTokens: { Deepgram: string; Google: string };

  /**
   * Constructs a new VoiceRecognition instance.
   * @param components Optional components to initialize the VoiceRecognition instance.
   * @constructor
   */
  constructor(components: STTComponents) {
    this.apiTokens = components.apiTokens;
    this.logger = components.logger ?? false;
    this.logSent = false;
  }

  /**
   * Performs voice recognition on the audio file specified by the filename.
   * @param player The player type.
   * @param filename The temp filename of the audio file for voice recognition.
   * @param callback The callback function to handle the result.
   */
  public voiceRecognition(
    player: Player,
    filename: string,
    callback: (result: string | void) => void
  ): void {
    const playerCommand: Record<Player, string> = {
      soxWindows: `sox -t waveaudio default --encoding signed-integer --bits 16 --rate 16000 ${filename}.wav silence 1 0.1 5% 1 1.0 5%`,
      soxLinux: `sox -t alsa default --encoding signed-integer --bits 16 --rate 16000 ${filename}.flac silence 1 0.1 5% 1 3.0 5%`,
    };

    const command: ChildProcess = exec(playerCommand[player]);

    command.stderr?.on("data", (data) => {
      if (this.logger && !this.logSent) {
        const lines = data.toString().split("\n");
        if (lines.length) {
          this.createLog(lines);
        }
      }
    });

    command.on("exit", (code) => {
      this.createLog(`VoiceRecognition closed with code: ${code}`);
      if (code === 0) callback(`${filename}.wav`);
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
    try {
      const apiUrl = "https://www.google.com/speech-api/v2/recognize";
      const params = querystring.stringify({
        output: "json",
        lang: components.language,
        key: this.apiTokens.Google,
      });
      const headers = { "Content-Type": "audio/x-flac; rate=16000;" };
      const audioData = fs.readFileSync(components.audioFile);
      const url = `${apiUrl}?${params}`;
      const response = await axios.post(url, audioData, { headers });
      return this.parseResponse(response.data);
    } catch (error) {
      this.createLog(`Error fetching Google transcript: ${error}`);
      return null;
    }
  }

  /**
   * Fetch transcript from the Deepgram Speech-to-Text API.
   * @param components - Object containing Deepgram components.
   * @returns {Promise<SyncPrerecordedResponse | null>} - Returns the transcribed result.
   * @throws {Error} - Throws an error if there's an issue with the API key or transcription process.
   */
  public async fetchTranscriptDeepgram(
    components: DeepgramSpeechComponents
  ): Promise<SyncPrerecordedResponse | null> {
    try {
      const client = createClient(this.apiTokens.Deepgram);
      const response = await client.listen.prerecorded.transcribeFile(
        fs.readFileSync(components.audioFile),
        {
          language: components.language,
          model: components.model,
          detect_language: true,
          smart_format: true,
        }
      );
      if (response.error) throw response.error;
      return response.result;
    } catch (error) {
      this.createLog(`Error fetching Deepgram transcript: ${error}`);
      throw new Error(
        "Deepgram API key is missing or there's an issue with the transcription process."
      );
    }
  }

  /**
   * Parses the response text and extracts transcript results.
   * @param {string} responseText - The response text to parse.
   * @returns {TranscriptResult | null} The parsed transcript result, or null if no result is found.
   */
  private parseResponse(responseText: string): TranscriptResult | null {
    try {
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
    } catch (error) {
      this.createLog(`Error parsing response: ${error}`);
      return null;
    }
  }

  /**
   * Creates logger with the provided information about the voice recognition process.
   * @param info Information to be logged.
   */
  private createLog(info: string[] | string): void {
    let logMessage = "[DEBUG VoiceRecognition]\n";
    const logPrefixRegex =
      /^(Input File|Channels|Sample Rate|Precision|Sample Encoding).*/;

    if (typeof info === "string") {
      logMessage += `* ${info}\n`;
    } else {
      info
        .filter((line) => logPrefixRegex.test(line))
        .forEach((line) => {
          logMessage += `* ${line}\n`;
        });
      this.logSent = true;
    }

    console.log(logMessage);
  }
}
