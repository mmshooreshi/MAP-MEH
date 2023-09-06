<script lang="ts" setup>
import {useFiltersStore} from "~/store/filters";
import {storeToRefs} from "pinia";

const dist = ref(25);

const filtersStore = useFiltersStore();
const {distanceKm} = storeToRefs(filtersStore);
const {replaceDistanceKm} = filtersStore;

watch(dist, (distN) => {
  replaceDistanceKm(distN);
  // console.log(distN);
});
</script>

<template>
  <div
    class="bg-black/50 cursor-pointer border-1 border-transparent hover:border-emerald hover:bg-black/25 font-peyda text-emerald-400 flex flex-row h-13 p-3 gap-2 rounded-lg m-3 mx-4 max-w-screen overflow-hidden"
  >
    <input
      type="range"
      v-model="dist"
      min="1"
      max="100"
      class="range transition-all w-full min-w-[60%] border-blue-400"
      className="range child"
      step="1"
    />

    <div
      class="flex flex-row-reverse gap-2 text-xs md:text-sm lg:text-base my-auto"
    >
      <div
        class="whitespace-nowrap text-gray-400 text-right text-justify mt-1 lg:mt-0"
      >
        فاصله از مرز مهران
      </div>

      <div class="whitespace-nowrap flex flex-row-reverse text-center text-lg">
        <span class="ml-1">Km</span>

        <span>{{ distanceKm }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.range::-moz-range-track {
  background-color: rgba(43, 232, 169, 0.381);
}
</style>
