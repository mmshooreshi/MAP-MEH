<script setup>
import Supercluster from "supercluster";
const props = defineProps(["data", "index"]);
const selectedFeature = ref(null);
const data = ref([]);
const index = ref(0);

import {getRTLTextPluginStatus} from "mapbox-gl";
import {setRTLTextPlugin} from "mapbox-gl";
import mapboxgl from "mapbox-gl";

const pluginURL =
  "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js";

onMounted(() => {
  if (getRTLTextPluginStatus() === "unavailable") {
    setRTLTextPlugin(pluginURL, (error) => {
      if (error) {
        // Handle error
      } else {
        // Plugin successfully loaded
      }
    });
  }

  watch(props, (propsN) => {
    if (propsN && propsN.data[0] != undefined) {
      let features = propsN.data[0].features;
      // console.log("features: ", features);
      // this.setupMarkers(newFeatures);
      if (props.data[props.index]) {
        useMapbox("mainMap", (map) => {
          addMarkers(map);

          // features.forEach((feature) => {
          //   const marker = new mapboxgl.Marker()
          //     .setLngLat(feature.geometry.coordinates)
          //     .addTo(map);

          //   marker.getElement().addEventListener("click", () => {
          //     openModal(feature);
          //   });
          // });

          // Do whatever with map here
          // console.log(map);
        });
      }
    }
  });

  useMapbox("mainMap", (map) => {
    // console.log(map);
    addMarkers(map);
    // map.on("load", (map) => {

    // map.addSource("t1", {
    //   type: "geojson",
    //   data: props.data[props.index],
    //   cluster: true,
    //   clusterMaxZoom: 14, // Max zoom to cluster points on
    //   clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
    // });

    // const clustersNew = indexNew.getClusters([-180, -85, 180, 85], 2);
  });
  // });
});

function openModal(feature) {
  selectedFeature.value = feature;
}
function closeModal() {
  selectedFeature.value = null;
}

const locations = ref([]);
const clusters = ref([]);
const markers = ref([]);
const clustersGeojson = ref({});
const clusterIndex = ref(null);

function addMarkers(map) {
  clusterIndex.value = new Supercluster({
    radius: 90,
    maxZoom: 10,
    map: (props2) => ({sum_accum: props2.site_accum}),
    reduce: (accumulated, props2) => {
      accumulated.sum_accum += props2.sum_accum;
    },
  });

  // console.log(clusterIndex.value);

  // clusterIndex.value.load(locations.value.features);

  clusterIndex.value.load(props.data[props.index].features);

  // console.log(clusterIndex.value);

  map.on("moveend", () => {
    moveEnd(map);
  });
  updateClusters(map);
}

