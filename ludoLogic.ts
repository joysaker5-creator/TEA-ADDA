import { PlayerColor, Token, Player, GameMode } from '../types';
import {
  START_INDICES,
  SAFE_PERIMETER_INDICES,
  PERIMETER_PATH,
  HOME_PATHS,
  YARD_COORDS,
  BoardCoord,
} from './ludoConstants';

export const MAX_STEP = 56; // 0 to 50 (perimeter), 51 to 55 (home run), 56 (home)

export function rollDiceValue(): number {
  return Math.floor(Math.random() * 6) + 1;
}

// Team pairing check (Red & Yellow vs Green & Blue)
export function isTeammate(colorA: PlayerColor, colorB: PlayerColor): boolean {
  const team1: PlayerColor[] = ['red', 'yellow'];
  const team2: PlayerColor[] = ['green', 'blue'];
  if (team1.includes(colorA) && team1.includes(colorB)) return true;
  if (team2.includes(colorA) && team2.includes(colorB)) return true;
  return false;
}

export function getTeamNumber(color: PlayerColor): 1 | 2 {
  return color === 'red' || color === 'yellow' ? 1 : 2;
}

export function getTokenCoord(token: Token): BoardCoord {
  const color: PlayerColor = (token && token.color) || 'red';
  const id = typeof token?.id === 'number' ? Math.max(0, Math.min(token.id, 3)) : 0;

  if (!token || token.step === -1) {
    const yard = YARD_COORDS[color] || YARD_COORDS.red;
    return yard?.[id] || { r: 0, c: 0 };
  }
  if (token.step <= 50) {
    const startIdx = START_INDICES[color] ?? START_INDICES.red;
    const perimeterIdx = ((startIdx + token.step) % 52 + 52) % 52;
    return PERIMETER_PATH[perimeterIdx] || { r: 0, c: 0 };
  }
  // Home lane & center
  const homeIdx = Math.min(Math.max(token.step - 51, 0), 5);
  const homePath = HOME_PATHS[color] || HOME_PATHS.red;
  return homePath?.[homeIdx] || { r: 7, c: 7 };
}

export function canTokenMove(token: Token, diceValue: number, isQuickMode: boolean = false): boolean {
  if (!token) return false;
  if (token.step === -1) {
    // In quick mode, 1 or 6 can bring token out of yard
    return isQuickMode ? (diceValue === 6 || diceValue === 1) : diceValue === 6;
  }
  if (token.step >= MAX_STEP) {
    return false;
  }
  return token.step + diceValue <= MAX_STEP;
}

export function getEligibleTokens(
  tokens: Token[],
  diceValue: number,
  isQuickMode: boolean = false
): number[] {
  if (!tokens || !Array.isArray(tokens)) return [];
  return tokens
    .filter((t) => canTokenMove(t, diceValue, isQuickMode))
    .map((t) => t.id);
}

export function isTokenInSafeZone(token: Token): boolean {
  if (!token || token.step === -1 || token.step > 50) return true;
  const color: PlayerColor = token.color || 'red';
  const startIdx = START_INDICES[color] ?? START_INDICES.red;
  const perimeterIdx = ((startIdx + token.step) % 52 + 52) % 52;
  return SAFE_PERIMETER_INDICES.includes(perimeterIdx);
}

export interface MoveResult {
  capturedToken: { color: PlayerColor; tokenId: number } | null;
  reachedHome: boolean;
  wonGame: boolean;
  teamWon?: 1 | 2;
}

