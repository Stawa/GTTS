import os
import subprocess
import time
import logging
from typing import List
from deepgram import (
    DeepgramClient,
    LiveTranscriptionEvents,
    LiveOptions,
    Microphone,
)
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    format="[VoiceRecognition Deepgram]\n* %(message)s", level=logging.INFO
)
logger = logging.getLogger()


class VoiceRecognition:
    def __init__(self, trigger_phrases: List[str], api_key: str):
        self.client = DeepgramClient(api_key=api_key)
        self.trigger_phrases = trigger_phrases
        self.transcriptions: List[str] = []
        self.is_processing_command = False
        self.microphone = None
        self.dg_connection = None
        self.is_reconnecting = False

    def run(self, language: str = "en-US", model: str = "nova-2"):
        try:
            self.dg_connection = self._setup_connection()
            options = self._create_live_options(language, model)

            logger.info("Press Enter to stop recording...")

            if not self._start_connection(self.dg_connection, options):
                return

            self.microphone = self._start_microphone(self.dg_connection)
            input("")
            self._stop_recording(self.microphone, self.dg_connection)

        except Exception as e:
            logger.error(f"Could not open socket: {e}")

    def _setup_connection(self):
        dg_connection = self.client.listen.websocket.v("1")
        event_handlers = {
            LiveTranscriptionEvents.Open: self._on_open,
            LiveTranscriptionEvents.Transcript: self._on_message,
            LiveTranscriptionEvents.Metadata: self._on_metadata,
            LiveTranscriptionEvents.SpeechStarted: self._on_speech_started,
            LiveTranscriptionEvents.UtteranceEnd: self._on_utterance_end,
            LiveTranscriptionEvents.Close: self._on_close,
            LiveTranscriptionEvents.Error: self._on_error,
            LiveTranscriptionEvents.Unhandled: self._on_unhandled,
        }
        for event, handler in event_handlers.items():
            dg_connection.on(event, handler)
        return dg_connection

    @staticmethod
    def _create_live_options(language: str, model: str) -> LiveOptions:
        return LiveOptions(
            model=model,
            language=language,
            smart_format=True,
            encoding="linear16",
            channels=1,
            sample_rate=16000,
            interim_results=True,
            utterance_end_ms="1000",
            vad_events=True,
            endpointing=300,
        )

    def _start_connection(self, dg_connection, options: LiveOptions) -> bool:
        if not dg_connection.start(options, addons={"no_delay": True}):
            logger.error("Failed to connect to Deepgram")
            return False
        logger.info("Successfully connected to Deepgram")
        return True

    @staticmethod
    def _start_microphone(dg_connection):
        logger.info("Starting microphone recording...")
        microphone = Microphone(dg_connection.send, input_device_index=2)
        microphone.start()
        return microphone

    @staticmethod
    def _stop_recording(microphone: Microphone, dg_connection):
        logger.info("Stopping microphone recording...")
        microphone.finish()
        dg_connection.finish()
        logger.info("Recording finished")

    def _on_open(self, *args, **kwargs):
        logger.info("Connection Open")

    def _on_message(self, *args, **kwargs):
        result = kwargs.get("result") if "result" in kwargs else args[0]
        sentence = result.channel.alternatives[0].transcript.strip().lower()
        if not sentence:
            return

        if result.is_final:
            self.transcriptions.append(sentence)
            if any(phrase in sentence for phrase in self.trigger_phrases):
                self._handle_trigger_phrase()
        else:
            logger.debug(f"Interim Results: {sentence}")

    def _handle_trigger_phrase(self):
        logger.info("Trigger phrase detected")
        if not self.is_processing_command:
            self._pause_microphone()
            subprocess.run(["bun", "run", "command.ts", "--audio", "default"])
            self.is_processing_command = True
            self._resume_microphone()

    def _pause_microphone(self):
        if self.microphone:
            logger.info("Pausing microphone...")
            self.microphone.finish()

    def _resume_microphone(self):
        if self.dg_connection:
            logger.info("Resuming microphone...")
            self.microphone = self._start_microphone(self.dg_connection)

    def _on_metadata(self, *args, **kwargs):
        metadata = kwargs.get("metadata", args[0] if args else None)
        if metadata:
            logger.info(f"Metadata: {metadata}")

    def _on_speech_started(self, *args, **kwargs):
        logger.info("Speech Started")

    def _on_utterance_end(self, *args, **kwargs):
        if self.transcriptions:
            utterance = " ".join(self.transcriptions)
            logger.info(f"Utterance End: {utterance}")
            self._process_utterance(utterance)
            self.transcriptions.clear()

    def _process_utterance(self, utterance: str):
        if self.is_processing_command:
            if not any(phrase in utterance for phrase in self.trigger_phrases):
                self._pause_microphone()
                logger.info(f"Asking Gemini about '{utterance}'")
                subprocess.run(["bun", "run", "command.ts", "--text", utterance])
                self.is_processing_command = False
                self._resume_microphone()
                self.transcriptions.clear()

    def _on_close(self, *args, **kwargs):
        logger.info("Connection Closed")
        self._reconnect()

    def _on_error(self, *args, **kwargs):
        error = kwargs.get("error", args[0] if args else None)
        logger.error(f"Handled Error: {error}")

    def _on_unhandled(self, *args, **kwargs):
        unhandled = kwargs.get("unhandled", args[0] if args else None)
        logger.warning(f"Unhandled Websocket Message: {unhandled}")

    def _reconnect(self):
        if self.is_reconnecting:
            return
        self.is_reconnecting = True
        logger.info("Attempting to reconnect...")
        try:
            self.dg_connection = self._setup_connection()
            options = self._create_live_options("en-US", "nova-2")
            if self._start_connection(self.dg_connection, options):
                self.microphone = self._start_microphone(self.dg_connection)
                logger.info("Successfully reconnected")
            else:
                logger.error("Failed to reconnect")
        except Exception as e:
            logger.error(f"Error during reconnection: {e}")
        finally:
            self.is_reconnecting = False


def main():
    trigger_phrases = ["hey, buddy", "hey buddy"]
    api_key = os.getenv("DEEPGRAM_API_KEY")

    if not api_key:
        raise ValueError("DEEPGRAM_API_KEY not set in environment variables")

    vr = VoiceRecognition(trigger_phrases, api_key)
    vr.run()


if __name__ == "__main__":
    main()
