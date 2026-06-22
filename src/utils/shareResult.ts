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
  outcome: RoundOutcome;
};

const formatMissPart = (misses: number) => `（お手つき${misses}回）`;

export const buildShareText = ({ normal, oddOne, elapsedMs, misses, outcome }: ShareParams) => {
  const seconds = formatElapsedSeconds(elapsedMs);
  const missPart = formatMissPart(misses);

  if (outcome === "surrendered") {
    return `「仲間はずれを探せ」で「${normal}」の中の「${oddOne}」に${seconds}秒で降参…${missPart}`;
  }

  return `「仲間はずれを探せ」で「${normal}」の中の「${oddOne}」を${seconds}秒で見つけた！${missPart}`;
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
