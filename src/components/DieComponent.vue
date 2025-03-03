<template>
  <div :class="parentDivClasses">
    <img 
      :class="dieImgClass"
      :src="currentDieRef" 
      :style="styles.rotate"
      @click="toggleShow" 
    >
    <div v-if="die?.isLoser && die.isActive" class="color-overlay">
      <img v-if="die?.isLoser" class="x-marker" src="@/assets/x-marker.png" @click="toggleShow" />
    </div>
    
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import redOne from '@/assets/RedOne.png';
import redTwo from '@/assets/RedTwo.png';
import redThree from '@/assets/RedThree.png';
import redFour from '@/assets/RedFour.png';
import redFive from '@/assets/RedFive.png';
import redSix from '@/assets/RedSix.png';
import whiteOne from '@/assets/WhiteOne.png';
import whiteTwo from '@/assets/WhiteTwo.png';
import whiteThree from '@/assets/WhiteThree.png';
import whiteFour from '@/assets/WhiteFour.png';
import whiteFive from '@/assets/WhiteFive.png';
import whiteSix from '@/assets/WhiteSix.png';

const props = defineProps({
  die: {
    type: Object,
    default: null
  },
  isWaiting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['dieRolled', 'toggleShow']);
defineExpose({ rollDie, setCurrentNumberToZero });

const redDiceRef = ref([redOne, redTwo, redThree, redFour, redFive, redSix]);
const whiteDiceRef = ref([whiteOne, whiteTwo, whiteThree, whiteFour, whiteFive, whiteSix]);
const currentDieRef = computed(() =>
  props.die?.isRed ? redDiceRef.value[currentNumber.value] : whiteDiceRef.value[currentNumber.value]
);

const currentNumber = ref(0);
const styleClasses = {
  OPACITY_25: "opacity-25",
  POINTER_ON_HOVER: "pointer-on-hover",
  WINNER_BORDER: "winner-border",
  LOSER_BORDER: "loser-border",
  NO_BORDER: "no-border",
  PARENT_DIV: "parent-div",
  DIE_WIDTH: "die-width",
  DICE_MARGINS: "dice-margins"
};

const dieImgClass = computed(() => {
  let classes = [styleClasses.DIE_WIDTH];
  if (!props.die?.isActive) classes.push(styleClasses.OPACITY_25);

  if (props.die?.isWinner) classes.push(styleClasses.WINNER_BORDER);
  else if (props.die?.isLoser) classes.push(styleClasses.LOSER_BORDER);
  else classes.push(styleClasses.NO_BORDER);

  return classes;
});

const parentDivClasses = computed(() => {
  let classes = [styleClasses.DICE_MARGINS, styleClasses.PARENT_DIV];
  if (props.die?.isTogglable) classes.push(styleClasses.POINTER_ON_HOVER);
  return classes;
});

const styles = reactive({
  rotate: null
});

async function rollDie() {
  if (props.die.isActive) {
    const maxAngle = 50
    for (let j = 0; j < 3; j++) {
      await rotateRange(1, (i) => i < maxAngle, 10);
      await rotateRange(maxAngle, (i) => i > 0 - maxAngle, -10);
      await rotateRange(0 - maxAngle, (i) => i < 1, 10);
    }
    emit('dieRolled', props.die, currentNumber.value + 1);
  }
}

async function rotateRange(startAngle, endExp, increment) {
  for (let i = startAngle; endExp(i); i += increment) {
    await delay(10);
    styles.rotate = `transform: rotate(${i}deg)`
  }
  currentNumber.value = Math.floor(Math.random() * 6);
}

async function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function toggleShow() {
  if (!props.die?.isTogglable) return;
  emit('toggleShow', props.die);
}

function setCurrentNumberToZero() {
  currentNumber.value = 0;
}

async function runWaitingDie() {
  currentNumber.value = 5;
  while (props.isWaiting) {
    for (let i = 0; i < 360; i += 2) {
      if (!props.isWaiting) break;
      await delay(1);
      styles.rotate = `transform: rotate(${i}deg)`
    }
  }

}

onMounted(() => {
  if (props.isWaiting) {
    runWaitingDie();
  }
})
</script>

<style scoped>
.pointer-on-hover {
  cursor: pointer;
}

.winner-border {
  border: 2vw solid yellow;
  border-radius: 5vw;
  margin-bottom: 20px;
}

.loser-border {
  border: 2vw solid red;
  border-radius: 5vw;
  margin-bottom: 20px;
}

.no-border {
  padding: 10px;
}

.parent-div {
  width: 100px;
  height: 90px;
}

.opacity-25 {
  opacity: 25% !important;
}

.color-overlay {
  position: relative;
  bottom: 31vw;
  left: 2vw;
  background-color: gray;
  opacity: 50%;
  width: 24vw;
  height: 24vw;
  border-radius: 4vw;
}
.x-marker {
  position: relative;
  bottom: 0.5vw;
  right: 0.5vw;
}

.die-width {
  width: 28vw;
}

.dice-margins {
  margin-left: 3vw;
  margin-right: 3vw;
}

@media only screen and (min-width: 500px) {
  .die-width {
    width: 120px;
  }

  .color-overlay {
    bottom: 130px;
    left: 10px;
    width: 100px;
    height: 100px;
    border-radius: 10px;
  }

  .x-marker {
    margin-top: 0px;
    bottom: 0vw;
    right: 0vw;
  }

  .winner-border {
    border-width: 10px;
    border-radius: 20px;
    margin-bottom: 20px;
  }

  .loser-border {    
    border-width: 10px;
    border-radius: 20px;
    margin-bottom: 20px;
  }
}
</style>