// Modal functionality
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('poker-hands-modal');
    const btn = document.getElementById('learn-hands-btn');
    const span = document.getElementsByClassName('close')[0];

    btn.onclick = function() {
        modal.style.display = 'block';
    }

    span.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});

// Card definitions
const SUITS = ["hearts", "diamonds", "clubs", "spades"];
const RANKS = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
const SUIT_SYMBOLS = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

// Rank values for comparison
const RANK_VALUES = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

// Hand rankings
const HAND_RANKS = {
  HIGH_CARD: 1,
  PAIR: 2,
  TWO_PAIR: 3,
  THREE_OF_A_KIND: 4,
  STRAIGHT: 5,
  FLUSH: 6,
  FULL_HOUSE: 7,
  FOUR_OF_A_KIND: 8,
  STRAIGHT_FLUSH: 9,
};

// Game state
let gameState = {
  deck: [],
  communityCards: [],
  players: [],
  currentQuestion: null,
  score: 0,
  streak: 0,
  settings: {
    lockedCommunityCards: false,
    communityCardsStage: "random",
    lockedPlayerCount: false,
    playerCount: "random",
    numSimulations: 10000,
  },
};

// Initialize deck
function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

// Shuffle deck
function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Create card element
function createCardElement(card, faceDown = false) {
  const cardDiv = document.createElement("div");
  cardDiv.className = `card ${card.suit}`;

  if (faceDown) {
    cardDiv.classList.add("card-back");
  } else {
    cardDiv.textContent = `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
  }

  return cardDiv;
}

// Deal cards
function dealGame() {
  gameState.deck = shuffleDeck(createDeck());
  gameState.communityCards = [];
  gameState.players = [];

  // Determine number of community cards
  let communityCardCount;
  if (
    gameState.settings.lockedCommunityCards &&
    gameState.settings.communityCardsStage !== "random"
  ) {
    communityCardCount = parseInt(gameState.settings.communityCardsStage);
  } else {
    const options = [0, 3, 4]; // Only pre-flop, flop, or turn
    communityCardCount = options[Math.floor(Math.random() * options.length)];
  }

  // Deal community cards
  for (let i = 0; i < communityCardCount; i++) {
    gameState.communityCards.push(gameState.deck.pop());
  }

  // Determine number of players
  let playerCount;
  if (
    gameState.settings.lockedPlayerCount &&
    gameState.settings.playerCount !== "random"
  ) {
    playerCount = parseInt(gameState.settings.playerCount);
  } else {
    playerCount = Math.floor(Math.random() * 4) + 2; // 2-5 players
  }

  // Deal player cards
  for (let i = 0; i < playerCount; i++) {
    gameState.players.push({
      id: i,
      name: `Player ${i + 1}`,
      cards: [gameState.deck.pop(), gameState.deck.pop()],
      winPercentage: 0, // Will be calculated later
    });
  }
}

// Display game state
function displayGame() {
  // Display community cards
  const communityDisplay = document.getElementById("community-cards-display");
  communityDisplay.innerHTML = "";

  if (gameState.communityCards.length === 0) {
    communityDisplay.innerHTML =
      '<p style="color: #fff; opacity: 0.6;">No community cards (Pre-flop)</p>';
  } else {
    // Show dealt cards
    gameState.communityCards.forEach((card) => {
      communityDisplay.appendChild(createCardElement(card));
    });

    // Show card backs for remaining cards (up to 5 total)
    const remainingCards = 5 - gameState.communityCards.length;
    for (let i = 0; i < remainingCards; i++) {
      const cardBack = document.createElement("div");
      cardBack.className = "card card-back";
      communityDisplay.appendChild(cardBack);
    }
  }

  // Display players
  const playersDisplay = document.getElementById("players-display");
  playersDisplay.innerHTML = "";

  gameState.players.forEach((player) => {
    const playerDiv = document.createElement("div");
    playerDiv.className = "player selectable";
    playerDiv.dataset.playerId = player.id;

    const playerName = document.createElement("h3");
    playerName.textContent = player.name;
    playerDiv.appendChild(playerName);

    const playerCards = document.createElement("div");
    playerCards.className = "player-cards";
    player.cards.forEach((card) => {
      playerCards.appendChild(createCardElement(card));
    });
    playerDiv.appendChild(playerCards);

    // Add win percentage display (initially hidden)
    const winPercentage = document.createElement("div");
    winPercentage.className = "win-percentage";
    winPercentage.style.display = "none";
    winPercentage.textContent = `${player.winPercentage.toFixed(1)}%`;
    playerDiv.appendChild(winPercentage);

    // Add click handler for quiz
    playerDiv.addEventListener("click", () => selectPlayer(player.id));

    playersDisplay.appendChild(playerDiv);
  });
}

// Select player for quiz answer
function selectPlayer(playerId) {
  if (!gameState.currentQuestion || gameState.currentQuestion.answered) return;

  // Remove previous selections
  document
    .querySelectorAll(".player")
    .forEach((p) => p.classList.remove("selected"));

  // Add selection to clicked player
  document
    .querySelector(`[data-player-id="${playerId}"]`)
    .classList.add("selected");

  // Check answer
  checkAnswer(playerId);
}

// Evaluate poker hand
function evaluateHand(cards) {
  if (cards.length < 5) return { rank: 0, values: [] };

  // Sort cards by rank value
  const sortedCards = [...cards].sort(
    (a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]
  );

  // Count ranks and suits
  const rankCounts = {};
  const suitCounts = {};

  for (const card of sortedCards) {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  }

  // Get all 5-card combinations
  const combinations = getCombinations(sortedCards, 5);
  let bestHand = null;

  for (const combo of combinations) {
    const hand = evaluateFiveCards(combo);
    if (!bestHand || compareHands(hand, bestHand) > 0) {
      bestHand = hand;
    }
  }

  return bestHand;
}

// Get all combinations of k items from array
function getCombinations(arr, k) {
  const results = [];

  function combine(start, combo) {
    if (combo.length === k) {
      results.push([...combo]);
      return;
    }

    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      combine(i + 1, combo);
      combo.pop();
    }
  }

  combine(0, []);
  return results;
}

// Evaluate exactly 5 cards
function evaluateFiveCards(cards) {
  const rankCounts = {};
  const suitCounts = {};
  const ranks = [];

  for (const card of cards) {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
    ranks.push(RANK_VALUES[card.rank]);
  }

  ranks.sort((a, b) => b - a);

  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const isFlush = Object.values(suitCounts).some((count) => count === 5);
  const isStraight = checkStraight(ranks);

  // Check for each hand type
  if (isStraight && isFlush) {
    // For straight flush, use the highest card of the straight
    // Special case: A-2-3-4-5 straight should use 5 as high card
    const straightHighCard = ranks[0] === 14 && ranks[1] === 5 ? 5 : ranks[0];
    return { rank: HAND_RANKS.STRAIGHT_FLUSH, values: [straightHighCard] };
  }

  if (counts[0] === 4) {
    return {
      rank: HAND_RANKS.FOUR_OF_A_KIND,
      values: getHandValues(cards, rankCounts, 4),
    };
  }

  if (counts[0] === 3 && counts[1] === 2) {
    // For full house, we need the trip rank first, then the pair rank
    const tripRank = Object.entries(rankCounts).find(
      ([rank, count]) => count === 3
    )[0];
    const pairRank = Object.entries(rankCounts).find(
      ([rank, count]) => count === 2
    )[0];
    return {
      rank: HAND_RANKS.FULL_HOUSE,
      values: [RANK_VALUES[tripRank], RANK_VALUES[pairRank]],
    };
  }

  if (isFlush) {
    return { rank: HAND_RANKS.FLUSH, values: ranks };
  }

  if (isStraight) {
    // For regular straight, use the highest card
    // Special case: A-2-3-4-5 straight should use 5 as high card
    const straightHighCard = ranks[0] === 14 && ranks[1] === 5 ? 5 : ranks[0];
    return { rank: HAND_RANKS.STRAIGHT, values: [straightHighCard] };
  }

  if (counts[0] === 3) {
    return {
      rank: HAND_RANKS.THREE_OF_A_KIND,
      values: getHandValues(cards, rankCounts, 3),
    };
  }

  if (counts[0] === 2 && counts[1] === 2) {
    return {
      rank: HAND_RANKS.TWO_PAIR,
      values: getHandValues(cards, rankCounts, 2, 2),
    };
  }

  if (counts[0] === 2) {
    return {
      rank: HAND_RANKS.PAIR,
      values: getHandValues(cards, rankCounts, 2),
    };
  }

  return { rank: HAND_RANKS.HIGH_CARD, values: ranks };
}

// Check if ranks form a straight
function checkStraight(ranks) {
  // Check regular straight
  for (let i = 0; i < ranks.length - 1; i++) {
    if (ranks[i] - ranks[i + 1] !== 1) {
      // Check for Ace-low straight (A-2-3-4-5)
      if (
        i === 0 &&
        ranks[0] === 14 &&
        ranks[1] === 5 &&
        ranks[2] === 4 &&
        ranks[3] === 3 &&
        ranks[4] === 2
      ) {
        return true;
      }
      return false;
    }
  }
  return true;
}

// Get hand values for comparison
function getHandValues(cards, rankCounts, ...counts) {
  const values = [];
  const used = new Set();

  // Special handling for two pair
  if (counts.length === 2 && counts[0] === 2 && counts[1] === 2) {
    // Get all pairs sorted by rank value
    const allPairs = Object.entries(rankCounts)
      .filter(([rank, count]) => count === 2)
      .sort(([rankA], [rankB]) => RANK_VALUES[rankB] - RANK_VALUES[rankA]);

    // Add the two highest pairs
    for (let i = 0; i < Math.min(2, allPairs.length); i++) {
      const [rank] = allPairs[i];
      values.push(RANK_VALUES[rank]);
      used.add(rank);
    }
  } else {
    // Normal handling for other hand types
    for (const count of counts) {
      // Sort ranks by their value in descending order to get highest pairs first
      const sortedRanks = Object.entries(rankCounts)
        .filter(([rank, rankCount]) => rankCount === count && !used.has(rank))
        .sort(([rankA], [rankB]) => RANK_VALUES[rankB] - RANK_VALUES[rankA]);

      if (sortedRanks.length > 0) {
        const [rank] = sortedRanks[0];
        values.push(RANK_VALUES[rank]);
        used.add(rank);
      }
    }
  }

  // Add kickers
  const kickers = cards
    .filter((card) => !used.has(card.rank))
    .map((card) => RANK_VALUES[card.rank])
    .sort((a, b) => b - a);

  return [...values, ...kickers];
}

// Compare two hands
function compareHands(hand1, hand2) {
  if (hand1.rank !== hand2.rank) {
    return hand1.rank - hand2.rank;
  }

  // Compare values
  for (let i = 0; i < Math.min(hand1.values.length, hand2.values.length); i++) {
    if (hand1.values[i] !== hand2.values[i]) {
      return hand1.values[i] - hand2.values[i];
    }
  }

  return 0;
}

// Evaluate final hands when all community cards are revealed
function evaluateFinalHands() {
  const hands = gameState.players.map((player) =>
    evaluateHand([...player.cards, ...gameState.communityCards])
  );

  const winCounts = new Array(gameState.players.length).fill(0);

  // Find winner(s)
  let bestHand = null;
  let winners = [];

  for (let i = 0; i < hands.length; i++) {
    if (!bestHand) {
      bestHand = hands[i];
      winners = [i];
    } else {
      const comparison = compareHands(hands[i], bestHand);
      if (comparison > 0) {
        bestHand = hands[i];
        winners = [i];
      } else if (comparison === 0) {
        winners.push(i);
      }
    }
  }

  // Award 100% to winner(s)
  for (const winner of winners) {
    winCounts[winner] = 100 / winners.length;
  }

  return winCounts;
}

// Calculate win probabilities using Monte Carlo simulation
function calculateWinProbabilities() {
  const remainingDeck = getRemainingDeck();
  const communityCardsNeeded = 5 - gameState.communityCards.length;

  if (communityCardsNeeded === 0) {
    // All cards revealed, just evaluate
    return evaluateFinalHands();
  }

  // For turn (4 cards shown, 1 to come), always calculate exactly for accuracy
  if (communityCardsNeeded === 1) {
    return calculateExactProbabilities(remainingDeck);
  }

  // Monte Carlo simulation parameters
  const numSimulations = gameState.settings.numSimulations;
  const winCounts = new Array(gameState.players.length).fill(0);

  for (let sim = 0; sim < numSimulations; sim++) {
    // Shuffle remaining deck and deal community cards
    const shuffledDeck = shuffleDeck(remainingDeck);
    const additionalCards = shuffledDeck.slice(0, communityCardsNeeded);
    const allCommunityCards = [...gameState.communityCards, ...additionalCards];

    // Evaluate all hands
    const hands = gameState.players.map((player) =>
      evaluateHand([...player.cards, ...allCommunityCards])
    );

    // Find winner(s)
    let bestHand = null;
    let winners = [];

    for (let i = 0; i < hands.length; i++) {
      if (!bestHand || compareHands(hands[i], bestHand) > 0) {
        bestHand = hands[i];
        winners = [i];
      } else if (compareHands(hands[i], bestHand) === 0) {
        winners.push(i);
      }
    }

    // Award wins (split if tied)
    for (const winner of winners) {
      winCounts[winner] += 1 / winners.length;
    }
  }

  // Convert to percentages
  return winCounts.map((count) => (count / numSimulations) * 100);
}

// Calculate exact probabilities when only one card remains
function calculateExactProbabilities(remainingDeck) {
  const winCounts = new Array(gameState.players.length).fill(0);
  const tieCount = new Array(gameState.players.length).fill(0);

  // Try each possible river card
  for (const riverCard of remainingDeck) {
    const allCommunityCards = [...gameState.communityCards, riverCard];

    // Evaluate all hands
    const hands = gameState.players.map((player) =>
      evaluateHand([...player.cards, ...allCommunityCards])
    );

    // Find winner(s)
    let bestHand = null;
    let winners = [];

    for (let i = 0; i < hands.length; i++) {
      if (!bestHand || compareHands(hands[i], bestHand) > 0) {
        bestHand = hands[i];
        winners = [i];
      } else if (compareHands(hands[i], bestHand) === 0) {
        winners.push(i);
      }
    }

    // Award wins (split if tied)
    for (const winner of winners) {
      if (winners.length > 1) {
        tieCount[winner] += 1;
      }
      winCounts[winner] += 1 / winners.length;
    }
  }

  // Convert to percentages
  return winCounts.map((count) => {
    const percentage = (count / remainingDeck.length) * 100;
    return percentage;
  });
}

// Get remaining cards in deck
function getRemainingDeck() {
  const usedCards = new Set();

  // Mark all revealed cards as used
  for (const card of gameState.communityCards) {
    usedCards.add(`${card.rank}-${card.suit}`);
  }

  for (const player of gameState.players) {
    for (const card of player.cards) {
      usedCards.add(`${card.rank}-${card.suit}`);
    }
  }

  // Build remaining deck
  const remaining = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const cardKey = `${rank}-${suit}`;
      if (!usedCards.has(cardKey)) {
        remaining.push({ suit, rank });
      }
    }
  }

  return remaining;
}

// Evaluate final hands when all community cards are revealed
function evaluateFinalHands() {
  const hands = gameState.players.map((player) =>
    evaluateHand([...player.cards, ...gameState.communityCards])
  );

  const winCounts = new Array(gameState.players.length).fill(0);

  // Find winner(s)
  let bestHand = null;
  let winners = [];

  for (let i = 0; i < hands.length; i++) {
    if (!bestHand) {
      bestHand = hands[i];
      winners = [i];
    } else {
      const comparison = compareHands(hands[i], bestHand);

      if (comparison > 0) {
        bestHand = hands[i];
        winners = [i];
      } else if (comparison === 0) {
        winners.push(i);
      }
    }
  }

  if (winners.length === 1) {
    winCounts[winners[0]] = 100;
  } else {
    // Split 100% among tied players
    for (const winner of winners) {
      winCounts[winner] = 100 / winners.length;
    }
  }

  return winCounts;
}

// Generate quiz question
function generateQuestion() {
  // Calculate win probabilities using Monte Carlo simulation
  const winProbabilities = calculateWinProbabilities();

  // Update player win percentages
  gameState.players.forEach((player, index) => {
    player.winPercentage = winProbabilities[index];
  });

  // Find the player with highest win percentage
  const winner = gameState.players.reduce((best, player) =>
    player.winPercentage > best.winPercentage ? player : best
  );

  gameState.currentQuestion = {
    type: "highest-percentage",
    correctAnswer: winner.id,
    answered: false,
  };

  // Display question
  document.getElementById("question").textContent =
    "Which player has the highest chance of winning?";
}

// Check answer
function checkAnswer(playerId) {
  gameState.currentQuestion.answered = true;

  const isCorrect = playerId === gameState.currentQuestion.correctAnswer;

  if (isCorrect) {
    gameState.score++;
    gameState.streak++;
  } else {
    gameState.streak = 0;
  }

  updateScore();

  // Show next question button
  document.getElementById("next-question").style.display = "block";

  // Disable player selection and show results
  document.querySelectorAll(".player").forEach((p, index) => {
    p.classList.remove("selectable");
    p.style.cursor = "default";

    // Show win percentage and update the text with actual calculated value
    const winPercentageDiv = p.querySelector(".win-percentage");
    winPercentageDiv.style.display = "block";
    const percentage = gameState.players[index].winPercentage;
    winPercentageDiv.textContent = `${percentage.toFixed(1)}%`;
  });

  // Highlight answers
  const correctPlayerDiv = document.querySelector(
    `[data-player-id="${gameState.currentQuestion.correctAnswer}"]`
  );
  const selectedPlayerDiv = document.querySelector(
    `[data-player-id="${playerId}"]`
  );

  if (isCorrect) {
    // User guessed correctly - highlight the winning player in green
    correctPlayerDiv.style.backgroundColor = "#27ae60";
    correctPlayerDiv.style.borderColor = "#2ecc71";
  } else {
    // User guessed incorrectly - highlight correct answer in green, wrong answer in red
    correctPlayerDiv.style.backgroundColor = "#27ae60";
    correctPlayerDiv.style.borderColor = "#2ecc71";
    selectedPlayerDiv.style.backgroundColor = "#e74c3c";
    selectedPlayerDiv.style.borderColor = "#c0392b";
  }

  // Bold the highest win percentage
  const highestWinPercentage = Math.max(
    ...gameState.players.map((p) => p.winPercentage)
  );
  document.querySelectorAll(".win-percentage").forEach((div, index) => {
    if (gameState.players[index].winPercentage === highestWinPercentage) {
      div.style.fontWeight = "bold";
      div.style.fontSize = "1.1em";
    }
  });
}

// Show feedback
function showFeedback(correct) {
  const feedbackDiv = document.createElement("div");
  feedbackDiv.className = "feedback";

  if (correct) {
    feedbackDiv.innerHTML = "<h3>Correct!</h3>";
  } else {
    feedbackDiv.innerHTML = "<h3>Incorrect</h3>";
  }

  // Add win percentages
  const percentages = gameState.players
    .map((p) => `${p.name}: ${p.winPercentage.toFixed(1)}%`)
    .join("<br>");
  feedbackDiv.innerHTML += `<p>Win percentages:<br>${percentages}</p>`;

  document.querySelector(".quiz-section").appendChild(feedbackDiv);
}

// Update score display
function updateScore() {
  document.getElementById("score").textContent = gameState.score;
  document.getElementById("streak").textContent = gameState.streak;
}

// Start new round
function newRound() {
  // Clear feedback
  const feedback = document.querySelector(".feedback");
  if (feedback) feedback.remove();

  // Hide next button
  document.getElementById("next-question").style.display = "none";

  // Reset player styling
  document.querySelectorAll(".player").forEach((p) => {
    p.style.backgroundColor = "";
    p.style.borderColor = "";
    p.classList.add("selectable");
    p.style.cursor = "pointer";

    // Hide win percentages
    const winPercentageDiv = p.querySelector(".win-percentage");
    if (winPercentageDiv) {
      winPercentageDiv.style.display = "none";
      winPercentageDiv.style.fontWeight = "";
      winPercentageDiv.style.fontSize = "";
    }
  });

  // Deal new game
  dealGame();
  displayGame();
  generateQuestion();
}

// Settings handlers
document
  .getElementById("lock-community-cards")
  .addEventListener("change", (e) => {
    gameState.settings.lockedCommunityCards = e.target.checked;
    document.getElementById("community-cards-stage").disabled =
      !e.target.checked;
    // Auto-refresh if game is not in progress
    if (!gameState.currentQuestion || gameState.currentQuestion.answered) {
      newRound();
    }
  });

document
  .getElementById("community-cards-stage")
  .addEventListener("change", (e) => {
    gameState.settings.communityCardsStage = e.target.value;
    // Auto-refresh if game is not in progress
    if (!gameState.currentQuestion || gameState.currentQuestion.answered) {
      newRound();
    }
  });

document.getElementById("lock-player-count").addEventListener("change", (e) => {
  gameState.settings.lockedPlayerCount = e.target.checked;
  document.getElementById("player-count").disabled = !e.target.checked;
  // Auto-refresh if game is not in progress
  if (!gameState.currentQuestion || gameState.currentQuestion.answered) {
    newRound();
  }
});

document.getElementById("player-count").addEventListener("change", (e) => {
  gameState.settings.playerCount = e.target.value;
  // Auto-refresh if game is not in progress
  if (!gameState.currentQuestion || gameState.currentQuestion.answered) {
    newRound();
  }
});

document.getElementById("num-simulations").addEventListener("change", (e) => {
  gameState.settings.numSimulations = parseInt(e.target.value);
  // Don't auto-refresh for simulation count changes since it doesn't affect the game state
});

// Next question button
document.getElementById("next-question").addEventListener("click", newRound);

// Initialize game
newRound();
