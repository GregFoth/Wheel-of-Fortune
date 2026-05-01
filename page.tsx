"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


const puzzles = [
  // 🏅 Sport
  { phrase: "WORLD CUP FINAL", category: "Sport" },

  // 📺 TV Programmes
  { phrase: "STRICTLY COME DANCING", category: "TV Programmes" },

  // 🌍 Geography
  { phrase: "MACHU PICCHU", category: "Geography" },

  // 🎬 Films
  { phrase: "BACK TO THE FUTURE", category: "Films" },
];

const finalPuzzle = { phrase: "WE ARE THE CHAMPIONS", category: "Final Round" };

const VOWELS = ["A", "E", "I", "O", "U"];
const VOWEL_COST = 250; // points
const FINAL_AUTO_LETTERS = ["R", "S", "T", "L", "N", "E"]; // auto-reveal



export default function WheelOfFortuneGame() {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [scores, setScores] = useState([0, 0, 0]);
  const [input, setInput] = useState("");
  const [gameStage, setGameStage] = useState<
    "main" | "finalIntro" | "final" | "win"
  >("main");

  const activePuzzle =
    gameStage === "final" || gameStage === "finalIntro"
      ? finalPuzzle
      : puzzles[currentPuzzle];

  const nextTurn = useCallback(() => {
    setCurrentTeam((t) => (t + 1) % scores.length);
    setSpinResult(null);
  }, [scores.length]);

  const guessConsonant = useCallback(() => {
    if (gameStage !== "main") return;
    const letter = input.toUpperCase();
    if (!letter || guessedLetters.includes(letter) || VOWELS.includes(letter))
      return;
    setGuessedLetters((g) => [...g, letter]);
    const count = activePuzzle.phrase
      .split("")
      .filter((c) => c === letter).length;
    if (count === 0) {
      nextTurn();
    }
    setInput("");
  }, [gameStage, input, guessedLetters, activePuzzle.phrase, nextTurn]);

  const solvePuzzle = useCallback(() => {
    const guess = input.toUpperCase();
    if (guess === activePuzzle.phrase) {
      setGuessedLetters(activePuzzle.phrase.replace(/[^A-Z]/g, "").split(""));
      if (gameStage === "final") setGameStage("win");
    } else if (gameStage === "main") {
      nextTurn();
    }
    setInput("");
  }, [input, activePuzzle.phrase, gameStage, nextTurn]);

  // Host keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Enter") {
        e.preventDefault();
        if (input.length === 1) guessConsonant();
        if (input.length > 1) solvePuzzle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStage, input, guessConsonant, solvePuzzle]);

  // Masked phrase
  const maskedPhrase = activePuzzle.phrase
    .split("")
    .map((char) =>
      char === " " || char === "'"
        ? char
        : guessedLetters.includes(char)
          ? char
          : "_"
    )
    .join("");

  const buyVowel = () => {
    if (gameStage !== "main") return;
    const letter = input.toUpperCase();
    if (!VOWELS.includes(letter) || guessedLetters.includes(letter)) return;
    if (scores[currentTeam] < VOWEL_COST) return;
    setScores((prev) => {
      const next = [...prev];
      next[currentTeam] -= VOWEL_COST;
      return next;
    });
    setGuessedLetters((g) => [...g, letter]);
    if (!activePuzzle.phrase.includes(letter)) nextTurn();
    setInput("");
  };

  const nextPuzzle = () => {
    if (currentPuzzle === puzzles.length - 1) {
      const topTeam = scores.indexOf(Math.max(...scores));
      setCurrentTeam(topTeam);
      setGuessedLetters([]);
      setGameStage("finalIntro");
    } else {
      setCurrentPuzzle((p) => p + 1);
      setGuessedLetters([]);
    }
  };

  // Enter final: auto-reveal R S T L N E
  useEffect(() => {
    if (gameStage === "final") {
      setGuessedLetters(FINAL_AUTO_LETTERS);
    }
  }, [gameStage]);

  if (gameStage === "win") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-900 to-blue-950 p-4">
        <Card className="w-full max-w-md border-amber-500 bg-blue-900/90 text-center">
          <CardContent className="p-8">
            <div className="mb-6 text-6xl">🏆</div>
            <h1 className="mb-6 text-3xl font-bold text-amber-400">Winner!</h1>
            <div className="space-y-3">
              {scores
                .map((s, i) => ({ team: i + 1, score: s }))
                .sort((a, b) => b.score - a.score)
                .map((t, rank) => (
                  <div
                    key={t.team}
                    className={`rounded-lg p-3 ${rank === 0 ? "bg-amber-500/20 text-amber-400" : "bg-blue-800/50 text-blue-200"}`}
                  >
                    {rank + 1}. Team {t.team} — {t.score} pts
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-blue-900 to-blue-950 p-4 text-white">
      <h1 className="mb-4 flex items-center gap-3 text-2xl font-bold text-amber-400 md:text-3xl">
        <span className="text-3xl">🇬🇧</span>
        Wheel of Fortune – Team Edition
      </h1>

      {/* FINAL ROUND INTRO */}
      {gameStage === "finalIntro" && (
        <Card className="mb-6 w-full max-w-md border-amber-500 bg-blue-800/80">
          <CardContent className="p-6 text-center">
            <h2 className="mb-2 text-2xl font-bold text-amber-400">
              Final Round
            </h2>
            <p className="mb-4 text-blue-200">
              Team {currentTeam + 1} advances!
            </p>
            <p className="mb-4 text-sm text-blue-300">
              R S T L N E will be revealed automatically.
            </p>
            <Button
              onClick={() => setGameStage("final")}
              className="bg-amber-500 text-blue-900 hover:bg-amber-400"
            >
              Start Final Round
            </Button>
          </CardContent>
        </Card>
      )}



      {/* PUZZLE BOARD */}
      <Card className="mb-6 w-full max-w-2xl border-amber-500/50 bg-blue-800/80">
        <CardContent className="p-4 md:p-6">
          <div className="mb-2 text-center text-sm font-medium text-amber-400">
            Category: {activePuzzle.category}
          </div>
          <div className="rounded-lg bg-blue-950 p-4 font-mono text-amber-300">
            <div className="mt-4 space-y-2 text-2xl tracking-widest text-center">
              {maskedPhrase.split(" ").map((word, index) => (
                <div key={index}>
                  {word}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SCORES */}
      <div className="mb-6 grid w-full max-w-2xl grid-cols-3 gap-2 md:gap-4">
        {scores.map((score, i) => (
          <Card
            key={i}
            className={`border-2 transition-all ${currentTeam === i ? "border-amber-400 bg-amber-500/20" : "border-blue-700 bg-blue-800/50"}`}
          >
            <CardContent className="p-3 text-center md:p-4">
              <div
                className={`mb-1 text-sm font-medium ${currentTeam === i ? "text-amber-400" : "text-blue-300"}`}
              >
                Team {i + 1}
              </div>
              <div
                className={`mb-2 text-xl font-bold md:text-2xl ${currentTeam === i ? "text-amber-300" : "text-white"}`}
              >
                {score} pts
              </div>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  placeholder="+/-"
                  className="h-8 w-full border-blue-600 bg-blue-900 text-center text-sm text-white placeholder:text-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const target = e.target as HTMLInputElement;
                      const value = parseInt(target.value);
                      if (!isNaN(value)) {
                        setScores((prev) => {
                          const next = [...prev];
                          next[i] = Math.max(0, next[i] + value);
                          return next;
                        });
                        target.value = "";
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>



      {/* CONTROLS */}
      <Card className="w-full max-w-md border-blue-700 bg-blue-800/80">
        <CardContent className="space-y-3 p-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter letter or solve..."
            className="border-blue-600 bg-blue-900 text-center text-lg text-white placeholder:text-blue-400"
          />

          <div className="grid grid-cols-2 gap-2">
            {gameStage === "main" && (
              <>
                <Button
                  onClick={guessConsonant}
                  className="bg-green-600 text-white hover:bg-green-500"
                >
                  Guess Consonant
                </Button>
                <Button
                  onClick={buyVowel}
                  disabled={scores[currentTeam] < VOWEL_COST}
                  className="bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  Buy Vowel ({VOWEL_COST} pts)
                </Button>
                <Button
                  onClick={solvePuzzle}
                  className="col-span-2 bg-purple-600 text-white hover:bg-purple-500"
                >
                  Solve Puzzle
                </Button>
              </>
            )}

            {gameStage === "final" && (
              <Button
                onClick={solvePuzzle}
                className="col-span-2 bg-amber-500 text-blue-900 hover:bg-amber-400"
              >
                Solve Final Puzzle
              </Button>
            )}
          </div>

          {gameStage === "main" &&
            maskedPhrase === activePuzzle.phrase &&
            currentPuzzle < puzzles.length && (
              <Button
                onClick={nextPuzzle}
                className="w-full bg-amber-500 text-blue-900 hover:bg-amber-400"
              >
                {currentPuzzle === puzzles.length - 1
                  ? "Go to Final Round"
                  : "Next Puzzle"}
              </Button>
            )}
        </CardContent>
      </Card>

      {/* INSTRUCTIONS */}
      <div className="mt-4 text-center text-xs text-blue-400">
        <p>Press ENTER to guess or solve</p>
        <p>Vowels cost {VOWEL_COST} pts | Enter +/- values under team scores to adjust points</p>
      </div>
    </div>
  );
}
