import { ForgeHookFn, ForgeMultiHookMap } from "@electron-forge/shared-types";
import PluginBase from "@electron-forge/plugin-base";
import path from "path";
import glob from "glob";
import os from "os";
import fs from "fs";

interface FFmpegStaticOptions {
  platform?: string;
  remove: boolean;
  arch?: string;
  path: string;
}

class FFmpegStatic extends PluginBase<FFmpegStaticOptions> {
  name = "ffmpeg-static-electron-forge";

  getHooks(): ForgeMultiHookMap {
    return {
      resolveForgeConfig: this.resolveForgeConfig,
      prePackage: this.prePackage,
    };
  }

  resolveForgeConfig: ForgeHookFn<"resolveForgeConfig"> = async (
    forgeConfig
  ) => {
    if (!forgeConfig.packagerConfig) {
      forgeConfig.packagerConfig = {};
    }
    if (!forgeConfig.packagerConfig.asar) {
      throw new Error(
        "The ffmpeg-static-electron-forge plugin requires asar to be truthy or an object"
      );
    }

    if (forgeConfig.packagerConfig.asar === true) {
      forgeConfig.packagerConfig.asar = {};
    }

    const existingUnpack = forgeConfig.packagerConfig.asar.unpack;
    const newUnpack = "ffmpeg,ffmpeg.exe,ffprobe,ffprobe.exe";

    if (existingUnpack) {
      forgeConfig.packagerConfig.asar.unpack = `{${existingUnpack},${newUnpack}}`;
    } else {
      forgeConfig.packagerConfig.asar.unpack = newUnpack;
    }
    return forgeConfig;
  };

  prePackage: ForgeHookFn<"prePackage"> = async (forgeConfig) => {
    const platform = this.config.platform || os.platform();
    const arch = this.config.arch || os.arch();

    const binaries = {
      darwin: ["x64", "arm64"],
      linux: ["x64", "ia32"],
      win32: ["x64", "ia32"],
    };

    // @ts-ignore
    if (platform in binaries && binaries[platform].includes(arch)) {
      const ffmpegName = platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
      const ffprobeName = platform === "win32" ? "ffprobe.exe" : "ffprobe";

      const ffmpegPath = path.join(
        __dirname,
        "bin",
        platform,
        arch,
        ffmpegName
      );
      const ffprobePath = path.join(
        __dirname,
        "bin",
        platform,
        arch,
        ffprobeName
      );

      if (this.config.remove) this.removeFFmpegName();

      fs.copyFileSync(ffmpegPath, path.join(this.config.path, ffmpegName));
      fs.copyFileSync(ffprobePath, path.join(this.config.path, ffprobeName));
    }
  };

  private removeFFmpegName() {
    glob(
      `${this.config.path}/**/{ffmpeg,ffmpeg.exe,ffprobe,ffprobe.exe}`,
      (err, files) => {
        if (err) {
          console.error(err);
          return;
        }

        files.forEach((file) => {
          fs.unlink(file, (err) => {
            if (err) {
              console.error(err);
              return;
            }
          });
        });
      }
    );
  }
}

export default FFmpegStatic;
