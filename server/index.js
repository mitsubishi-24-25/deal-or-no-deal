const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");

const config = require("./config");
const questions = require("./questions");

const bankerFormula = require("./bankerFormula");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

/*
|--------------------------------------------------------------------------
| CENTRAL GAME STATE
|--------------------------------------------------------------------------
*/

const gameState = {
  currentPage: "splash",

    luckyStar: {
    name: null,
    group: null,
    luckyBriefcase: null,
    previousGroups: []   // Track past Lucky Star groups (para hindi mag-repeat)
  },

  roulette: {
    allNames: [...config.rouletteNames],
    usedNames: [],
    isSpinning: false,
    spinType: null,
    targetName: null,
    targetIndex: null,
    showResult: false,
    resultName: null
  },

  groups: {
    1: { score: 0, isLoggedIn: false, socketId: null },
    2: { score: 0, isLoggedIn: false, socketId: null },
    4: { score: 0, isLoggedIn: false, socketId: null },
    5: { score: 0, isLoggedIn: false, socketId: null },
    6: { score: 0, isLoggedIn: false, socketId: null },
    7: { score: 0, isLoggedIn: false, socketId: null },
    8: { score: 0, isLoggedIn: false, socketId: null },
    9: { score: 0, isLoggedIn: false, socketId: null }
  },

  briefcases: {
    mode: "rigged", // "rigged" (fixed order) | "random" (shuffled values + questions)
    fixedValueSequence: [
      85, 95, 10, 25, 70, 5, 40, 15, 55, 100
    ],
    allValues: [
      5, 10, 15, 25, 40, 55, 70, 85, 95, 100
    ],
    claimedValues: [],
    openOrder: [],
    // Random-mode assignments (populated when mode === "random").
    valueMap: null,     // { caseNumber: value }
    questionMap: null,  // { caseNumber: questionNumber }
    cases: {
      1: { isOpened: false, assignedValue: null, openedByGroup: null },
      2: { isOpened: false, assignedValue: null, openedByGroup: null },
      3: { isOpened: false, assignedValue: null, openedByGroup: null },
      4: { isOpened: false, assignedValue: null, openedByGroup: null },
      5: { isOpened: false, assignedValue: null, openedByGroup: null },
      6: { isOpened: false, assignedValue: null, openedByGroup: null },
      7: { isOpened: false, assignedValue: null, openedByGroup: null },
      8: { isOpened: false, assignedValue: null, openedByGroup: null },
      9: { isOpened: false, assignedValue: null, openedByGroup: null },
      10: { isOpened: false, assignedValue: null, openedByGroup: null }
    }
  },

    banker: {
    currentRound: 0,
    offers: [null, null, null, null, null],  // 5 offers
    computedOffer: null,                      // Pre-computed offer (not yet shown)
    computedForRound: null,                   // Which round is the computed offer for
    isCalling: false,                          // Banker call animation active
    isRevealing: false,                        // Show offer on TV homepage
    revealedRound: null,                       // Which offer currently being highlighted
    dealAccepted: null,                        // { round, amount, group } when deal is taken
    lastDecision: null                         // "deal" | "no_deal" | null
  },

  buzzer: {
    isActive: false,
    firstPresser: null,
    firstPressTime: null,
    isLocked: false,
    excludedGroups: [],
    pressHistory: []
  },

  /*
  | ACTIVE BRIEFCASE
  | Kapag may bukas na briefcase, ito ang state niya.
  */
    activeBriefcase: {
    caseNumber: null,
    questionNumber: null, // Which question belongs to the currently open case
    view: "question",
    questionBlurred: false,
    explanationSlide: 0   // Which slide is currently shown
  },

      gameEnd: null,

  teacher: {
    isLoggedIn: false,
    socketId: null
  },

  pauseOverlay: {
    isActive: false,
    activatedAt: null
  },

  // DISCUSSION SLIDESHOW (TV)
  discussion: {
    index: 0,
    slides: []   // ["/discussion/slide1.jpg", ...] — populated at startup
  },

  // BUZZER TEST MODE (TV)
  buzzerTest: {
    isActive: false,
    group7BuzzCount: 0,   // Group 7's buzz count for the current test session
    lastPress: null,      // { group, time, sound }
    pressCount: 0         // total presses this session (used to force re-render)
  }
};

