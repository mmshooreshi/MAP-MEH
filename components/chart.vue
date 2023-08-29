<template>
  <div class="chart font-peyda">
    <h3 class="chart__title text-center w-full text-emerald-400 mb-2">
      {{ props.title }}
    </h3>
    <Bar class="chart__bar" :data="chartData" :options="optionsT" />
  </div>
</template>

<script setup>
import chroma from "chroma-js";

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
var maxP = Math.max(...props.data);

const chartData = {
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      barPercentage: 1,
      minBarLength: 5,
      backgroundColor: props.data.map((item) => {
        // Generate a color based on the item value using a gradient scale
        const color = chroma
          .scale(["#758989", "#00fa9a"])
          .mode("lch")(item / maxP)
          .hex();
        return color;
      }),
      label: props.label,
    },
  ],
};

// ChartJS.defaults.backgroundColor = "#9BD0F5";
// ChartJS.defaults.borderColor = "#ADCACB";
// ChartJS.defaults.color = "#FEE3A2";

const optionsT = {
  responsive: true,
  scales: {
    y: {
      ticks: {color: "#00fa9a", beginAtZero: true},
    },
    x: {
      ticks: {
        display: false,
        color: "#00fa9a",
        beginAtZero: true,
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        // This more specific font property overrides the global property
        font: {
          size: 14,
          family: "peyda",
          color: "#00fa9a",
        },
      },
    },
  },
};
ChartJS.defaults.borderColor = "#00fa9a20";
// ChartJS.defaults.color = "#00fa9a";
// ChartJS.defaults.backgroundColor = "#F3C301";
</script>