export function executeTokenMove(
  movingColor: PlayerColor,
  tokenId: number,
  diceValue: number,
  allPlayers: Player[],
  gameMode: GameMode = 'vs-bot'
): { updatedPlayers: Player[]; result: MoveResult } {
  let capturedToken: { color: PlayerColor; tokenId: number } | null = null;
  let reachedHome = false;
  const isQuickMode = gameMode === 'quick-match';
  const isTournament = gameMode === 'tournament';
  const isTeamMode = gameMode === 'team-2v2';

  const updatedPlayers = allPlayers.map((player) => {
    if (player.color !== movingColor) return player;

    const updatedTokens = player.tokens.map((token) => {
      if (token.id !== tokenId) return token;

      let newStep = token.step;
      if (token.step === -1) {
        newStep = 0; // Brought out to start cell
      } else {
        newStep = Math.min(token.step + diceValue, MAX_STEP);
      }

      if (newStep === MAX_STEP && token.step !== MAX_STEP) {
        reachedHome = true;
      }

      return {
        ...token,
        step: newStep,
        isHome: newStep === MAX_STEP,
      };
    });

    const homeTokensCount = updatedTokens.filter((t) => t.isHome).length;
    // Win condition: Quick mode & tournament need 2 tokens; Standard needs all 4
    const targetCount = (isQuickMode || isTournament) ? 2 : 4;
    const hasFinished = homeTokensCount >= targetCount;

    return {
      ...player,
      tokens: updatedTokens,
      hasFinished,
    };
  });

  // Check captures
  const movingPlayer = updatedPlayers.find((p) => p.color === movingColor);
  const movedToken = movingPlayer?.tokens.find((t) => t.id === tokenId);

  if (movedToken && movedToken.step >= 0 && movedToken.step <= 50) {
    const targetPerimeterIdx = (START_INDICES[movingColor] + movedToken.step) % 52;
    const isSafe = SAFE_PERIMETER_INDICES.includes(targetPerimeterIdx);

    if (!isSafe) {
      // Find opponent tokens at targetPerimeterIdx
      for (const player of updatedPlayers) {
        if (player.color === movingColor) continue;
        // In team mode, teammates do NOT capture each other!
        if (isTeamMode && isTeammate(movingColor, player.color)) continue;

        for (const oppToken of player.tokens) {
          if (oppToken.step >= 0 && oppToken.step <= 50) {
            const oppPerimeterIdx = (START_INDICES[oppToken.color] + oppToken.step) % 52;
            if (oppPerimeterIdx === targetPerimeterIdx) {
              // Captured!
              oppToken.step = -1;
              oppToken.isHome = false;
              capturedToken = { color: player.color, tokenId: oppToken.id };
              break;
            }
          }
        }
        if (capturedToken) break;
      }
    }
  }

  // Win condition evaluation
  let wonGame = false;
  let teamWon: 1 | 2 | undefined;

  if (isTeamMode) {
    // Team 1: red & yellow (target: 6 home tokens combined)
    const team1HomeCount = updatedPlayers
      .filter((p) => p.color === 'red' || p.color === 'yellow')
      .reduce((sum, p) => sum + p.tokens.filter((t) => t.isHome).length, 0);

    // Team 2: green & blue (target: 6 home tokens combined)
    const team2HomeCount = updatedPlayers
      .filter((p) => p.color === 'green' || p.color === 'blue')
      .reduce((sum, p) => sum + p.tokens.filter((t) => t.isHome).length, 0);

    if (team1HomeCount >= 6) {
      wonGame = true;
      teamWon = 1;
    } else if (team2HomeCount >= 6) {
      wonGame = true;
      teamWon = 2;
    }
  } else {
    wonGame = updatedPlayers.find((p) => p.color === movingColor)?.hasFinished || false;
  }

  return {
    updatedPlayers,
    result: {
      capturedToken,
      reachedHome,
      wonGame,
      teamWon,
    },
  };
}

// Bot Decision Maker
export function pickSmartBotToken(
  botColor: PlayerColor,
  tokens: Token[],
  diceValue: number,
  allPlayers: Player[],
  gameMode: GameMode = 'vs-bot'
): number | null {
  const isQuickMode = gameMode === 'quick-match';
  const isTeamMode = gameMode === 'team-2v2';
  const eligible = tokens.filter((t) => canTokenMove(t, diceValue, isQuickMode));
  if (eligible.length === 0) return null;
  if (eligible.length === 1) return eligible[0].id;

  let bestToken = eligible[0];
  let bestScore = -999;

  for (const token of eligible) {
    let score = 0;
    const currentStep = token.step;
    const newStep = currentStep === -1 ? 0 : currentStep + diceValue;

    // 1. Entering Home is top priority
    if (newStep === MAX_STEP) {
      score += 100;
    }

    // 2. Capturing an opponent
    if (newStep >= 0 && newStep <= 50) {
      const targetPerimeter = (START_INDICES[botColor] + newStep) % 52;
      const isSafe = SAFE_PERIMETER_INDICES.includes(targetPerimeter);

      if (!isSafe) {
        for (const opp of allPlayers) {
          if (opp.color === botColor) continue;
          if (isTeamMode && isTeammate(botColor, opp.color)) continue;

          for (const oppToken of opp.tokens) {
            if (oppToken.step >= 0 && oppToken.step <= 50) {
              const oppPerimeter = (START_INDICES[opp.color] + oppToken.step) % 52;
              if (oppPerimeter === targetPerimeter) {
                score += 80;
              }
            }
          }
        }
      } else {
        // Landing on safe star
        score += 35;
      }
    }

    // 3. Coming out of yard
    if (currentStep === -1) {
      if (diceValue === 6) score += 65;
      else if (isQuickMode && diceValue === 1) score += 60;
    }

    // 4. Moving into home lane (safe from all opponents)
    if (currentStep <= 50 && newStep > 50) {
      score += 45;
    }

    // 5. Escaping danger: is current position threatened by an opponent?
    if (currentStep >= 0 && currentStep <= 50 && !isTokenInSafeZone(token)) {
      const myCurrentPerimeter = (START_INDICES[botColor] + currentStep) % 52;
      for (const opp of allPlayers) {
        if (opp.color === botColor) continue;
        if (isTeamMode && isTeammate(botColor, opp.color)) continue;

        for (const oppToken of opp.tokens) {
          if (oppToken.step >= 0 && oppToken.step <= 50) {
            const oppPerimeter = (START_INDICES[opp.color] + oppToken.step) % 52;
            const distanceBehind = (myCurrentPerimeter - oppPerimeter + 52) % 52;
            if (distanceBehind >= 1 && distanceBehind <= 6) {
              score += 30; // Run away!
            }
          }
        }
      }
    }

    // 6. Progressive distance
    score += (newStep * 0.5);

    if (score > bestScore) {
      bestScore = score;
      bestToken = token;
    }
  }

  return bestToken.id;
}
