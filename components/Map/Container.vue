<script setup>
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
    if (propsN && 0) {
      let features = propsN.data[0].features;
      // this.setupMarkers(newFeatures);

      useMapbox("mainMap", (map) => {
        features.forEach((feature) => {
          const marker = new mapboxgl.Marker()
            .setLngLat(feature.geometry.coordinates)
            .addTo(map);

          marker.getElement().addEventListener("click", () => {
            openModal(feature);
          });
        });

        // Do whatever with map here
        console.log(map);
      });
    }
  });
});

function openModal(feature) {
  selectedFeature.value = feature;
}
function closeModal() {
  selectedFeature.value = null;
}
</script>

<template>
  <div>
    <MapboxMap
      map-id="mainMap"
      style="
        width: 100vw;
        height: 83vh;
        z-index: -1;
        display: block;
        margin-top: 12vh;
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

      <div v-if="props.data[index] != undefined">
        <MapboxSource
          source-id="t1"
          :source="{
            type: 'geojson',
            data: props.data[props.index],
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