/*
|--------------------------------------------------------------------------
| LOAD DISCUSSION SLIDES (from public/discussion, e.g. slide1.jpg, slide2.jpg)
|--------------------------------------------------------------------------
*/
(function loadDiscussionSlides() {
  const dir = path.join(__dirname, "../public/discussion");
  try {
    if (!fs.existsSync(dir)) {
      console.log("No discussion folder yet — slides will be empty.");
      return;
    }
    const files = fs.readdirSync(dir)
      .filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
      .sort((a, b) => {
        // Sort numerically by any leading number (slide2 before slide10).
        const num = (s) => parseInt((s.match(/\d+/) || ["0"])[0], 10);
        return num(a) - num(b) || a.localeCompare(b);
      });
    gameState.discussion.slides = files.map((f) => `/discussion/${f}`);
    console.log(`📚 Discussion slides loaded: ${gameState.discussion.slides.length}`);
  } catch (err) {
    console.error("Error loading discussion slides:", err.message);
  }
})();

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  // Neutral landing page — device links are intentionally NOT listed here so
  // students can't discover the controller/teacher URLs from the root address.
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BSIT 1E</title>
      <style>
        body { margin: 0; min-height: 100vh; display: flex; align-items: center;
               justify-content: center; background: #001333; color: #fff;
               font-family: Arial, sans-serif; }
      </style>
    </head>
    <body>
      <h1 style="opacity:0.6;">BSIT 1E</h1>
    </body>
    </html>
  `);
});

app.get("/tv", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/tv/index.html"));
});

app.get("/controller", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/controller/index.html"));
});

app.get("/controller2", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/controller2/index.html"));
});

app.get("/group", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/group/index.html"));
});

app.get("/teacher", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/teacher/index.html"));
});

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function broadcastGameState() {
  const publicState = {
    ...gameState,
    groups: {},
    // Strip server-internal briefcase maps so clients can't peek at
    // un-revealed values/questions (rigged order stays hidden too).
    briefcases: {
      ...gameState.briefcases,
      valueMap: undefined,
      questionMap: undefined
    }
  };

  Object.entries(gameState.groups).forEach(
    ([groupNum, groupData]) => {
      publicState.groups[groupNum] = {
        score: groupData.score,
        isLoggedIn: groupData.isLoggedIn
      };
    }
  );

  // Strip teacher socketId for privacy.
  publicState.teacher = {
    isLoggedIn: gameState.teacher.isLoggedIn
  };

  // Attach current question data if a briefcase is open.
  if (gameState.activeBriefcase.caseNumber) {
    const qNum = gameState.activeBriefcase.questionNumber;
    publicState.currentQuestion = questions[qNum] ?? null;
  } else {
    publicState.currentQuestion = null;
  }

  io.to("tv").emit("game-state", publicState);
  io.to("controller").emit("game-state", publicState);
  io.to("controller2").emit("game-state", publicState);
  io.to("group").emit("buzzer-state", gameState.buzzer);
}

// Decide which question a case will show AT THE MOMENT IT IS OPENED.
//  - Rigged mode: questions follow OPEN ORDER (1st case opened → question 1,
//    2nd opened → question 2, ...) regardless of the briefcase number.
//    This matches how values are already assigned (fixedValueSequence by
//    open order), so question N pairs with the Nth value.
//  - Random mode: each case maps to a shuffled question.
function assignQuestionForCase(caseNum) {
  if (gameState.briefcases.mode === "random" && gameState.briefcases.questionMap) {
    return gameState.briefcases.questionMap[caseNum] ?? caseNum;
  }
  return gameState.briefcases.openOrder.length + 1;
}

function changePage(pageName) {
  const allowedPages = [
    "splash",
    "roulette",
    "homepage",
    "briefcase",
    "game_end",
    "discussion",
    "buzzer_test"
  ];
  if (!allowedPages.includes(pageName)) return false;
  gameState.currentPage = pageName;
  return true;
}

/*
| ROULETTE
*/
function getAvailableNames() {
  return gameState.roulette.allNames.filter(
    (n) => !gameState.roulette.usedNames.includes(n)
  );
}

function pickRandomAvailableName() {
  const available = getAvailableNames();
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function determineSpinTarget(spinType) {
  switch (spinType) {
    case "R": return pickRandomAvailableName();
    case "A": return config.specificNameA;
    case "B": return config.specificNameB;
    case "Y": return config.specificNameC;
    default: return null;
  }
}

function startSpin(spinType) {
  if (gameState.currentPage !== "roulette") {
    return { success: false, message: "TV must be on the Roulette page first." };
  }
  if (gameState.roulette.showResult) {
    return { success: false, message: "Close popup first." };
  }
  if (gameState.roulette.isSpinning) {
    return { success: false, message: "Currently spinning." };
  }

  const targetName = determineSpinTarget(spinType);
  if (!targetName) return { success: false, message: "No available name." };

  const targetIndex = gameState.roulette.allNames.indexOf(targetName);
  if (targetIndex === -1) {
    return { success: false, message: `Name "${targetName}" not found.` };
  }

  gameState.roulette.isSpinning = true;
  gameState.roulette.spinType = spinType;
  gameState.roulette.targetName = targetName;
  gameState.roulette.targetIndex = targetIndex;
  gameState.roulette.showResult = false;
  gameState.roulette.resultName = null;
  broadcastGameState();

  setTimeout(() => {
    gameState.roulette.isSpinning = false;
    gameState.roulette.showResult = true;
    gameState.roulette.resultName = targetName;
    gameState.luckyStar.name = targetName;
    if (!gameState.roulette.usedNames.includes(targetName)) {
      gameState.roulette.usedNames.push(targetName);
    }
    broadcastGameState();
  }, 5000);

  return { success: true, message: `Spinning (${spinType}) → ${targetName}` };
}

function closeRouletteResult() {
  if (!gameState.roulette.showResult) {
    return { success: false, message: "No popup open." };
  }
  gameState.roulette.showResult = false;
  gameState.roulette.resultName = null;
  broadcastGameState();
  return { success: true, message: "Popup closed." };
}

/*
| BUZZER
*/
function activateBuzzer() {
  gameState.buzzer.isActive = true;
  gameState.buzzer.firstPresser = null;
  gameState.buzzer.firstPressTime = null;
  gameState.buzzer.isLocked = false;
  gameState.buzzer.pressHistory = [];
  broadcastGameState();
  return { success: true, message: "Buzzer activated." };
}

function deactivateBuzzer() {
  gameState.buzzer.isActive = false;
  broadcastGameState();
  return { success: true, message: "Buzzer deactivated." };
}

function resetBuzzerForNewQuestion() {
  gameState.buzzer.isActive = false;
  gameState.buzzer.firstPresser = null;
  gameState.buzzer.firstPressTime = null;
  gameState.buzzer.isLocked = false;
  gameState.buzzer.excludedGroups = [];
  gameState.buzzer.pressHistory = [];
  broadcastGameState();
  return { success: true, message: "Buzzer reset." };
}

/*
| BRIEFCASE
*/
function openBriefcase(caseNumber) {
  const num = parseInt(caseNumber, 10);

  if (!gameState.briefcases.cases[num]) {
    return { success: false, message: "Invalid briefcase number." };
  }

  if (gameState.briefcases.cases[num].isOpened) {
    return { success: false, message: `Briefcase ${num} is already opened.` };
  }

  // Prevent opening the Lucky Briefcase during regular gameplay.
  if (gameState.luckyStar.luckyBriefcase === num) {
    return {
      success: false,
      message: `Briefcase ${num} is the Lucky Star's Lucky Briefcase. It cannot be opened during rounds.`
    };
  }

  // Set active briefcase (assign its question now, by open order in rigged mode).
  gameState.activeBriefcase.caseNumber = num;
  gameState.activeBriefcase.questionNumber = assignQuestionForCase(num);
  gameState.activeBriefcase.view = "question";
  gameState.activeBriefcase.questionBlurred = false;

  // Change TV to briefcase page.
  gameState.currentPage = "briefcase";

  // Reset buzzer for new question, then activate.
  gameState.buzzer.isActive = true;
  gameState.buzzer.firstPresser = null;
  gameState.buzzer.firstPressTime = null;
  gameState.buzzer.isLocked = false;
  gameState.buzzer.excludedGroups = [];
  gameState.buzzer.pressHistory = [];

  broadcastGameState();

  return {
    success: true,
    message: `Briefcase ${num} opened. Question displayed, buzzer active.`
  };
}

