# ffmpeg-static-electron-forge

This package provides an easy and quick integration of FFmpeg with electron-forge and webpack. It's lightweight and does not affect production, and it's very easy to use. Thank you for using this package!

## Installation

To install the package, run the following command in your project:

```bash
  npm install ffmpeg-static-electron-forge
```

The library detects your operating system and downloads the binaries, but you can set env var ALL_BINS=true flag to download all of them for Windows, Linux, Mac, which is approximately 250MB. You can also use your own optimized or customized binaries by creating a bin folder in `node_modules/ffmpeg-static-electron-forge`, and make sure that the operating system directories match `os.platform()` and the architecture matches `os.arch()`.

Linux, Mac
```bash
  export ALL_BINS=true
  npm install ffmpeg-static-electron-forge
```

Windows
```powershell
  $env:ALL_BINS="true"
  npm install ffmpeg-static-electron-forge
```

## Usage

To use the package, simply add ffmpeg-static-electron-forge to your development dependencies. Once installed, you can access FFmpeg from your electron-forge configuration. It's important to set `asar: true` in `packagerConfig`.

```javascript
const path = require("path");
const FFmpegStatic = require("ffmpeg-static-electron-forge").default;

module.exports = {
  packagerConfig: {
    asar: true, // Important
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-webpack",
      config: {
        mainConfig: "./webpack.main.config.js",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./src/index.html",
              js: "./src/renderer.js",
              name: "main_window",
              preload: {
                js: "./src/preload.js",
              },
            },
          ],
        },
      },
    },
    new FFmpegStatic({
      remove: true, // Required
      path: path.join(__dirname, ".webpack", "main"), // Set path of main build
    }),
  ],
};
```

```typescript
import ffmpeg from "fluent-ffmpeg";
import { paths } from "ffmpeg-static-electron-forge";

const ffmpegPath = paths.ffmpegPath.replace("app.asar", "app.asar.unpacked");
const ffprobePath = paths.ffprobePath.replace("app.asar", "app.asar.unpacked");

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

export default ffmpeg;
```

## Contributions

If you find any issues or have any suggestions to improve this package, please create an issue on our GitHub repository. If you want to contribute with code, please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT license. You can read the full license in the LICENSE file.
