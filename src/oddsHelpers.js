let redDiceValues = [];
let whiteDiceValues = [];
let redWhiteWinSet = [];
let totalCombinations;
let diceCount;

let rollOddsSets = {};
let battleOddsSets = {};

export function calculateOdds(redDiceCount, whiteDiceCount) {
  const storedResult = rollOddsSets[`${redDiceCount}vs${whiteDiceCount}`];
  if (storedResult) 
    return storedResult;

  diceCount = redDiceCount + whiteDiceCount;
  resetValues(redDiceCount, whiteDiceCount);
  let currentDie = 0;
  recurseOdds(currentDie);
  totalCombinations = redWhiteWinSet.length;
  const result = compileOdds();
  rollOddsSets[`${redDiceCount}vs${whiteDiceCount}`] = result;
  return result;
}

function resetValues(redDiceCount, whiteDiceCount) {
  redDiceValues = fillArrayWithZeros(redDiceCount);
  whiteDiceValues = fillArrayWithZeros(whiteDiceCount);
  redWhiteWinSet = [];
  totalCombinations = 0;
}

function fillArrayWithZeros(arrLength) {
  let arr = [];
  for (let i = 0; i < arrLength; i++) arr.push(0);
  return arr;
}

function recurseOdds(currentDie) {
  if (currentDie >= diceCount) {
    return;
  }
  currentDie++;
  for (let i = 1; i <= 6; i++) {
    if (currentDie <= redDiceValues.length) {
      redDiceValues[currentDie - 1] = i;
    } else {
      whiteDiceValues[currentDie - redDiceValues.length - 1] = i;
    }
    recurseOdds(currentDie);
    if (currentDie == diceCount) {
      redWhiteWinSet.push(getRiskWinners());
    }
  }
  currentDie--;
}

function getRiskWinners() {
  let wins = [0, 0];
  if (Math.max(...whiteDiceValues) >= Math.max(...redDiceValues)) {
    wins[1]++;
  } else {
    wins[0]++;
  }

  if (whiteDiceValues.length > 1 && redDiceValues.length > 1) {
    if (getSecondHighest(whiteDiceValues) >= getSecondHighest(redDiceValues)) {
      wins[1]++;
    }
    else wins[0]++;
  }
  return wins;
}

function getSecondHighest(arr) {
  let largest = arr[0];
  let secondHighest = -1;
  arr.forEach((currentValue) => {
    if (currentValue > largest) {
      secondHighest = largest;
      largest = currentValue;
    } else if (currentValue < largest && currentValue > secondHighest) {
      secondHighest = currentValue;
    }
  });
  return secondHighest;
}

function compileOdds() {
  let result = {
    redSweep: { 
      label: 'Offensive Sweep',
      redLosses: 0, 
      whiteLosses: 2,
      count: 0 
    },
    redWin: { 
      label: 'Offensive Win',
      redLosses: 0, 
      whiteLosses: 1,
      count: 0 
    },
    whiteSweep: { 
      label: 'Defensive Sweep',
      redLosses: 2, 
      whiteLosses: 0,
      count: 0 
    },
    whiteWin: { 
      label: 'Defensive Win',
      redLosses: 1,  
      whiteLosses: 0,
      count: 0 
    },
    tie: { 
      label: 'Tie',
      redLosses: 1,
      whiteLosses: 1,
      count: 0 
    }
  };

  redWhiteWinSet.forEach((redWhite) => {
    if (redWhite[0] == 2) {
      result.redSweep.count++;
    }
    else if (redWhite[1] == 2) {
      result.whiteSweep.count++;
    }
    else if (redWhite[0] == 1 && redWhite[1] == 1) {
      result.tie.count++;
    }
    else if (redWhite[0] == 1) {
      result.redWin.count++;
    }
    else if (redWhite[1] == 1) {
      result.whiteWin.count++;
    }
  });

  for (let field in result) {
    result[field].chance = (result[field].count / totalCombinations);
  }

  let resultArr = [];
  for (let property in result) {
    if (result[property].chance != 0)
      resultArr.push(result[property]);
  }

  return resultArr.sort((a, b) => b.chance - a.chance);
}

//Battle Odds Functions
export function formatOccupiers(battleOdds, potentialOccupierCount = null) {
  const offenseCount = potentialOccupierCount
    ? potentialOccupierCount + 1 
    : battleOdds.offensiveOccupiers.length;

  let occupiersArray = Array.from({ length: offenseCount } , () => ({ label: null, chance: null }));

  occupiersArray[offenseCount - 1].label = `${offenseCount - 1} offensive occupiers`;
  occupiersArray[offenseCount - 1].chance = battleOdds.offensiveOccupiers[offenseCount - 1];
  
  for (let i = offenseCount - 2; i > 0; i--) {
    occupiersArray[i].label = `${i} or more offensive occupiers`;
    occupiersArray[i].chance = occupiersArray[i + 1].chance + battleOdds.offensiveOccupiers[i];
  }
  return occupiersArray;
}

export async function calculateBattleOdds(offenseCount, defenseCount) {
  const storedResult = battleOddsSets[`${offenseCount}vs${defenseCount}`];
  if (storedResult)
    return storedResult;

  let battleOdds = {
    offensiveOccupiers: new Array(offenseCount),
    offensiveVictory: 0,
    defensiveVictory: 0
  }

  runScenarios(offenseCount, defenseCount, battleOdds);
  battleOddsSets[`${offenseCount}vs${defenseCount}`] = battleOdds;
  return battleOdds;
}

