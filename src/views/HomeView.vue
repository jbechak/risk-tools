<template>
  <div class="home">
    <div class="d-flex mt-3 mb-5">
      <div v-for="die in redDice" :key="die.id">
        <DieComponent ref="redDiceRef" :die="die" @dieRolled="getDieValue" @toggleShow="toggleShow"/>
      </div>
    </div>
    <div class="d-flex my-5">
      <div v-for="die in whiteDice" :key="die.id">
        <DieComponent ref="whiteDiceRef" :die="die" @dieRolled="getDieValue" @toggleShow="toggleShow"/>
      </div>
    </div>
    <button type="button" class="btn btn-primary pt-3 mx-2" @click="rollDice"><h2>Roll</h2></button>
    <button type="button" class="btn btn-primary pt-3 mx-2" @click="resetDiceValues"><h2>Reset</h2></button>
   
    <div id="result-container" class="d-flex justify-content-center align-items-center mt-4" :class="resultContainerStyleClass">
      <h2 class="m-0">{{resultMessage}}</h2>
    </div>
    
    <OddsComponent 
      :redDiceCount="activeRedDice?.length" 
      :whiteDiceCount="activeWhiteDice?.length"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import DieComponent from '@/components/DieComponent.vue';
import OddsComponent from '@/components/OddsComponent.vue';
import { useVibrate } from '@vueuse/core';

const { vibrate } = useVibrate({ pattern: [300, 100, 300] });

const redDiceRef = ref(null);
const whiteDiceRef = ref(null);
const resultEditted = ref(false);
const diceRolled = ref(0);

const redDice = ref([
  { id: 1, isActive: true, isTogglable: true, isRed: true, isWinner: false, isLoser: false   },
  { id: 2, isActive: true, isTogglable: true, isRed: true, isWinner: false, isLoser: false   },
  { id: 3, isActive: true, isTogglable: true, isRed: true, isWinner: false, isLoser: false   },
]);

const whiteDice = ref([
  { id: 1, isActive: true, isTogglable: true, isRed: false, isWinner: false, isLoser: false   },
  { id: 2, isActive: true, isTogglable: true, isRed: false, isWinner: false, isLoser: false   },
]);

const activeRedDice = computed(() => redDice.value.filter((die) => die.isActive));
const activeWhiteDice = computed(() => whiteDice.value.filter((die) => die.isActive));

const resultMessage = computed(() => {
  const redWinnerCount = redDice.value.filter((die) => die.isWinner).length;
  const whiteWinnerCount = whiteDice.value.filter((die) => die.isWinner).length;

  if (redWinnerCount === 0 && whiteWinnerCount === 0) 
    return null;

  const redMinusWhite = redWinnerCount - whiteWinnerCount;
  switch(redMinusWhite) {
    case 2:
      return 'Offensive Sweep!';
    case 1:
      return 'Offensive Win';
    case -2:
      return 'Defensive Sweep!';
    case -1:
      return 'Defensive Win';
    default:
      return 'Tie';
  }
});

const resultContainerStyleClass = computed(() => {
  if (resultMessage.value?.includes('Offensive')) return 'red-background';
  if (resultMessage.value?.includes('Defensive')) return 'white-background';
  if (resultMessage.value?.includes('Tie')) return 'gray-background';
  return null
});

function getHighestValues(diceArray, isTwoMatches) {
  let highestValue;
  let secondHighestValue;

  diceArray.forEach((die) => {
    if (!highestValue || die.value > highestValue) {
      if (isTwoMatches && (!secondHighestValue || highestValue > secondHighestValue)) {
        secondHighestValue = highestValue;
      }
      highestValue = die.value;
    } 
    else if (isTwoMatches && (!secondHighestValue || die.value > secondHighestValue)) {
      secondHighestValue = die.value;
    }
  });

  return isTwoMatches ? [highestValue, secondHighestValue] : [highestValue];
}

async function rollDice() {
  resetDiceValues();
  vibrate();
  redDiceRef.value.forEach((die) => {
    die.rollDie();
  });
  whiteDiceRef.value.forEach((die) => {
    die.rollDie();
  });
  resultEditted.value = false;
}

function resetDiceValues() {
  diceRolled.value = 0;
  redDice.value.forEach((die) => { die.value = null; die.isWinner = false; die.isLoser = false; }); 
  whiteDice.value.forEach((die) => { die.value = null; die.isWinner = false; die.isLoser = false; });
  redDiceRef.value.forEach((die) => { die.setCurrentNumberToZero(); });
  whiteDiceRef.value.forEach((die) => { die.setCurrentNumberToZero(); });
}

function getDieValue(die, value) {
  diceRolled.value++;
  die.value = value;
}

function toggleShow(die) {
  die.isActive = !die.isActive;
  setToggable(die.isRed ? redDice.value : whiteDice.value);
  resultEditted.value = true;
}

function setToggable(dice) {
  const activeDice = dice.filter((die) => die.isActive);
  if (activeDice.length === 1) {
    activeDice[0].isTogglable = false;
  } else {
    dice.forEach((die) => { if (!die.isTogglable) die.isTogglable = true })
  }
}

function processResults() {
  if (activeWhiteDice.value.findIndex((die) => die.value) === -1) {
    return null;
  }

  const isTwoMatches = activeRedDice.value.length > 1 && activeWhiteDice.value.length > 1;
  const highestRedValues = getHighestValues(activeRedDice.value, isTwoMatches);
  const highestWhiteValues = getHighestValues(activeWhiteDice.value, isTwoMatches);

  for (let i = 0; i < highestRedValues.length; i++) {
    if (highestRedValues[i] > highestWhiteValues[i]) {
      assignWinnerAndLoser(activeRedDice.value, activeWhiteDice.value, highestRedValues[i], highestWhiteValues[i]);
    } else {
      assignWinnerAndLoser(activeWhiteDice.value, activeRedDice.value, highestWhiteValues[i], highestRedValues[i]);
    }
  }
}

function assignWinnerAndLoser(winnerArr, loserArr, winningValue, losingValue) {
  winnerArr.find((die) => die.value === winningValue && !die.isWinner && !die.isLoser).isWinner = true;
  loserArr.find((die) => die.value === losingValue && !die.isWinner && !die.isLoser).isLoser = true;
}

watch(
  () => diceRolled.value,
  (value) => {
    if (value === activeRedDice.value.length + activeWhiteDice.value.length) {
      processResults();
    }
  }
);
</script>

<style scoped>
.home {
  position: absolute;
  z-index: 1;
  background-image: url('@/assets/highly-blurred-map-skinny-lesslight.png');
  background-repeat: repeat-y;
  min-height: 100vh;
}

.red-background {
  background-color: rgba(255, 0, 0, 0.675);
}

.white-background {
  background-color: rgba(255, 255, 255, 0.53);
}

.gray-background {
  background-color: rgba(128, 128, 128, 0.507);
}

#result-container {
  height: 40px;
  box-shadow: 0px 0px 0px 5px rgba(0,0,0,0.3);
}

@media only screen and (min-width: 500px) {
  .home {
    background-image: url('@/assets/highly-blurred-map.png');
    width: 100%;
  }
}
</style>