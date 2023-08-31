<script setup>
// import {useFiltersStore} from "~/store/filters";
// import {storeToRefs} from "pinia";
// const filtersStore = useFiltersStore();
// const {addValueToFilterList} = filtersStore;
// const {filtersList} = storeToRefs(filtersStore);

import {useFiltersStore} from "~/store/filters";
import {storeToRefs} from "pinia";

import moment from "moment";
import jMoment from "moment-jalaali";

// Given arrays

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

const minHour = ref(10000);
const nref = ref(24);
const key_arr = ref([]);
const key_arr_shamsi = ref([]);
const sp = ref([]);
const geojson_arr = ref([]);
const total_arr = ref([]);
const index = ref(0);
const showD = ref(false);
const chartIndex = ref(0);
const key_arr_day = ref([]);
const total_arr_day_shamsi = ref([]);
const total_arr_day = ref([]);

const indexStart = ref(0);
const indexEnd = ref(0);

const filtersStore = useFiltersStore();
const {distanceKm} = storeToRefs(filtersStore);

async function getData() {
  // console.log("distanceKm is", distanceKm.value);
  var {result} = await $fetch("/api/read-geojsons", {
    method: "POST",
    body: {
      inputData: distanceKm.value,
    },
  }).then((result) => {
    // console.log("result", result);
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
    return 1;
    // for (let i = 0; i < key_arr.value.length; i++) {
    //   const shamsiDate = jMoment(key_arr.value[i], "YYYYMMDDHHmmssSSS").format(
    //     "jYYYYjMMjDDHH"
    //   );
    //   // console.log(key_arr.value[i], shamsiDate);
    //   key_arr_shamsi.value[i] = shamsiDate;
    //   const day = key_arr_shamsi.value[i].slice(0, 8);

    //   const existingIndex = key_arr_day.value.indexOf(day);

    //   if (existingIndex === -1) {
    //     key_arr_day.value.push(day);
    //     total_arr_day.value.push(total_arr.value[i]);
    //   } else {
    //     total_arr_day.value[existingIndex] += total_arr.value[i];
    //   }
    // }
  });
}

function splitFunction(n) {
  let days = {};

  for (let [index, filename] of key_arr.value.entries()) {
    let day = filename.slice(0, 8); // Extract the day part of the filename
    let hour = parseInt(filename.slice(8, 10)); // Extract the hour part of the

    days[day] = days[day] || []; // Initialize the day array if it doesn't exist
    days[day][hour] = [filename, total_arr.value[index]]; // Assign the filename to the specific hour of t
  }

  for (let day in days) {
    for (let hour = 0; hour <= 24 - n; hour++) {
      if (!days[day][hour]) {
        days[day][hour] = ["-" + hour.toString().padStart(2, "0"), 0];
      }
    }
  }

  let array_new = {};
  let chartArrX = [];
  let chartArrY = [];

  let rawchartArrX = [];
  let rawchartArrY = [];
  for (let day in days) {
    for (let hour = 0; hour <= 24 - n; hour += n) {
      let hourData = days[day].slice(hour, hour + n); // Get the data for the next 2 hours
      array_new[day] = array_new[day] || {};
      array_new[day][hour] = [
        hourData.map((value) => value),
        hourData.reduce((sum, value) => sum + value[1], 0), // Calculate the sum
        hourData.reduce((sum, value) => {
          let hourN = value[0];
          if (parseInt(hourN) >= 0) {
            hourN = value[0].slice(8, 10);
          }
          if (hourData.indexOf(value) !== hourData.length - 1) {
            return sum + hourN + ":";
          } else {
            return sum + hourN;
          }
        }, ""),
      ];
      jMoment.locale("fa");

      if (
        array_new[day][hour][1] >=
        (minHour.value / (100 / distanceKm.value)) * n
      ) {
        if (chartArrY.length >= 1) {
          let mult = array_new[day][hour][1] / chartArrY[chartArrY.length - 1];
          if (mult < 8.5 && mult > 0.15) {
            chartArrX.push(
              jMoment(day, "YYYYMMDD").format("jMM/jDD") +
                "\n" +
                hour +
                ":00" +
                "->" +
                (parseInt(hour) + n).toString() +
                ":00"
            );
            chartArrY.push(array_new[day][hour][1]);
          }
        } else {
          chartArrX.push(
            jMoment(day, "YYYYMMDD").format("jMM/jDD") +
              "\n" +
              hour +
              "->" +
              (parseInt(hour) + n).toString() +
              ":00"
          );
          chartArrY.push(array_new[day][hour][1]);
        }
      }
      rawchartArrX.push(
        day +
          "  " +
          hour +
          ":00" +
          " => " +
          (parseInt(hour) + n).toString() +
          ":00"
      );
      rawchartArrY.push(array_new[day][hour][1]);
    }
  }
  return {array_new, chartArrX, chartArrY, rawchartArrX, rawchartArrY};
}

