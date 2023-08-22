<template>
<div     class="font-peyda bg-gradient-to-tr from-dark-300 to-indigo-700 p-8 absolute w-full h-full">
  <div
      class="group hover:bg-opacity-25 p-4 transition-all cursor-pointer bg-opacity-0 bg-green-500 w-full h-full rounded-6xl bg-blend-saturation"
    >
      <div class="bg-gradient-52 p-2 w-full h-full rounded-3xl overflow-hidden">
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

          <MapboxSource
  source-id="t1"
  :source="{
    type: 'geojson',
    data: '/data/mehran-towers-t1.geojson',
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
        0,
        '#ffffb205',
        250,
        '#ffffb235',
        376,
        '#feb24c45',
        400,
        '#fd8d3c55',
        800,
        '#fc4e2665',
        1000,
        '#e31a1c85',
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

</div>

</template>

<script setup>
// import Slider from '@vueform/slider'
import {getRTLTextPluginStatus} from "mapbox-gl";
import {setRTLTextPlugin} from "mapbox-gl";

const value = ref(null);

onMounted(() => {
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

function toFarsiNumber(n) {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  return n.toString().replace(/\d/g, (x) => farsiDigits[x]);
}
</script>

<style>
.mapboxgl-popup-content {
  background: #1931bd;
  border-radius: 15px;
  box-shadow: 0 10px 2px rgba(14, 130, 85, 0.1);
  padding: 10px;
  pointer-events: auto;
  position: relative;
}

.mapboxgl-popup:hover .mapboxgl-popup-content {
  background: #0b196a;
  color: black !important;
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
  border: 10px solid transparent;
  height: 0;
  width: 0;
  z-index: 1;
}

.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
  align-self: center;
  border-bottom: none;
  border-top-color: #1931bd;
}

.mapboxgl-popup:hover .mapboxgl-popup-tip {
  border-top-color: #101e6f !important;
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
