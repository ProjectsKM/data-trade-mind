export type Categoria = "CRIPTO" | "FOREX" | "ACOES";

export const ASSETS: Record<Categoria, string[]> = {
  CRIPTO: ["BTC/USD", "XRP/USD", "BCH/USD", "LTC/USD", "ETH/USD", "BNB/USD", "SOL/USD"],
  FOREX: [
    "GBP/AUD", "EUR/NZD", "AUD/CAD", "AUD/NZD", "AUD/JPY", "CAD/CHF",
    "CAD/JPY", "CHF/JPY", "EUR/CHF", "EUR/AUD", "EUR/CAD", "EUR/GBP",
    "EUR/USD", "NZD/CHF", "USD/JPY", "NZD/CAD",
  ],
  ACOES: ["Apple", "Amazon", "McDonalds", "Microsoft", "Tesla"],
};

export const CATEGORIA_LABEL: Record<Categoria, string> = {
  CRIPTO: "Cripto",
  FOREX: "Opções (Forex)",
  ACOES: "Ações",
};

export function payoutForCategoria(c: Categoria): number {
  if (c === "CRIPTO") return 86;
  if (c === "FOREX") return 85;
  return 83;
}

export function categoriaForAtivo(ativo: string): Categoria | null {
  const up = ativo.toUpperCase();
  for (const [cat, list] of Object.entries(ASSETS) as [Categoria, string[]][]) {
    if (list.some((a) => a.toUpperCase() === up)) return cat;
  }
  return null;
}

export function calcLucro(valor: number, payout: number, res: "WIN" | "LOSS" | "OPEN"): number {
  if (res === "WIN") return +(valor * (payout / 100)).toFixed(2);
  if (res === "LOSS") return -valor;
  return 0;
}

const BANCA_KEY = "orion.gestao.banca";
const VALOR_MODE_KEY = "orion.gestao.valorMode";

export function getBanca(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(BANCA_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return isFinite(n) && n > 0 ? n : null;
}

export function setBanca(v: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BANCA_KEY, String(v));
}

export function getValorMode(): "VALOR" | "PCT" {
  if (typeof window === "undefined") return "VALOR";
  return (window.localStorage.getItem(VALOR_MODE_KEY) as "VALOR" | "PCT") || "VALOR";
}

export function setValorMode(m: "VALOR" | "PCT"): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VALOR_MODE_KEY, m);
}