<h2 align="center" style="display: flex; align-items: center; justify-content: center;">
  <img src="https://raw.githubusercontent.com/Stawa/Gemini-Text-To-Speech/86c0daa9de8303ef31b791eb172ce70c651de23c/repo/google_gemini.svg" alt="Gemini Icon" width="24" height="24" style="margin-right: 8px;">
  Gemini Text-To-Speech 
  <img src="https://raw.githubusercontent.com/Stawa/Gemini-Text-To-Speech/86c0daa9de8303ef31b791eb172ce70c651de23c/repo/google_gemini.svg" alt="Gemini Icon" width="24" height="24" style="margin-left: 8px;">
</h2>

<p align="center"><b>Convert written material into speech using Google AI (Gemini) for text creation or internet searches.</b></p>

<p align="center">
  <a href="https://gemini.google.com/">
    <img src="https://img.shields.io/badge/Google%20Gemini-black?style=flat&logo=Google&logoColor=blue" alt="Google Gemini">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/Made%20with%20TypeScript-black?style=flat&logo=TypeScript&logoColor=blue" alt="Made with TypeScript">
  </a>
  <a href="https://bun.sh/">
    <img src="https://img.shields.io/badge/Powered%20by%20Bun-black?style=flat&logo=bun&logoColor=white" alt="Powered by Bun">
  </a>
  <a href="https://stawa.github.io/GTTS/">
    <img alt="Documentation" src="https://img.shields.io/website?url=https://stawa.github.io/GTTS/&up_message=Available&up_color=1F51FF&down_color=critical&down_message=Unavailable&style=flat&logo=github&label=Documentation&labelColor=black">
  </a>
  <a href="https://sonarcloud.io/project/overview?id=Stawa_Gemini-Text-To-Speech">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=Stawa_Gemini-Text-To-Speech&metric=reliability_rating" alt="SonarCloud Reliability Rating">
  </a>
</p>

<hr />

<h3>📜 Table of Contents</h3>
<ol>
  <li><a href="#how-it-works"><b>How It Works</b></a></li>
  <li><a href="#project-note"><b>Project Note</b></a></li>
  <li><a href="#project-installation"><b>Project Installation</b></a></li>
  <li><a href="#project-examples"><b>Project Examples</b></a></li>
  <li><a href="#contributors"><b>Contributors</b></a></li>
</ol>

<hr />

<h3 id="how-it-works">❓ How It Works</h3>
<p>This project is based on an example in <a href="https://github.com/Stawa/GTTS/blob/main/test/app.ts">test/app.ts</a>. It fetches a voice, sends a request to the Google Gemini API to receive an AI-generated response, and automatically plays it as TTS.</p>

<hr />

<h3 id="project-note">📌 Project Note</h3>
<p>This project is tested on Linux (Ubuntu 24.04 LTS x86_64). Windows users can install SoX via SourceForge. No MacOS-specific information is available.</p>

<table>
  <tr>
    <th>Task</th>
    <th>Priority</th>
    <th>Complete</th>
    <th>Status</th>
  </tr>
  <tr>
    <td>Implement Gemini Chat</td>
    <td>High</td>
    <td>&check;</td>
    <td>Completed</td>
  </tr>
  <tr>
    <td>Develop Voice Recognition</td>
    <td>High</td>
    <td>&check;</td>
    <td>Completed</td>
  </tr>
  <tr>
    <td>Implement Audio Language Detection</td>
    <td>High</td>
    <td>&check;</td>
    <td>Completed</td>
  </tr>
  <tr>
    <td>Implement Text Language Detection</td>
    <td>Medium</td>
    <td>&check;</td>
    <td>Completed</td>
  </tr>
  <tr>
    <td>Implement an Audio Player</td>
    <td>Low</td>
    <td>&check;</td>
    <td>Completed</td>
  </tr>
  <tr>
    <td>Define Enums</td>
    <td>Low</td>
    <td>&check;</td>
    <td>Completed</td>
  </tr>
  <tr>
    <td>Integrate Debugging</td>
    <td>Low</td>
    <td>&check;</td>
    <td>Completed</td>
  </tr>
</table>

<hr />

<h3 id="project-installation">📦 Project Installation</h3>
<p>Before using this repository, ensure the following libraries are installed on Linux:</p>
<ul>
  <li><b>SoX</b>
    <ul>
      <li><code>sudo apt-get install sox</code></li>
      <li><a href="https://sourceforge.net/projects/sox/">Windows Users (SourceForge)</a></li>
    </ul>
  </li>
  <li><b>libsox-fmt-all</b>
    <ul>
      <li><code>sudo apt-get install libsox-fmt-all</code></li>
    </ul>
  </li>
  <li><b>FFmpeg</b>
    <ul>
      <li><code>choco install ffmpeg</code></li>
      <li><code>sudo apt install ffmpeg</code></li>
      <li><a href="https://www.ffmpeg.org/download.html">FFmpeg Downloads</a></li>
    </ul>
  </li>
</ul>

<p>Then install the repository using the following commands:</p>

```bash
# npm
$ npm install git+https://github.com/Stawa/GTTS.git --legacy-peer-deps
# Bun
$ bun install git+https://github.com/Stawa/GTTS.git --trust
```

<hr />

<h3 id="project-examples">📄 Project Examples</h3>
<p>Requirements for successful execution:</p>
<ul>
  <li><b>Google Gemini API Key</b> (<code>lib.GoogleGemini</code>)
    <ul><li>Obtain from <a href="https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com">Google Cloud</a></li></ul>
  </li>
  <li><b>TikTok SessionID</b> (<code>lib.TextToSpeech</code>)
    <ul><li>Obtain from <a href="https://www.tiktok.com/">TikTok</a> cookies</li></ul>
  </li>
  <li><b>Google Speech API Key</b> (<code>lib.VoiceRecognition.fetchTranscriptGoogle</code>)
    <ul><li>Obtain from <a href="https://www.chromium.org/developers/how-tos/api-keys/">Chromium API Key</a></li></ul>
  </li>
  <li><b>Deepgram API Key</b> (<code>lib.VoiceRecognition.fetchTranscriptDeepgram</code>)
    <ul><li>Obtain from <a href="https://console.deepgram.com/">Deepgram</a></li></ul>
  </li>
</ul>

<p>This is an example of how you get a generated response from the Google Gemini API; it only takes one function:</p>

```ts
import { GoogleGemini } from "@stawa/gtts";

const google = new GoogleGemini({
  apiKey: "XXXXX",
  logger: true,
});

async function app() {
  const res = await google.chat("When was Facebook launched?");
  console.log(res);
}

app();
```

<hr />

<h3 id="contributors">👥 Contributors</h3>
<a href="https://github.com/stawa/gtts/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=stawa/gtts" alt="Contributors">
</a>
