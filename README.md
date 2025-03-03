# Risk Tools

## View deployed application
https://risk-tools.netlify.app/

## User Instructions
Risk Roller is a companion to the game of Risk. The top portion of the window serves as a dice roller and evaluator, which can be used during game play in lieu of dice. The bottom portion is an odds calculator, which consists of three modes: Single Roll, Battle, and Conquest.

### Dice Roller
Click the 'Roll' button to roll the dice. Click the 'Reset' button to reset the dice, although resetting in between dice rolls is not necessary. To change the number of dice to be rolled, simply click on any die to toggle it on or off.

### Odds Calculator
**Single Roll Mode** - This mode calculates and displays the odds of every possible outcome based on which dice are currently turned on in the dice roller. Toggle various dice on and off to see the odds from different combinations of red and white dice. 

**Battle Mode** - This mode calculates and displays the odds of an offensive player conquering a neighboring territory based on the number of offensive battalions and the number of defensive battalions. Enter the number of offensive battalions and defensive battalions. Then click the 'Calculate' button. Once the results are displayed, offensive victory results can be expanded or contracted by clicking on 'Offensive Victory'. For large battles, these expanded results will be displayed in a compressed format. They can be further expanded or contracted by clicking on the results.

Battle Mode assumes that the maximum number of dice will always be rolled by each player. For example, if in the beginning or at any point in the battle, a player has only 1 battalion to attack or defend with, that player will only roll 1 die. If the attacker has 3 or more battalions to attack with, he/she will roll 3 dice. If the defender has 2 or more battalions to defend with, he/she will roll 2 dice. 

**Conquest Mode** - This mode calculates and displays the odds of an offensive player conquering a list of territories in succession. Enter the number of offensive battalions. Add or remove enemy territories by using the buttons to the right of the 'Enemy Territories' list. For each enemy territory, optionally update the name and update the number of defensive battalions if it isn't 1. For every territory except for the last one, you may update the number of desired occupiers. Click the 'Calculate' button. Once the results are displayed, the offensive victory odds can be expanded and contracted in the same manner as they can in Battle Mode. Defensive Victory odds can be expanded and contracted as well. Conquest Mode makes the same assumptions about the number of dice being rolled as Battle Mode.


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
