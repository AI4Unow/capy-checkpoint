"use client";

import { useState, useEffect, useCallback } from "react";

interface OnscreenCalculatorProps {
  /** Whether calculator is visible */
  isOpen: boolean;
  /** Callback to close calculator */
  onClose: () => void;
}

/**
 * Onscreen calculator to help students with math questions
 * Follows Kawaii/Cottagecore design aesthetic
 */
export function OnscreenCalculator({ isOpen, onClose }: OnscreenCalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // Reset function for clear button
  const clearDisplay = useCallback(() => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }, [display, waitingForOperand]);

  const clearEntry = useCallback(() => {
    setDisplay("0");
  }, []);

  const toggleSign = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value * -1));
  }, [display]);

  const inputPercent = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  }, [display]);

  const performOperation = useCallback((nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue;
      let result: number;

      switch (operator) {
        case "+":
          result = currentValue + inputValue;
          break;
        case "-":
          result = currentValue - inputValue;
          break;
        case "×":
          result = currentValue * inputValue;
          break;
        case "÷":
          result = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        default:
          result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  }, [display, operator, previousValue]);

  const calculate = useCallback(() => {
    if (operator === null || previousValue === null) return;

    const inputValue = parseFloat(display);
    let result: number;

    switch (operator) {
      case "+":
        result = previousValue + inputValue;
        break;
      case "-":
        result = previousValue - inputValue;
        break;
      case "×":
        result = previousValue * inputValue;
        break;
      case "÷":
        result = inputValue !== 0 ? previousValue / inputValue : 0;
        break;
      default:
        result = inputValue;
    }

    setDisplay(String(result));
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  }, [display, operator, previousValue]);

  const backspace = useCallback(() => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  }, [display]);

  // Keyboard support - only active when calculator is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent game controls from triggering
      e.stopPropagation();

      if (e.key >= "0" && e.key <= "9") {
        inputDigit(e.key);
      } else if (e.key === ".") {
        inputDecimal();
      } else if (e.key === "+" || e.key === "-") {
        performOperation(e.key);
      } else if (e.key === "*") {
        performOperation("×");
      } else if (e.key === "/") {
        e.preventDefault();
        performOperation("÷");
      } else if (e.key === "Enter" || e.key === "=") {
        calculate();
      } else if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Backspace") {
        backspace();
      } else if (e.key === "c" || e.key === "C") {
        clearDisplay();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, inputDigit, inputDecimal, performOperation, calculate, onClose, backspace, clearDisplay]);

  if (!isOpen) return null;

  // Button styles following design guidelines
  const btnBase = "w-14 h-12 rounded-xl border-4 border-text font-[family-name:var(--font-baloo)] text-xl text-text hover:scale-105 active:scale-95 transition-transform shadow-md";
  const btnNumber = `${btnBase} bg-cream hover:bg-yellow/30`;
  const btnOperator = `${btnBase} bg-sage hover:bg-sage/80`;
  const btnAction = `${btnBase} bg-pink hover:bg-pink/80`;

  return (
    <div
      className="absolute z-30 bottom-20 left-4"
      role="dialog"
      aria-label="Calculator"
    >
      {/* Calculator body */}
      <div className="bg-white/95 rounded-3xl border-4 border-text p-3 shadow-xl">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-2">
          <span className="font-[family-name:var(--font-fredoka)] text-sm text-text/70 pl-2">
            🧮 Calculator
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-pink/50 hover:bg-pink border-2 border-text flex items-center justify-center text-text hover:scale-110 transition-transform"
            aria-label="Close calculator"
          >
            ✕
          </button>
        </div>

        {/* Display */}
        <div className="bg-cream rounded-xl border-4 border-text px-3 py-2 mb-3 text-right font-[family-name:var(--font-baloo)] text-3xl text-text overflow-hidden">
          <div className="truncate">{display}</div>
        </div>

        {/* Button grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Row 1: C, CE, %, ÷ */}
          <button onClick={clearDisplay} className={btnAction}>C</button>
          <button onClick={clearEntry} className={btnAction}>CE</button>
          <button onClick={inputPercent} className={btnOperator}>%</button>
          <button onClick={() => performOperation("÷")} className={btnOperator}>÷</button>

          {/* Row 2: 7, 8, 9, × */}
          <button onClick={() => inputDigit("7")} className={btnNumber}>7</button>
          <button onClick={() => inputDigit("8")} className={btnNumber}>8</button>
          <button onClick={() => inputDigit("9")} className={btnNumber}>9</button>
          <button onClick={() => performOperation("×")} className={btnOperator}>×</button>

          {/* Row 3: 4, 5, 6, - */}
          <button onClick={() => inputDigit("4")} className={btnNumber}>4</button>
          <button onClick={() => inputDigit("5")} className={btnNumber}>5</button>
          <button onClick={() => inputDigit("6")} className={btnNumber}>6</button>
          <button onClick={() => performOperation("-")} className={btnOperator}>−</button>

          {/* Row 4: 1, 2, 3, + */}
          <button onClick={() => inputDigit("1")} className={btnNumber}>1</button>
          <button onClick={() => inputDigit("2")} className={btnNumber}>2</button>
          <button onClick={() => inputDigit("3")} className={btnNumber}>3</button>
          <button onClick={() => performOperation("+")} className={btnOperator}>+</button>

          {/* Row 5: ±, 0, ., = */}
          <button onClick={toggleSign} className={btnNumber}>±</button>
          <button onClick={() => inputDigit("0")} className={btnNumber}>0</button>
          <button onClick={inputDecimal} className={btnNumber}>.</button>
          <button onClick={calculate} className={`${btnBase} bg-sky hover:bg-sky/80`}>=</button>
        </div>

        {/* Backspace button */}
        <button
          onClick={backspace}
          className="w-full mt-2 h-10 rounded-xl border-4 border-text bg-cream hover:bg-yellow/30 font-[family-name:var(--font-baloo)] text-lg text-text hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          ⌫ Backspace
        </button>
      </div>
    </div>
  );
}
