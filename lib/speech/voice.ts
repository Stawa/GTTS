import { spawn, type ChildProcessWithoutNullStreams } from "child_process";

/**
 * Interface for the components that can be passed to the VoiceRecognition constructor.
 */
interface STTComponents {
  /**
   * A boolean flag indicates whether debug logging is enabled.
   */
  debugLog?: boolean;
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
   * Constructs a new VoiceRecognition instance.
   * @param components Optional components to initialize the VoiceRecognition instance.
   * @constructor
   */
  constructor(components?: STTComponents) {
    this.debugLog = components?.debugLog || false;
    this.debugLogged = false;
  }

  /**
   * Performs voice recognition on the audio file specified by the filename.
   * @param filename The filename of the audio file for voice recognition.
   */
  public voiceRecognition(filename: string): void {
    const command: ChildProcessWithoutNullStreams = spawn("sox", [
      "-t",
      "alsa",
      "default",
      `${filename}.wav`,
      "silence",
      "1",
      "0.1",
      "5%",
      "1",
      "3.0",
      "5%",
    ]);

    command.stderr.on("data", (data) => {
      if (this.debugLog && !this.debugLogged) {
        const lines = data.toString().split("\n");
        if (lines.length) {
          this.createLog(lines);
        }
      }
    });

    command.on("close", (code) => {
      if (this.debugLog && !this.debugLogged) {
        this.createLog([`VoiceRecognition Closed with Code: ${code}`]);
      }
    });
  }

  /**
   * Creates debug logs with the provided information about the voice recognition process.
   * @param info Information to be logged.
   */
  private createLog(info: string[]): void {
    console.log("[DEBUG VoiceRecognition]");
    !this.debugLogged &&
      info
        .filter((line) =>
          /^(Input File|Channels|Sample Rate|Precision|Sample Encoding).*/.test(
            line
          )
        )
        .forEach((line) => {
          const match = line.match(
            /^(Input File|Channels|Sample Rate|Precision|Sample Encoding).*/
          )?.[0];
          console.log(`* ${match}`);
        });

    this.debugLogged = true;
  }
}
