import { spawn, type ChildProcessWithoutNullStreams } from "child_process";
import mm, { type IAudioMetadata } from "music-metadata";

/**
 * Interface for the components that can be passed to the AudioGemini constructor.
 * @interface
 */
interface AudioComponents {
  /**
   * A boolean flag indicates whether debug logging is enabled.
   */
  debugLog?: boolean;
}

/**
 * Represents details about the audio file.
 * @interface
 */
interface AudioDetails {
  /**
   * The types of tags associated with the audio file.
   */
  tagTypes: string[];
  /**
   * Information about the tracks is in the audio file.
   */
  trackInfo: string[];
  /**
   * Indicates whether the audio file is lossless.
   */
  lossless: boolean;
  /**
   * The container format of the audio file.
   */
  container: string;
  /**
   * The codec was used for encoding the audio file.
   */
  codec: string;
  /**
   * The sample rate of the audio file.
   */
  sampleRate: number;
  /**
   * The number of channels in the audio file.
   */
  numberOfChannels: number;
  /**
   * The bitrate of the audio file.
   */
  bitrate: number;
  /**
   * The codec profile of the audio file.
   */
  codecProfile: string;
  /**
   * The number of samples in the audio file.
   */
  numberOfSamples: number;
  /**
   * The duration of the audio file in seconds.
   */
  duration: number;
}

/**
 * The AudioGemini class provides functionalities for playing audio files and retrieving metadata.
 * @class
 */
export class AudioGemini {
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
   * Constructs a new AudioGemini instance.
   * @param components Optional components to initialize the AudioGemini instance.
   */
  constructor(components?: AudioComponents) {
    this.debugLog = components?.debugLog || false;
    this.debugLogged = false;
  }

  /**
   * Plays the audio file specified by the filename.
   * @param filename The filename of the audio file to be played.
   */
  public playAudio(filename: string): void {
    const command: ChildProcessWithoutNullStreams = spawn("play", [filename]);

    command.stderr.on("data", async (_data) => {
      if (this.debugLog && !this.debugLogged) {
        const parseAudio = await mm.parseFile(filename);
        const format: AudioDetails = this.extractAudioFormat(parseAudio);
        this.createLog(format);
      }
    });

    command.on("close", (code) => {
      if (this.debugLog) {
        this.createLog(`AudioGemini Closed with Code: ${code}`);
      }
    });
  }

  /**
   * Creates debug logs with the provided audio details or string information.
   * @param info Information about the audio file or a string message to be logged.
   */
  private createLog(info: AudioDetails | string): void {
    typeof info === "string"
      ? console.log(`[DEBUG AudioGemini]\n* ${info}`)
      : null;
    const format: AudioDetails =
      typeof info === "string" ? ({} as AudioDetails) : info;

    const log = {
      title: "[DEBUG AudioGemini]",
      bitRate: `* Bit Rate: ${format.bitrate / 1000}k`,
      encoding: `* Encoding: ${format.codec}`,
      channels: `* Channels: ${format.numberOfChannels}`,
      sampleRate: `* Samplerate: ${format.sampleRate}Hz`,
      duration: `* Duration: ${this.formatDuration(format.duration)}`,
    };

    !this.debugLogged &&
      Object.values(log).forEach((entry) => console.log(entry));
    this.debugLogged = true;
  }

  /**
   * Formats the duration from seconds to HH:MM:SS format.
   * @param duration The duration of the audio file in seconds.
   * @returns The formatted duration string.
   */
  private formatDuration(duration: number): string {
    if (!duration) return "N/A";
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toFixed(2)}`;
  }

  /**
   * Extracts audio format details from the provided audio metadata.
   * @param audioMetadata The metadata of the audio file.
   * @returns The extracted audio format details.
   */
  private extractAudioFormat(audioMetadata: IAudioMetadata): AudioDetails {
    const format = {
      tagTypes: audioMetadata.format.tagTypes,
      trackInfo: audioMetadata.format.trackInfo,
      lossless: audioMetadata.format.lossless,
      container: audioMetadata.format.container,
      codec: audioMetadata.format.codec,
      sampleRate: audioMetadata.format.sampleRate,
      numberOfChannels: audioMetadata.format.numberOfChannels,
      bitrate: audioMetadata.format.bitrate,
      codecProfile: audioMetadata.format.codecProfile,
      numberOfSamples: audioMetadata.format.numberOfSamples,
      duration: audioMetadata.format.duration,
    };
    return format as AudioDetails;
  }
}
