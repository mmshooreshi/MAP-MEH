<template>
  <div class="chart">
    <h3 class="chart__title">{{ props.title }}</h3>
    <Bar class="chart__bar" :data="chartData" />
  </div>
</template>

<script setup>
import {Bar} from "vue-chartjs";
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

const props = defineProps(["title", "label", "labels", "data"]);

const chartData = {
  labels: props.labels,
  datasets: [
    {data: props.data, backgroundColor: "#f87979", label: props.label},
  ],
};
</script>
