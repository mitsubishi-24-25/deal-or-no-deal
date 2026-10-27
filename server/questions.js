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

/* explanation: {
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
    } */

const questions = {
  1: {
    question: "Saan nagtatapos ang hangganan ng mall ayon kay Morales-Nuncio?",
    choices: [
      { letter: "A", text: "Sa mismong pisikal na pader ng gusali ng mall" },
      { letter: "B", text: "Sa seguridad at mga guardia sibil ng mall" },
      { letter: "C", text: "Sa malay ng tao na pag-iral sa loob ng syudad at sa siyudad ng mall" },
      { letter: "D", text: "Sa parking lot ng mall" }
    ],
    correctAnswer: "C",
    explanation: {
      slides: [
        {
          title: "Hangganan ng Mall",
          bullets: [
            "Natatapos ang hangganan ng isang mall kapag nagising na ang tao sa imahinasyon at ilusyon na ibinibigay ng mall.",
            "Ang tao ay kinokontrol lamang ng kapitalismo at konsumerismo."
          ]
        }
      ]
    }
  },

  2: {
    question: "Ayon sa pag-aaral ni Tolentino, ano ang pangunahing dahilan kung bakit naipapasok ang street market na gaya ng Divisoria sa loob ng mall?",
    choices: [
      { letter: "A", text: "Upang mapagaan ang trapiko sa naturang lugar" },
      { letter: "B", text: "Upang maalis ang underground economy ng Divisoria" },
      { letter: "C", text: "Upang maibaba ang presyo ng mga paninda" },
      { letter: "D", text: "Upang mailapat ang gitnang uring panuntunan ng pamimili" }
    ],
    correctAnswer: "D",
    explanation: {
      slides: [
        {
          title: "Gitnang Uring Panuntunan ng Pamimili",
          bullets: [
            "Ito ay ang paghahanap ng mura ngunit dekalidad na mga produkto at komportableng pamilihan.",
            "Sa pamamagitan ng pagpasok ng street market sa loob ng mall, napapanatili nito ang mababang presyo.",
            "Kasabay nito, binibigay ang malinis at ligtas na pamilihan."
          ]
        }
      ]
    }
  },

  3: {
    question: "Tuwing Sabado, ang mag-anak na Dela Cruz ay kumakain sa parehong food court sa SM. Ang mga bata ay umoorder ng chicken joy, ang nanay ay nag-uulam ng pansit, at ang tatay ay umiinom ng kape. Sabi ng tatay: \"Ito ang aming tradisyon. Dito kami nagkakasama-sama.\" Anong klasipikasyon ni Morales-Nuncio ang ipinapakita ng senaryo?",
    choices: [
      { letter: "A", text: "Pagbabakod" },
      { letter: "B", text: "Pagbubuklod" },
      { letter: "C", text: "Pagbubukod" },
      { letter: "D", text: "Pagbabalikwas" }
    ],
    correctAnswer: "B",
    explanation: {
      slides: [
        {
          title: "Pagbubuklod (Pagkakaisa sa Pagkonsumo)",
          bullets: [
            "Ang pagbubuklod ay tumutukoy sa pagkakaisa ng mga tao sa ilalim ng isang karanasan o layunin.",
            "Sa loob ng mall, ang lahat ng tao ay nagiging konsumer na nagbabahagi ng parehong karanasan sa pagkain, pamimili, at paglilibang.",
            "Ang tradisyonal na pagsasama-sama ng pamilya sa food court ay nagpapakita ng pagkakaisa at pagbuo ng identidad bilang mga konsumer sa ilalim ng globalisasyon."
          ]
        }
      ]
    }
  },

  4: {
    question: "Ano ang tawag sa ekonomiya ng tradisyonal na Divisoria na walang VAT, walang buwis sa lungsod, at walang pwestong binabayaran?",
    choices: [
      { letter: "A", text: "Shadow Economy" },
      { letter: "B", text: "Underground Economy" },
      { letter: "C", text: "Parallel Economy" },
      { letter: "D", text: "Informal Settler Economy" }
    ],
    correctAnswer: "B",
    explanation: {
      slides: [
        {
          title: "Underground Economy",
          bullets: [
            "Ito ang mga negosyong walang VAT, hindi nagbabayad ng buwis, at walang bayad sa pwesto.",
            "Ang mga street vendor na kabilang sa underground economy sa tradisyonal na Divisoria ay hindi kabilang sa pormal at rehistradong sistema ng pagnenegosyo."
          ]
        }
      ]
    }
  },

  5: {
    question: "Alin sa mga sumusunod ang HINDI kabilang sa mga naging institusyon o organisasyong kinabilangan ni Dr. Rolando B. Tolentino?",
    choices: [
      { letter: "A", text: "Manunuri ng Pelikulang Pilipino" },
      { letter: "B", text: "Altermidya (People's Alternative Media Network)" },
      { letter: "C", text: "Korporasyon ng mga Manunulat ng Pilipinas" },
      { letter: "D", text: "CONTEND (Congress of Teachers and Educators for Nationalism and Democracy)" }
    ],
    correctAnswer: "C",
    explanation: {
      slides: [
        {
          title: "Mga Institusyong Kinabilangan ni Dr. Rolando B. Tolentino",
          bullets: [
            "Si Dr. Rolando B. Tolentino ay naging bahagi ng Manunuri ng Pelikulang Pilipino, isang organisasyong nagbibigay ng parangal sa mga mahusay na pelikulang Pilipino.",
            "Naging kabilang din siya sa Altermidya (People's Alternative Media Network) at CONTEND (Congress of Teachers and Educators for Nationalism and Democracy).",
            "Ang \"Korporasyon ng mga Manunulat ng Pilipinas\" ay walang rekord sa kanyang bayograpiya at ito ang tamang sagot dahil HINDI siya kabilang dito."
          ]
        }
      ]
    }
  },

  6: {
    question: "Alin sa mga sumusunod na pahayag ang TAMA tungkol sa ebolusyon ng espasyo ng kalakalan sa Pilipinas ayon kay Morales-Nuncio?",
    choices: [
      { letter: "A", text: "Ang unang prototype ng pamilihan sa Pilipinas ay ang Parian" },
      { letter: "B", text: "Ang Escolta ang pinakaunang anyo ng pamilihan sa bansa" },
      { letter: "C", text: "Ang Tabuan ang prototype ng pamilihan bago ang Parian" },
      { letter: "D", text: "Ang Binondo ang pinakaunang pamilihan sa Pilipinas" }
    ],
    correctAnswer: "C",
    explanation: {
      slides: [
        {
          title: "Ebolusyon ng Pamilihan sa Pilipinas",
          bullets: [
            "Ayon kay Morales-Nuncio, ang Tabuan ang itinuturing na prototype ng pamilihan sa Pilipinas.",
            "Sinundan ito ng Parian na naging lugar ng segregasyon para sa mga Tsino, at ang Binondo na naging sentro ng komersyalisasyon.",
            "Ang Escolta naman ang nagsilbing prototype ng mall sa bansa bago pa man dumating ang mga makabagong mall ngayon."
          ]
        }
      ]
    }
  },

  7: {
    question: "Sina Ana at Bea ay magkaibigan. Si Ana ay mayaman; si Bea ay mahirap. Nagkita sila sa isang mamahaling boutique. Pinagtinginan nila ang parehong bag na nagkakahalaga ng ₱10,000. Sabi ni Bea: \"Ang ganda, pero hindi ko kayang bilhin.\" Sabi ni Ana: \"Bilhin mo na, ako ang magbabayad.\" Anong klasipikasyon ni Morales-Nuncio ang ipinapakita ng senaryo?",
    choices: [
      { letter: "A", text: "Pagbubuklod" },
      { letter: "B", text: "Pagbabakod" },
      { letter: "C", text: "Pagbubukod" },
      { letter: "D", text: "Pagbabalikwas" }
    ],
    correctAnswer: "C",
    explanation: {
      slides: [
        {
          title: "Pagbubukod (Ekslusyon)",
          bullets: [
            "Ang pagbubukod ay ang epekto ng pagbabakod kung saan lumilikha ito ng eksklusibong espasyo para sa ilang uri ng tao.",
            "Sa senaryo, ang mamahaling boutique at ang produktong nagkakahalaga ng ₱10,000 ay nagpapakita ng hangganan batay sa kakayahang bumili.",
            "Bagaman magkasama sina Ana at Bea sa iisang lugar at nakikita ang parehong bag, ang kakayahang bumili lamang ni Ana ang nagpapakita ng pagbubukod dahil sa agwat ng kanilang kalagayang pang-ekonomiya."
          ]
        }
      ]
    }
  },

  8: {
    question: "Ano ang pangunahing argumento ni Tolentino tungkol sa fantasia sa loob ng mall?",
    choices: [
      { letter: "A", text: "Ang fantasia sa mall ay nagpapayaman sa lokal na kultura" },
      { letter: "B", text: "Ang fantasia sa mall ay isang anyo ng pagtakas mula sa realidad ng lipunan" },
      { letter: "C", text: "Ang fantasia sa mall ay nagpapataas ng antas ng edukasyon ng mga mamimili" },
      { letter: "D", text: "Ang fantasia sa mall ay nagpapaunlad ng sining at arkitektura" }
    ],
    correctAnswer: "B",
    explanation: {
      slides: [
        {
          title: "Fantasia sa Mall",
          bullets: [
            "Batay sa kahulugan ng \"fantasya sa mall,\" ito ay ang pagkakaroon ng imahinasyon o ilusyon ng mas maginhawa, malinis, at komportableng pamilihan kaysa sa tradisyonal na Divisoria.",
            "Ito ay isang anyo ng pagtakas mula sa realidad ng lipunan."
          ]
        }
      ]
    }
  },

  9: {
    question: "Anong konsepto ang ginamit ni Morales-Nuncio upang ilarawan ang mall bilang isang espasyo na lumilikha ng ilusyon ng kaayusan at kaunlaran habang binabalot ang kahirapan sa labas?",
    choices: [
      { letter: "A", text: "Simulakrum" },
      { letter: "B", text: "Heterotopia" },
      { letter: "C", text: "Pantheon" },
      { letter: "D", text: "Arkitektura ng Panlilinlang" }
    ],
    correctAnswer: "A",
    explanation: {
      slides: [
        {
          title: "Ang Mall bilang Simulakrum",
          bullets: [
            "Ang simulakrum ay isang representasyon o kopya ng realidad na nagbibigay ng ilusyon ng isang bagay.",
            "Inilarawan ni Morales-Nuncio ang mall bilang isang simulakrum dahil nagbibigay ito ng ilusyon ng isang maliit, kontrolado, malinis, at organisadong lungsod.",
            "Habang binabalot nito ang tao sa kaginhawahan at kaayusan sa loob, naitatago o natatakpan nito ang kahirapan at magulong realidad sa labas ng mall."
          ]
        }
      ]
    }
  },

  10: {
    question: "Ayon kay Tolentino, ano ang naghahari sa Divisoria pagkatapos ng pagtatayo ng mga mall?",
    choices: [
      { letter: "A", text: "Ang mga tunay na negosyanteng Tsino" },
      { letter: "B", text: "Ang mga lokal na pamahalaan ng Maynila" },
      { letter: "C", text: "Ang pakiwaring gitnang uri" },
      { letter: "D", text: "Ang mga dating manininda sa kalsada" }
    ],
    correctAnswer: "C",
    explanation: {
      slides: [
        {
          title: "Ang Pakiwaring Gitnang Uri sa Divisoria",
          bullets: [
            "Ayon kay Tolentino, sa kabila ng pagpasok ng mga mall at modernisasyon sa Divisoria, hindi nawawala ang tunay na kalagayan ng lugar.",
            "Bagkus, naghahari dito ang tinatawag na \"pakiwaring gitnang uri\" (imagined middle class) kung saan ang mga tao ay nagkukunwari o nag-aakalang sila ay kabilang sa gitnang uri dahil sa pagpasok sa mga modernong pamilihan, ngunit hindi ito tugma sa totoong kalagayan ng kanilang pamumuhay."
          ]
        }
      ]
    }
  },

  11: {
    question: "Si Mang Tomas ay nagtitinda ng kendi at sigarilyo sa labas ng isang mall. Kahit buong araw siyang nakatayo sa ilalim ng init ng araw, nakikita niya ang mga taong pumapasok at lumalabas ng mall—may mga bag, may mga pagkain, at may mga ngiti. Sabi niya: \"Sana ako rin, nakakapasok diyan.\" Anong klasipikasyon ni Morales-Nuncio ang ipinapakita ng senaryo?",
    choices: [
      { letter: "A", text: "Pagbubuklod" },
      { letter: "B", text: "Pagbabakod" },
      { letter: "C", text: "Pagbubukod" },
      { letter: "D", text: "Pagbabalikwas" }
    ],
    correctAnswer: "C",
    explanation: {
      slides: [
        {
          title: "Pagbubukod",
          bullets: [
            "Base sa sitwasyon ni Mang Tomas, binubukod nito ang kaniyang sarili dahil nagtitinda lamang siya ng kendi at sigarilyo.",
            "Sa kanyang palagay, hindi kabilang ang kanyang sarili sa mga taong nasa loob ng mall."
          ]
        }
      ]
    }
  },

  12: {
    question: "Ayon sa aralin, ano ang papel ng midya at advertisement sa paglikha ng fantasia sa loob ng mall?",
    choices: [
      { letter: "A", text: "Nagbibigay ito ng wastong impormasyon tungkol sa mga produkto" },
      { letter: "B", text: "Lumilikha ito ng mood at mentalidad ng pagkonsumo" },
      { letter: "C", text: "Pinoprotektahan nito ang mga mamimili mula sa panlilinlang" },
      { letter: "D", text: "Nagtuturo ito ng tamang paghawak ng pera" }
    ],
    correctAnswer: "B",
    explanation: {
      slides: [
        {
          title: "Papel ng Midya at Advertisement",
          bullets: [
            "Malaki ang impluwensya ng midya at advertisement sa paghubog ng ating mga kagustuhan.",
            "Hindi lamang produkto ang ibinibenta nito, kundi ikinokonekta rin nila ang mga ito sa kaligayahan, kasikatan, kumpiyansa, magandang lifestyle, at tagumpay.",
            "Dahil dito, ang mga mamimili ay nahihikayat na bumili, na lumilikha ng mood at mentalidad ng pagkonsumo sa loob ng mall."
          ]
        }
      ]
    }
  },

  13: {
    question: "Noong 1980s, ang Divisoria ay isang magulong palengke sa kalsada. Walang bubong, walang aircon, at walang security. Ngunit noong 2000s, itinayo ang 168 Mall. Ngayon, ang mga dating nagtitinda sa kalsada ay nasa loob na ng mall—may bubong, may aircon, at may security. Anong pangunahing konsepto ang inilalarawan ng pagbabago sa Divisoria?",
    choices: [
      { letter: "A", text: "Pagbubuklod" },
      { letter: "B", text: "Pagbabakod" },
      { letter: "C", text: "Pakiwaring gitnang uri" },
      { letter: "D", text: "Gentrifikasyon" }
    ],
    correctAnswer: "D",
    explanation: {
      slides: [
        {
          title: "Gentripikasyon sa Divisoria",
          bullets: [
            "Ang gentripikasyon ay ang proseso ng pagpapaunlad ng isang lugar upang tumaas ang halaga ng lupa at kalakalan, ngunit nagiging dahilan ito ng pag-alis ng mga mahihirap na residente.",
            "Ang paglipat ng mga dating nagtitinda sa kalsada papasok sa 168 Mall ay isang halimbawa nito, kung saan ang magulong pamilihan ay ginawang moderno at kontrolado.",
            "Dahil dito, ang mga maliliit na negosyante na hindi kayang sumabay sa mas mataas na pwesto o pamantayan sa loob ng mall ay maaaring mawalan ng kabuhayan."
          ]
        }
      ]
    }
  },

  14: {
    question: "Alin sa mga sumusunod ang HINDI kabilang sa tatlong klasipikasyon ng syudad ng mall ayon kay Morales-Nuncio?",
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
          title: "3B's ng Siyudad ng Mall",
          bullets: [
            "Pagbabalikwas — ang pagtutol sa isang bagay o pangyayari; ito ang HINDI kabilang sa tatlong klasipikasyon.",
            "Pagbabakod — ang mismong pisikal na pader ng mall na naghihiwalay sa magulo at mainit na labas ng kalsada.",
            "Pagbubukod — bagaman bukas ang mall para sa lahat, may mga taong nakakaramdam na hindi sila kabilang dito dahil kilala ito sa pagiging sosyal o magarbong lugar.",
            "Pagbubuklod — binubuklod nito ang mga tao sa isang lugar."
          ]
        }
      ]
    }
  },

  15: {
    question: "Anong klasipikasyon ni Morales-Nuncio ang ipinapakita ng senaryo?",
    choices: [
      { letter: "A", text: "Pagbubuklod" },
      { letter: "B", text: "Pagbabakod" },
      { letter: "C", text: "Pagbubukod" },
      { letter: "D", text: "Pagbabalikwas" }
    ],
    correctAnswer: "B",
    explanation: {
      slides: [
        {
          title: "Pagbabakod (Segregasyon)",
          bullets: [
            "Ang pagbabakod ay tumutukoy sa polisiya ng segregasyon at paglalagay ng hangganan sa mga tao.",
            "Makikita ito sa mga pisikal na harang tulad ng pader ng mall, gate, at security guards.",
            "Ito ay naghihiwalay sa magulo at mainit na labas ng kalsada sa kontrolado at maayos na loob ng mall, na sumisimbolo sa dibisyon ng mga uri sa lipunan."
          ]
        }
      ]
    }
  }
};

