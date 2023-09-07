<script setup>
import {useFiltersStore} from "~/store/filters";
import {useChartsDataStore} from "~/store/chartsData";
import {storeToRefs} from "pinia";
import moment from "moment";
import jMoment from "moment-jalaali";
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
const chartsDataStore = useChartsDataStore();

const {distanceKm} = storeToRefs(filtersStore);
const {chartsData} = storeToRefs(chartsDataStore);
const loadingVar = ref(0);
async function getData() {
  loadingVar.value = 1;
  var {result} = await $fetch("/api/read-geojsons", {
    method: "POST",
    body: {
      inputData: distanceKm.value,
    },
  }).then((result) => {
    loadingVar.value = 0;
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
  });
}

function splitFunction(n) {
  let days = {};
  for (let [index, filename] of key_arr.value.entries()) {
    let day = filename.slice(0, 8);
    let hour = parseInt(filename.slice(8, 10));
    days[day] = days[day] || [];
    days[day][hour] = [filename, total_arr.value[index]];
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
      let hourData = days[day].slice(hour, hour + n);
      array_new[day] = array_new[day] || {};
      array_new[day][hour] = [
        hourData.map((value) => value),
        hourData.reduce((sum, value) => sum + value[1], 0),
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
          let mult = 0;
          try {
            if (hour == 0) {
              mult =
                array_new[day][hour][1] /
                array_new[day - 1][array_new[day - 1].length - 1][1];
            } else {
              mult = array_new[day][hour][1] / array_new[day][hour - n][1];
            }
          } catch (e) {}
          // console.log(mult);
          if (mult < 5 && mult >= 0.2) {
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
          } else {
            chartArrX.push(
              jMoment(day, "YYYYMMDD").format("jMM/jDD") +
                "\n" +
                hour +
                ":00" +
                "->" +
                (parseInt(hour) + n).toString() +
                ":00"
            );
            let t = 10000;
            chartArrY.push(array_new[day][hour][1] * -1);
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
  // console.log("before:");
  // showD.value = false;
  // console.log(chartsData);
  // console.log("--------");
  await getData();
  chartsDataStore.reInit();
  // console.log("after:");
  // console.log(chartsData);
  for (let span = 1; span <= 24; span += 24 / nref.value) {
    let tmpV = splitFunction(span);
    chartsDataStore.addValueToChartsData(tmpV);
    // console.log(span);
    // console.log(chartsData);
    // console.log(chartsDataStore);
  }
});
const router = useRouter();

onMounted(async () => {
  await getData();

  chartsDataStore.reInit();

  for (let span = 1; span <= 24; span += 24 / nref.value) {
    // console.log(nref.value);
    let tmpV = splitFunction(span);
    chartsDataStore.addValueToChartsData(tmpV);
    // console.log(chartsData);
    // console.log(chartsDataStore);
  }
});
</script>

<template>
  <div
    class="font-peyda bg-transparent h-full w-full flex flex-col justify-start"
  >
    <!-- <DateFormat
      class="text-sm whitespace-nowrap mt-0"
      :date="key_arr[index]"
      :mode="1"
    /> -->
    <!-- {{ loadingVar }} -->
    <Loading v-if="key_arr.length == 0 || loadingVar == 1" />

    <div
      class="bg-black/50 cursor-pointer border-1 border-transparent hover:border-emerald hover:bg-black/25 font-peyda text-emerald-400 flex flex-row h-24 p-3 m-4 mt-0 pt-3 gap-2 rounded-lg max-w-screen overflow-hidden"
      v-if="key_arr.length != 0"
    >
      <div
        v-if="geojson_arr"
        class="text-emerald-400 w-full flex flex-col mt-0 mb-2"
      >
        <input
          type="range"
          v-model="index"
          min="0"
          :max="key_arr.length - 1"
          class="range-sm range w-full -mt-1 min-h-5"
          className="range "
          :step="1"
        />
        <div
          class="w-full flex justify-between text-center mb-2 px-2 -translate-x-2 h-1 translate-y-[12px]"
        >
          <span
            v-for="span in key_arr.length"
            :key="span"
            :class="{
              'text-red-400/25 scale-150 -translate-x-[3px] -translate-y-[5px] transform-origin-center z-1 ':
                span % 24 == 1,
              'text-emerald-400/10 ': span % 24 != 1,
            }"
          >
            <div
              class="w-4 text-2xl -mt-1 h-4 transition-all duration-100 absolute dot text-yellow-400 z-10"
              :class="{
                'scale-100': span - 1 == index,
                'scale-0': span - 1 != index,
              }"
            >
              |
            </div>
            <div
              class="w-4 h-2 transition-all duration-100 absolute dot"
              :class="{
                'scale-0 mt-1': span - 1 == index,
                'scale-100': span - 1 != index,
              }"
            >
              |
            </div>
          </span>
        </div>
      </div>
      <button
        class="w-[100px] max-w-[100px] px-1 h-14 whitespace-nowrap text-emerald-400 hover:text-green-800 bg-emerald-400/25 border-3 rounded-xl hover:bg-emerald-400/75"
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
      v-if="key_arr.length != 0"
      class="max-h-10 h-10 text-center w-full mr-1 whitespace-nowrap text-lg my-1 mb-4 text-emerald-400"
    >
      <DateFormat :date="key_arr[index]" :mode="1" />
    </div>
    <div
      v-if="geojson_arr.length > 0 && showD"
      class="h-fit mx-2 absolute z-10 w-[98%] lg:max-w-[74%] 2xl:max-w-[50%] p-2 cursor-pointer lg:mx-[13%] 2xl:mx-[25%] morphg bg-[#2a6160a7] border-1 border-emerald-400 overflow-hidden rounded-xl"
    >
      <div
        @click="showD = false"
        class="group hover:bg-red hover:scale-125 duration-100 transition-transform text-black p-1 w-5 h-6 m-4 text-center scale-100 bg-red-400/10 border-1 border-red rounded-lg absolute right-0 top-0"
      >
        <div
          class="scale-100 relative -mt-1 group-hover:scale-150 text-red group-hover:text-black transition-transform duration-100"
        >
          ×
        </div>
      </div>
      <div class="w-full">
        <div class="w-ful mx-8 mr-12 mt-2">
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
            class="w-full flex justify-between text-center mb-2 px-2 -translate-x-2"
          >
            <span
              v-for="span in nref"
              :key="span"
              :class="{
                'text-teal-600': span % 2 == 0 && span % 6 != 0,
                'text-red-400': span % 6 == 0,
              }"
            >
              <div
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
      </div>
      <div class="w-full pt-8 pb-0 h-fit overflow-scroll">
        <!-- <div v-for="(item, index) in sp" :key="index"> -->
        <!-- {{ chartsData[chartIndex].chartArrY }} -->

        <Chart
          class="chart font-peyda mx-8"
          label="جمعیت"
          :index="chartIndex"
          :mode="'processed'"
          :nref="nref"
        />
        <!-- <Chart
          class="chart font-peyda max-h-fit mx-8"
          label="جمعیت"
          :index="chartIndex"
          :mode="'unprocessed'"
        /> -->
        <!-- </div> -->
      </div>
    </div>

    <div class="map-container0 border-t-2 border-t-teal-600">
      <MapContainer :index="index" :data="geojson_arr"></MapContainer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container0 {
  position: relative;
  height: 100%;
  /* Add other styles for the container */
}

.map-container0 {
  // position: absolute;
  // top: 0;
  // left: 0;
  // right: 0;
  // bottom: 0;
  // z-index: 1;
  position: relative;
  height: 100%;
  width: 100%;
}
.dot {
  transform-origin: center;
  transition: transform;
}
.dot.scale-0 {
  transform: scale(0);
  transition: transform;
}
.dot.scale-100 {
  animation: moveit 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transition: transform;
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
.morphg {
  background: rgba(1, 41, 35, 0.556);
  box-shadow: 0 8px 32px 0 rgba(10, 18, 133, 0.37);
  backdrop-filter: blur(7.5px);
  -webkit-backdrop-filter: blur(7.5px);
  border-radius: 10px;
  border: 1px solid rgba(29, 248, 201, 0.632);
}

.range::-moz-range-track {
  background-color: rgba(43, 232, 169, 0.381);
}
</style>
