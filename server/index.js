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

const PORT = Number(process.env.PORT) || 3000;
const TOTAL_CASES = 15;
const ANSWER_TIME_MS = 10_000;
const VALID_ANSWERS = ["A", "B", "C", "D"];
const CASE_NUMBERS = Array.from({ length: TOTAL_CASES }, (_, index) => index + 1);
const VALUE_SEQUENCE = [
  1,
  5,
  10,
  25,
  50,
  100,
  500,
  1_000,
  5_000,
  10_000,
  25_000,
  50_000,
  100_000,
  500_000,
  1_000_000
];

function createCases() {
  const cases = {};
  CASE_NUMBERS.forEach((number) => {
    cases[number] = {
      isOpened: false,
      assignedValue: null,
      answeredBy: null
    };
  });
  return cases;
}

function createBriefcases() {
  return {
    mode: "rigged",
    // Controller 1 uses this sequence by OPEN ORDER.
    fixedValueSequence: [...VALUE_SEQUENCE],
    allValues: [...VALUE_SEQUENCE],
    claimedValues: [],
    openOrder: [],
    valueMap: null,
    questionMap: null,
    cases: createCases()
  };
}

const gameState = {
  currentPage: "splash",

  luckyStar: {
    name: null,
    luckyBriefcase: null,
    isLoggedIn: false,
    socketId: null,
    selectedAnswer: null,
    answerLocked: false,
    answerDeadline: null,
    answerTimedOut: false,
    answerJudged: null, // null | "correct" | "wrong"
    correctAnswers: 0,
    answerHistory: []
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

  briefcases: createBriefcases(),

  banker: {
    currentRound: 0,
    offers: [null, null, null, null, null, null],
    computedOffer: null,
    computedBreakdown: null,
    computedForRound: null,
    isCalling: false,
    isRevealing: false,
    revealedRound: null,
    decisionOpen: false,
    dealAccepted: null,
    lastDecision: null,
    decisionSequence: 0,
    autoCalledRound: 0
  },

  activeBriefcase: {
    caseNumber: null,
    questionNumber: null,
    view: "question", // question | explanation | value
    choicesVisible: false,
    dealRevealMode: false,
    questionBlurred: false,
    answerTimedOut: false,
    answerJudged: null,
    correctAnswerHighlighted: false,
    wrongAnswerHighlighted: false,
    explanationSlide: 0
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

  discussion: {
    index: 0,
    slides: []
  }
};

let answerTimer = null;

(function loadDiscussionSlides() {
  const directory = path.join(__dirname, "../public/discussion");
  try {
    if (!fs.existsSync(directory)) return;
    const files = fs.readdirSync(directory)
      .filter((file) => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
      .sort((a, b) => {
        const number = (value) => parseInt((value.match(/\d+/) || ["0"])[0], 10);
        return number(a) - number(b) || a.localeCompare(b);
      });
    gameState.discussion.slides = files.map((file) => `/discussion/${file}`);
  } catch (error) {
    console.error("Error loading discussion slides:", error.message);
  }
})();

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BSIT 1E</title>
      <style>
        body { margin: 0; min-height: 100vh; display: grid; place-items: center;
               background: #001333; color: #fff; font-family: Arial, sans-serif; }
        h1 { opacity: .6; }
      </style>
    </head>
    <body><h1>BSIT 1E</h1></body>
    </html>
  `);
});

app.get("/tv", (req, res) => res.sendFile(path.join(__dirname, "../public/tv/index.html")));
app.get("/controller", (req, res) => res.sendFile(path.join(__dirname, "../public/controller/index.html")));
app.get("/controller2", (req, res) => res.sendFile(path.join(__dirname, "../public/controller2/index.html")));
app.get("/luckystar", (req, res) => res.sendFile(path.join(__dirname, "../public/luckystar/index.html")));
app.get("/teacher", (req, res) => res.sendFile(path.join(__dirname, "../public/teacher/index.html")));

function publicGameState() {
  const publicState = {
    ...gameState,
    luckyStar: {
      ...gameState.luckyStar,
      socketId: undefined
    },
    teacher: {
      isLoggedIn: gameState.teacher.isLoggedIn
    },
    briefcases: {
      ...gameState.briefcases,
      valueMap: undefined,
      questionMap: undefined
    },
    banker: {
      ...gameState.banker,
      progress: bankerFormula.getBankerProgress(
        gameState.briefcases.openOrder.length,
        gameState.banker.autoCalledRound,
        TOTAL_CASES
      )
    }
  };

  const activeQuestionNumber = gameState.activeBriefcase.questionNumber;
  const originalQuestion = activeQuestionNumber
    ? questions[activeQuestionNumber]
    : null;

  if (originalQuestion) {
    publicState.currentQuestion = {
      question: originalQuestion.question,
      choices: originalQuestion.choices,
      explanation: originalQuestion.explanation
    };

    // Do not expose the answer before the host judges it.
    if (gameState.activeBriefcase.answerJudged !== null) {
      publicState.currentQuestion.correctAnswer = originalQuestion.correctAnswer;
    }
  } else {
    publicState.currentQuestion = null;
  }

  return publicState;
}

function broadcastGameState() {
  const state = publicGameState();
  io.to("tv").emit("game-state", state);
  io.to("controller").emit("game-state", state);
  io.to("controller2").emit("game-state", state);
  io.to("luckystar").emit("game-state", state);
}

function changePage(pageName) {
  const allowedPages = ["splash", "roulette", "homepage", "briefcase", "game_end", "discussion"];
  if (!allowedPages.includes(pageName)) return false;
  gameState.currentPage = pageName;
  return true;
}

function getAvailableNames() {
  return gameState.roulette.allNames.filter(
    (name) => !gameState.roulette.usedNames.includes(name)
  );
}

function pickRandomAvailableName() {
  const available = getAvailableNames();
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function determineSpinTarget(spinType) {
  if (spinType === "A") return config.specificNameA;
  if (spinType === "B") return config.specificNameB;
  if (spinType === "Y") return config.specificNameC;
  return pickRandomAvailableName();
}

function resetLuckyStarAnswerState() {
  gameState.luckyStar.selectedAnswer = null;
  gameState.luckyStar.answerLocked = false;
  gameState.luckyStar.answerDeadline = null;
  gameState.luckyStar.answerTimedOut = false;
  gameState.luckyStar.answerJudged = null;
  gameState.activeBriefcase.answerTimedOut = false;
  gameState.activeBriefcase.answerJudged = null;
  gameState.activeBriefcase.correctAnswerHighlighted = false;
  gameState.activeBriefcase.wrongAnswerHighlighted = false;
}

function startSpin(spinType) {
  if (gameState.currentPage !== "roulette") {
    return { success: false, message: "TV must be on the Roulette page first." };
  }
  if (gameState.roulette.showResult || gameState.roulette.isSpinning) {
    return { success: false, message: "Close the current roulette result first." };
  }

  const targetName = determineSpinTarget(spinType);
  if (!targetName) return { success: false, message: "No available name." };

  const targetIndex = gameState.roulette.allNames.indexOf(targetName);
  if (targetIndex < 0) return { success: false, message: "Name not found." };

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
    gameState.luckyStar.selectedAnswer = null;
    gameState.luckyStar.answerJudged = null;
    gameState.luckyStar.answerTimedOut = false;
    gameState.luckyStar.answerLocked = false;
    gameState.luckyStar.answerDeadline = null;
    gameState.luckyStar.luckyBriefcase = null;

    if (!gameState.roulette.usedNames.includes(targetName)) {
      gameState.roulette.usedNames.push(targetName);
    }
    broadcastGameState();
  }, 5000);

  return { success: true, message: `Spinning roulette for ${targetName}.` };
}

function closeRouletteResult() {
  if (!gameState.roulette.showResult) {
    return { success: false, message: "No roulette result is open." };
  }
  gameState.roulette.showResult = false;
  gameState.roulette.resultName = null;
  broadcastGameState();
  return { success: true, message: "Roulette result closed." };
}

function setGameMode(mode) {
  if (mode !== "rigged" && mode !== "random") {
    return { success: false, message: "Invalid game mode." };
  }

  gameState.briefcases.mode = mode;
  if (mode === "random") {
    const shuffledValues = shuffleArray(gameState.briefcases.allValues);
    const shuffledQuestions = shuffleArray(CASE_NUMBERS);
    const valueMap = {};
    const questionMap = {};

    CASE_NUMBERS.forEach((caseNumber, index) => {
      valueMap[caseNumber] = shuffledValues[index];
      questionMap[caseNumber] = shuffledQuestions[index];
    });

    gameState.briefcases.valueMap = valueMap;
    gameState.briefcases.questionMap = questionMap;
  } else {
    gameState.briefcases.valueMap = null;
    gameState.briefcases.questionMap = null;
  }

  broadcastGameState();
  return {
    success: true,
    message: mode === "random"
      ? "Random mode enabled."
      : "Rigged mode enabled."
  };
}

function shuffleArray(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function assignQuestionForCase(caseNumber) {
  if (gameState.briefcases.mode === "random" && gameState.briefcases.questionMap) {
    return gameState.briefcases.questionMap[caseNumber] ?? caseNumber;
  }
  return gameState.briefcases.openOrder.length + 1;
}

function clearAnswerTimer() {
  if (answerTimer) clearTimeout(answerTimer);
  answerTimer = null;
}

function startAnswerTimer(caseNumber) {
  clearAnswerTimer();
  gameState.luckyStar.answerDeadline = Date.now() + ANSWER_TIME_MS;

  answerTimer = setTimeout(() => {
    if (gameState.activeBriefcase.caseNumber !== caseNumber) return;
    if (gameState.luckyStar.answerJudged !== null) return;
    if (gameState.luckyStar.answerLocked) return;

    gameState.luckyStar.answerLocked = true;
    gameState.luckyStar.answerDeadline = null;
    gameState.luckyStar.answerTimedOut = true;
    gameState.activeBriefcase.answerTimedOut = true;
    gameState.activeBriefcase.questionBlurred = true;
    broadcastGameState();
  }, ANSWER_TIME_MS);
}

function openBriefcase(caseNumber) {
  const number = parseInt(caseNumber, 10);
  const caseData = gameState.briefcases.cases[number];

  if (!caseData) return { success: false, message: "Invalid briefcase number." };
  if (gameState.currentPage !== "homepage") {
    return { success: false, message: "TV must be on the Homepage before opening a briefcase." };
  }
  if (!gameState.luckyStar.name || !gameState.luckyStar.luckyBriefcase) {
    return { success: false, message: "Set the Lucky Star name and Lucky Briefcase first." };
  }
  if (caseData.isOpened) return { success: false, message: "Briefcase is already opened." };
  if (number === gameState.luckyStar.luckyBriefcase) {
    return { success: false, message: "That is the Lucky Briefcase. It is reserved for the final reveal." };
  }

  clearAnswerTimer();
  resetLuckyStarAnswerState();
  gameState.activeBriefcase.caseNumber = number;
  gameState.activeBriefcase.questionNumber = assignQuestionForCase(number);
  gameState.activeBriefcase.view = "question";
  gameState.activeBriefcase.choicesVisible = false;
  gameState.activeBriefcase.dealRevealMode = false;
  gameState.activeBriefcase.questionBlurred = false;
  gameState.activeBriefcase.explanationSlide = 0;
  gameState.currentPage = "briefcase";
  clearAnswerTimer();
  broadcastGameState();

  return {
    success: true,
    message: `Briefcase ${number} opened. Press SHOW CHOICES / START TIMER.`
  };
}

function showChoicesAndStartTimer() {
  if (!gameState.activeBriefcase.caseNumber || gameState.currentPage !== "briefcase") {
    return { success: false, message: "Walang aktibong tanong." };
  }
  if (gameState.activeBriefcase.dealRevealMode) {
    return { success: false, message: "Deal-special reveal already shows the choices." };
  }
  if (gameState.activeBriefcase.choicesVisible) {
    return { success: false, message: "Choices and timer are already active." };
  }

  gameState.activeBriefcase.choicesVisible = true;
  startAnswerTimer(gameState.activeBriefcase.caseNumber);
  broadcastGameState();
  return { success: true, message: "Choices shown and 10-second timer started." };
}

function openFinalLuckyBriefcase() {
  const luckyCase = gameState.luckyStar.luckyBriefcase;
  if (!luckyCase) return { success: false, message: "Set the Lucky Briefcase first." };
  if (!gameState.luckyStar.name) return { success: false, message: "No Lucky Star is selected." };
  if (gameState.currentPage !== "homepage") {
    return { success: false, message: "TV must be on the Homepage first." };
  }
  if (gameState.briefcases.cases[luckyCase].isOpened) {
    return { success: false, message: "Lucky Briefcase is already opened." };
  }

  const dealSpecial = gameState.banker.lastDecision === "deal";
  const unopenedRegularCases = Object.entries(gameState.briefcases.cases)
    .filter(([number, data]) => !data.isOpened && parseInt(number, 10) !== luckyCase);

  if (!dealSpecial && unopenedRegularCases.length !== 0) {
    return { success: false, message: "Open the last regular briefcase before the Lucky Briefcase." };
  }

  clearAnswerTimer();
  resetLuckyStarAnswerState();
  gameState.activeBriefcase.caseNumber = luckyCase;
  gameState.activeBriefcase.questionNumber = assignQuestionForCase(luckyCase);
  gameState.activeBriefcase.view = "question";
  gameState.activeBriefcase.choicesVisible = dealSpecial;
  gameState.activeBriefcase.dealRevealMode = dealSpecial;
  gameState.activeBriefcase.questionBlurred = false;
  gameState.activeBriefcase.explanationSlide = 0;
  gameState.currentPage = "briefcase";
  if (!dealSpecial) {
    clearAnswerTimer();
  }
  broadcastGameState();

  return {
    success: true,
    message: dealSpecial
      ? "Deal-special Lucky Briefcase question opened."
      : "Final Lucky Briefcase question opened. Press SHOW CHOICES / START TIMER."
  };
}

function setLuckyBriefcase(caseNumber) {
  const number = parseInt(caseNumber, 10);
  if (!gameState.luckyStar.name) {
    return { success: false, message: "Spin roulette for a Lucky Star first." };
  }
  if (!gameState.briefcases.cases[number]) {
    return { success: false, message: "Invalid Lucky Briefcase." };
  }
  if (gameState.briefcases.cases[number].isOpened) {
    return { success: false, message: "That briefcase is already opened." };
  }
  gameState.luckyStar.luckyBriefcase = number;
  broadcastGameState();
  return { success: true, message: `Lucky Briefcase set to ${number}.` };
}

function selectLuckyStarAnswer(answer, socket, callback) {
  const normalized = String(answer || "").toUpperCase();
  if (!socket.data.isLuckyStar || gameState.luckyStar.socketId !== socket.id) {
    return callback?.({ success: false, message: "Kailangan munang mag-login bilang Lucky Star." });
  }
  if (!VALID_ANSWERS.includes(normalized)) {
    return callback?.({ success: false, message: "Hindi valid ang piniling sagot." });
  }
  if (!gameState.activeBriefcase.caseNumber || gameState.currentPage !== "briefcase") {
    return callback?.({ success: false, message: "Walang aktibong tanong." });
  }
  if (!gameState.activeBriefcase.choicesVisible || gameState.activeBriefcase.dealRevealMode) {
    return callback?.({ success: false, message: "Hintayin ang controller na ipakita ang choices." });
  }
  if (gameState.luckyStar.answerLocked || gameState.luckyStar.answerJudged !== null) {
    return callback?.({ success: false, message: "Naka-lock na ang pagpili ng sagot." });
  }

  gameState.luckyStar.selectedAnswer = normalized;
  broadcastGameState();
  callback?.({ success: true, answer: normalized });
}

function ensureJudgingReady() {
  if (!gameState.activeBriefcase.caseNumber) {
    return { success: false, message: "Walang aktibong tanong." };
  }
  if (!gameState.luckyStar.answerLocked) {
    return { success: false, message: "Wait for the 10-second answer timer to finish." };
  }
  if (gameState.luckyStar.answerJudged !== null) {
    return { success: false, message: "This answer was already judged." };
  }
  return null;
}

function handleWrongAnswer() {
  const readyError = ensureJudgingReady();
  if (readyError) return readyError;

  gameState.luckyStar.answerJudged = "wrong";
  gameState.luckyStar.answerDeadline = null;
  gameState.activeBriefcase.answerJudged = "wrong";
  gameState.activeBriefcase.questionBlurred = false;
  gameState.activeBriefcase.correctAnswerHighlighted = false;
  gameState.activeBriefcase.wrongAnswerHighlighted = Boolean(
    gameState.luckyStar.selectedAnswer
  );
  broadcastGameState();

  return {
    success: true,
    message: "Answer marked wrong. No retry; continue to the explanation." 
  };
}

function judgeLuckyStarAnswer() {
  if (gameState.activeBriefcase.dealRevealMode) {
    const question = questions[gameState.activeBriefcase.questionNumber];
    gameState.luckyStar.answerLocked = true;
    gameState.luckyStar.answerJudged = "correct";
    gameState.activeBriefcase.answerJudged = "correct";
    gameState.activeBriefcase.questionBlurred = false;
    gameState.activeBriefcase.correctAnswerHighlighted = true;
    broadcastGameState();

    return {
      success: true,
      message: `Correct answer is ${question?.correctAnswer || "revealed"}. Show the explanation before the prize.`
    };
  }

  const readyError = ensureJudgingReady();
  if (readyError) return readyError;

  const question = questions[gameState.activeBriefcase.questionNumber];
  const selected = gameState.luckyStar.selectedAnswer;
  const isCorrect = Boolean(selected && question && selected === question.correctAnswer);
  const result = isCorrect ? "correct" : "wrong";

  gameState.luckyStar.answerJudged = result;
  gameState.luckyStar.answerDeadline = null;
  gameState.activeBriefcase.answerJudged = result;
  gameState.activeBriefcase.questionBlurred = false;
  gameState.activeBriefcase.correctAnswerHighlighted = isCorrect;
  gameState.activeBriefcase.wrongAnswerHighlighted = !isCorrect && Boolean(selected);

  if (isCorrect) {
    gameState.luckyStar.correctAnswers += 1;
    gameState.luckyStar.answerHistory.push({
      caseNumber: gameState.activeBriefcase.caseNumber,
      questionNumber: gameState.activeBriefcase.questionNumber,
      selectedAnswer: selected,
      correctAnswer: question?.correctAnswer ?? null,
      result: "correct"
    });
  }

  broadcastGameState();
  return {
    success: true,
    result,
    message: isCorrect
      ? "Correct answer. The correct choice is now green."
      : "Wrong or no answer. The selected choice is red and the correct choice is green."
  };
}

function revealActiveBriefcaseValue() {
  const caseNumber = gameState.activeBriefcase.caseNumber;
  if (!caseNumber) return { success: false, message: "No active briefcase." };

  const caseData = gameState.briefcases.cases[caseNumber];
  if (caseData.isOpened) {
    gameState.activeBriefcase.view = "value";
    broadcastGameState();
    return { success: true, message: "Value already revealed." };
  }

  const openIndex = gameState.briefcases.openOrder.length;
  const value = gameState.activeBriefcase.dealRevealMode
    ? (gameState.briefcases.mode === "random" && gameState.briefcases.valueMap
      ? gameState.briefcases.valueMap[caseNumber]
      : gameState.briefcases.fixedValueSequence[gameState.briefcases.fixedValueSequence.length - 1])
    : (gameState.briefcases.mode === "random" && gameState.briefcases.valueMap
      ? gameState.briefcases.valueMap[caseNumber]
      : gameState.briefcases.fixedValueSequence[openIndex]);

  caseData.isOpened = true;
  caseData.assignedValue = value;
  caseData.answeredBy = "lucky-star";
  gameState.briefcases.openOrder.push(caseNumber);
  gameState.briefcases.claimedValues.push(value);

  gameState.activeBriefcase.view = "value";
  gameState.activeBriefcase.questionBlurred = false;
  gameState.activeBriefcase.correctAnswerHighlighted = false;
  gameState.activeBriefcase.wrongAnswerHighlighted = false;
  broadcastGameState();

  return { success: true, message: `Value revealed: ₱${value}.` };
}

function showExplanation() {
  if (!gameState.activeBriefcase.caseNumber) {
    return { success: false, message: "No active briefcase." };
  }
  if (!gameState.luckyStar.answerJudged) {
    return { success: false, message: "Judge the Lucky Star answer first." };
  }

  const question = questions[gameState.activeBriefcase.questionNumber];
  const slides = question?.explanation?.slides || [];

  if (gameState.activeBriefcase.view === "question") {
    if (slides.length === 0) return revealActiveBriefcaseValue();
    gameState.activeBriefcase.view = "explanation";
    gameState.activeBriefcase.explanationSlide = 0;
    gameState.activeBriefcase.correctAnswerHighlighted = false;
    gameState.activeBriefcase.wrongAnswerHighlighted = false;
    broadcastGameState();
    return { success: true, message: `Showing explanation slide 1 of ${slides.length}.` };
  }

  if (gameState.activeBriefcase.view === "explanation") {
    const current = gameState.activeBriefcase.explanationSlide;
    if (current < slides.length - 1) {
      gameState.activeBriefcase.explanationSlide = current + 1;
      broadcastGameState();
      return {
        success: true,
        message: `Showing explanation slide ${current + 2} of ${slides.length}.`
      };
    }

    // The next click after the last slide reveals the price.
    return revealActiveBriefcaseValue();
  }

  return { success: false, message: "Price is already shown." };
}

function backToQuestion() {
  if (!gameState.activeBriefcase.caseNumber) {
    return { success: false, message: "No active briefcase." };
  }
  gameState.activeBriefcase.view = "question";
  gameState.activeBriefcase.questionBlurred = false;
  broadcastGameState();
  return { success: true, message: "Back to question review." };
}

function goToHomepageFromBriefcase() {
  const cancelledQuestion = Boolean(
    gameState.activeBriefcase.caseNumber &&
    gameState.activeBriefcase.view !== "value"
  );

  const finalCaseValue = gameState.luckyStar.luckyBriefcase
    ? gameState.briefcases.cases[gameState.luckyStar.luckyBriefcase]?.assignedValue
    : null;
  const isComplete = gameState.briefcases.openOrder.length === TOTAL_CASES;

  clearAnswerTimer();
  gameState.activeBriefcase = {
    caseNumber: null,
    questionNumber: null,
    view: "question",
    choicesVisible: false,
    dealRevealMode: false,
    questionBlurred: false,
    answerTimedOut: false,
    answerJudged: null,
    correctAnswerHighlighted: false,
    wrongAnswerHighlighted: false,
    explanationSlide: 0
  };
  gameState.luckyStar.selectedAnswer = null;
  gameState.luckyStar.answerLocked = false;
  gameState.luckyStar.answerDeadline = null;
  gameState.luckyStar.answerTimedOut = false;
  gameState.luckyStar.answerJudged = null;
  if (isComplete) {
    gameState.gameEnd = {
      outcome: "no_deal",
      starName: gameState.luckyStar.name,
      finalValue: finalCaseValue,
      correctAnswers: gameState.luckyStar.correctAnswers
    };
  }
  gameState.currentPage = "homepage";
  broadcastGameState();
  maybeAutoBankerCall();
  return {
    success: true,
    message: cancelledQuestion
      ? "Returned to Homepage. Active question cancelled."
      : "Returned to Homepage."
  };
}

function triggerBankerCall() {
  if (gameState.currentPage !== "homepage") {
    return { success: false, message: "Banker call requires the Homepage." };
  }
  if (!gameState.luckyStar.name || !gameState.luckyStar.luckyBriefcase) {
    return { success: false, message: "Set the Lucky Star and Lucky Briefcase first." };
  }

  const result = bankerFormula.calculateBankerOffer(gameState);
  if (!result.success) return { success: false, message: result.message };

  const currentRound = bankerFormula.determineCurrentRound(
    gameState.briefcases.openOrder.length
  );
  if (currentRound === 0) {
    return { success: false, message: "Not enough opened briefcases for an offer." };
  }

  gameState.banker.computedOffer = result.offer;
  gameState.banker.computedBreakdown = result.breakdown;
  gameState.banker.computedForRound = currentRound;
  gameState.banker.currentRound = currentRound;
  gameState.banker.isCalling = true;
  gameState.banker.decisionOpen = false;
  broadcastGameState();

  setTimeout(() => {
    gameState.banker.isCalling = false;
    broadcastGameState();
  }, 3000);

  return {
    success: true,
    message: `Banker Round ${currentRound} offer computed: ₱${result.offer}.`
  };
}

function maybeAutoBankerCall() {
  const currentRound = bankerFormula.determineCurrentRound(
    gameState.briefcases.openOrder.length
  );
  if (currentRound === 0) return null;
  if (currentRound <= gameState.banker.autoCalledRound) return null;

  const result = triggerBankerCall();
  if (result?.success) gameState.banker.autoCalledRound = currentRound;
  return result;
}

function revealBankerOffer(roundNumber) {
  const round = parseInt(roundNumber, 10);
  if (round < 1 || round > 6) return { success: false, message: "Invalid round." };
  if (gameState.banker.computedOffer === null) {
    return { success: false, message: "No computed offer yet." };
  }
  if (gameState.banker.computedForRound !== round) {
    return { success: false, message: "That is not the current offer round." };
  }

  gameState.banker.offers[round - 1] = gameState.banker.computedOffer;
  gameState.banker.revealedRound = round;
  gameState.banker.isRevealing = true;
  gameState.banker.decisionOpen = true;
  broadcastGameState();

  return { success: true, message: `Offer ${round} revealed.` };
}

function decisionIsOpen() {
  return Boolean(
    gameState.banker.decisionOpen &&
    gameState.banker.computedOffer !== null &&
    gameState.banker.revealedRound === gameState.banker.computedForRound &&
    gameState.banker.lastDecision === null
  );
}

function handleDeal() {
  if (!decisionIsOpen()) {
    return { success: false, message: "Deal or No Deal is not open yet." };
  }

  const amount = gameState.banker.computedOffer;
  const round = gameState.banker.computedForRound;
  gameState.banker.lastDecision = "deal";
  gameState.banker.decisionSequence += 1;
  gameState.banker.decisionOpen = false;
  gameState.banker.dealAccepted = {
    round,
    amount,
    starName: gameState.luckyStar.name,
    correctAnswers: gameState.luckyStar.correctAnswers
  };
  gameState.gameEnd = {
    outcome: "deal",
    starName: gameState.luckyStar.name,
    amount,
    correctAnswers: gameState.luckyStar.correctAnswers
  };
  // Stay on the current Homepage while the DEAL popup is shown. The
  // controller can explicitly open the final Lucky Briefcase or game-end page.
  gameState.currentPage = "homepage";
  broadcastGameState();
  return { success: true, message: `DEAL accepted for ₱${amount}.` };
}

function handleNoDeal() {
  if (!decisionIsOpen()) {
    return { success: false, message: "Deal or No Deal is not open yet." };
  }

  const amount = gameState.banker.computedOffer;
  const round = gameState.banker.computedForRound;
  gameState.banker.lastDecision = "no_deal";
  gameState.banker.decisionSequence += 1;
  gameState.banker.decisionOpen = false;
  gameState.banker.computedOffer = null;
  gameState.banker.computedBreakdown = null;
  gameState.banker.computedForRound = null;
  broadcastGameState();

  setTimeout(() => {
    if (gameState.banker.lastDecision === "no_deal") {
      gameState.banker.lastDecision = null;
      broadcastGameState();
    }
  }, 0);

  return { success: true, message: `NO DEAL. Offer ₱${amount} rejected.` };
}

function showGameEndScreen() {
  if (!gameState.gameEnd) {
    return { success: false, message: "No game-end result is ready." };
  }
  gameState.currentPage = "game_end";
  broadcastGameState();
  return { success: true, message: "Showing game-end screen." };
}

function discussionNext() {
  const total = gameState.discussion.slides.length;
  if (total === 0) return { success: false, message: "No discussion slides." };
  gameState.discussion.index = (gameState.discussion.index + 1) % total;
  broadcastGameState();
  return { success: true, message: "Next discussion slide." };
}

function discussionPrev() {
  const total = gameState.discussion.slides.length;
  if (total === 0) return { success: false, message: "No discussion slides." };
  gameState.discussion.index = (gameState.discussion.index - 1 + total) % total;
  broadcastGameState();
  return { success: true, message: "Previous discussion slide." };
}

function forceClearPause() {
  gameState.pauseOverlay.isActive = false;
  gameState.pauseOverlay.activatedAt = null;
  if (gameState.teacher.isLoggedIn) {
    const teacherSocketId = gameState.teacher.socketId;
    gameState.teacher.isLoggedIn = false;
    gameState.teacher.socketId = null;
    const teacherSocket = io.sockets.sockets.get(teacherSocketId);
    if (teacherSocket) {
      teacherSocket.data.isTeacher = false;
      teacherSocket.emit("force-logout");
    }
  }
  broadcastGameState();
  return { success: true, message: "Pause cleared and teacher logged out." };
}

function forceLogoutLuckyStar() {
  if (!gameState.luckyStar.isLoggedIn) {
    return { success: false, message: "Lucky Star is not logged in." };
  }
  const socketId = gameState.luckyStar.socketId;
  gameState.luckyStar.isLoggedIn = false;
  gameState.luckyStar.socketId = null;
  const luckySocket = io.sockets.sockets.get(socketId);
  if (luckySocket) {
    luckySocket.data.isLuckyStar = false;
    luckySocket.emit("force-logout");
  }
  broadcastGameState();
  return { success: true, message: "Lucky Star logged out." };
}

io.on("connection", (socket) => {
  socket.on("register-device", (role) => {
    const allowedRoles = ["tv", "controller", "controller2", "luckystar", "teacher"];
    if (!allowedRoles.includes(role)) return;
    socket.data.role = role;
    socket.join(role);

    if (role === "controller2") setGameMode("random");
    if (role === "controller") setGameMode("rigged");

    broadcastGameState();
  });

  socket.on("controller-login-attempt", (data, callback) => {
    const password = String(data?.password ?? "");
    if (password !== config.controllerPassword) {
      return callback?.({ success: false, message: "Invalid controller password." });
    }
    socket.data.isController = true;
    callback?.({ success: true, message: "Controller unlocked." });
  });

  socket.on("teacher-login-attempt", (data, callback) => {
    const password = String(data?.password ?? "");
    if (password !== config.teacherPassword) {
      return callback?.({ success: false, message: "Incorrect teacher password." });
    }
    if (gameState.teacher.isLoggedIn && gameState.teacher.socketId !== socket.id) {
      return callback?.({ success: false, message: "Teacher is already logged in." });
    }
    gameState.teacher.isLoggedIn = true;
    gameState.teacher.socketId = socket.id;
    socket.data.isTeacher = true;
    broadcastGameState();
    callback?.({ success: true, teacherName: config.teacherName });
  });

  socket.on("teacher-logout", () => {
    if (!socket.data.isTeacher) return;
    gameState.teacher.isLoggedIn = false;
    gameState.teacher.socketId = null;
    socket.data.isTeacher = false;
    gameState.pauseOverlay.isActive = false;
    gameState.pauseOverlay.activatedAt = null;
    broadcastGameState();
  });

  socket.on("teacher-toggle-pause", (callback) => {
    if (!socket.data.isTeacher) {
      return callback?.({ success: false, message: "Not authorized." });
    }
    gameState.pauseOverlay.isActive = !gameState.pauseOverlay.isActive;
    gameState.pauseOverlay.activatedAt = gameState.pauseOverlay.isActive
      ? Date.now()
      : null;
    broadcastGameState();
    callback?.({ success: true, isPaused: gameState.pauseOverlay.isActive });
  });

  socket.on("luckystar-login-attempt", (data, callback) => {
    const password = String(data?.password ?? "");
    if (password !== config.luckyStarPassword) {
      return callback?.({ success: false, message: "Mali ang password ng Lucky Star." });
    }
    if (gameState.luckyStar.isLoggedIn && gameState.luckyStar.socketId !== socket.id) {
      return callback?.({ success: false, message: "May naka-login nang ibang Lucky Star device." });
    }
    gameState.luckyStar.isLoggedIn = true;
    gameState.luckyStar.socketId = socket.id;
    socket.data.isLuckyStar = true;
    broadcastGameState();
    callback?.({ success: true, name: gameState.luckyStar.name });
  });

  socket.on("luckystar-logout", () => {
    if (!socket.data.isLuckyStar) return;
    gameState.luckyStar.isLoggedIn = false;
    gameState.luckyStar.socketId = null;
    socket.data.isLuckyStar = false;
    broadcastGameState();
  });

  socket.on("luckystar-answer-select", (answer, callback) => {
    selectLuckyStarAnswer(answer, socket, callback);
  });

  socket.on("lucky-star-decision", (decision, callback) => {
    if (!socket.data.isLuckyStar || gameState.luckyStar.socketId !== socket.id) {
      return callback?.({ success: false, message: "Kailangan munang mag-login bilang Lucky Star." });
    }
    const result = String(decision).toLowerCase() === "deal"
      ? handleDeal()
      : handleNoDeal();
    callback?.(result);
  });

  socket.on("controller-action", (actionData, callback) => {
    if (!socket.data.isController) {
      return callback?.({ success: false, message: "Controller login required." });
    }

    const action = actionData?.action;
    const params = actionData?.params ?? {};
    let result;

    switch (action) {
      case "GO_TO_SPLASH": result = { success: changePage("splash"), message: "TV → Splash." }; break;
      case "GO_TO_ROULETTE": result = { success: changePage("roulette"), message: "TV → Roulette." }; break;
      case "GO_TO_HOMEPAGE": result = goToHomepageFromBriefcase(); break;
      case "GO_TO_DISCUSSION": result = { success: changePage("discussion"), message: "TV → Discussion." }; break;
      case "DISCUSSION_NEXT": result = discussionNext(); break;
      case "DISCUSSION_PREV": result = discussionPrev(); break;
      case "FORCE_CLEAR_PAUSE": result = forceClearPause(); break;
      case "FORCE_LOGOUT_LUCKY_STAR": result = forceLogoutLuckyStar(); break;
      case "SET_GAME_MODE": result = setGameMode(params.mode); break;
      case "SPIN_ROULETTE": result = startSpin(params.spinType); break;
      case "CLOSE_ROULETTE_RESULT": result = closeRouletteResult(); break;
      case "SET_LUCKY_BRIEFCASE": result = setLuckyBriefcase(params.caseNumber); break;
      case "OPEN_BRIEFCASE": result = openBriefcase(params.caseNumber); break;
      case "SHOW_CHOICES_START_TIMER": result = showChoicesAndStartTimer(); break;
      case "JUDGE_ANSWER": result = judgeLuckyStarAnswer(); break;
      case "SHOW_EXPLANATION": result = showExplanation(); break;
      case "BACK_TO_QUESTION": result = backToQuestion(); break;
      case "REVEAL_LUCKY_BRIEFCASE": result = openFinalLuckyBriefcase(); break;
      case "REVEAL_BANKER_OFFER": result = revealBankerOffer(params.roundNumber); break;
      case "DEAL": result = handleDeal(); break;
      case "NO_DEAL": result = handleNoDeal(); break;
      case "SHOW_GAME_END": result = showGameEndScreen(); break;
      default: result = { success: false, message: "Unknown controller action." };
    }

    if (result?.success && action !== "DEAL" && action !== "NO_DEAL") {
      broadcastGameState();
    }
    callback?.(result || { success: false, message: "No result." });
  });

  socket.on("disconnect", () => {
    if (socket.data.isTeacher && gameState.teacher.socketId === socket.id) {
      gameState.teacher.isLoggedIn = false;
      gameState.teacher.socketId = null;
      if (gameState.pauseOverlay.isActive) {
        gameState.pauseOverlay.isActive = false;
        gameState.pauseOverlay.activatedAt = null;
      }
    }

    if (socket.data.isLuckyStar && gameState.luckyStar.socketId === socket.id) {
      gameState.luckyStar.isLoggedIn = false;
      gameState.luckyStar.socketId = null;
    }
    broadcastGameState();
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Deal or No Deal server running on port ${PORT}`);
});