function handleWrongAnswer() {
  const wrongGroup = gameState.buzzer.firstPresser;
  if (wrongGroup === null) {
    return { success: false, message: "No group has buzzed in yet." };
  }

  if (!gameState.buzzer.excludedGroups.includes(wrongGroup)) {
    gameState.buzzer.excludedGroups.push(wrongGroup);
  }

  gameState.buzzer.firstPresser = null;
  gameState.buzzer.firstPressTime = null;
  gameState.buzzer.isLocked = false;
  gameState.buzzer.isActive = true;

  // Un-blur the question so all can see again.
  gameState.activeBriefcase.questionBlurred = false;

  broadcastGameState();

  return {
    success: true,
    message: `Group ${wrongGroup} answered wrong and is now locked out.`
  };
}

function handleCorrectAnswer() {
  const correctGroup = gameState.buzzer.firstPresser;
  if (correctGroup === null) {
    return { success: false, message: "No group has buzzed in yet." };
  }

  const caseNum = gameState.activeBriefcase.caseNumber;
  if (!caseNum) {
    return { success: false, message: "No briefcase is currently open." };
  }

  // Determine value:
  //  - Rigged mode: next value in the fixed sequence (open order).
  //  - Random mode: the case's pre-assigned shuffled value.
  const openIndex = gameState.briefcases.openOrder.length;
  let value;
  if (
    gameState.briefcases.mode === "random" &&
    gameState.briefcases.valueMap
  ) {
    value = gameState.briefcases.valueMap[caseNum];
  } else {
    value = gameState.briefcases.fixedValueSequence[openIndex];
  }

  // For the Lucky Star's own briefcase, the value always goes to the
  // Lucky Star's group (it's their case). Otherwise it goes to the group
  // that answered correctly.
  const isLuckyCase = gameState.luckyStar.luckyBriefcase === caseNum;
  const scoreRecipient = isLuckyCase
    ? gameState.luckyStar.group || correctGroup
    : correctGroup;

  // Assign value to this briefcase.
  gameState.briefcases.cases[caseNum].isOpened = true;
  gameState.briefcases.cases[caseNum].assignedValue = value;
  gameState.briefcases.cases[caseNum].openedByGroup = scoreRecipient;
  gameState.briefcases.openOrder.push(caseNum);
  gameState.briefcases.claimedValues.push(value);

  // Add score to the correct group.
  if (gameState.groups[scoreRecipient]) {
    gameState.groups[scoreRecipient].score += value;
  }

  // Deactivate buzzer.
  gameState.buzzer.isActive = false;
  gameState.buzzer.isLocked = true;

  // Switch view to value reveal.
  gameState.activeBriefcase.view = "value";
  gameState.activeBriefcase.questionBlurred = false;

  broadcastGameState();

  return {
    success: true,
    message: `Group ${correctGroup} correct! Briefcase ${caseNum} = ₱${value}. Score updated.`
  };
}

