import { AWG_PER_USD } from "./config";

export function awgToUsd(awg: number): number {
  return awg / AWG_PER_USD;
}

export function formatAwg(amount: number): string {
  return `Afl. ${amount.toLocaleString("en-US", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/** "Afl. 150 (~$84 USD)" */
export function formatAwgWithUsd(awg: number): string {
  return `${formatAwg(awg)} (~${formatUsd(awgToUsd(awg))} USD)`;
}

/** "Afl. 100–250" */
export function formatAwgRange(min: number, max: number): string {
  return `Afl. ${min.toLocaleString("en-US")}–${max.toLocaleString("en-US")}`;
}
