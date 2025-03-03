<template>
  <div class="pb-4 px-3">
    <p class="text-start">
        Calculates the odds of a single dice roll. Click on the dice to toggle which ones are active.
    </p>
    <div v-for="(instance, index) in odds" :key="index">
      <div class="d-flex justify-content-between">
        <h3>{{ instance.label }}</h3>
        <h3>{{ formatOddsValue(instance.chance) }}</h3>  
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { calculateOdds, formatOddsValue } from '@/oddsHelpers.js'

const props = defineProps({
  redDiceCount: {
    type: Number,
    default: 3
  },
  whiteDiceCount: {
    type: Number,
    default: 2
  },
});

const odds = computed(() => calculateOdds(props.redDiceCount, props.whiteDiceCount));
</script>