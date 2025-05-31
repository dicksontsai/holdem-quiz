# Texas Hold'em Quiz

An interactive client-side web application for practicing Texas Hold'em probability assessment through quiz-based gameplay.

## Overview

This project is a GitHub Pages-hosted quiz application that tests players' ability to assess winning probabilities in Texas Hold'em poker scenarios. Each quiz problem presents a randomized poker situation where players must identify which hand has the highest winning percentage or estimate win probability ranges.

## Features

### Core Functionality
- **Random Problem Generation**: Each quiz generates unique scenarios with:
  - 0, 3, 4, or 5 revealed community cards (pre-flop, flop, turn, or river)
  - 2 to 5 players with visible hole cards
- **Primary Quiz Mode**: Identify which player's hand has the highest winning percentage
- **Alternative Quiz Mode**: Estimate the win probability range for a randomly selected player

### Customization Options
- **Fixed Parameters Mode**: Lock specific game conditions:
  - Always show the same number of community cards (e.g., always flop scenarios)
  - Fix the number of players (e.g., always heads-up situations)
- **Difficulty Settings**: Adjust complexity based on player skill level

## Technical Stack

- **Frontend**: Pure JavaScript, HTML5, CSS3
- **Hosting**: GitHub Pages (static site)
- **Card Visualization**: Canvas or SVG-based card rendering
- **Probability Calculations**: Client-side Monte Carlo simulations or pre-calculated lookup tables

## Project Goals

1. Create an educational tool for poker players to improve their probability assessment skills
2. Provide immediate feedback with accurate win percentage calculations
3. Build a responsive, intuitive interface that works on desktop and mobile devices
4. Implement efficient client-side probability calculations without requiring a backend server