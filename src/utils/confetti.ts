import confetti from 'canvas-confetti';

let activeTimeouts: number[] = [];

/**
 * Multi-wave celebratory flower/confetti shower when spinning completes
 * Kept well-timed so it completes within ~3.5 seconds
 */
export function fireCelebrationShower() {
  clearAllConfetti();

  try {
    // Wave 1: Center dramatic burst
    confetti({
      particleCount: 75,
      spread: 90,
      origin: { x: 0.5, y: 0.55 },
      colors: ['#06b6d4', '#f43f5e', '#fbbf24', '#a855f7', '#ffffff', '#10b981'],
      ticks: 100,
      gravity: 1.1,
      scalar: 1.1,
      disableForReducedMotion: true,
    });

    // Wave 2: Left celebratory cannon (after 300ms)
    const t1 = window.setTimeout(() => {
      confetti({
        particleCount: 55,
        angle: 60,
        spread: 60,
        origin: { x: 0.1, y: 0.7 },
        colors: ['#fbbf24', '#f43f5e', '#38bdf8', '#34d399', '#ec4899'],
        ticks: 110,
        gravity: 1.0,
        scalar: 1.1,
      });
    }, 300);
    activeTimeouts.push(t1);

    // Wave 3: Right celebratory cannon (after 600ms)
    const t2 = window.setTimeout(() => {
      confetti({
        particleCount: 55,
        angle: 120,
        spread: 60,
        origin: { x: 0.9, y: 0.7 },
        colors: ['#06b6d4', '#fbbf24', '#f43f5e', '#a855f7', '#38bdf8'],
        ticks: 110,
        gravity: 1.0,
        scalar: 1.1,
      });
    }, 600);
    activeTimeouts.push(t2);

    // Wave 4: Gentle raining petals (after 1100ms)
    const t3 = window.setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { x: 0.5, y: 0.35 },
        colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#ffffff'],
        ticks: 120,
        gravity: 0.8,
        scalar: 1.0,
      });
    }, 1100);
    activeTimeouts.push(t3);
  } catch {
    // Canvas might not be available
  }
}

/**
 * Fires a celebratory burst when student answers correctly (1-1.5s)
 */
export function fireCorrectAnswerConfetti() {
  clearAllConfetti();

  try {
    const count = 60;
    confetti({
      particleCount: count,
      angle: 60,
      spread: 55,
      origin: { x: 0.15, y: 0.6 },
      colors: ['#10b981', '#34d399', '#fbbf24', '#38bdf8', '#ffffff'],
      ticks: 90,
      gravity: 1.1,
    });
    confetti({
      particleCount: count,
      angle: 120,
      spread: 55,
      origin: { x: 0.85, y: 0.6 },
      colors: ['#10b981', '#34d399', '#fbbf24', '#38bdf8', '#ffffff'],
      ticks: 90,
      gravity: 1.1,
    });
  } catch {
    // ignore
  }
}

/**
 * STOPS AND CLEARS ALL CONFETTI PARTICLES & TIMERS IMMEDIATELY
 * Mandatory requirement 13: Clean up before question appears.
 */
export function clearAllConfetti() {
  activeTimeouts.forEach((t) => clearTimeout(t));
  activeTimeouts = [];
  try {
    confetti.reset();
  } catch {
    // ignore
  }
}

export function fireConfetti(intensity: 'reel' | 'correct' = 'reel') {
  if (intensity === 'reel') {
    fireCelebrationShower();
  } else {
    fireCorrectAnswerConfetti();
  }
}
