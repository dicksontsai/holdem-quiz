# Texas Hold'em Quiz

An interactive client-side web application for practicing Texas Hold'em probability assessment through quiz-based gameplay.

## Overview

This project is a GitHub Pages-hosted quiz application that tests players' ability to assess winning probabilities in Texas Hold'em poker scenarios. Each quiz problem presents a randomized poker situation where players must identify which hand has the highest winning percentage or estimate win probability ranges.

The probabilities are computed using exact calculation for turn scenarios (when only 1 card remains) and Monte Carlo simulations for other scenarios.

## Features

### Core Functionality
- **Random Problem Generation**: Each quiz generates unique scenarios with:
  - 0, 3, or 4 revealed community cards (pre-flop, flop, turn)
  - 2 to 5 players with visible hole cards
- **Primary Quiz Mode**: Identify which player's hand has the highest winning percentage

### Customization Options
- **Fixed Parameters Mode**: Lock specific game conditions:
  - Always show the same number of community cards (e.g., always flop scenarios)
  - Fix the number of players (e.g., always heads-up situations)

## Extension Ideas

* Given two hole cards, some community cards, and a target hand, determine the probability of getting that hand. (Multiple choice of probability ranges)

