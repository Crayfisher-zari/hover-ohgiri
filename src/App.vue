<script setup lang="ts">
import { animate, eases } from "animejs";
import { type ComponentPublicInstance, computed, ref } from "vue";
import {
  getAffectedCells,
  getScaleForDistance,
  HOVER_SCALE_RADIUS,
  HOVER_EFFECT_RADIUS,
  MAX_SCALE,
  GRID_SIZE,
} from "./utils/gridHover";
import { createShuffledGridItems } from "./utils/createShuffledGridItems";

const CHAR_PAIRS = [
  { normal: "鳥", oddOne: "烏" },
  { normal: "木", oddOne: "本" },
  { normal: "日", oddOne: "目" },
  { normal: "土", oddOne: "士" },
  { normal: "未", oddOne: "末" },
  { normal: "犬", oddOne: "大" },
  { normal: "柿", oddOne: "杮" },
  { normal: "力", oddOne: "カ" },
  { normal: "千", oddOne: "チ" },
  { normal: "緑", oddOne: "縁" },
  { normal: "治", oddOne: "冶" },
  { normal: "壁", oddOne: "璧" },
  { normal: "王", oddOne: "玉" },
] as const;

const pickRandomPair = () => CHAR_PAIRS[Math.floor(Math.random() * CHAR_PAIRS.length)];

const pair = ref(pickRandomPair());
const oddOne = computed(() => pair.value.oddOne);

const items = ref(createShuffledGridItems(pair.value.normal, pair.value.oddOne));
const round = ref(0);
const isFinished = ref(false);
const misses = ref(0);
const wrongIndex = ref<number | null>(null);

const statusLabel = computed(() => (isFinished.value ? "発見" : "探索中"));

const cellRefs = ref<HTMLElement[]>([]);

const setCellRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el instanceof HTMLElement) cellRefs.value[index] = el;
};

const contentOf = (index: number) =>
  cellRefs.value[index]?.querySelector<HTMLElement>(".cell-content") ?? null;

const handleMouseEnter = (hoveredIndex: number) => {
  if (isFinished.value) return;
  const affected = getAffectedCells(hoveredIndex, HOVER_EFFECT_RADIUS, {
    maxScale: MAX_SCALE,
  });

  affected.forEach(({ index, distance, offset }) => {
    const target = contentOf(index);
    if (!target) return;
    animate(target, {
      scale: getScaleForDistance(distance, HOVER_SCALE_RADIUS, MAX_SCALE),
      translateX: offset.x,
      translateY: offset.y,
      duration: 800,
      ease: "outExpo",
    });
  });
};

const handleMouseLeave = (hoveredIndex: number) => {
  if (isFinished.value) return;
  const affected = getAffectedCells(hoveredIndex, HOVER_EFFECT_RADIUS, {
    maxScale: MAX_SCALE,
  });

  affected.forEach(({ index }) => {
    const target = contentOf(index);
    if (!target) return;
    animate(target, {
      scale: 1,
      translateX: 0,
      translateY: 0,
      duration: 800,
      ease: eases.outQuint,
    });
  });
};

const handleClick = (index: number) => {
  if (isFinished.value) return;
  const target = contentOf(index);
  if (!target) return;

  if (items.value[index] === oddOne.value) {
    isFinished.value = true;
    wrongIndex.value = null;
    animate(target, {
      color: "#bc2e1f",
      duration: 400,
      ease: "outExpo",
    });
    return;
  }

  misses.value += 1;
  wrongIndex.value = index;
  animate(target, {
    translateX: [-7, 7, -5, 5, -2, 0],
    duration: 420,
    ease: "inOutSine",
  });
};

const reset = () => {
  isFinished.value = false;
  misses.value = 0;
  wrongIndex.value = null;
  cellRefs.value = [];
  pair.value = pickRandomPair();
  items.value = createShuffledGridItems(pair.value.normal, pair.value.oddOne);
  round.value += 1;
};
</script>

