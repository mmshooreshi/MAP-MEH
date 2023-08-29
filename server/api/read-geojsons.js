import path from "path";
import fs from "node:fs";
import haversine from "haversine-distance";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // console.log(body.inputData);
  //// const filePath = path.join(process.cwd(), 'public', 'data', 'accum_runs');
  // const accumfolder = path.join(process.cwd(), "/public/data/accum_runs");

  const accumfolder = "/var/www/dockerize-nuxt/data";

  //  console.log(accumfolder);
  try {
    const filePaths = await readdirRecursive(accumfolder);
    // return filePaths;
    return readGeoJSONFilesAndStoreInLocalStorage(filePaths, body.inputData);
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

async function readGeoJSONFilesAndStoreInLocalStorage(filePaths, dist) {
  let minTimestamp = Infinity;
  let maxTimestamp = -Infinity;

  var flag = 0;
  try {
    const geojsonData = await Promise.all(
      filePaths.map(async (filePath) => {
        try {
          const stats = await fs.promises.stat(filePath);
          const fileSizeInBytes = stats.size;
          const fileName = path.basename(filePath);

          if (fileSizeInBytes < 5240) {
            // console.log("File size is less than 10 KB. Ignoring file.");
          } else {
            // Read the file content
            let fileContent = await fs.promises.readFile(filePath, "utf-8");
            fileContent = geojsonReduce(fileContent, dist);
            // console.log(fileContent.total);

            const key = convertFileNameToDateTime2(fileName);
            minTimestamp = Math.min(minTimestamp, key).toString();
            maxTimestamp = Math.max(maxTimestamp, key).toString();

            return {
              key: key,
              fileContent: fileContent.newGeojson,
              total: fileContent.total,
            };
          }
        } catch (error) {
          // console.error("Error reading file:", error);
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
  dateObj.setUTCHours(parseInt(hour));
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
const allowedSiteIds = ["26728", "19714", "18015", "20822"];
// const pointC = [46.05269519417466, 33.123403650750646];

const point1 = {lat: 46.05269, lng: 33.1234};

function geojsonReduce(geojson, distanceKm) {
  let total = 0;
  let jso = JSON.parse(geojson).features;

  let newGeojson = {
    type: "FeatureCollection",
    features: jso
      .map((feature) => {
        var point2 = {
          lat: feature.geometry.coordinates[0],
          lng: feature.geometry.coordinates[1],
        };
        var dist = haversine(point1, point2);

        if (dist < distanceKm * 1000) {
          // if (allowedSiteIds.includes(feature.properties.site_id)) {

          total += parseInt(feature.properties.site_accum);
          return {
            type: "Feature",
            geometry: feature.geometry,
            properties: {
              site_id: feature.properties.site_id,
              site_accum: feature.properties.site_accum,
              // dist: dist,
            },
          };
        } else {
          return null;
        }
      })
      .filter((feature) => feature !== null),
  };

  return {newGeojson, total};
}
