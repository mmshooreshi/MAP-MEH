import path from "path";
import fs from "node:fs";

export default defineEventHandler(async (event) => {
  //// const filePath = path.join(process.cwd(), 'public', 'data', 'accum_runs');
  const accumfolder = path.join(process.cwd(), "/public/data/accum_runs");
  //  console.log(accumfolder);
  try {
    const filePaths = await readdirRecursive(accumfolder);

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
        const fileContent = await fs.promises.readFile(filePath, "utf-8");
        const fileName = path.basename(filePath);
        const key = convertFileNameToDateTime(fileName);

        minTimestamp = Math.min(minTimestamp, key).toString();
        maxTimestamp = Math.max(maxTimestamp, key).toString();

        return {key, fileContent};
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
  const day = dateTimePart.substring(6, 8);
  const hour = dateTimePart.substring(8, 10);
  const minute = "00";
  const second = "00";
  return `${year}${month}${day}${hour}${minute}${second}`;
}
