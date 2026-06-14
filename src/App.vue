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

const NORMAL = "鳥";
const ODD_ONE = "あ";

const items = ref(createShuffledGridItems(NORMAL, ODD_ONE));
const round = ref(0);
const isFinished = ref(false);
const misses = ref(0);
const wrongIndex = ref<number | null>(null);

const statusLabel = computed(() => (isFinished.value ? "発見" : "探索中"));

const cellRefs = ref<HTMLElement[]>([]);

const setCellRef = (
  el: Element | ComponentPublicInstance | null,
  index: number,
) => {
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

  if (items.value[index] === ODD_ONE) {
    isFinished.value = true;
    wrongIndex.value = null;
    animate(target, {
      scale: 3,
      translateX: 0,
      translateY: 0,
      color: "#bc2e1f",
      duration: 900,
      ease: "outElastic(1, .55)",
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
  items.value = createShuffledGridItems(NORMAL, ODD_ONE);
  round.value += 1;
};
</script>

<template>
  <main class="stage">
    <header class="masthead">
      <p class="kicker"><span class="kicker__mark">○</span>Odd One Out — 仲間はずれ</p>
      <h1 class="title">仲間はずれを探せ</h1>
      <p class="lead">百九十六字の鳥のなかに、一字だけ紛れた異物がいる。</p>
    </header>

    <section class="board">
      <div class="field">
        <div class="container">
          <div
            v-for="(item, index) in items"
            :key="`${round}-${index}`"
            :ref="(el) => setCellRef(el, index)"
            class="cell"
            :class="{ 'is-correct': isFinished && item === ODD_ONE }"
            @mouseenter="handleMouseEnter(index)"
            @mouseleave="handleMouseLeave(index)"
            @click="handleClick(index)"
          >
            <span class="cell-content">{{ item }}</span>
          </div>
        </div>
      </div>

      <aside class="meta">
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
            <dd class="meta__target">{{ isFinished ? ODD_ONE : "？" }}</dd>
          </div>
        </dl>

        <p class="meta__note">
          <template v-if="isFinished">見つけたね。それが仲間はずれ。</template>
          <template v-else>盤面をなぞって、違う一字を探す。</template>
        </p>

        <button class="reset" type="button" @click="reset">
          <span class="reset__line"></span>もう一度
        </button>
      </aside>
    </section>

    <footer class="footer">
      <span>烏 — Crow in the flock</span>
      <span>2026</span>
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
  max-width: 52ch;
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
  letter-spacing: 0.12em;
  line-height: 1.04;
}

.lead {
  margin: clamp(18px, 2.4vw, 28px) auto 0;
  max-width: 34ch;
  font-size: clamp(0.85rem, 1.4vw, 1rem);
  letter-spacing: 0.06em;
  line-height: 2;
  color: var(--ink-soft);
}

/* ---------- board ---------- */
.board {
  display: flex;
  align-items: flex-start;
  gap: clamp(24px, 3vw, 56px);
}

.field {
  /* スケール時にあふれる余白を確保 */
  padding: clamp(16px, 2.4vw, 36px);
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

.cell.is-correct .cell-content::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1.7em;
  height: 1.7em;
  border: 0.1em solid var(--accent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: seal 0.6s 0.25s ease both;
}

@keyframes seal {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.4) rotate(-25deg);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
}

/* ---------- meta ---------- */
.meta {
  width: clamp(180px, 22vw, 232px);
  flex-shrink: 0;
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
  width: min(100%, 720px);
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
