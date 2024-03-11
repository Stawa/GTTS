<h2 align="center" style="display: flex; align-items: center; justify-content: center;">
    <img src="https://raw.githubusercontent.com/Stawa/Gemini-Text-To-Speech/86c0daa9de8303ef31b791eb172ce70c651de23c/repo/google_gemini.svg" alt="Icon" width="24" height="24" style="margin-right: 4px;"> <span style="margin-right: 2px; margin-left: 2px;"> Gemini Text-To-Speech </span> 
    <img src="https://raw.githubusercontent.com/Stawa/Gemini-Text-To-Speech/86c0daa9de8303ef31b791eb172ce70c651de23c/repo/google_gemini.svg" alt="Icon" width="24" height="24" style="margin-left: 4px;"> 
</h2>

<p align="center">
    This project converts written material into speech by using Google AI (Gemini) for text creation or internet searches.
</p>

<p align="center">
    <a href="https://gemini.google.com/"><img src=https://img.shields.io/badge/Google%20Gemini-black?style=flat&logo=Google&logoColor=blue>
    </a>
    <a href="https://www.typescriptlang.org/"><img src=https://img.shields.io/badge/Made%20with%20TypeScript-black?style=flat&logo=TypeScript&logoColor=blue>
    </a>
    <a href="https://bun.sh/"><img src=https://img.shields.io/badge/Powered%20by%20Bun-black?style=flat&logo=bun&logoColor=white>
    </a>
    <a href="https://stawa.github.io/Gemini-Text-To-Speech/"><img alt="Documentation" src="https://img.shields.io/website?url=https://stawa.github.io/Gemini-Text-To-Speech&up_message=Available&up_color=1F51FF&down_color=critical&&down_message=Unavailable&style=flat&logo=github&label=Documentation&labelColor=black">
    <a href="https://sonarcloud.io/project/overview?id=Stawa_Gemini-Text-To-Speech"><img src="https://sonarcloud.io/api/project_badges/measure?project=Stawa_Gemini-Text-To-Speech&metric=reliability_rating" alt="SonarCloud" /></a>
    </a>
</p>

<h3> <span class="emoji">📌</span> Note </h3>

This project is being tested on Linux using the Ubuntu 23.10 x86_64 distribution. I'm not sure whether this will work on Windows or MacOS.

| Task                               | Priority | Complete | Status      |
| ---------------------------------- | :------: | :------: | ----------- |
| Implement Gemini Chat              |   High   | &check;  | Completed   |
| Develop Voice Recognition          |   High   | &cross;  | In Progress |
| Implement Audio Language Detection |   High   | &cross;  | In Progress |
| Implement Text Language Detection  |  Medium  | &check;  | Completed   |
| Implement an Audio Player          |   Low    | &check;  | Completed   |
| Define Enums                       |   Low    | &check;  | Completed   |
| Integrate Debugging                |   Low    | &check;  | Completed   |

<h3> <span class="emoji">📜</span> Table of Contents </h3>

1. <a href="#--project-installlation-"> <b>Project Installlation</b> </a>
2. <a href="#--project-examples-"> <b>Project Examples</b> </a>
3. <a href="#--author--"> <b>Project Author</b> </a>

<h3> <span class="emoji">📦</span> Project Installlation </h4>

<p> Before you use this repository, verify that you have the following libraries installed on Linux: </p>

1. SoX
   - `sudo apt-get install sox`
2. libsox-fmt-all
   - `sudo apt-get install libsox-fmt-all`

<p> After installing the necessary libraries, proceed to install the repository by using the following commands: </p>

```bash
# NPM
$ npm install git+https://github.com/Stawa/Gemini-Text-To-Speech.git
# Bun
$ bun install git+https://github.com/Stawa/Gemini-Text-To-Speech.git
```

<h3> <span class="emoji">📄</span> Project Examples </h4>

<p> A few requirements must be completed in order for each class to execute successfully. These needs include the following: </p>

1. Google Gemini API Key (`lib.GoogleGemini`)
   - This key can be obtained from [Google Cloud](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com).
2. TikTok SessionID (`lib.TextToSpeech`)
   - This SessionID can be obtained from [TikTok](https://www.tiktok.com/) cookies.
3. Speech API Key (`lib.VoiceRecognition`)
   - This key can be obtained from [Chromium API Key](https://www.chromium.org/developers/how-tos/api-keys/).

<p> If you are using <code>.env</code>, you can use these following example of our <code>.env</code> file: </p>

```
GEMINI_API_KEY=XXXXXXXXXXXXXXXXXXXXXXX
TIKTOK_SESSION_ID=XXXXXXXXXXXXXXXXXXXX
GOOGLE_SPEECH_API_KEY=XXXXXXXXXXXXXXXX
```

```ts
console.log("Soon!");
```

<h3> <span class="emoji">🛠</span> Project Author </h3>

| Developer Avatar                                                                                 | GitHub                                          |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| <img src="https://avatars.githubusercontent.com/u/69102292" alt="Developer Avatar" width="50"/>  | [Stawa](https://github.com/Stawa)               |
| <img src="https://avatars.githubusercontent.com/u/121237326" alt="Developer Avatar" width="50"/> | [TeenYsMASTER](https://github.com/TeenYsMASTER) |
