<template>
  <div
    class="p-4 font-peyda absolute w-full h-full flex flex-col justify-center content-evenly"
  >
    <!-- {{ total }} -->

    <!-- {{ indexRef }} -->
    <div class="text-indigo-500 w-full text-center text-2xl font-peyda">
      نمایشگر انباشتِ ساعتی جمعیت در مرز مهران
    </div>
    <!-- {{ filescontents.length }}<br />
    {{ filestoload }}<br />
    {{ total.length }}<br /> -->

    <div v-if="filestoload" class="text-emerald-400 h-28 p-4 font-peyda">
      <input
        type="range"
        v-model="o0nfile"
        min="0"
        :max="filestoload.length - 1"
        class="range range-lg prange-info"
        className="range"
        :step="1"
      />
      <div
        class="w-full text-center flex flex-row content-between justify-center"
      >
        <div class="mx-1">{{ formatdate(filestoload[o0nfile], 1) }}</div>
        <div class="mx-1">نفر</div>

        <div class="mx-1">{{ total[o0nfile].toLocaleString() }}</div>
      </div>

      <div
        v-if="filescontents[o0nfile] != undefined && 0"
        class="overflow-scroll m-8 p-8 z-1000 border border-2 h-[50vw] absolute bg-black border-red-500"
      >
        {{ filescontents[o0nfile] }}
      </div>
    </div>

    <div
      v-if="filestoload.length == 0 && total[o0nfile] != 0"
      class="text-emerald-400 font-peyda text-center w-full"
    >
      در حال بارگیری
    </div>

    <div
      class="mt-8 mb-4 lg:p-1 transition-all cursor-pointer rounded-[2.5rem] h-inherit"
    >
      <div
        class="border-emerald-400 border-2 rounded-[2.2rem] overflow-hidden h-inherit"
      >
        <MapboxMap
          map-id="mainMap"
          style="
            width: 120%;
            height: 120%;
            margin: -10%;
            display: block;
            position: relative;
          "
          :options="{
            style: 'mapbox://styles/mapbox/navigation-night-v1',
            center: [46.05269519417466, 33.123403650750646],
            zoom: 10,
            maxZoom: 22,
          }"
        >
          <MapboxSource
            source-id="ID"
            :source="{
              type: 'geojson',
              data: '/data/iran.geojson',
            }"
          />
          <MapboxSource
            source-id="IDD"
            :source="{
              type: 'geojson',
              data: '/data/mehran-towers.geojson',
            }"
          />

          <div v-if="filescontents[o0nfile] != undefined">
            <MapboxSource
              source-id="t1"
              :source="{
                type: 'geojson',
                data: filescontents[o0nfile],
              }"
            />
          </div>

          <MapboxLayer
            :layer="{
              id: 'property-heat',
              type: 'heatmap',
              source: 't1',
              maxzoom: 18,
              paint: {
                'heatmap-weight': {
                  property: 'site_accum',
                  type: 'exponential',
                  stops: [
                    [0, 0],
                    [1000, 7],
                  ],
                },
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0,
                  'rgba(209, 229, 240, 0)',
                  0.05,
                  'rgba(209, 229, 240, 0.3)',
                  1,
                  'rgba(227, 16, 48, 0.5)',
                ],
                'heatmap-radius': {
                  stops: [
                    [5, 50],
                    [18, 100],
                  ],
                },
                'heatmap-opacity': {
                  default: 1,
                  stops: [
                    [14, 1],
                    [18, 0],
                  ],
                },
              },
            }"
          />

          <MapboxLayer
            :layer="{
              id: 'property-point',
              type: 'circle',
              source: 't1',
              minzoom: 8,
              paint: {
                'circle-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'site_accum'],
                  1,
                  'rgba(253, 141, 60, 0.333)',
                  250,
                  'rgba(255, 255, 178, 0.208)',
                  376,
                  'rgba(254, 178, 76, 0.271)',
                  400,
                  'rgba(253, 141, 60, 0.333)',
                  800,
                  'rgba(252, 78, 38, 0.396)',
                  1000,
                  'rgba(227, 26, 28, 0.522)',
                ],
                'circle-stroke-color': 'white',
                'circle-stroke-width': 0,
                'circle-radius': {
                  property: 'site_accum',
                  type: 'exponential',
                  stops: [
                    [{zoom: 8, value: 0}, 10],
                    [{zoom: 8, value: 7}, 20],
                    [{zoom: 22, value: 0}, 40],
                    [{zoom: 22, value: 7}, 100],
                  ],
                },
                'circle-opacity': {
                  stops: [
                    [14, 0],
                    [18, 1],
                  ],
                },
                'circle-translate': [0, -10],
                'circle-translate-anchor': 'map',
              },
            }"
          />

          <MapboxLayer
            :layer="{
              id: 'cluster-count',
              type: 'symbol',
              source: 't1',
              filter: ['has', 'site_accum'],
              layout: {
                'text-field': ['get', 'site_accum'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 18,
              },
            }"
          />

          <MapboxDefaultMarker
            marker-id="marker1"
            :options="{}"
            :lnglat="[46.05269519417466, 33.123403650750646]"
          >
            <MapboxDefaultPopup
              popup-id="popup1"
              :lnglat="[46.05269519417466, 33.123403650750646]"
              :options="{
                closeOnClick: true,
              }"
            >
              <h1 class="text-lg font-peyda text-gray-200">
                ناحیه‌ی مرزی مهران
              </h1>
            </MapboxDefaultPopup>
          </MapboxDefaultMarker>

          <MapboxGeolocateControl position="top-left" />
        </MapboxMap>
      </div>
    </div>

    <div>
      <date-picker
        class="mx-8"
        :from="minT"
        :to="maxT"
        :shortcut="true"
        :column="column"
        :styles="styles"
        :modal="true"
        :auto-submit="false"
        type="datetime"
      />
      //
    </div>
  </div>