function showExplanation() {
  if (!gameState.activeBriefcase.caseNumber) {
    return { success: false, message: "No briefcase is currently open." };
  }

  const caseNum = gameState.activeBriefcase.caseNumber;
  const qNum = gameState.activeBriefcase.questionNumber;
  const q = questions[qNum];
  const totalSlides = q?.explanation?.slides?.length ?? 0;

  if (totalSlides === 0) {
    return { success: false, message: "No explanation slides available." };
  }

  // Case 1: Currently on value → show first explanation slide.
  if (gameState.activeBriefcase.view === "value") {
    gameState.activeBriefcase.view = "explanation";
    gameState.activeBriefcase.explanationSlide = 0;
    broadcastGameState();
    return {
      success: true,
      message: `Showing explanation slide 1 of ${totalSlides}.`
    };
  }

  // Case 2: Already on explanation → next slide, OR loop back to question if last slide.
  if (gameState.activeBriefcase.view === "explanation") {
    const currentSlide = gameState.activeBriefcase.explanationSlide;

    if (currentSlide < totalSlides - 1) {
      // Advance to next slide.
      gameState.activeBriefcase.explanationSlide = currentSlide + 1;
      broadcastGameState();
      return {
        success: true,
        message: `Slide ${currentSlide + 2} of ${totalSlides}.`
      };
    } else {
      // Last slide → loop back to question (review mode, no buzzer).
      gameState.activeBriefcase.view = "question";
      gameState.activeBriefcase.questionBlurred = false;
      gameState.activeBriefcase.explanationSlide = 0;
      broadcastGameState();
      return {
        success: true,
        message: "Reached last slide. Looping back to question (review mode)."
      };
    }
  }

  // Case 3: On question (review mode) → go to value.
  if (gameState.activeBriefcase.view === "question") {
    gameState.activeBriefcase.view = "value";
    broadcastGameState();
    return {
      success: true,
      message: "Showing value again."
    };
  }

  return { success: false, message: "Unexpected state." };
}

function backToQuestion() {
  if (!gameState.activeBriefcase.caseNumber) {
    return { success: false, message: "No briefcase is currently open." };
  }
  gameState.activeBriefcase.view = "question";
  gameState.activeBriefcase.questionBlurred = false;
  gameState.activeBriefcase.explanationSlide = 0;
  broadcastGameState();
  return { success: true, message: "Back to question view." };
}

/*
| LUCKY STAR ASSIGNMENT
*/
function setLuckyStarGroup(groupNumber) {
  const num = parseInt(groupNumber, 10);
  const validGroups = [1, 2, 4, 5, 6, 7, 8, 9];

  if (!validGroups.includes(num)) {
    return { success: false, message: "Invalid group number." };
  }

  // Check constraint: cannot be same as previous Lucky Star's group.
  const previousGroups = gameState.luckyStar.previousGroups;
  const lastGroup = previousGroups[previousGroups.length - 1];

  if (lastGroup !== undefined && lastGroup === num) {
    return {
      success: false,
      message: `Group ${num} was the previous Lucky Star's group. Please choose a different group.`
    };
  }

  gameState.luckyStar.group = num;
  broadcastGameState();

  return { success: true, message: `Lucky Star's group set to ${num}.` };
}

function setLuckyBriefcase(caseNumber) {
  const num = parseInt(caseNumber, 10);

  if (!gameState.briefcases.cases[num]) {
    return { success: false, message: "Invalid briefcase number." };
  }

  if (gameState.briefcases.cases[num].isOpened) {
    return {
      success: false,
      message: `Briefcase ${num} is already opened. Choose an unopened one.`
    };
  }

  gameState.luckyStar.luckyBriefcase = num;
  broadcastGameState();

  return { success: true, message: `Lucky Star's lucky briefcase set to ${num}.` };
}

/*
|--------------------------------------------------------------------------
| BANKER LOGIC
|--------------------------------------------------------------------------
*/

function triggerBankerCall() {
  // Only allow on homepage.
  if (gameState.currentPage !== "homepage") {
    return {
      success: false,
      message: "Banker call only works when TV is on the Homepage."
    };
  }

  // Compute the offer based on current state.
  const result = bankerFormula.calculateBankerOffer(gameState);

  if (!result.success) {
    return { success: false, message: result.message };
  }

  // Determine current round.
  const casesOpened = gameState.briefcases.openOrder.length;
  const currentRound = bankerFormula.determineCurrentRound(casesOpened);

  if (currentRound === 0) {
    return {
      success: false,
      message: "Not enough briefcases opened yet for a banker offer."
    };
  }

  // Store the computed offer (not yet revealed).
  gameState.banker.computedOffer = result.offer;
  gameState.banker.computedForRound = currentRound;
  gameState.banker.currentRound = currentRound;
  gameState.banker.isCalling = true;

  console.log(
    `📞 BANKER CALL for Round ${currentRound}: ₱${result.offer}`
  );
  console.log("Breakdown:", result.breakdown);

  broadcastGameState();

  // Auto-end the call animation after 3 seconds.
  setTimeout(() => {
    gameState.banker.isCalling = false;
    broadcastGameState();
  }, 3000);

  return {
    success: true,
    message:
      `Banker calling! Round ${currentRound} offer computed: ₱${result.offer}. ` +
      `Formula: ${result.breakdown.formula}`
  };
}

function revealBankerOffer(roundNumber) {
  const round = parseInt(roundNumber, 10);

  if (round < 1 || round > 5) {
    return { success: false, message: "Invalid round number." };
  }

  if (gameState.banker.computedOffer === null) {
    return {
      success: false,
      message: "No offer has been computed yet. Use the Banker Call button first."
    };
  }

  if (gameState.banker.computedForRound !== round) {
    return {
      success: false,
      message:
        `Computed offer is for Round ${gameState.banker.computedForRound}. ` +
        `You clicked Round ${round}.`
    };
  }

  // Save the offer.
  gameState.banker.offers[round - 1] = gameState.banker.computedOffer;
  gameState.banker.revealedRound = round;
  gameState.banker.isRevealing = true;

  broadcastGameState();

  return {
    success: true,
    message: `Round ${round} offer revealed: ₱${gameState.banker.computedOffer}`
  };
}

