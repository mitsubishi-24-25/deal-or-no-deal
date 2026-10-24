/*
|--------------------------------------------------------------------------
| BANKER OFFER FORMULA
|--------------------------------------------------------------------------
|
| Offer = (Briefcase Average × 0.50) + (Score Gap × 0.30) + (Bonus × 0.20)
|         + (Comeback Bonus)
|
| Components:
| - Briefcase Average: sum of remaining values ÷ number of remaining values
| - Score Gap: (highest group score) − (Lucky Star's group score)
| - Bonus: based on remaining cases, including the Lucky Briefcase
|     11 cases left → +1
|      8 cases left → +2
|      6 cases left → +3
|      4 cases left → +4
|      3 cases left → +4
|      2 cases left → +6
| - Comeback Bonus: based on score gap
|     0–10  → +0
|     11–30 → +5
|     31–50 → +10
|     51–80 → +15
|     81+   → +20
|
| Scheduled banker calls for 15 cases:
|   Round 1: after 4 opened  (11 remaining)
|   Round 2: after 7 opened  (8 remaining)
|   Round 3: after 9 opened  (6 remaining)
|   Round 4: after 11 opened (4 remaining)
|   Round 5: after 12 opened (3 remaining)
|   Round 6: after 13 opened (2 remaining)
*/

const BANKER_CALL_THRESHOLDS = Object.freeze([4, 7, 9, 11, 12, 13]);

const BONUS_BY_REMAINING_CASES = Object.freeze({
  11: 1,
  8: 2,
  6: 3,
  4: 4,
  3: 4,
  2: 6
});

function getBonusForRemainingCases(remainingCount) {
  if (Object.prototype.hasOwnProperty.call(BONUS_BY_REMAINING_CASES, remainingCount)) {
    return BONUS_BY_REMAINING_CASES[remainingCount];
  }

  // The game only calls the banker at the exact table counts above. These
  // ranges are safe fallbacks if somebody manually triggers a call early.
  if (remainingCount >= 9) return 1;
  if (remainingCount >= 7) return 2;
  if (remainingCount === 6) return 3;
  if (remainingCount >= 3) return 4;
  return 6;
}

function calculateBankerOffer(gameState) {
  // 1. Get remaining values (unclaimed). The Lucky Briefcase is included
  // because it has not been claimed/opened yet.
  const claimedValues = gameState.briefcases.claimedValues;
  const allValues = gameState.briefcases.allValues;
  const remainingValues = allValues.filter(
    (v) => !claimedValues.includes(v)
  );

  if (remainingValues.length === 0) {
    return {
      success: false,
      message: "No remaining values — cannot compute offer.",
      offer: null
    };
  }

  // 2. Briefcase Average.
  const sum = remainingValues.reduce((a, b) => a + b, 0);
  const briefcaseAverage = sum / remainingValues.length;

  // 3. Score Gap.
  const luckyStarGroup = gameState.luckyStar.group;

  if (!luckyStarGroup) {
    return {
      success: false,
      message: "Cannot compute offer: Lucky Star's group is not set yet.",
      offer: null
    };
  }

  const allScores = Object.values(gameState.groups).map((g) => g.score);
  const highestScore = Math.max(...allScores);
  const luckyStarScore = gameState.groups[luckyStarGroup].score;
  const scoreGap = highestScore - luckyStarScore;

  // 4. Updated Bonus Table.
  const remainingCount = remainingValues.length;
  const bonus = getBonusForRemainingCases(remainingCount);

  // 5. Existing Comeback Bonus remains part of the formula.
  let comebackBonus;
  if (scoreGap <= 10) comebackBonus = 0;
  else if (scoreGap <= 30) comebackBonus = 5;
  else if (scoreGap <= 50) comebackBonus = 10;
  else if (scoreGap <= 80) comebackBonus = 15;
  else comebackBonus = 20;

  // 6. Final offer. Round upward, as in the previous version.
  const rawOffer =
    briefcaseAverage * 0.5 +
    scoreGap * 0.3 +
    bonus * 0.2 +
    comebackBonus;

  const offer = Math.ceil(rawOffer);

  return {
    success: true,
    offer: offer,
    breakdown: {
      remainingValues: remainingValues,
      remainingCases: remainingCount,
      briefcaseAverage: Math.round(briefcaseAverage * 100) / 100,
      highestScore: highestScore,
      luckyStarScore: luckyStarScore,
      scoreGap: scoreGap,
      bonus: bonus,
      comebackBonus: comebackBonus,
      formula:
        `(${briefcaseAverage.toFixed(2)} × 0.5) + ` +
        `(${scoreGap} × 0.3) + ` +
        `(${bonus} × 0.2) + ` +
        `(${comebackBonus} comeback) = ₱${offer}`
    }
  };
}

/*
| Determine the round from the total number of regular cases opened.
*/
function determineCurrentRound(totalCasesOpened) {
  for (let i = BANKER_CALL_THRESHOLDS.length - 1; i >= 0; i -= 1) {
    if (totalCasesOpened >= BANKER_CALL_THRESHOLDS[i]) return i + 1;
  }
  return 0;
}

/*
| Data used by the controller countdown. It distinguishes:
| - a call that is ready but has not happened until the homepage is opened;
| - the next scheduled call after the current one was already made.
*/
function getBankerProgress(totalCasesOpened, autoCalledRound, totalCases) {
  const currentRound = determineCurrentRound(totalCasesOpened);
  const scheduledRounds = BANKER_CALL_THRESHOLDS.length;
  let targetRound = null;
  let targetCaseCount = null;
  let callReady = false;

  if (currentRound > autoCalledRound) {
    targetRound = currentRound;
    targetCaseCount = BANKER_CALL_THRESHOLDS[currentRound - 1];
    callReady = true;
  } else if (autoCalledRound < scheduledRounds) {
    targetRound = autoCalledRound + 1;
    targetCaseCount = BANKER_CALL_THRESHOLDS[targetRound - 1];
  }

  return {
    casesOpened: totalCasesOpened,
    totalCases: totalCases,
    casesRemaining: Math.max(totalCases - totalCasesOpened, 0),
    currentRound: currentRound,
    autoCalledRound: autoCalledRound,
    targetRound: targetRound,
    targetCaseCount: targetCaseCount,
    briefcasesUntilCall: targetCaseCount === null
      ? 0
      : Math.max(targetCaseCount - totalCasesOpened, 0),
    callReady: callReady,
    allCallsComplete: autoCalledRound >= scheduledRounds
  };
}

module.exports = {
  BANKER_CALL_THRESHOLDS,
  BONUS_BY_REMAINING_CASES,
  calculateBankerOffer,
  determineCurrentRound,
  getBankerProgress,
  getBonusForRemainingCases
};
