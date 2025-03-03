<template>
  <p class="mx-3 text-start">
    Enter a string of enemy territories to plan your conquest. 
    Click 'Calculate' to view your odds of success. 
  </p>
  <div v-if="validationErrors?.length > 0" class="mx-3 text-danger text-start">
    <div v-for="(error, index) in validationErrors" :key="index">
      {{ error }}
    </div>
  </div>

  <div class="pb-3 px-3">
    <div class="d-flex flex-column mb-3 pb-3 bottom-border">
      <label for="offensiveBattalions" class="form-label pe-2 mb-0">
        <h3 class="text-start" >Offensive Battalions</h3>
      </label>
      <input
        id="offensiveBattalions"
        type="number"
        class="form-control form-control-sm w-15 input-field"
        min="2"
        max="100"
        v-model="formData.offensiveBattalions"
      />
    </div>

    <h3 class="text-start">Enemy Territories</h3>
    <div d-flex>
      <label class="w-8"></label>
      <label class="w-45 text-start enemy-table-header">Territory Name</label>
      <label class="w-21 text-start enemy-table-header">Defensive Battalions</label>
      <label class="w-21 text-start enemy-table-header">Desired Occupiers</label>
      <label class="w-5"></label>
    </div>
    <Sortable
      :list="rawTerritoryList"
      itemKey="id"
      :options="{sort: true, handle: '.sort-icon'}"
      @end="updateList"
    >
      <template #item="{element}">
        <div v-if="!element.isDeleted" class="draggable d-flex" :key="element.id">
          <font-awesome-icon 
            class="pt-1 pe-0 w-8 sort-icon"
            size="xl" 
            icon="sort"
          />
          <input
            :id="element.id"
            type="text"
            v-model="element.name"
            maxLength="50"
            class="w-45"
            :class="styleClasses.INPUT_FIELD"
            @focus="onFocus"
            :placeholder="element.placeholder"
          />
          <input
            type="number"
            min="1"
            v-model="element.defensiveBattalions"
            class="w-21 ms-1"
            :class="styleClasses.INPUT_FIELD"
          />
          <input
            type="number"
            min="1"
            v-model="element.desiredOccupiers"
            class="w-21 ms-1"
            :class="styleClasses.INPUT_FIELD"
            :disabled="isLastTerritory(element.id)"
          />
          <font-awesome-icon
            :class="styleClasses.END_ICON"
            size="2xl" 
            icon="xmark" 
            @click="removeTerritory(element)"
          />
        </div>
      </template>
    </Sortable>

    <div class="d-flex">
      <font-awesome-icon 
        class="pt-1 pe-0 w-8 opacity-0"
        size="xl" 
        icon="sort"
      />
      <input
        type="text"
        v-model="newTerritory.name"
        maxLength="50"
        class="w-45 opacity-25"
        :class="styleClasses.INPUT_FIELD"
        @keyup.enter="addNewTerritory"
        @focus="onFocus"
        :placeholder="newTerritory.placeholder"
      />
      <input
        type="number"
        min="1"
        v-model="newTerritory.defensiveBattalions"
        class="w-21 ms-1 opacity-25"
        :class="styleClasses.INPUT_FIELD"
        @keyup.enter="addNewTerritory"
      />
      <input
        type="number"
        min="1"
        v-model="newTerritory.desiredOccupiers"
        class="w-21 ms-1 opacity-25"
        :class="styleClasses.INPUT_FIELD"
        @keyup.enter="addNewTerritory"
      />
      <font-awesome-icon
        class="blue-color"
        :class="styleClasses.END_ICON"
        size="2xl" 
        icon="plus" 
        @click="addNewTerritory"
      />
    </div>
    <button 
      ref="calculateButton" 
      type="button" 
      class="btn btn-primary mt-2 mb-2 pt-3" 
      :disabled="isCalculating" 
      @click="calculateOdds"
    >
      <h2>{{ calculateButtonLabel }}</h2>
    </button>
    <BattleConquestResults 
      :results="results" 
      :rawOccupierArray="rawOccupierArray"
      :rawHoldOffArray="rawHoldOffArray"
    />
  </div>
</template>

<script setup>
import { reactive, ref, nextTick, computed } from "vue";
import { Sortable } from "sortablejs-vue3";
import { calculateConquestOdds, formatOccupiers, formatDefensiveHoldoffs } from '@/oddsHelpers.js';
import * as yup from 'yup';
import BattleConquestResults from '@/components/BattleConquestResults.vue';

const styleClasses = {
  INPUT_FIELD: "form-control mb-1 input-field",
  END_ICON: "ps-1 pb-1 align-self-center w-5 btn-hover"
};

