import path from "path";
import fs from "node:fs";

export default defineEventHandler(async (event) => {
  //// const filePath = path.join(process.cwd(), 'public', 'data', 'accum_runs');
  const accumfolder = path.join(process.cwd(), "/public/data/accum_runs");
  // const accumfolder = "/var/www/dockerize-nuxt/data";

  //  console.log(accumfolder);
  try {
    const filePaths = await readdirRecursive(accumfolder);
    // return filePaths;
    return readGeoJSONFilesAndStoreInLocalStorage(filePaths);
    //  const db =  Promise.all(
    //    filePaths.map(async (fpath) => {
    //      const file = await fs.promises.readFile(path.join(accumfolder, fpath));
    //      console.log(fpath, file);
    //      return file;
    //    })
    //  );
    //  console.log(db);
    //  return db;
  } catch (err) {
    console.error(err);
    return err;
  }
});

async function readdirRecursive(dir) {
  const dirents = await fs.promises.readdir(dir, {withFileTypes: true});

  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? readdirRecursive(res) : res;
    })
  );

  const flattenedFiles = Array.prototype.concat(...files);

  const geojsonFiles = flattenedFiles.filter(
    (file) => path.extname(file) === ".geojson"
  );

  return geojsonFiles;
}

async function readGeoJSONFilesAndStoreInLocalStorage(filePaths) {
  let minTimestamp = Infinity;
  let maxTimestamp = -Infinity;

  var flag = 0;
  try {
    const geojsonData = await Promise.all(
      filePaths.map(async (filePath) => {
        try {
          const stats = await fs.stat(filePath);
          const fileSizeInBytes = stats.size;

          if (fileSizeInBytes < 10240) {
            console.log("File size is less than 10 KB. Ignoring file.");
          } else {
            // Read the file content
            const fileContent = await fs.promises.readFile(filePath, "utf-8");

            console.log("File content:", fileContent);

            const key = convertFileNameToDateTime2(fileName);
            minTimestamp = Math.min(minTimestamp, key).toString();
            maxTimestamp = Math.max(maxTimestamp, key).toString();

            return {key, fileContent};
          }
        } catch (error) {
          console.error("Error reading file:", error);
        }
      })
    );

    return {geojs_data: geojsonData, minT: minTimestamp, maxT: maxTimestamp};
  } catch (err) {
    return err;
  }
}

function convertFileNameToDateTime(fileName) {
  const dateTimePart = fileName.match(/\d+/g).join("");
  const year = dateTimePart.substring(0, 4);
  const month = dateTimePart.substring(4, 6);
  let hour = (parseInt(dateTimePart.substring(8, 10)) + 4)
    .toString()
    .padStart(2, "0");
  let day = "";

  if (parseInt(hour) >= 24) {
    hour = "00";
    day = (parseInt(dateTimePart.substring(6, 8)) + 1)
      .toString()
      .padStart(2, "0");
  } else {
    day = dateTimePart.substring(6, 8);
  }

  const minute = "00";
  const second = "00";

  return `${year}${month}${day}${hour}${minute}${second}`;
}

function convertFileNameToDateTime2(fileName) {
  const dateTimePart = fileName.match(/\d+/g).join("");
  const year = dateTimePart.substring(0, 4);
  const month = dateTimePart.substring(4, 6);
  const day = dateTimePart.substring(6, 8);
  const hour = dateTimePart.substring(8, 10);
  const dateObj = new Date(Date.UTC(year, month - 1, day, hour, 0, 0));
  dateObj.setUTCHours(hour + 4);
  // const dateObj = new Date(year, month - 1, day, hour, 0, 0);
  // dateObj.setHours(dateObj.getHours() + 4);
  // return `${[dateTimePart, dateObj, year, month - 1, day, hour, 0, 0]}`;
  // dateObj.setHours(dateObj.getHours() - 4);
  // dateObj.setHours(dateObj.getMinutes() - 30);

  const formattedDate = dateObj
    .toISOString()
    .slice(0, 14)
    .replace(/[-:.TZ]/g, "");

  return `${dateObj.toISOString().replace(/[-:.TZ]/g, "")}`;
}
