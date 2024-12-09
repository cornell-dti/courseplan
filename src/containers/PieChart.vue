<template>
  <div>
    <canvas ref="chartCanvas" style="max-width: 300px; max-height: 300px"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export default defineComponent({
  props: {
    chartData: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const chartCanvas = ref<HTMLCanvasElement | null>(null);

    onMounted(() => {
      if (chartCanvas.value) {
        // eslint-disable-next-line no-new
        new Chart(chartCanvas.value, {
          type: 'pie',
          data: {
            labels: Object.keys(props.chartData),
            datasets: [
              {
                data: Object.values(props.chartData),
                backgroundColor: [
                  '#003f5c',
                  '#2f4b7c',
                  '#665191',
                  '#a05195',
                  '#d45087',
                  '#f95d6a',
                  '#ff7c43',
                  '#ffa600',
                ],
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true, // Maintain a smaller size
            plugins: {
              legend: {
                position: 'bottom',
              },
            },
          },
        });
      }
    });

    return {
      chartCanvas,
    };
  },
});
</script>