/* const questions = {
  1: {
    question: "What color is the sun?",
    choices: [
      { letter: "A", text: "Blue" },
      { letter: "B", text: "Yellow" },
      { letter: "C", text: "Purple" },
      { letter: "D", text: "Green" }
    ],
    correctAnswer: "B",
    explanation: "explanaiton"
  },

  2: {
    question: "How many legs does a dog have?",
    choices: [
      { letter: "A", text: "Two" },
      { letter: "B", text: "Three" },
      { letter: "C", text: "Four" },
      { letter: "D", text: "Six" }
    ],
    correctAnswer: "C",
    explanation: "explanaiton"
  },

  3: {
    question: "What sound does a cow make?",
    choices: [
      { letter: "A", text: "Meow" },
      { letter: "B", text: "Moo" },
      { letter: "C", text: "Woof" },
      { letter: "D", text: "Quack" }
    ],
    correctAnswer: "B",
    explanation: "explanaiton"
  },

  4: {
    question: "What comes after the number 3?",
    choices: [
      { letter: "A", text: "1" },
      { letter: "B", text: "2" },
      { letter: "C", text: "5" },
      { letter: "D", text: "4" }
    ],
    correctAnswer: "D",
    explanation: "explanaiton"
  },

  5: {
    question: "Which animal says \"meow\"?",
    choices: [
      { letter: "A", text: "A dog" },
      { letter: "B", text: "A cat" },
      { letter: "C", text: "A duck" },
      { letter: "D", text: "A cow" }
    ],
    correctAnswer: "B",
    explanation: "explanaiton"
  },

  6: {
    question: "What do you use to see things?",
    choices: [
      { letter: "A", text: "Your ears" },
      { letter: "B", text: "Your nose" },
      { letter: "C", text: "Your eyes" },
      { letter: "D", text: "Your feet" }
    ],
    correctAnswer: "C",
    explanation: "explanaiton"
  },

  7: {
    question: "What color are most leaves on trees?",
    choices: [
      { letter: "A", text: "Red" },
      { letter: "B", text: "Green" },
      { letter: "C", text: "Pink" },
      { letter: "D", text: "Black" }
    ],
    correctAnswer: "B",
    explanation: "explanaiton"
  },

  8: {
    question: "How many days are in a week?",
    choices: [
      { letter: "A", text: "Five" },
      { letter: "B", text: "Six" },
      { letter: "C", text: "Seven" },
      { letter: "D", text: "Ten" }
    ],
    correctAnswer: "C",
    explanation: "explanaiton"
  },

  9: {
    question: "What is frozen water called?",
    choices: [
      { letter: "A", text: "Steam" },
      { letter: "B", text: "Juice" },
      { letter: "C", text: "Milk" },
      { letter: "D", text: "Ice" }
    ],
    correctAnswer: "D",
    explanation: "explanaiton"
  },

  10: {
    question: "Which fruit is yellow and monkeys love it?",
    choices: [
      { letter: "A", text: "An apple" },
      { letter: "B", text: "A banana" },
      { letter: "C", text: "A grape" },
      { letter: "D", text: "A lemon" }
    ],
    correctAnswer: "B",
    explanation: "explanaiton"
  },

  11: {
    question: "What do bees make?",
    choices: [
      { letter: "A", text: "Milk" },
      { letter: "B", text: "Bread" },
      { letter: "C", text: "Honey" },
      { letter: "D", text: "Butter" }
    ],
    correctAnswer: "C",
    explanation: "explanaiton"
  },

  12: {
    question: "What shape is a ball?",
    choices: [
      { letter: "A", text: "A square" },
      { letter: "B", text: "A triangle" },
      { letter: "C", text: "A circle" },
      { letter: "D", text: "A star" }
    ],
    correctAnswer: "C",
    explanation: "explanaiton"
  },

  13: {
    question: "What do you wear on your feet?",
    choices: [
      { letter: "A", text: "A hat" },
      { letter: "B", text: "Gloves" },
      { letter: "C", text: "Shoes" },
      { letter: "D", text: "A scarf" }
    ],
    correctAnswer: "C",
    explanation: "explanaiton"
  },

  14: {
    question: "Which animal is known as the \"King of the Jungle\"?",
    choices: [
      { letter: "A", text: "The elephant" },
      { letter: "B", text: "The lion" },
      { letter: "C", text: "The monkey" },
      { letter: "D", text: "The zebra" }
    ],
    correctAnswer: "B",
    explanation: "explanaiton"
  },

  15: {
    question: "What do we call the meal we eat in the morning?",
    choices: [
      { letter: "A", text: "Dinner" },
      { letter: "B", text: "Lunch" },
      { letter: "C", text: "Snack" },
      { letter: "D", text: "Breakfast" }
    ],
    correctAnswer: "D",
    explanation: "explanaiton"
  }
}; */

module.exports = questions;