const isCalculating = ref(null);
const newTerritory = reactive({});
const calculateButton = ref(null);
const validationErrors = ref(null);
const orderedTerritoryList = reactive({ Items: [] });
const rawOccupierArray = ref([{label: null, chance: null}]);
const rawHoldOffArray = ref([{label: null, chance: null}]);
const rawTerritoryList = ref([
  {
    id: getGuid(),
    name: null,
    placeholder: "Territory 1",
    defensiveBattalions: 1,
    desiredOccupiers: 1
  }
]);

const formData = reactive({
  offensiveBattalions: 4,
  enemyTerritoryList: [],
});

const results = reactive({
  offensiveVictory: null,
  defensiveVictory: null,
  offensiveOccupiers: []
});

const calculateButtonLabel = computed(() => isCalculating.value ? 'Calculating...' : 'Calculate');


formData.enemyTerritoryList = [...rawTerritoryList.value];
Object.assign(orderedTerritoryList.Items, rawTerritoryList.value);
setUpNewTerritory();

function isLastTerritory(id) {
  return (formData.enemyTerritoryList[formData.enemyTerritoryList.length - 1].id === id);
}

function getGuid() {
  return Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);
}

function setUpNewTerritory() {
  newTerritory.id = getGuid();
  newTerritory.name = null;
  newTerritory.placeholder = `Territory ${rawTerritoryList.value.length + 1}`;
  newTerritory.defensiveBattalions = 1;
  newTerritory.desiredOccupiers = 1;
}

function updateList(e) {
  formData.enemyTerritoryList.splice(e.newIndex, 0, formData.enemyTerritoryList.splice(e.oldIndex, 1)[0]);
}

async function addNewTerritory() {
  let newTerr = {};
  Object.assign(newTerr, newTerritory);
  rawTerritoryList.value.push(newTerr);
  formData.enemyTerritoryList.push(newTerr);
  setUpNewTerritory();
  await nextTick();
  calculateButton.value.scrollIntoView({ behavior: "smooth" });
}

async function removeTerritory(territory) {
  territory.isDeleted = true;
  formData.enemyTerritoryList = formData.enemyTerritoryList.filter((obj) => obj.id !== territory.id);
}

async function calculateOdds() {
  if (!validateForm())
    return;

  isCalculating.value = true;
  await new Promise((r) => setTimeout(r, 100));
  Object.assign(results, (await calculateConquestOdds(formData.offensiveBattalions, formData.enemyTerritoryList)));

  let potentialOccupierCount = formData.offensiveBattalions - 1;
  for (let i = 0; i < formData.enemyTerritoryList.length - 1; i++) {
    potentialOccupierCount -= formData.enemyTerritoryList[i].desiredOccupiers;
  }
  
  rawOccupierArray.value = formatOccupiers(results, potentialOccupierCount);
  rawHoldOffArray.value = formatDefensiveHoldoffs(results, formData.enemyTerritoryList);
  isCalculating.value = false;
}

const validationSchema = yup.object().shape({
  offensiveBattalions: yup.number().nullable().required().max(200).label('Offensive Battalions'),
  enemyTerritoryList: yup.array()
    .test(
      'tooManyOccupiers',
      'Desired Occupiers exceeds Offensive Battalions',
      (value) => value.map(i=>i.desiredOccupiers).reduce((a, b) => a + b) <= formData.offensiveBattalions
    )
    .nullable()
    .of(yup.object().shape({
      name: yup.string().nullable().max(50).label('Territory Name')
        .test(
          'nameRequired',
          'Territory Name is a required field',
          (value, context) => value || context.parent.placeholder
        ),
      defensiveBattalions: yup.number().nullable().required().positive().max(200).label('Defensive Battalions'),
      desiredOccupiers: yup.number().nullable().required().positive().max(200).label('Desired Occupiers')
  }))
});


function validateForm() {
  validationErrors.value = [];
  try {
    validationSchema.validateSync(formData, { abortEarly: false });
    return true;
  } catch (error) {
    error.inner.forEach(e => {
        validationErrors.value.push(e.message);
    });
    return false;
  }
}

</script>

<style scoped>
.label { float: left; }

.sort-icon:hover {
  cursor: move;
}

.input-field {
  background-color: rgba(128, 128, 128, 0.252);
}

.bottom-border {
  border-bottom: 2px solid rgba(255, 255, 255, 0.326);
}

.w-5 {
  width: 5%;
}

.w-8 {
  width: 8%;
}

.w-15 {
  width: 15%;
}

.w-21 {
  width: 21%;
}

.w-45 {
  width: 45%;
}

.btn-hover:hover {
  cursor: pointer;
}

.blue-color {
  color: blue;
}

.form-control:disabled {
  background-color: rgba(128, 128, 128, 0.252);
  opacity: 25%;
}

.opacity-25 {
  opacity: 25% !important;
}

@media only screen and (max-width: 500px) {
  .enemy-table-header {
    font-size: 14px;
  }
}
</style>