function handleDeal() {
  const round = gameState.banker.computedForRound;
  const offer = gameState.banker.computedOffer;
  const luckyStarGroup = gameState.luckyStar.group;
  const luckyStarName = gameState.luckyStar.name;

  if (offer === null || !round) {
    return {
      success: false,
      message: "No active offer to accept."
    };
  }

  if (!luckyStarGroup) {
    return {
      success: false,
      message: "Lucky Star's group is not set."
    };
  }

  // Add offer amount to Lucky Star's group score.
  gameState.groups[luckyStarGroup].score += offer;

  // Record the deal.
  gameState.banker.dealAccepted = {
    round: round,
    amount: offer,
    group: luckyStarGroup,
    starName: luckyStarName
  };
  gameState.banker.lastDecision = "deal";

  // Add to previousGroups so next Lucky Star cannot be from same group.
  if (luckyStarGroup) {
    gameState.luckyStar.previousGroups.push(luckyStarGroup);
  }

  // Deactivate this Lucky Star (ready for new one via roulette).
  gameState.luckyStar.name = null;
  gameState.luckyStar.group = null;
  gameState.luckyStar.luckyBriefcase = null;

  // Reset computed offer.
  gameState.banker.computedOffer = null;
  gameState.banker.computedForRound = null;

  console.log(
    `💰 DEAL! ${luckyStarName} (Group ${luckyStarGroup}) accepted ₱${offer} at Round ${round}`
  );

  broadcastGameState();

  return {
    success: true,
    message:
      `DEAL! ${luckyStarName} (Group ${luckyStarGroup}) accepted ₱${offer}. ` +
      `Score updated. Spin roulette for a new Lucky Star.`
  };
}

function handleNoDeal() {
  const round = gameState.banker.computedForRound;
  const offer = gameState.banker.computedOffer;
  const luckyStarName = gameState.luckyStar.name;

  if (offer === null) {
    return {
      success: false,
      message: "No active offer to reject."
    };
  }

  gameState.banker.lastDecision = "no_deal";

  // Reset computed offer so next round can start fresh.
  gameState.banker.computedOffer = null;
  gameState.banker.computedForRound = null;

  console.log(
    `❌ NO DEAL! ${luckyStarName} rejected ₱${offer} at Round ${round}`
  );

  broadcastGameState();

  return {
    success: true,
    message: `NO DEAL. ${luckyStarName} rejected ₱${offer}. Game continues.`
  };
}

function revealFinalLuckyBriefcase() {
  const luckyCase = gameState.luckyStar.luckyBriefcase;
  const luckyStarGroup = gameState.luckyStar.group;

  if (!luckyCase) {
    return {
      success: false,
      message: "No Lucky Briefcase is set."
    };
  }

  if (gameState.briefcases.cases[luckyCase].isOpened) {
    return {
      success: false,
      message: "Lucky Briefcase was already opened."
    };
  }

  // Show the QUESTION first (full answer flow), NOT the value.
  // The value is only revealed + added to the Lucky Star's group once the
  // group answers correctly (handled in handleCorrectAnswer).
  gameState.activeBriefcase.caseNumber = luckyCase;
  gameState.activeBriefcase.questionNumber = assignQuestionForCase(luckyCase);
  gameState.activeBriefcase.view = "question";
  gameState.activeBriefcase.questionBlurred = false;
  gameState.activeBriefcase.explanationSlide = 0;

  // Reset + activate buzzer so the Lucky Star's group can answer.
  gameState.buzzer.isActive = true;
  gameState.buzzer.firstPresser = null;
  gameState.buzzer.firstPressTime = null;
  gameState.buzzer.isLocked = false;
  gameState.buzzer.excludedGroups = [];
  gameState.buzzer.pressHistory = [];

  gameState.currentPage = "briefcase";

  console.log(
    `🎁 LUCKY BRIEFCASE ${luckyCase} — question shown, awaiting answer (Group ${luckyStarGroup})`
  );

  broadcastGameState();

  return {
    success: true,
    message:
      `Lucky Briefcase ${luckyCase}: question shown. ` +
      `Awaiting correct answer to reveal the value.`
  };
}

function showGameEndScreen() {
  // Determine winner (highest score).
  let highestScore = -1;
  let winnerGroup = null;
  let winnerTied = false;

  Object.entries(gameState.groups).forEach(([groupNum, data]) => {
    if (data.score > highestScore) {
      highestScore = data.score;
      winnerGroup = parseInt(groupNum, 10);
      winnerTied = false;
    } else if (data.score === highestScore && data.score > 0) {
      winnerTied = true;
    }
  });

  gameState.currentPage = "game_end";
  gameState.gameEnd = {
    winnerGroup: winnerGroup,
    highestScore: highestScore,
    isTied: winnerTied,
    allScores: {}
  };

  Object.entries(gameState.groups).forEach(([groupNum, data]) => {
    gameState.gameEnd.allScores[groupNum] = data.score;
  });

  broadcastGameState();

  return {
    success: true,
    message: winnerTied
      ? `Game over! It's a TIE at ₱${highestScore}!`
      : `Game over! Group ${winnerGroup} wins with ₱${highestScore}!`
  };
}

