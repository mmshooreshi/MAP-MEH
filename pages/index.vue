<script setup>
// import {useFiltersStore} from "~/store/filters";
// import {storeToRefs} from "pinia";
// const filtersStore = useFiltersStore();
// const {addValueToFilterList} = filtersStore;
// const {filtersList} = storeToRefs(filtersStore);

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

function getData() {
  var {result} = $fetch("/api/read-geojsons").then((result) => {
    var geojs = result.geojs_data.filter((elements) => {
      key_arr.value.push(elements.key);
      geojson_arr.value.push(elements.fileContent);
      total_arr.value.push(elements.total);
      indexEnd.value += 1;
      return elements !== null;
    });
  });

  console.log(key_arr.value);
  console.log(geojson_arr.value);
  console.log(total_arr.value);
}
onMounted(() => {
  getData();
});

// The type of chart we want to create
</script>

<template>
  <div class="font-peyda">
    <div class="flex flex-row m-2">
      <button
        class="child p-1 m-1 w-max h-min whitespace-nowrap text-emerald-400 hover:text-green-800 bg-emerald-400/25 border-3 rounded-xl hover:bg-emerald-400/75"
        :class="{
          'border-green-400 ': showD,
          'border-transparent ': !showD,
        }"
        @click="showD = !showD"
      >
        نمایش چارت
      </button>

      <div
        v-if="geojson_arr"
        class="text-emerald-400 p-1 m-1 w-full flex flex-col gap-2"
      >
        {{ indexStart }} : {{ indexEnd }}
        <input
          type="range"
          v-model="index"
          min="0"
          :max="key_arr.length - 1"
          class="range"
          className="range child"
          :step="1"
        />
        <div class="w-full">{{ key_arr[index] }}</div>
      </div>
    </div>
    <div
      v-if="geojson_arr.length > 0 && showD"
      class="m-2 mt-10 p-2 cursor-pointer lg:mx-28 2xl:mx-56 bg-[#1e503c50] border-1 border-emerald-400 rounded-xl overflow-hidden"
    >
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
