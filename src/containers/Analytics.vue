<template>
  <div>
    <div class="body-container" :class="{ 'no-data': !hasData() }">
      <top-bar />
      <div class="timestamp" v-if="hasData()">Data last retrieved at: {{ analyticsTimestamp }}</div>
      <pre class="analytics" v-if="hasData()">{{ analyticsData }}</pre>
      <div v-if="hasData() && Object.keys(gradYearFrequencies).length > 0" class="hash-map-display">
        <h3>Graduation Year Frequencies</h3>
        <ul>
          <li v-for="(value, key) in gradYearFrequencies" :key="key">{{ key }}: {{ value }}</li>
        </ul>
        <!-- Pie Chart Component -->
        <PieChart :chartData="gradYearFrequencies" />
      </div>
      <div class="back_to_home">
        <a class="back_to_home_link" href="/login">Back to home</a>
      </div>
      <custom-footer />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CustomFooter from '@/components/Footer.vue';
import TopBar from '@/components/TopBar.vue';
import PieChart from '@/containers/PieChart.vue'; // Import PieChart Component
import { retrieveAnalytics } from '@/global-firestore-data';

export default defineComponent({
  components: { CustomFooter, TopBar, PieChart },
  mounted() {
    this.retrieveData();
  },
  data() {
    return {
      analyticsData: '',
      analyticsTimestamp: '',
      gradYearFrequencies: {} as Record<string, number>, // Add property for hash map
    };
  },
  methods: {
    async retrieveData() {
      const analyticsObject = await retrieveAnalytics();
      this.analyticsData = analyticsObject.data;
      this.analyticsTimestamp = analyticsObject.timestamp;

      // Extract gradYearFrequencies once data is retrieved
      this.gradYearFrequencies = this.extractGradYearFrequencies();
    },
    hasData() {
      return this.analyticsData.length > 2;
    },
    extractGradYearFrequencies() {
      const startKey = '"gradYearFrequencies": {';
      const endKey = '}';

      // Find the part of the string containing gradYearFrequencies
      const startIndex = this.analyticsData.indexOf(startKey) + startKey.length;
      const endIndex = this.analyticsData.indexOf(endKey, startIndex);
      const gradYearFrequenciesString = this.analyticsData.substring(startIndex, endIndex).trim();

      // Convert the extracted string to a hash map
      const hashMap: Record<string, number> = {}; // Explicit typing for hash map
      const pairs = gradYearFrequenciesString.split(',').map(pair => pair.trim());
      for (const pair of pairs) {
        const [key, value] = pair.split(':').map(item => item.trim().replace(/["']/g, '')); // Remove quotes
        hashMap[key] = parseInt(value, 10); // Convert value to an integer
      }

      return hashMap;
    },
  },
});
</script>

<style scoped lang="scss">
.no-data {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.back_to_home {
  font-size: 32px;
  vertical-align: middle;
  text-align: center;
  color: #7b7d7e;
  margin-bottom: 10rem;
  margin-top: 6rem;
  height: 100px;
  @media (max-width: 1154px) {
    margin-bottom: 3rem;
  }
  @media (max-width: 800px) {
    margin-top: 8%;
    font-size: 8vw;
    margin-bottom: 0;
  }
}
a.back_to_home_link {
  color: #7b7d7e;
}
.body-container {
  min-height: 100vh;
}

.timestamp {
  font-size: 16px;
  padding: 3.75rem 0 0 6.5rem;
  margin-bottom: 1rem;

  @media (max-width: 1154px) {
    padding: 0 0 0 3.125rem;
  }
}

.analytics {
  font-size: 14px;
  padding: 0 0 0 6.5rem;

  @media (max-width: 1154px) {
    padding: 0 0 0 3.125rem;
  }
}
.hash-map-display {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.hash-map-display h3 {
  margin-bottom: 1rem;
}
</style>
