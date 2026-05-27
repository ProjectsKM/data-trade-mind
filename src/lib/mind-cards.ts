// Tipos compartilhados entre backend (ai-mind.ts) e frontend (mind.tsx + componentes).
// Cada operação bem-sucedida no chat de IA emite um MindCard que substitui
// (visualmente) a confirmação textual da IA.

export type TradeCardData = {
  id: string;
  ativo: string;
  dir: "COMPRA" | "VENDA";
  valor: number;
  payout: number;
  res: "WIN" | "LOSS";
  lucro: number;
  obs?: string | null;
  data?: string;
};

export type ReportByCategory = {
  categoria: "CRIPTO" | "FOREX" | "ACOES" | "OUTROS";
  count: number;
  wins: number;
  lucro: number;
};

export type MonthlyReportData = {
  label: string;            // ex: "Maio/2026"
  totalOps: number;
  wins: number;
  losses: number;
  winRate: number;          // 0-100
  lucroTotal: number;       // soma de lucros (positivo) e prejuízos (negativos)
  melhorAtivo: string | null;
  byCategory: ReportByCategory[];
};

export type WinReportPeriod = "today" | "week" | "month" | "all";

export type WinReportData = {
  period: WinReportPeriod;
  label: string;            // ex: "Últimos 7 dias"
  totalOps: number;
  wins: number;
  losses: number;
  winRate: number;
  lucroTotal: number;
  bestStreak: number;       // maior sequência de wins
  worstStreak: number;      // maior sequência de losses
};

export type MindCard =
  | { type: "trade_added"; trade: TradeCardData }
  | { type: "trade_updated"; trade: TradeCardData }
  | { type: "trade_deleted"; ativo: string; valor: number; lucro: number; res: "WIN" | "LOSS" }
  | { type: "monthly_report"; report: MonthlyReportData }
  | { type: "win_report"; report: WinReportData };

export const CARD_PREFIX = "__MIND_CARD__:";

export function serializeCard(card: MindCard): string {
  return `${CARD_PREFIX}${JSON.stringify(card)}`;
}

export function parseCard(content: string): MindCard | null {
  if (!content.startsWith(CARD_PREFIX)) return null;
  try {
    const raw = content.slice(CARD_PREFIX.length);
    const parsed = JSON.parse(raw) as MindCard;
    if (!parsed || typeof parsed !== "object" || !("type" in parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}
