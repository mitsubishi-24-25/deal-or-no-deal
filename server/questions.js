/*
|--------------------------------------------------------------------------
| QUESTIONS DATA
|--------------------------------------------------------------------------
| 15 questions, isa per briefcase (1-15).
| Palitan mo ito ng actual questions ng reviewer ninyo.
|
| Structure:
|   question:      Main question text
|   choices:       Array of 4 choices (A, B, C, D)
|   correctAnswer: Which letter is correct ("A", "B", "C", or "D")
|   explanation:   Object with "slides" array (for later phase)
*/

const questions = {
  1: {
    question:
      "Alin sa mga sumusunod ang HINDI kabilang sa tatlong klasipikasyon ng syudad ng mall ayon kay Morales-Nuncio?",
    choices: [
      { letter: "A", text: "Pagbabakod" },
      { letter: "B", text: "Pagbubukod" },
      { letter: "C", text: "Pagbabalikwas" },
      { letter: "D", text: "Pagbubuklod" }
    ],
    correctAnswer: "C",
    explanation: {
      slides: [
        {
          title: "3 Klasipikasyon ng Syudad ng Mall mula sa Pananaw ni Morales-Nuncio",
          bullets: [
            "Pagbabakod",
            "Pagbubukod",
            "Pagbubuklod"
          ]
        }
      ]
    }
  },

  2: {
    question:
      "Sample question 2 — palitan mo ito ng totoong question.",
    choices: [
      { letter: "A", text: "Choice A" },
      { letter: "B", text: "Choice B" },
      { letter: "C", text: "Choice C" },
      { letter: "D", text: "Choice D" }
    ],
    correctAnswer: "A",
    explanation: {
      slides: [
        {
          title: "Explanation for Question 2",
          bullets: [
            "Point 1",
            "Point 2",
            "Point 3"
          ]
        }
      ]
    }
  },

  3: {
    question: "Sample question 3.",
    choices: [
      { letter: "A", text: "Choice A" },
      { letter: "B", text: "Choice B" },
      { letter: "C", text: "Choice C" },
      { letter: "D", text: "Choice D" }
    ],
    correctAnswer: "B",
    explanation: {
      slides: [
        {
          title: "Explanation slide 1",
          bullets: ["Bullet 1", "Bullet 2"]
        },
        {
          title: "Explanation slide 2",
          bullets: ["More info here"]
        }
      ]
    }
  },

  4: {
    question: "Sample question 4.",
    choices: [
      { letter: "A", text: "Choice A" },
      { letter: "B", text: "Choice B" },
      { letter: "C", text: "Choice C" },
      { letter: "D", text: "Choice D" }
    ],
    correctAnswer: "D",
    explanation: {
      slides: [
        {
          title: "Explanation for Question 4",
          bullets: ["Explanation content"]
        }
      ]
    }
  },

  5: {
    question: "Sample question 5.",
    choices: [
      { letter: "A", text: "Choice A" },
      { letter: "B", text: "Choice B" },
      { letter: "C", text: "Choice C" },
      { letter: "D", text: "Choice D" }
    ],
    correctAnswer: "C",
    explanation: {
      slides: [
        {
          title: "Explanation for Question 5",
          bullets: ["Explanation content"]
        }
      ]
    }
  },

  6: {
    question: "Sample question 6.",
    choices: [
      { letter: "A", text: "Choice A" },
      { letter: "B", text: "Choice B" },
      { letter: "C", text: "Choice C" },
      { letter: "D", text: "Choice D" }
    ],
    correctAnswer: "A",
    explanation: {
      slides: [
        {
          title: "Explanation for Question 6",
          bullets: ["Explanation content"]
        }
      ]
    }
  },

  7: {
    question: "Sample question 7.",
    choices: [
      { letter: "A", text: "Choice A" },
      { letter: "B", text: "Choice B" },
      { letter: "C", text: "Choice C" },
      { letter: "D", text: "Choice D" }
    ],
    correctAnswer: "B",
    explanation: {
      slides: [
        {
          title: "Explanation for Question 7",
          bullets: ["Explanation content"]
        }
      ]
    }
  },

  8: {
    question: "Sample question 8.",
    choices: [
      { letter: "A", text: "Choice A" },
      { letter: "B", text: "Choice B" },
      { letter: "C", text: "Choice C" },
      { letter: "D", text: "Choice D" }
    ],
    correctAnswer: "D",
    explanation: {
      slides: [
        {
          title: "Explanation for Question 8",
          bullets: ["Explanation content"]
        }
      ]
    }
  },

  9: {
    question: "Sample question 9.",
    choices: [
      { letter: "A", text: "Choice A" },
      { letter: "B", text: "Choice B" },
      { letter: "C", text: "Choice C" },
      { letter: "D", text: "Choice D" }
    ],
    correctAnswer: "C",
    explanation: {
      slides: [
        {
          title: "Explanation for Question 9",
          bullets: ["Explanation content"]
        }
      ]
    }
  },

  10: {
    question: "Sample question 10.",
    choices: [
      { letter: "A", text: "Choice A" },
      { letter: "B", text: "Choice B" },
      { letter: "C", text: "Choice C" },
      { letter: "D", text: "Choice D" }
    ],
    correctAnswer: "A",
    explanation: {
      slides: [
        {
          title: "Explanation for Question 10",
          bullets: ["Explanation content"]
        }
      ]
    }
  },

  11: {
    question: "Placeholder question 11 — replace this with the actual reviewer question.",
    choices: [
      { letter: "A", text: "Choice A" },
      { letter: "B", text: "Choice B" },
      { letter: "C", text: "Choice C" },
      { letter: "D", text: "Choice D" }
    ],
    correctAnswer: "A",
    explanation: {
      slides: [
        {
          title: "Explanation for Question 11",
          bullets: ["Replace this placeholder explanation."]
        }
      ]
    }
  },

  12: {
    question: "Placeholder question 12 — replace this with the actual reviewer question.",
    choices: [
      { letter: "A", text: "Choice A" },
      { letter: "B", text: "Choice B" },
      { letter: "C", text: "Choice C" },
      { letter: "D", text: "Choice D" }
    ],
    correctAnswer: "A",
    explanation: {
      slides: [
        {
          title: "Explanation for Question 12",
          bullets: ["Replace this placeholder explanation."]
        }
      ]
    }
  },

  13: {
    question: "Placeholder question 13 — replace this with the actual reviewer question.",
    choices: [
      { letter: "A", text: "Choice A" },
      { letter: "B", text: "Choice B" },
      { letter: "C", text: "Choice C" },
      { letter: "D", text: "Choice D" }
    ],
    correctAnswer: "A",
    explanation: {
      slides: [
        {
          title: "Explanation for Question 13",
          bullets: ["Replace this placeholder explanation."]
        }
      ]
    }
  },

  14: {
    question: "Placeholder question 14 — replace this with the actual reviewer question.",
    choices: [
      { letter: "A", text: "Choice A" },
      { letter: "B", text: "Choice B" },
      { letter: "C", text: "Choice C" },
      { letter: "D", text: "Choice D" }
    ],
    correctAnswer: "A",
    explanation: {
      slides: [
        {
          title: "Explanation for Question 14",
          bullets: ["Replace this placeholder explanation."]
        }
      ]
    }
  },

  15: {
    question: "Placeholder question 15 — replace this with the actual reviewer question.",
    choices: [
      { letter: "A", text: "Choice A" },
      { letter: "B", text: "Choice B" },
      { letter: "C", text: "Choice C" },
      { letter: "D", text: "Choice D" }
    ],
    correctAnswer: "A",
    explanation: {
      slides: [
        {
          title: "Explanation for Question 15",
          bullets: ["Replace this placeholder explanation."]
        }
      ]
    }
  }
};

module.exports = questions;