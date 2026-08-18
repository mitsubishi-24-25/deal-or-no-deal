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
| - Bonus: based on remaining cases
|     9–7 cases → +1
|     6–4 cases → +2
|     3 cases   → +3
|     2 cases   → +5
| - Comeback Bonus: based on score gap
|     0–10  → +0
|     11–30 → +5
|     31–50 → +10
|     51–80 → +15
|     81+   → +20
*/

function calculateBankerOffer(gameState) {
  // 1. Get remaining values (unclaimed).
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

  // 4. Bonus.
  const remainingCount = remainingValues.length;
  let bonus;
  if (remainingCount >= 7) bonus = 1;
  else if (remainingCount >= 4) bonus = 2;
  else if (remainingCount === 3) bonus = 3;
  else bonus = 5; // 2 cases left (Lucky Briefcase + 1)

  // 5. Comeback Bonus (based on score gap).
  let comebackBonus;
  if (scoreGap <= 10) comebackBonus = 0;
  else if (scoreGap <= 30) comebackBonus = 5;
  else if (scoreGap <= 50) comebackBonus = 10;
  else if (scoreGap <= 80) comebackBonus = 15;
  else comebackBonus = 20;

  // 6. Final offer.
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
| Determine which round number based on total cases opened.
| Round 1: after 3 cases opened
| Round 2: after 5 cases opened
| Round 3: after 6 cases opened
| Round 4: after 7 cases opened
| Round 5: after 8 cases opened
*/
function determineCurrentRound(totalCasesOpened) {
  if (totalCasesOpened >= 8) return 5;
  if (totalCasesOpened >= 7) return 4;
  if (totalCasesOpened >= 6) return 3;
  if (totalCasesOpened >= 5) return 2;
  if (totalCasesOpened >= 3) return 1;
  return 0; // Not enough cases opened yet.
}

module.exports = {
  calculateBankerOffer,
  determineCurrentRound
};