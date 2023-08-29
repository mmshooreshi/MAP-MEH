<script lang="ts" setup>
import {useFiltersStore} from "~/store/filters";
import {storeToRefs} from "pinia";

const dist = ref(5);

const filtersStore = useFiltersStore();
const {distanceKm} = storeToRefs(filtersStore);
const {replaceDistanceKm} = filtersStore;

watch(dist, (distN) => {
  replaceDistanceKm(distN);
  console.log(distN);
});
</script>

<template>
  <div class="bg-black/50 px-4">
    فاصله از مرز مهران (km)
    <input
      type="range"
      v-model="dist"
      min="1"
      max="100"
      class="range"
      className="range child"
      step="1"
    />

    {{ distanceKm }}
  </div>
</template>

<style scoped></style>
