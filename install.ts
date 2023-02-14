import { hideBin } from "yargs/helpers";
import yargs from "yargs";
import fs from "fs";
import os from "os";
import path from "path";
import AdmZip from "adm-zip";
import { pipeline } from "stream";

const downloadUrls = {
  darwin: {
    url: "https://dl.dropboxusercontent.com/sh/3scfjeuno6b03o5/AAAy1zZNHiC_tTPEtzzHg9xVa/darwin.zip?dl=0",
    name: "darwin.zip",
  },
  linux: {
    url: "https://dl.dropboxusercontent.com/sh/3scfjeuno6b03o5/AADZtD8GXegArBWFTgJBNSYLa/linux.zip?dl=0",
    name: "linux.zip",
  },
  win32: {
    url: "https://dl.dropboxusercontent.com/sh/3scfjeuno6b03o5/AABsiTT_AKQf8MoWH_klBfQ6a/win32.zip?dl=0",
    name: "win32.zip",
  },
};

const downloadPath = path.join(__dirname, "bin");

try {
  fs.mkdirSync(downloadPath);
} catch (error) {
  // ignore
}

const argv: any = yargs(hideBin(process.argv)).option("all-bins", {
  alias: "a",
  describe: "Descargar todos los binarios",
  type: "boolean",
}).argv;

if (argv["all-bins"]) {
  Object.values(downloadUrls).map((value) => {
    download(value);
  });
} else {
  if (os.platform() in downloadUrls) {
    // @ts-ignore
    download(downloadUrls[os.platform()]);
  }
}

function download(value: { url: string; name: string }) {
  fetch(value.url)
    .then((res) => {
      if (res.body) {
        const zipFile = path.join(downloadPath, value.name);
        const dest = fs.createWriteStream(zipFile);

        // @ts-ignore
        pipeline(res.body, dest, (err) => {
          if (err) {
            console.error("Error downloading binaries", err);
          } else {
            console.log("Binaries downloaded successfully.");
          }
        });

        dest.on("close", () => {
          const zip = new AdmZip(zipFile);
          zip.extractAllTo(downloadPath, true);
          fs.unlinkSync(zipFile);
        });
      }
    })
    .catch((reason) => {
      console.error("Error downloading binaries", reason);
    });
}
