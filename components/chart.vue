<template>
  <div
    class="chart font-peyda pointer-events-auto"
    @click="showXticks = !showXticks"
  >
    <!-- {{ chartData }} -->
    <h3 class="chart__title text-center w-full text-emerald-400 mb-2">
      {{ props.title }}
    </h3>

    <Bar
      class="chart__bar transition-all duration-10"
      :data="chartData"
      :options="optionsT"
    />
  </div>
</template>

<script setup>
import chroma from "chroma-js";

import {useChartsDataStore} from "~/store/chartsData";
import {storeToRefs} from "pinia";

import {Bar} from "vue-chartjs";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  elements,
  Chart,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const chartsDataStore = useChartsDataStore();
const {chartsData} = storeToRefs(chartsDataStore);

const showXticks = ref(true);
const props = defineProps(["title", "label", "index", "mode", "nref"]);

const lh = ref([]);
const col = ref([]);

const chartArrY = computed(() => {
  return chartsData.value[props.index].chartArrY;
});

// const maxP = 15000;
const generateColors = (chartArrY) => {
  let maxP = Math.max(...chartArrY);
  return chartArrY.map((item, index) => {
    return chroma
      .scale(["#758989", "#00fa9a"])
      .mode("lch")(item / maxP)
      .hex();
    // if (item < 0) {
    //   return "#000";
    // } else {
    //   return chroma
    //     .scale(["#758989", "#00fa9a"])
    //     .mode("lch")(item / maxP)
    //     .hex();
    // }
  });
};

watch(chartArrY, (chartArrYNew) => {
  col.value = generateColors(chartArrYNew);
});
col.value = generateColors(chartArrY.value);

const chartData = computed(() => {
  return {
    labels: chartsData.value[props.index].chartArrX,
    datasets: [
      {
        data: chartArrY.value.map((num) => Math.abs(num)),
        barPercentage: 1,
        minBarLength: 5,
        backgroundColor: col.value,
        label: props.label,
      },
    ],
  };
});

if (props.mode == "processed") {
}

// const maxP = Math.max(...chartsData.value[props.index].chartArrY);

// const lh = ref([]);
// const col = ref([]);

// const generateColors = (chartArrY) => {
//   return chartArrY.map((item, index) => {
//     if (item < 0) {
//       console.log(item);
//       lh.value.push(item * -1);
//       return "#000";
//     } else {
//       lh.value.push(item);
//       return chroma
//         .scale(["#758989", "#00fa9a"])
//         .mode("lch")(item / maxP.value)
//         .hex();
//     }
//   });
// };

// const chartData = computed(() => {
//
//   col.value = generateColors(chartArrY);

//   return {
//     labels: chartsData.value[props.index].chartArrX,
//     datasets: [
//       {
//         data: lh.value,
//         barPercentage: 1,
//         minBarLength: 5,
//         backgroundColor: col.value,
//         label: props.label,
//       },
//     ],
//   };
// });

// ChartJS.defaults.backgroundColor = "#9BD0F5";
// ChartJS.defaults.borderColor = "#ADCACB";
// ChartJS.defaults.color = "#FEE3A2";

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
const optionsT = ref({
  responsive: true,
  scales: {
    y: {
      ticks: {color: "#00fa9a", beginAtZero: true},
    },
    x: {
      ticks: {
        display: showXticks.value,
        color: "#00fa9a",
        beginAtZero: true,
      },
    },
  },
  plugins: {
    tooltip: {
      label: {
        callback: function (context) {
          // return formatdate(context.toString(), 1);
          return context;
        },
      },
    },
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
});
ChartJS.defaults.borderColor = "#00fa9a20";
// ChartJS.defaults.color = "#00fa9a";
// ChartJS.defaults.backgroundColor = "#F3C301";
</script>
