<template>
  <p class="mx-3 text-start">
    Enter the amount of offensive battalions, including one army to stay behind. 
    Enter the amount of defensive battalions in the territory you wish to occupy. 
  </p>
  <div class="d-flex justify-content-evenly pb-3 px-3">
    <div>
      <label for="offensiveBattalions" class="form-label text-start">
        Offensive Battalions
      </label>
      <input
        id="offensiveBattalions"
        type="number"
        class="form-control form-control-sm w-50"
        min="2"
        max="200"
        v-model="offensiveBattalions"
      />
    </div>
    <div>
      <label for="defensiveBattalions" class="form-label text-start">
        Defensive Battalions
      </label>
      <input
        id="defensiveBattalions"
        type="number"
        class="form-control form-control-sm w-50"
        min="1"
        max="200"
        v-model="defensiveBattalions"
      />
    </div>
    <button type="button" class="btn btn-primary mt-1 pt-3" @click="calculateOdds">
      <h2>Calculate</h2>
    </button>
  </div>
  <BattleConquestResults 
    :results="results" 
    :rawOccupierArray="rawOccupierArray"
  />
</template>

<script setup>
import { ref, reactive } from 'vue';
import { calculateBattleOdds, formatOccupiers } from '@/oddsHelpers.js';
import BattleConquestResults from '@/components/BattleConquestResults.vue';

const offensiveBattalions = ref(5);
const defensiveBattalions = ref(3);
const rawOccupierArray = ref([{label: null, chance: null}]);
const results = reactive({
  offensiveVictory: null,
  defensiveVictory: null,
  offensiveOccupiers: [],
});

async function calculateOdds() {
  Object.assign(results, (await calculateBattleOdds(offensiveBattalions.value, defensiveBattalions.value)));
  rawOccupierArray.value = formatOccupiers(results);
}
</script>

<style scoped>
h3 {
  margin-bottom: 0px;
}
</style>