</template>

<script setup>
import Slider from "@vueform/slider";
import {getRTLTextPluginStatus} from "mapbox-gl";
import {setRTLTextPlugin} from "mapbox-gl";
const show = ref(false);
const nuxtApp = useNuxtApp();

// console.log(nuxtApp)

const column = {
  576: 1,
  700: 2,
};

const styles = {
  "primary-color": "#00fa9a",
  "secondary-color": "#00dcff",
  "overlay-color": "#00f",
  "text-color": "white",
  "hover-color": "#00fa9a",
  "in-range-background": "#00fa9a30",
  background: "#000",
};
const minTf = ref("");
const maxTf = ref("");
const minT = ref("");
const maxT = ref("");
const filestoload = ref([]);
const filescontents = ref([]);
const zerosArray = new Array(1000).fill(0);
const total = ref(zerosArray);
const indexRef = ref(0);
// const zerosArray = Array.from({ length: 1000 }, () => 0);
function geojsonReduce(geojson) {
  let jso = JSON.parse(geojson).features;
  console.log(jso);
  let totaltmp = 0;
  let newGeojson = {
    type: "FeatureCollection",
    features: jso.map((feature) => {
      totaltmp += feature.properties.site_accum;
      return {
        type: "Feature",
        geometry: feature.geometry,
        properties: {
          site_id: feature.properties.site_id,
          site_accum: feature.properties.site_accum,
        },
      };
    }),
  };
  indexRef.value += 1;
  total.value[indexRef.value] = totaltmp;
  console.log(newGeojson);
  return newGeojson;
}

const o0nfile = ref("0");

