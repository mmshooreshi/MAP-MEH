<script setup>
// import {useFiltersStore} from "~/store/filters";
// import {storeToRefs} from "pinia";
// const filtersStore = useFiltersStore();
// const {addValueToFilterList} = filtersStore;
// const {filtersList} = storeToRefs(filtersStore);

import {useFiltersStore} from "~/store/filters";
import {storeToRefs} from "pinia";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const key_arr = ref([]);
const geojson_arr = ref([]);
const total_arr = ref([]);
const index = ref(0);
const showD = ref(false);

const indexStart = ref(0);
const indexEnd = ref(0);

const filtersStore = useFiltersStore();
const {distanceKm} = storeToRefs(filtersStore);

function getData() {
  var {result} = $fetch("/api/read-geojsons", {
    method: "POST",
    body: {
      inputData: distanceKm.value,
    },
  }).then((result) => {
    var k = 0;
    var geojs = result.geojs_data.filter((elements) => {
      if (k == 0 && elements != null) {
        key_arr.value = [elements.key];
        geojson_arr.value = [elements.fileContent];
        total_arr.value = [elements.total];
        indexEnd.value = 1;
      } else if (elements != null) {
        key_arr.value.push(elements.key);
        geojson_arr.value.push(elements.fileContent);
        total_arr.value.push(elements.total);
        indexEnd.value += 1;
      }
      k += 1;
      return elements !== null;
    });
  });

  // console.log(key_arr.value);
  // console.log(geojson_arr.value);
  // console.log(total_arr.value);
}

watch(distanceKm, (distN) => {
  showD.value = false;
  getData();
  // console.log(distanceKm.value);
  setTimeout(() => (showD.value = true), 500);

  // setTimeout(() => (showD.value = false), 1000);

  // console.log(ChartJS.instances[0].$context.chart);
  // ChartJS.instances[0].$context.chart.update();

  // showD.value = true;
});

onMounted(() => {
  getData();
});

// The type of chart we want to create

function getDateFormat(uDate, option) {
  let date = new Intl.DateTimeFormat("fa-IR", option).format(uDate);
  return date;
}
function toFarsiNumber(n) {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  return n.toString().replace(/\d/g, (x) => farsiDigits[x]);
}

function toRegularNumber(str) {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  return str.replace(/[۰-۹]/g, (x) => farsiDigits.indexOf(x));
}
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

    // console.log(thatdayFa);

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
</script>

<template>
  <div class="font-peyda">
    <!-- <div class="flex flex-row m-2"> -->
    <div
      class="bg-black/50 font-peyda text-emerald-400 flex flex-row h-16 p-4 gap-2"
    >
      <div
        v-if="geojson_arr"
        class="text-emerald-400 w-full flex flex-row justify-stretch mt-1"
      >
        <div class="mt-1 mr-1 w-max whitespace-nowrap text-sm">
          {{ formatdate(key_arr[index], 1) }}
        </div>
        <!-- {{ indexStart }} : {{ indexEnd }} -->
        <input
          type="range"
          v-model="index"
          min="0"
          :max="key_arr.length - 1"
          class="range w-full"
          className="range child"
          :step="1"
        />
      </div>
      <button
        class="child w-[100px] max-w-[100px] h-min whitespace-nowrap text-emerald-400 hover:text-green-800 bg-emerald-400/25 border-3 rounded-xl hover:bg-emerald-400/75"
        :class="{
          'border-green-400 ': showD,
          'border-transparent ': !showD,
        }"
        @click="showD = !showD"
      >
        نمایش چارت
      </button>
    </div>
    <div
      v-if="geojson_arr.length > 0 && showD"
      class="absolute z-10 w-[98%] lg:w-[74%] 2xl:w-[50%] m-2 mt-10 p-2 cursor-pointer lg:mx-[13%] 2xl:mx-[25%] bg-[#1e503c50] border-1 border-emerald-400 rounded-xl overflow-hidden"
    >
      <div
        class="font-mono p-0 -m-2 ml-1 mt-0 absolute text-4xl hover:text-pink text-yellow"
        @click="showD = false"
      >
        ✖
      </div>
      <Chart
        class="chart font-peyda"
        title="انباشت ساعتی"
        label="جمعیت"
        :labels="key_arr"
        :data="total_arr"
      />
    </div>
    <MapContainer :index="index" :data="geojson_arr"></MapContainer>
  </div>
</template>

<style scoped></style>
