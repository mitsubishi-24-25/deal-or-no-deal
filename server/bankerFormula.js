/*
|--------------------------------------------------------------------------
| BANKER OFFER FORMULA — NO GROUPS
|--------------------------------------------------------------------------
|
| Base Offer = Remaining Average × 0.25 × Late-Game Multiplier
| Correct Answer Bonus = Correct Answers × (Remaining Average × 0.02)
| Final Offer = Base Offer + Correct Answer Bonus
|
| The late-game multiplier is intentionally gentle:
|   11+ remaining → 1.00×
|    8–10         → 1.05×
|    6–7          → 1.10×
|    4–5          → 1.15×
|    3            → 1.20×
|    2            → 1.25×
*/

const BANKER_CALL_THRESHOLDS = Object.freeze([4, 7, 9, 11, 12, 13]);
const BASE_OFFER_FACTOR = 0.25;
const CORRECT_ANSWER_FACTOR = 0.02;

function getLateGameMultiplier(remainingCases) {
  if (remainingCases >= 11) return 1.00;
  if (remainingCases >= 8) return 1.05;
  if (remainingCases >= 6) return 1.10;
  if (remainingCases >= 4) return 1.15;
  if (remainingCases === 3) return 1.20;
  return 1.25;
}

function calculateBankerOffer(gameState) {
  const claimedValues = gameState.briefcases.claimedValues;
  const allValues = gameState.briefcases.allValues;
  const remainingValues = allValues.filter(
    (value) => !claimedValues.includes(value)
  );

  if (remainingValues.length === 0) {
    return {
      success: false,
      message: "No remaining values — cannot compute offer.",
      offer: null
    };
  }

  const sum = remainingValues.reduce((total, value) => total + value, 0);
  const remainingAverage = sum / remainingValues.length;
  const remainingCases = remainingValues.length;
  const correctAnswers = Number(gameState.luckyStar.correctAnswers || 0);
  const lateGameMultiplier = getLateGameMultiplier(remainingCases);

  const baseOffer = Math.ceil(
    remainingAverage * BASE_OFFER_FACTOR * lateGameMultiplier
  );
  const perCorrectAnswerBonus = Math.ceil(
    remainingAverage * CORRECT_ANSWER_FACTOR
  );
  const correctAnswerBonus = correctAnswers * perCorrectAnswerBonus;
  const offer = Math.ceil(baseOffer + correctAnswerBonus);

  return {
    success: true,
    offer,
    breakdown: {
      remainingValues,
      remainingCases,
      remainingAverage: Math.round(remainingAverage * 100) / 100,
      lateGameMultiplier,
      correctAnswers,
      baseFactor: BASE_OFFER_FACTOR,
      baseOffer,
      correctAnswerFactor: CORRECT_ANSWER_FACTOR,
      perCorrectAnswerBonus,
      correctAnswerBonus,
      finalOffer: offer,
      formula:
        `Base ₱${baseOffer} (${lateGameMultiplier.toFixed(2)}×) + ` +
        `(${correctAnswers} correct × ₱${perCorrectAnswerBonus}) ` +
        `= ₱${offer}`
    }
  };
}

function determineCurrentRound(totalCasesOpened) {
  for (let index = BANKER_CALL_THRESHOLDS.length - 1; index >= 0; index -= 1) {
    if (totalCasesOpened >= BANKER_CALL_THRESHOLDS[index]) {
      return index + 1;
    }
  }
  return 0;
}

function getBankerProgress(totalCasesOpened, autoCalledRound, totalCases) {
  const currentRound = determineCurrentRound(totalCasesOpened);
  const totalRounds = BANKER_CALL_THRESHOLDS.length;
  let targetRound = null;
  let targetCaseCount = null;
  let callReady = false;

  if (currentRound > autoCalledRound) {
    targetRound = currentRound;
    targetCaseCount = BANKER_CALL_THRESHOLDS[currentRound - 1];
    callReady = true;
  } else if (autoCalledRound < totalRounds) {
    targetRound = autoCalledRound + 1;
    targetCaseCount = BANKER_CALL_THRESHOLDS[targetRound - 1];
  }

  return {
    casesOpened: totalCasesOpened,
    totalCases,
    casesRemaining: Math.max(totalCases - totalCasesOpened, 0),
    currentRound,
    autoCalledRound,
    targetRound,
    targetCaseCount,
    briefcasesUntilCall: targetCaseCount === null
      ? 0
      : Math.max(targetCaseCount - totalCasesOpened, 0),
    callReady,
    allCallsComplete: autoCalledRound >= totalRounds
  };
}

module.exports = {
  BASE_OFFER_FACTOR,
  BANKER_CALL_THRESHOLDS,
  CORRECT_ANSWER_FACTOR,
  calculateBankerOffer,
  determineCurrentRound,
  getBankerProgress,
  getLateGameMultiplier
};
