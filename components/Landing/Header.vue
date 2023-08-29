<script lang="ts" setup>
import {useFiltersStore} from "~/store/filters";
import {storeToRefs} from "pinia";

const dist = ref(100);

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
    class="bg-black/50 font-peyda text-emerald-400 flex flex-row h-16 p-4 gap-2"
  >
    <div class="whitespace-nowrap">فاصله از مرز مهران</div>
    <input
      type="range"
      v-model="dist"
      min="1"
      max="100"
      class="range w-full"
      className="range child"
      step="1"
    />
    <div class="whitespace-nowrap flex flex-row w-[100px] max-w-[100px]">
      <span class="mr-1">کیلومتر</span>
      <span>{{ distanceKm }}</span>
    </div>
  </div>
</template>

<style scoped></style>
