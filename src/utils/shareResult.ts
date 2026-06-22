const DEFAULT_GAME_URL = "https://crayfisher-zari.github.io/hover-ohgiri/";

export const getGameUrl = () => {
  if (typeof window === "undefined") return DEFAULT_GAME_URL;
  return new URL(import.meta.env.BASE_URL, window.location.origin).href;
};

export const formatElapsedSeconds = (elapsedMs: number) => (elapsedMs / 1000).toFixed(1);

export type RoundOutcome = "won" | "surrendered";

export type ShareParams = {
  normal: string;
  oddOne: string;
  elapsedMs: number;
  misses: number;
  triedFindShortcut: boolean;
  outcome: RoundOutcome;
};

const formatStatPart = ({ misses, triedFindShortcut }: Pick<ShareParams, "misses" | "triedFindShortcut">) => {
  const parts = [`お手つき${misses}回`];
  if (triedFindShortcut) parts.push("検索でズルしようとした");
  return `（${parts.join("・")}）`;
};

export const buildShareText = ({ normal, elapsedMs, outcome, ...stats }: ShareParams) => {
  const seconds = formatElapsedSeconds(elapsedMs);
  const statPart = formatStatPart(stats);

  if (outcome === "surrendered") {
    return `「仲間はずれを探せ」で「${normal}」の中に仲間外れを見つけられずに${seconds}秒で降参…${statPart}`;
  }

  return `「仲間はずれを探せ」で「${normal}」の中に仲間外れを${seconds}秒で見つけた！${statPart}`;
};

export const buildShareMessage = (params: ShareParams) => {
  const text = buildShareText(params);
  return `${text}\n${getGameUrl()}`;
};

export const shareToX = (params: ShareParams) => {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareMessage(params))}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

export const shareToLine = (params: ShareParams) => {
  const url = `https://line.me/R/msg/text/${encodeURIComponent(buildShareMessage(params))}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

export const canUseNativeShare = () =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";

export const nativeShare = async (params: ShareParams) => {
  if (!canUseNativeShare()) return false;

  await navigator.share({
    text: buildShareText(params),
    url: getGameUrl(),
  });
  return true;
};

export const copyShareMessage = async (params: ShareParams) => {
  const message = buildShareMessage(params);
  await navigator.clipboard.writeText(message);
  return message;
};