onMounted(() => {
  const {data: geojs_raw} = $fetch("/api/read-geojsons").then((geojs_raw) => {
    let geojs = geojs_raw.geojs_data;

    minT.value = formatdate(geojs_raw.minT);
    maxT.value = formatdate(geojs_raw.maxT);
    minTf.value = geojs_raw.minT;
    maxTf.value = geojs_raw.maxT;

    filescontents.value = geojs_raw.geojs_data;
    filestoload.value = filescontents.value.map(({key}) => key);
    filescontents.value = filescontents.value.map(({fileContent}) => {
      // console.log();
      let filter = geojsonReduce(fileContent);
      if (filter.features.length >= 0) {
        return geojsonReduce(fileContent);
      }
    });
    console.log("*****");
    console.log(filescontents.value);
    console.log("*****");
    console.log("process.client ", process.client);
    if (process.client) {
      console.log();
      // window.localStorage.setData("salam", JSON.stringify(geojs));
    }
  });

  const pluginURL =
    "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js";

  if (getRTLTextPluginStatus() === "unavailable") {
    setRTLTextPlugin(pluginURL, (error) => {
      if (error) {
        // Handle error
      } else {
        // Plugin successfully loaded
      }
    });
  }
});

function formatdate(dateTimeString, type) {
  if (dateTimeString != undefined) {
    const year = dateTimeString.slice(0, 4);
    const month = dateTimeString.slice(4, 6) - 1; // Subtract 1 as months are zero-based in Date objects
    const day = dateTimeString.slice(6, 8);
    const hour = dateTimeString.slice(8, 10);
    const minute = dateTimeString.slice(10, 12);

    const dateObj = new Date(year, month, day, hour, minute);
    const timestamp = dateObj.getTime();

    const iranize = `${dateTimeString.slice(0, 4)}/${dateTimeString.slice(
      4,
      6
    )}/${dateTimeString.slice(6, 8)} ${dateTimeString.slice(
      8,
      10
    )}:${dateTimeString.slice(10, 12)}`;

    const thatdayFa = {
      day: getDateFormat(timestamp, {day: "2-digit"}),
      month: getDateFormat(timestamp, {month: "numeric"}),
      monthTitle: getDateFormat(timestamp, {month: "long"}),
      year: getDateFormat(timestamp, {year: "numeric"}),
      dayWeek: getDateFormat(timestamp, {weekday: "long"}),
    };

    console.log(thatdayFa);

    if (type == 1) {
      return (
        "    در تاریخِ   " +
        toRegularNumber(thatdayFa.year) +
        "/" +
        toRegularNumber(thatdayFa.month) +
        "/" +
        toRegularNumber(thatdayFa.day) +
        "   و در ساعتِ   " +
        toRegularNumber(hour) +
        ":" +
        toRegularNumber(minute)
      );
    } else {
      return (
        toRegularNumber(thatdayFa.year) +
        "/" +
        toRegularNumber(thatdayFa.month) +
        "/" +
        toRegularNumber(thatdayFa.day) +
        "   " +
        toRegularNumber(hour) +
        ":" +
        toRegularNumber(minute)
      );
    }
  }
}

function getDateFormat(uDate, option) {
  let date = new Intl.DateTimeFormat("fa-IR", option).format(uDate);
  return date;
}

// const date = nuxtApp.ssrContext.uselocaledate(new Date('2016-10-26'))
// const useX = () => useState('x')

function toFarsiNumber(n) {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  return n.toString().replace(/\d/g, (x) => farsiDigits[x]);
}

function toRegularNumber(str) {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  return str.replace(/[۰-۹]/g, (x) => farsiDigits.indexOf(x));
}
</script>

<style>
.pdp .pdp-picker .pdp-select-year li,
.pdp .pdp-picker .pdp-select-month li {
  max-width: 20%;
  height: 20%;
  margin: 0.5rem;
  cursor: pointer;
  /* margin: 0.1rem; */
  /* margin-right: 0.6rem; */
  /* margin-left: 0.4rem; */
  -webkit-font-smoothing: antialiased;
  display: inline-flex;
  font-size: x-large;
  /* font-weight: 100; */
  flex: 30% 0;
  justify-content: space-evenly;
  align-items: center;
}

.pdp .pdp-picker .pdp-header .bottom button svg {
  width: 20px;
  height: 20px;
}