watch(distanceKm, async (distN) => {
  showD.value = false;
  // console.log(key_arr.value);
  // console.log(geojson_arr.value);
  // console.log(total_arr.value);
  // console.log(key_arr_day.value);
  // console.log(total_arr_day.value);

  await getData();

  sp.value = [];
  for (let span = 1; span <= 24; span += 24 / nref.value) {
    sp.value.push(splitFunction(span));
    // console.log("running: ", span, sp.value);
  }
  // console.log(distanceKm.value);
  // setTimeout(() => (showD.value = true), 500);

  // setTimeout(() => (showD.value = false), 1000);

  // console.log(ChartJS.instances[0].$context.chart);
  // ChartJS.instances[0].$context.chart.update();

  // showD.value = true;
});

onMounted(async () => {
  // sp.value = [];
  // console.log("started (mounted) ", sp.value);
  await getData();
  // console.log("get data finished (mounted) ", key_arr.value, total_arr.value);
  // console.log("started sp");
  sp.value = [];

  for (let span = 1; span <= 24; span += 24 / nref.value) {
    sp.value.push(splitFunction(span));
    // console.log("running: ", span, sp.value);
  }
  // console.log("end of sp", sp.value);
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
  <div class="">
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
        @click="showD = false"
        class="group hover:bg-red hover:scale-125 transition-colors duration-100 transition-transform text-black p-0 w-2 h-2 px-1 text-center pt-0 scale-100 bg-red-400/10 border-1 border-red rounded-lg w-min h-min absolute right-0 top-0 m-4"
      >
        <div
          class="scale-100 relative -mt-1 group-hover:scale-150 text-red group-hover:text-black transition-transform transition-colors duration-100"
        >
          ×
        </div>
      </div>
      <!-- <Chart×✖x
        class="chart font-peyda"
        title="انباشت ساعتی"
        label="جمعیت"
        :labels="key_arr"
        :data="total_arr"
      /> -->

      <div v-for="(item, index) in sp" :key="index">
        <!-- <div class="w-full h-16 overflow-auto">{{ index }} , {{ item }}</div> -->
        <Chart
          v-if="chartIndex == index"
          class="chart font-peyda"
          title="انباشت ساعتی"
          label="جمعیت"
          :labels="item.chartArrX"
          :data="item.chartArrY"
        />

        <!-- <Chart
          v-if="chartIndex == index"
          class="chart font-peyda"
          title="انباشت ساعتی"
          label="جمعیت"
          :labels="item.rawchartArrX"
          :data="item.rawchartArrY"
        /> -->
      </div>

      <div class="w-1/2 mx-auto">
        <input
          type="range"
          v-model="chartIndex"
          min="0"
          :max="nref - 1"
          class="range range-error w-full mx-auto"
          className="range child"
          :step="1"
        />

        <div
          class="w-full flex justify-between text-center mb-8 mb-2 px-2 -translate-x-2"
        >
          <span
            v-for="span in nref"
            :key="span"
            :class="{
              'text-teal-600': span % 2 == 0 && span % 6 != 0,
              'text-red-400': span % 6 == 0,
            }"
            ><div
              class="w-4 h-4 transition-all duration-100 absolute dot"
              :class="{
                'scale-100': span - 1 == chartIndex,
                'scale-0': span - 1 != chartIndex,
              }"
            >
              ⊙
            </div>
            <div
              class="w-4 h-2 translate-y-[2px] transition-all duration-100 absolute dot"
              :class="{
                'scale-0 mt-1': span - 1 == chartIndex,
                'scale-100': span - 1 != chartIndex,
              }"
            >
              •
            </div>
          </span>
        </div>
      </div>
      <!-- 
      <Chart
        class="chart font-peyda"
        title="انباشت ساعتی"
        label="جمعیت"
        :labels="key_arr_day"
        :data="total_arr_day"
      /> -->
    </div>
    <MapContainer :index="index" :data="geojson_arr"></MapContainer>
  </div>
</template>

<style lang="scss" scoped>
.dot {
  transform-origin: center;
  transition: transform;
}

.dot.scale-0 {
  transform: scale(0);
  transition: transform;
}

.dot.scale-100 {
  // animation: moveit 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) both;
  animation: moveit 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transition: transform;

  // will-change: transform;
}

@keyframes moveit {
  0% {
    transform: scale3d(0.92, 0.92, 1);
  }
  20% {
    transform: scale3d(1.4, 1.4, 1);
  }
  40% {
    transform: scale3d(0.94, 0.94, 1);
  }
  60% {
    transform: scale3d(1.1, 1.1, 1);
  }
  80% {
    transform: scale3d(0.99, 0.99, 1);
  }
  100% {
    transform: scale3d(1, 1, 1);
  }
}

// @keyframes moveitback {
//   0% {
//     transform: translateY(60px);
//   }
//   100% {
//     transform: translateY(0) scale3d(0.96, 0.96, 1);
//   }
// }
</style>