function goToHomepageFromBriefcase() {
  // Close active briefcase and clear buzzer.
  gameState.activeBriefcase.caseNumber = null;
  gameState.activeBriefcase.questionNumber = null;
  gameState.activeBriefcase.view = "question";
  gameState.activeBriefcase.questionBlurred = false;

  gameState.buzzer.isActive = false;
  gameState.buzzer.firstPresser = null;
  gameState.buzzer.firstPressTime = null;
  gameState.buzzer.isLocked = false;
  gameState.buzzer.excludedGroups = [];

  gameState.currentPage = "homepage";

  broadcastGameState();
  return { success: true, message: "Returned to homepage." };
}

/*
|--------------------------------------------------------------------------
| GAME MODE (rigged vs random)
|--------------------------------------------------------------------------
*/
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateRandomAssignments() {
  const caseNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const shuffledValues = shuffleArray(gameState.briefcases.allValues);
  const shuffledQuestions = shuffleArray(caseNumbers);

  const valueMap = {};
  const questionMap = {};
  caseNumbers.forEach((caseNum, i) => {
    valueMap[caseNum] = shuffledValues[i];
    questionMap[caseNum] = shuffledQuestions[i];
  });

  gameState.briefcases.valueMap = valueMap;
  gameState.briefcases.questionMap = questionMap;

  console.log("🎲 Random assignments generated:", valueMap);
}

function setGameMode(mode) {
  if (mode !== "rigged" && mode !== "random") {
    return { success: false, message: "Invalid mode." };
  }

  gameState.briefcases.mode = mode;

  if (mode === "random") {
    generateRandomAssignments();
  } else {
    gameState.briefcases.valueMap = null;
    gameState.briefcases.questionMap = null;
  }

  console.log(`🎲 Game mode set to: ${mode}`);
  broadcastGameState();

  return {
    success: true,
    message:
      mode === "random"
        ? "Random mode: briefcase values & questions shuffled."
        : "Rigged mode: fixed order restored."
  };
}

/*
|--------------------------------------------------------------------------
| DISCUSSION SLIDESHOW
|--------------------------------------------------------------------------
*/
function discussionNext() {
  const total = gameState.discussion.slides.length;
  if (total === 0) return { success: false, message: "No discussion slides." };
  gameState.discussion.index = (gameState.discussion.index + 1) % total;
  broadcastGameState();
  return {
    success: true,
    message: `Discussion slide ${gameState.discussion.index + 1} of ${total}.`
  };
}

function discussionPrev() {
  const total = gameState.discussion.slides.length;
  if (total === 0) return { success: false, message: "No discussion slides." };
  gameState.discussion.index =
    (gameState.discussion.index - 1 + total) % total;
  broadcastGameState();
  return {
    success: true,
    message: `Discussion slide ${gameState.discussion.index + 1} of ${total}.`
  };
}

/*
|--------------------------------------------------------------------------
| BUZZER TEST
|--------------------------------------------------------------------------
*/
function startBuzzerTest() {
  gameState.buzzerTest.isActive = true;
  gameState.buzzerTest.group7BuzzCount = 0;
  gameState.buzzerTest.lastPress = null;
  gameState.buzzerTest.pressCount = 0;

  // Make the phones "active" too so groups can buzz freely (no lock).
  gameState.buzzer.isActive = true;
  gameState.buzzer.firstPresser = null;
  gameState.buzzer.firstPressTime = null;
  gameState.buzzer.isLocked = false;
  gameState.buzzer.excludedGroups = [];
  gameState.buzzer.pressHistory = [];

  gameState.currentPage = "buzzer_test";
  broadcastGameState();
  return { success: true, message: "Buzzer test started. Groups may buzz freely." };
}

function resetBuzzerTest() {
  gameState.buzzerTest.group7BuzzCount = 0;
  gameState.buzzerTest.lastPress = null;
  gameState.buzzerTest.pressCount = 0;
  broadcastGameState();
  return {
    success: true,
    message: "Buzzer test reset (Group 7 funny sound restored)."
  };
}

function endBuzzerTest() {
  gameState.buzzerTest.isActive = false;
  gameState.buzzerTest.lastPress = null;
  gameState.buzzer.isActive = false;
  broadcastGameState();
  return { success: true, message: "Buzzer test ended." };
}

/*
|--------------------------------------------------------------------------
| SOCKET.IO EVENTS
|--------------------------------------------------------------------------
*/

