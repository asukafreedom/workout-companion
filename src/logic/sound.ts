/** Shared AudioContext, created/resumed inside a user gesture so the
 *  rest-timer chime works on iOS, where audio must be unlocked by a tap. */

let ctx: AudioContext | null = null;

export function unlockAudio(): void {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    // no audio support — the visual countdown still works
  }
}

export function beep(): void {
  try {
    ctx ??= new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.value = 0.15;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // audio blocked — fine
  }
}