.pdp .pdp-picker {
  padding-top: 0rem !important;
  padding-bottom: 0rem !important;
  font-family: Peyda;
  padding-left: 0rem !important;
  padding-right: 0rem !important;
  border-radius: 30px;

  background: rgba(85, 108, 103, 0.25);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  border: 2px solid #00fa9a;
  overflow: auto;
}

@media (max-width: 600px) {
  .pdp-shortcut {
    flex-direction: row !important;
    flex-wrap: unset !important;
    justify-content: space-between;
    overflow: auto;
    padding: 1px !important;
    max-width: 60vw;
  }
}

.pdp .pdp-picker .pdp-footer .pdp-today,
.pdp .pdp-picker .pdp-footer .pdp-submit {
  border-radius: 0.5rem;
  background: transparent !important;
  color: #00fa9a;
  cursor: pointer;
  border: 1px solid #00fa9a;
}

.pdp .pdp-picker .pdp-footer .pdp-today:hover,
.pdp .pdp-picker .pdp-footer .pdp-submit:hover {
  border-radius: 0.5rem;
  background: #00fa9a !important;
  color: #13211b;
  cursor: pointer;
}

.pdp-month {
  color: #cedbe0 !important;
}
.pdp-year {
  color: #cedbe0 !important;
  margin-right: 25px;
}
.pdp-year:hover,
.pdp-month:hover {
  color: #ffffff !important;
}
.pdp-arrow {
  fill: #00fa9a !important;
}
.pdp-weekday {
  color: #95cfb2 !important;
}
.pdp .pdp-picker .pdp-footer > div small {
  letter-spacing: 1px;
  margin-left: 5px;
}

.pdp .pdp-picker .pdp-shortcut li {
  margin: 0.4rem 0.2rem;
  padding: 0.2rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;

  text-align: center;
  cursor: pointer;
  border-radius: 0.6rem;
  border: 0.5px solid;
  letter-spacing: 0.5px;
  color: #a8efb9;
  white-space: nowrap;
  font-weight: 500;
}

::-webkit-scrollbar {
  height: 4px;
  width: 4px;
  background: gray;
  border: 0px solid gray;
}
::-webkit-scrollbar-thumb:horizontal {
  background: #00fa9a;
  border-radius: 10px;
}

.mapboxgl-popup-content {
  border-radius: 15px;

  padding: 10px;
  pointer-events: auto;
  position: relative;
  background: rgba(47, 134, 123, 0.35);
  -webkit-backdrop-filter: blur(23px);
  backdrop-filter: blur(23px);
  border: 2px solid rgba(47, 134, 123, 0);
  transition: all 0.3s;
}

.mapboxgl-popup:hover .mapboxgl-popup-content {
  padding-top: 20px;
  margin-top: -20px;
  padding-bottom: 20px;
  transform: translateY(-10%);
  animation-name: moveAnimation;
  animation-duration: 0.4s;
  animation-iteration-count: 1;
  animation-direction: alternate;
  transition: all 0.1s;

  color: black !important;
  border: 2px solid rgba(47, 134, 123, 1);
  box-shadow: 0px -1px 20px 2px rgba(130, 221, 162, 0.424);
}

@keyframes moveAnimation {
  0% {
    transform: translateY(0%);
  }
  20% {
    transform: translateY(20%);
  }
  100% {
    transform: translateY(-10%);
  }
}

.mapboxgl-popup-close-button {
  display: none;
  background-color: transparent;
  border: 0;
  border-radius: 2px;
  cursor: pointer;
  position: absolute;
  right: 2px;
  top: 2px;
}

.mapboxgl-popup-tip {
  border-top-color: rgb(130, 221, 162);
  border-radius: 20px 20px;
  height: 0;
  width: 0;
  z-index: 1;
}

.mapboxgl-popup-tip {
  transition: all 0.3s;
  transform: translateY(-200%);
  z-index: -1;
  border-top-color: rgb(130, 221, 162) !important;
}

.mapboxgl-popup:hover .mapboxgl-popup-tip {
  align-self: center;
  border-bottom: none;
  transform: translateY(10%);
}

.mapboxgl-popup {
  display: flex;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  will-change: transform;
}
</style>