io.on("connection", (socket) => {
  console.log("Device connected:", socket.id);

  socket.on("register-device", (role) => {
    const allowedRoles = ["tv", "controller", "controller2", "group"];
    if (!allowedRoles.includes(role)) return;
    socket.join(role);

    // Controller 1 → rigged (fixed order). Controller 2 → random (shuffled).
    if (role === "controller2") {
      setGameMode("random");
    } else if (role === "controller") {
      setGameMode("rigged");
    }

    console.log(`${socket.id} registered as ${role}`);
    broadcastGameState();
    sendAvailableGroups();
  });

    /*
  |----------------------------------------------------------------------
  | TEACHER LOGIN (Ginoong Ricky)
  |----------------------------------------------------------------------
  */

  socket.on("teacher-login-attempt", (data, callback) => {
    const password = String(data?.password ?? "");

    if (password !== config.teacherPassword) {
      return callback({
        success: false,
        message: "Mali ang iyong password."
      });
    }

    // Check if already logged in on another device.
    if (
      gameState.teacher.isLoggedIn &&
      gameState.teacher.socketId !== socket.id
    ) {
      return callback({
        success: false,
        message: `${config.teacherName} is already logged in on another device.`
      });
    }

    gameState.teacher.isLoggedIn = true;
    gameState.teacher.socketId = socket.id;
    socket.data.isTeacher = true;

    console.log(`👨‍🏫 ${config.teacherName} logged in.`);
    broadcastGameState();
    sendAvailableGroups();

    callback({
      success: true,
      message: `Welcome, ${config.teacherName}!`,
      teacherName: config.teacherName
    });
  });

  socket.on("teacher-logout", () => {
    if (socket.data.isTeacher) {
      gameState.teacher.isLoggedIn = false;
      gameState.teacher.socketId = null;
      socket.data.isTeacher = false;

      // Auto-hide pause overlay if teacher logs out.
      if (gameState.pauseOverlay.isActive) {
        gameState.pauseOverlay.isActive = false;
        gameState.pauseOverlay.activatedAt = null;
      }

      broadcastGameState();
    }
  });

  socket.on("teacher-toggle-pause", (callback) => {
    if (!socket.data.isTeacher) {
      return callback?.({
        success: false,
        message: "Not authorized."
      });
    }

    gameState.pauseOverlay.isActive = !gameState.pauseOverlay.isActive;
    gameState.pauseOverlay.activatedAt =
      gameState.pauseOverlay.isActive ? Date.now() : null;

    console.log(
      `⏸ Pause overlay: ${gameState.pauseOverlay.isActive ? "ON" : "OFF"}`
    );

    broadcastGameState();

    callback?.({
      success: true,
      isPaused: gameState.pauseOverlay.isActive
    });
  });

  socket.on("group-login-attempt", (data, callback) => {
    const groupNumber = parseInt(data?.groupNumber, 10);
    const password = String(data?.password ?? "");

    if (!gameState.groups[groupNumber]) {
      return callback({ success: false, message: "Invalid group number." });
    }

    if (
      gameState.groups[groupNumber].isLoggedIn &&
      gameState.groups[groupNumber].socketId !== socket.id
    ) {
      return callback({
        success: false,
        message: `Group ${groupNumber} ay naka-logged in na sa ibang device.`
      });
    }

    if (password !== config.groupPasswords[groupNumber]) {
      return callback({
        success: false,
        message: "Mali ang iyong password. Muling subukan."
      });
    }

    gameState.groups[groupNumber].isLoggedIn = true;
    gameState.groups[groupNumber].socketId = socket.id;
    socket.data.groupNumber = groupNumber;

    console.log(`Group ${groupNumber} logged in.`);
    broadcastGameState();
    sendAvailableGroups();

    callback({
      success: true,
      message: `Welcome, Group ${groupNumber}!`,
      groupNumber: groupNumber
    });
  });

  socket.on("group-logout", () => {
    const groupNumber = socket.data.groupNumber;
    if (groupNumber && gameState.groups[groupNumber]) {
      gameState.groups[groupNumber].isLoggedIn = false;
      gameState.groups[groupNumber].socketId = null;
      socket.data.groupNumber = null;
      broadcastGameState();
      sendAvailableGroups();
    }
  });

  socket.on("buzzer-press", (callback) => {
    const groupNumber = socket.data.groupNumber;
    const receivedAt = Date.now();

    if (!groupNumber || !gameState.groups[groupNumber]) {
      return callback?.({
        success: false,
        status: "error",
        message: "Not logged in."
      });
    }

    // BUZZER TEST MODE — no lock, record every press, play sound on TV.
    // Group 7's first buzz of a session uses funny_buzzer, then default.
    if (gameState.buzzerTest.isActive) {
      let sound = "buzzer";
      if (groupNumber === 7) {
        gameState.buzzerTest.group7BuzzCount += 1;
        if (gameState.buzzerTest.group7BuzzCount === 1) {
          sound = "funny_buzzer";
        }
      }
      gameState.buzzerTest.lastPress = {
        group: groupNumber,
        time: receivedAt,
        sound: sound
      };
      gameState.buzzerTest.pressCount += 1;

      console.log(`🧪 BUZZER TEST: Group ${groupNumber} → ${sound}`);
      broadcastGameState();

      return callback?.({
        success: true,
        status: "test",
        message: `Group ${groupNumber} buzzed (test).`
      });
    }

    if (!gameState.buzzer.isActive) {
      return callback?.({
        success: false,
        status: "inactive",
        message: "Buzzer not active."
      });
    }

    if (gameState.buzzer.isLocked) {
      gameState.buzzer.pressHistory.push({
        group: groupNumber,
        time: receivedAt,
        status: "too_slow"
      });
      return callback?.({
        success: false,
        status: "too_slow",
        message: "Someone else was faster!"
      });
    }

    if (gameState.buzzer.excludedGroups.includes(groupNumber)) {
      return callback?.({
        success: false,
        status: "locked_out",
        message: "You are locked out."
      });
    }

    // FIRST PRESSER
    gameState.buzzer.firstPresser = groupNumber;
    gameState.buzzer.firstPressTime = receivedAt;
    gameState.buzzer.isLocked = true;
    gameState.buzzer.pressHistory.push({
      group: groupNumber,
      time: receivedAt,
      status: "first"
    });

    // Blur the question on TV.
    gameState.activeBriefcase.questionBlurred = true;

    console.log(`🔔 Group ${groupNumber} buzzed FIRST`);
    broadcastGameState();

    callback?.({ success: true, status: "first", message: "You buzzed first!" });
  });

  socket.on("controller-action", (actionData, callback) => {
    const action = actionData?.action;
    const params = actionData?.params ?? {};

    console.log("Controller action:", action, params);

    let result = { success: false, message: "Unknown action." };

    switch (action) {
      case "GO_TO_SPLASH":
        result = { success: changePage("splash"), message: "TV → Splash." };
        break;
      case "GO_TO_ROULETTE":
        result = { success: changePage("roulette"), message: "TV → Roulette." };
        break;
      case "GO_TO_HOMEPAGE":
        result = goToHomepageFromBriefcase();
        break;
      case "GO_TO_DISCUSSION":
        result = { success: changePage("discussion"), message: "TV → Discussion." };
        break;
      case "GO_TO_BUZZER_TEST":
        result = startBuzzerTest();
        break;
      case "DISCUSSION_NEXT":
        result = discussionNext();
        break;
      case "DISCUSSION_PREV":
        result = discussionPrev();
        break;
      case "BUZZER_TEST_RESET":
        result = resetBuzzerTest();
        break;
      case "BUZZER_TEST_END":
        result = endBuzzerTest();
        break;
      case "SET_GAME_MODE":
        result = setGameMode(params.mode);
        break;
      case "SPIN_ROULETTE":
        result = startSpin(params.spinType);
        break;
      case "CLOSE_ROULETTE_RESULT":
        result = closeRouletteResult();
        break;
      case "FORCE_LOGOUT_GROUP":
        result = forceLogoutGroup(params.groupNumber);
        break;

      case "ACTIVATE_BUZZER":
        result = activateBuzzer();
        break;
      case "DEACTIVATE_BUZZER":
        result = deactivateBuzzer();
        break;
      case "RESET_BUZZER":
        result = resetBuzzerForNewQuestion();
        break;

      case "OPEN_BRIEFCASE":
        result = openBriefcase(params.caseNumber);
        break;

      case "WRONG_ANSWER":
        result = handleWrongAnswer();
        break;
      case "CORRECT_ANSWER":
        result = handleCorrectAnswer();
        break;

      case "SHOW_EXPLANATION":
        result = showExplanation();
        break;
      case "BACK_TO_QUESTION":
        result = backToQuestion();
        break;

    case "SET_LUCKY_STAR_GROUP":
        result = setLuckyStarGroup(params.groupNumber);
        break;

      case "SET_LUCKY_BRIEFCASE":
        result = setLuckyBriefcase(params.caseNumber);
        break;

              case "BANKER_CALL":
        result = triggerBankerCall();
        break;

      case "REVEAL_BANKER_OFFER":
        result = revealBankerOffer(params.roundNumber);
        break;

      case "DEAL":
        result = handleDeal();
        break;

      case "NO_DEAL":
        result = handleNoDeal();
        break;

    case "REVEAL_LUCKY_BRIEFCASE":
        result = revealFinalLuckyBriefcase();
        break;

      case "SHOW_GAME_END":
        result = showGameEndScreen();
        break;

      default:
        result = { success: false, message: "Action not recognized." };
    }

    if (result.success) broadcastGameState();
    if (typeof callback === "function") callback(result);
  });

    socket.on("disconnect", () => {
    console.log("Device disconnected:", socket.id);

    // Group cleanup.
    const groupNumber = socket.data.groupNumber;
    if (groupNumber && gameState.groups[groupNumber]) {
      if (gameState.groups[groupNumber].socketId === socket.id) {
        gameState.groups[groupNumber].isLoggedIn = false;
        gameState.groups[groupNumber].socketId = null;
        broadcastGameState();
        sendAvailableGroups();
      }
    }

    // Teacher cleanup.
    if (socket.data.isTeacher && gameState.teacher.socketId === socket.id) {
      gameState.teacher.isLoggedIn = false;
      gameState.teacher.socketId = null;

      // Auto-hide pause overlay if teacher disconnects.
      if (gameState.pauseOverlay.isActive) {
        gameState.pauseOverlay.isActive = false;
        gameState.pauseOverlay.activatedAt = null;
      }

      broadcastGameState();
    }
  });
});

function sendAvailableGroups() {
  const available = [];
  Object.entries(gameState.groups).forEach(([groupNum, data]) => {
    if (!data.isLoggedIn) available.push(parseInt(groupNum, 10));
  });
  io.to("group").emit("available-groups", available);
}

function forceLogoutGroup(groupNumber) {
  const num = parseInt(groupNumber, 10);
  if (!gameState.groups[num]) {
    return { success: false, message: "Invalid group." };
  }
  if (!gameState.groups[num].isLoggedIn) {
    return { success: false, message: `Group ${num} not logged in.` };
  }
  const targetSocketId = gameState.groups[num].socketId;
  gameState.groups[num].isLoggedIn = false;
  gameState.groups[num].socketId = null;
  if (targetSocketId) io.to(targetSocketId).emit("force-logout");
  broadcastGameState();
  sendAvailableGroups();
  return { success: true, message: `Group ${num} logged out.` };
}

server.listen(PORT, "0.0.0.0", () => {
  console.log("---------------------------------------");
  console.log("Deal or No Deal server is running!");
  console.log(`Local address: http://localhost:${PORT}`);
  console.log("---------------------------------------");
});