# ffmpeg-static-electron-forge
This library is a module designed for fast integration with Electron Forge and Webpack. With this library, you can use the ffmpeg video conversion tool statically in your Electron applications.

## Installation
To install this library, run the following command in your terminal:
Then you need to put the [binaries](https://www.dropbox.com/s/6vfi6zdgy5nit4k/bin.zip?dl=0) in the root of the node_modules/ffmpeg-static-electron-forge library folder or you can use your own binaries.
```
npm install --save-dev ffmpeg-static-electron-forge
```

## Usage
You can import and use the library as follows:
This is an example of a preproject configuration but it is not 100% necessary that you use it pay special attention to the plugin and the asar config. It is important that the last plugin in your list is this one or at least after WebpackPlugin.

```TypeScript
// in forge.config.ts
import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import FFmpegStatic from "ffmpeg-static-electron-forge";

import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";

import path from "path";
import os from "os";

const config: ForgeConfig = {
  packagerConfig: {
      asar: {
        unpack: "{*.exe,*.dll,*.node,ffmpeg,ffprobe}",
      },
      appVersion: "1.0.0",
      appCopyright: "Copyright (c) Cismu, inc. All rights reserved.",
      executableName: "Cismu",
      name: "Cismu",
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      devContentSecurityPolicy: "connect-src 'self' \* 'unsafe-eval'",
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: "./src/cismu/ui/index.html",
            js: "./src/renderer.ts",
            name: "main_window",
            preload: {
              js: "./src/preload.ts",
            },
          },
      ],
      },
    }),
    new FFmpegStatic({
      platform: os.platform(),
      arch: process.arch,
      path: "C:\\Users\\Undead34\\Documents\\Undead34\\Cismu-Desktop\\.webpack\\main",
    }),
  ],
  };

export default config;
```

License
This library is available under the MIT license. You can see the license terms in the LICENSE file of this repository.


// https://www.dropbox.com/s/6vfi6zdgy5nit4k/bin.zip?dl=0
