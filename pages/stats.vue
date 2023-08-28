<template>
  <div class="stats">
    <h2 class="stats__title title">Статистика</h2>
    <div class="charts">
      <Chart :labels="profitLabels" :data="profitData" />
      <!-- <chart-pie class="chart" title="Продано" :labels="saledLabels" :dataset="saledDataset" /> -->
    </div>
    <div class="saled">
      <h2 class="saled__title">Продажи</h2>
      <table class="saled__table table">
        <thead class="table__header">
          <tr class="text-left">
            <th>Имя заказчика</th>
            <th>Цена</th>
            <th>Статус</th>
            <th>Информация</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in orders" :key="index" class="aicsss">
            <td>{{ item.user }}</td>
            <td>{{ item.price }} грн.</td>
            <td>{{ item.status }}</td>
            <td>
              <button class="icon" icon color="white">
                <span>mdi-eye</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import Chart from "/components/chart.vue";

const profitLabels = ["sa", "s", "aa", "bb", "cc"];
const profitData = [40000, 20000, 31200, 34400, 25000];

const saledLabels = ["Беговые дорожки", "Велотренажеры", "Прочее"];
const saledDataset = {
  backgroundColor: ["#41B883", "#E46651", "#00D8FF"],
  data: [40, 20, 10],
};

const orders = [
  {user: "Иван", price: 19999, status: "В процессе"},
  {user: "Иван", price: 19999, status: "В процессе"},
  {user: "Иван", price: 19999, status: "В процессе"},
  {user: "Иван", price: 19999, status: "В процессе"},
  {user: "Иван", price: 19999, status: "В процессе"},
  {user: "Иван", price: 19999, status: "В процессе"},
  {user: "Иван", price: 19999, status: "В процессе"},
  {user: "Иван", price: 19999, status: "В процессе"},
  {user: "Иван", price: 19999, status: "В процессе"},
  {user: "Иван", price: 19999, status: "В процессе"},
  {user: "Иван", price: 19999, status: "В процессе"},
];
</script>

<style lang="scss" scoped>
.stats {
  &__title {
    text-align: center;
    margin-bottom: 50px;
  }
}

.charts {
  display: flex;
  justify-content: space-around;
  margin-bottom: 50px;
}

.chart {
  min-width: 350px;
}

.saled {
  &__title {
    text-align: center;
    margin-bottom: 30px;
  }
}

@media (max-width: 800px) {
  .charts {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 30px;
  }
}
</style>