<template>
  <main class="stage">
    <header class="masthead">
      <h1 class="title">仲間はずれを探せ</h1>
      <p class="lead">百九十六字の中に、一字だけ紛れた異物がいる。</p>
    </header>

    <section class="board">
      <div class="field">
        <div class="container">
          <div
            v-for="(item, index) in items"
            :key="`${round}-${index}`"
            :ref="(el) => setCellRef(el, index)"
            class="cell"
            :class="{ 'is-correct': isFinished && item === oddOne }"
            @mouseenter="handleMouseEnter(index)"
            @mouseleave="handleMouseLeave(index)"
            @click="handleClick(index)"
          >
            <span class="cell-content">{{ item }}</span>
          </div>
        </div>
      </div>

      <!-- <aside class="meta">
       <dl class="meta__list">
          <div class="meta__row">
            <dt><span class="meta__idx">01</span>Status</dt>
            <dd :class="{ 'is-found': isFinished }">{{ statusLabel }}</dd>
          </div>
          <div class="meta__row">
            <dt><span class="meta__idx">02</span>Grid</dt>
            <dd>{{ GRID_SIZE }} × {{ GRID_SIZE }}</dd>
          </div>
          <div class="meta__row">
            <dt><span class="meta__idx">03</span>Misses</dt>
            <dd>{{ String(misses).padStart(2, "0") }}</dd>
          </div>
          <div class="meta__row">
            <dt><span class="meta__idx">04</span>Target</dt>
            <dd class="meta__target">{{ isFinished ? oddOne : "？" }}</dd>
          </div>
        </dl>


       
      </aside> -->
    </section>
    <footer class="footer">
      <button class="reset" type="button" @click="reset">
        <span class="reset__line"></span>もう一度
      </button>
    </footer>
  </main>
</template>

<style scoped>
.stage {
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(32px, 5vw, 64px);
  padding: clamp(28px, 5vw, 72px);
  color: var(--ink);
}

/* ---------- masthead ---------- */
.masthead {
  text-align: center;
  max-width: auto;
}

.kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.7em;
  margin: 0 0 clamp(16px, 2vw, 28px);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.kicker__mark {
  color: var(--accent);
  font-size: 13px;
}

.title {
  margin: 0;
  font-weight: 900;
  font-size: clamp(2.4rem, 7vw, 5rem);
  line-height: 1.04;
}

.lead {
  margin: clamp(18px, 2.4vw, 28px) auto 0;
  font-size: clamp(0.85rem, 1.4vw, 1rem);
  letter-spacing: 0.06em;
  line-height: 2;
  color: var(--ink-soft);
}

/* ---------- board ---------- */
.board {
  width: 760px;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: space-between;
  gap: 64px;
}

.container {
  --cell-size: clamp(20px, 4.6vw, 38px);
  width: calc(var(--cell-size) * v-bind(GRID_SIZE));
  height: calc(var(--cell-size) * v-bind(GRID_SIZE));
  display: grid;
  grid-template-columns: repeat(v-bind(GRID_SIZE), var(--cell-size));
  grid-template-rows: repeat(v-bind(GRID_SIZE), var(--cell-size));
  place-items: center;
}

.cell {
  width: var(--cell-size);
  height: var(--cell-size);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.cell-content {
  position: relative;
  font-size: calc(var(--cell-size) * 0.34);
  font-weight: 400;
  line-height: 1;
  color: rgba(20, 18, 15, 0.62);
  transition: color 0.4s ease;
}

.cell:hover .cell-content {
  color: var(--ink);
}

.cell.is-correct {
  z-index: 2;
}

.cell.is-correct .cell-content {
  color: var(--accent);
}

/* ---------- meta ---------- */
.meta {
  width: clamp(180px, 22vw, 232px);
  flex-shrink: 0;
  margin-top: 12px;
}

.meta__list {
  margin: 0;
}

.meta__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid var(--hairline);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.meta__row:last-child {
  border-bottom: 1px solid var(--hairline);
}

.meta__row dt {
  display: inline-flex;
  align-items: baseline;
  gap: 0.8em;
  color: var(--ink-soft);
}

.meta__idx {
  font-size: 9px;
  color: var(--accent);
}

.meta__row dd {
  margin: 0;
  color: var(--ink);
}

.meta__row dd.is-found {
  color: var(--accent);
}

.meta__target {
  font-family: var(--font-serif);
  font-size: 15px;
  letter-spacing: normal;
}

.meta__note {
  margin: 20px 0 28px;
  font-size: 0.82rem;
  line-height: 1.9;
  letter-spacing: 0.05em;
  color: var(--ink-soft);
}

.reset {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 0.8em;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--ink);
}

.reset__line {
  width: 28px;
  height: 1px;
  background: var(--ink);
  transition: width 0.3s ease;
}

.reset:hover .reset__line {
  width: 44px;
}

/* ---------- footer ---------- */
.footer {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  width: 760px;
  padding-top: 20px;
  border-top: 1px solid var(--hairline);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

@media (max-width: 1024px) {
  .board {
    flex-direction: column;
    align-items: center;
  }
  .meta {
    width: min(100%, 420px);
  }
}
</style>