function updateClusters(map) {
  var bounds = map.getBounds(),
    zoom = map.getZoom();

  clustersGeojson.value = clusterIndex.value.getClusters(
    [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
    Math.floor(zoom)
  );

  // console.log(clustersGeojson.value);

  if (Object.keys(clusters.value).length) {
    clusters.value.forEach(function (cluster) {
      cluster.remove();
    });
  }

  displayFeatures(clustersGeojson.value, map);
}
function moveEnd(map) {
  updateClusters(map);
}
function displayFeatures(features, map) {
  if (markers.value.length) {
    markers.value.forEach(function (marker) {
      marker.remove();
    });
  }

  features.forEach((feature) => {
    var isCluster = !!feature.properties.cluster ? true : false,
      $feature;

    if (isCluster) {
      var leaf = clusterIndex.value.getLeaves(feature.properties.cluster_id)[0];
      $feature = document.createElement("div");

      if (feature.properties.sum_accum > 1000) {
        $feature.className = `transition-border  font-peyda flex text-2xl items-center justify-center w-56 h-56 rounded-full text-center text-yellow font-bold shadow bg-cover cursor-pointer bg-center   hover:border-1 border-teal/50`;
      } else if (feature.properties.sum_accum > 500) {
        $feature.className = `transition-border  font-peyda flex text-2xl items-center justify-center w-48 h-48 rounded-full text-center text-lime font-bold shadow bg-cover cursor-pointer bg-center  hover:border-1 border-teal/50`;
      } else if (feature.properties.sum_accum > 250) {
        $feature.className = `transition-border   font-peyda flex text-2xl items-center justify-center w-36 h-36 rounded-full text-center text-lime-500  font-bold shadow bg-cover cursor-pointer bg-center  hover:border-1 border-teal/50`;
      } else if (feature.properties.sum_accum > 100) {
        $feature.className = `transition-border  font-peyda flex text-xl items-center justify-center w-28 h-28 rounded-full text-center text-lime-400 font-bold shadow bg-cover cursor-pointer bg-center  hover:border-1 border-teal/50`;
      } else if (feature.properties.sum_accum > 50) {
        $feature.className = `transition-border  font-peyda flex text-lg items-center justify-center w-24 h-24 rounded-full text-center text-lime-400 font-bold shadow bg-cover cursor-pointer bg-center  hover:border-1 border-teal/50`;
      } else if (feature.properties.sum_accum > 20) {
        $feature.className = `transition-border  font-peyda flex text-base items-center justify-center w-16 h-16 rounded-full text-center text-lime-400 font-bold shadow bg-cover cursor-pointer bg-center  hover:border-1 border-teal/50`;
      } else {
        $feature.className = `transition-border font-peyda flex text-sm items-center justify-center w-12 h-12 rounded-full text-center text-lime-300 font-bold shadow bg-cover cursor-pointer bg-center  hover:border-1 border-teal/50`;
      }
      // $feature.style.backgroundImage = `url(${leaf.properties.image})`;

      var $inner = document.createElement("div");
      $inner.innerHTML = feature.properties.sum_accum;

      $feature.appendChild($inner);
      bindClusterClickEvent($feature, feature, map);

      clusters.value[feature.properties.cluster_id] = new mapboxgl.Marker(
        $feature
      )
        .setLngLat(feature.geometry.coordinates)
        .addTo(map);
    } else {
      $feature = document.createElement("div");
      $feature.className =
        "font-peyda  text-lg flex items-center justify-center w-12 h-6 pt-2  rounded-full text-center text-teal font-bold shadow bg-cover cursor-pointer bg-center border-teal-400 border-1 bg-teal-600/50 hover:bg-teal-800";
      // $feature.style.backgroundImage = `url(${feature.properties.image})`;
      var $inner = document.createElement("div");
      $inner.innerHTML = feature.properties.site_accum;

      $feature.appendChild($inner);

      markers.value.push(
        new mapboxgl.Marker($feature)
          .setLngLat(feature.geometry.coordinates)
          .addTo(map)
      );
    }
  });
}
function bindClusterClickEvent(el, feature, map) {
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    var bounds = new mapboxgl.LngLatBounds();

    var features = clusterIndex.value.getLeaves(
      feature.properties.cluster_id,
      100
    );

    features.forEach(function (feature) {
      bounds.extend(feature.geometry.coordinates);
    });

    map.fitBounds(bounds, {padding: 100});
  });
}
</script>

<template>
  <div>
    <MapboxMap
      map-id="mainMap"
      style="width: 100vw; height: 84vh; z-index: 1; display: block"
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

      <MapboxSource
        v-if="props.data[0] != undefined"
        source-id="t1"
        :source="{
          type: 'geojson',
          data: props.data[props.index],
        }"
      />

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
              'rgba(0, 255, 255, 0.05)', // Cool color 1
              0.05,
              'rgba(0, 128, 128,0.5)', // Cool color 2
              1,
              'rgba(150, 60, 105,0.6)',
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
          source: 't12',
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
          <h1 class="text-lg font-peyda text-gray-200">ناحیه‌ی مرزی مهران</h1>
        </MapboxDefaultPopup>
      </MapboxDefaultMarker>

      <MapboxGeolocateControl position="top-left" />
    </MapboxMap>

    <div v-if="selectedFeature" class="absolute w-56 h-56 bg-black/25">
      {{ selectedFeature.properties.site_id }}

      <button @click="closeModal">Close</button>
    </div>
  </div>
</template>

<style lang="scss">
* {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}
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

.parent .child {
  pointer-events: auto;
}
.parent {
  pointer-events: none;
}
</style>
