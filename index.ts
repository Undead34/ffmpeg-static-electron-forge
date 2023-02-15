import { ForgeHookFn, ForgeMultiHookMap } from "@electron-forge/shared-types";
import PluginBase from "@electron-forge/plugin-base";
import path from "path";
import glob from "glob";
import util from "util";
import os from "os";
import fs from "fs";

interface FFmpegStaticOptions {
  platform?: string;
  remove: boolean;
  arch?: string;
  path: string;
}

const ffmpegName = os.platform() === "win32" ? "ffmpeg.exe" : "ffmpeg";
const ffprobeName = os.platform() === "win32" ? "ffprobe.exe" : "ffprobe";

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
    if (this.config.remove) await this.removeFFmpegName();

    const platform = this.config.platform || os.platform();
    const arch = this.config.arch || os.arch();

    const binaries = {
      darwin: ["x64", "arm64"],
      linux: ["x64", "ia32"],
      win32: ["x64", "ia32"],
    };

    // @ts-ignore
    if (platform in binaries && binaries[platform].includes(arch)) {
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

      fs.copyFileSync(ffmpegPath, path.join(this.config.path, ffmpegName));
      fs.copyFileSync(ffprobePath, path.join(this.config.path, ffprobeName));
    }
  };

  private removeFFmpegName() {
    const deleteFiles = util.promisify(fs.unlink);

    const patron = path.join(
      this.config.path,
      "**",
      "@(ffmpeg|ffmpeg.exe|ffprobe|ffprobe.exe)"
    );
    glob(patron, {}, async (error, files) => {
      if (error) {
        console.error(`Error to find files: ${error}`);
        return;
      }

      try {
        for (const file of files) {
          await deleteFiles(file);
          console.log(`Deleted file: ${file}`);
        }
      } catch (error) {
        console.error(`Error to delete file: ${error}`);
      }
    });
  }
}

export default FFmpegStatic;
export const paths = {
  ffmpegPath: path.join(__dirname, ffmpegName),
  ffprobePath: path.join(__dirname, ffprobeName),
};