async function runScenarios(offenseCount, defenseCount, battleOdds, chance = 1) {
  if (offenseCount < 2) {
    battleOdds.defensiveVictory += chance;
  } 

  else if (defenseCount < 1) {
    battleOdds.offensiveVictory += chance;
    battleOdds.offensiveOccupiers[offenseCount - 1] = battleOdds.offensiveOccupiers[offenseCount - 1] 
    ? battleOdds.offensiveOccupiers[offenseCount - 1] + chance
    : chance;
  } 
  
  else { 
    const storedResult = battleOddsSets[`${offenseCount}vs${defenseCount}`];
    if (storedResult) {
      updateBattleOddsUsingStoredResult(battleOdds, storedResult, chance);
    } else {
      battleOddsSets[`${offenseCount}vs${defenseCount}`] = {
        offensiveOccupiers: new Array(offenseCount),
        offensiveVictory: 0,
        defensiveVictory: 0
      };

      const redDiceToRoll = offenseCount > 3 ? 3 : offenseCount - 1;
      const whiteDiceToRoll = defenseCount > 1 ? 2 : 1;
      const rollResults = calculateOdds(redDiceToRoll, whiteDiceToRoll);
      runScenariosBasedOnRollResults(offenseCount, defenseCount, battleOdds, rollResults, chance);
    }
  }
}

function updateBattleOddsUsingStoredResult(battleOdds, storedResult, chance = 1) {
  for (let i = 1; i < storedResult.offensiveOccupiers.length; i++) {
    battleOdds.offensiveOccupiers[i] = battleOdds.offensiveOccupiers[i] 
      ? battleOdds.offensiveOccupiers[i] + storedResult.offensiveOccupiers[i] * chance
      : storedResult.offensiveOccupiers[i] * chance;
  }
  battleOdds.offensiveVictory += (chance * storedResult.offensiveVictory);
  battleOdds.defensiveVictory += (chance * storedResult.defensiveVictory);
}

function runScenariosBasedOnRollResults(offenseCount, defenseCount, battleOdds, rollResults, chance = 1) {
  rollResults.forEach((rollResult) => {
    runScenarios(
      offenseCount - rollResult.redLosses, 
      defenseCount - rollResult.whiteLosses, 
      battleOddsSets[`${offenseCount}vs${defenseCount}`], 
      1 * rollResult.chance,
    );
    runScenarios(
      offenseCount - rollResult.redLosses, 
      defenseCount - rollResult.whiteLosses, 
      battleOdds, 
      chance * rollResult.chance,
    );
  });
}

//Conquest Odds Functions
let territoryCount = null;

export async function calculateConquestOdds(offensiveBattalions, territoryList) {
  territoryCount = territoryList.length;
  let conquestOdds = {    
    offensiveOccupiers: new Array(offensiveBattalions),
    defensiveHoldoffs: new Array(territoryCount),
    offensiveVictory: 0,
    defensiveVictory: 0
  }
  await runBattles(offensiveBattalions, conquestOdds, territoryList);
  return conquestOdds;
}

async function runBattles(offensiveBattalions, conquestOdds, territoryList, chance = 1) {
  let battleOdds = await calculateBattleOdds(offensiveBattalions, territoryList[0].defensiveBattalions);
  conquestOdds.defensiveVictory += battleOdds.defensiveVictory * chance;

  let remainingTerritories = territoryList.filter((terr, i) => i !== 0);

  if (remainingTerritories.length > 0) {
    for (const [key, value] of Object.entries(battleOdds.offensiveOccupiers)) {
      let offBattalions = key.split('b')[0] - territoryList[0].desiredOccupiers + 1;

      // if only 1 army is remaining add to defensiveVictory odds and stop here
      if (offBattalions <= 1) {
        conquestOdds.defensiveVictory += value * chance;
        const currentTerritoryIndex = territoryCount - remainingTerritories.length - 1;

        // add to defensive holdoffs
        if (offBattalions + territoryList[0].desiredOccupiers === 2)
          conquestOdds.defensiveHoldoffs[currentTerritoryIndex] = conquestOdds.defensiveHoldoffs[currentTerritoryIndex] 
            ? conquestOdds.defensiveHoldoffs[currentTerritoryIndex] + value * chance + battleOdds.defensiveVictory * chance
            : value * chance + battleOdds.defensiveVictory * chance;

      // else run remaining battles
      } else {
        await runBattles(offBattalions, conquestOdds, remainingTerritories, chance * value);
      }
    }
  } else {
    // last battle has been fought. Add these to offensive victory chance
    conquestOdds.offensiveOccupiers[offensiveBattalions - 1] = conquestOdds.offensiveOccupiers[offensiveBattalions - 1] 
      ? conquestOdds.offensiveOccupiers[offensiveBattalions - 1] + chance * battleOdds.offensiveVictory
      : chance * battleOdds.offensiveVictory;

    Object.values(battleOdds.offensiveOccupiers).forEach((value) => {
      conquestOdds.offensiveVictory += value * chance;
    });
  }
}

export function formatOddsValue(oddsValue) {
  return oddsValue ? `${(oddsValue * 100).toFixed(2)}%` : null
}

export function formatDefensiveHoldoffs(results, territoryList) {
  let totalChance = 0;
  let resultArray = Array.from({ length: territoryList.length } , () => ({ label: null, chance: null }));
  for (let i = 0; i < resultArray.length; i++) {
    resultArray[i].label = `Victory in or before ${territoryList[i].name ?? territoryList[i].placeholder}`;
    if (i === resultArray.length - 1) {
      resultArray[i].chance = results.defensiveVictory;
    } else {
      totalChance += results.defensiveHoldoffs[i];
      resultArray[i].chance = totalChance;
    }
  }
  return resultArray;
}