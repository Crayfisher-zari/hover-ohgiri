<script setup lang="ts">
import { animate, eases  } from "animejs";
import { type ComponentPublicInstance, ref } from "vue";
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

const items = createShuffledGridItems(NORMAL, ODD_ONE);
const gameResult = ref<"correct" | "incorrect" | null>(null);
const isFinished = ref(false);
const wrongIndex = ref<number | null>(null);


const cellRefs = ref<HTMLElement[]>([]);

const setCellRef = (
  el: Element | ComponentPublicInstance | null,
  index: number,
) => {
  if (el instanceof HTMLElement) cellRefs.value[index] = el;
};

const handleMouseEnter = (hoveredIndex: number) => {
  const affected = getAffectedCells(hoveredIndex, HOVER_EFFECT_RADIUS, {
    maxScale: MAX_SCALE,

  });


  affected.forEach(({ index, distance, offset }) => {
    const cell = cellRefs.value[index];
    if (!cell) return;    
    const target = cell.querySelector<HTMLElement>(".cell-content");
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
  const affected = getAffectedCells(hoveredIndex, HOVER_EFFECT_RADIUS, {
    maxScale: MAX_SCALE,
  });

  affected.forEach(({ index }) => {
    const cell = cellRefs.value[index];
    if (!cell) return;
    const target = cell.querySelector<HTMLElement>(".cell-content");
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

  if (items[index] === ODD_ONE) {
    gameResult.value = "correct";
    isFinished.value = true;
    wrongIndex.value = null;
    return;
  }

  gameResult.value = "incorrect";
  wrongIndex.value = index;
};
</script>

<template>
  <main class="game">
  <h1>仲間はずれを探せ！</h1>
  <p v-if="gameResult === 'correct'" class="result result--correct">正解！</p>
  <p v-else-if="gameResult === 'incorrect'" class="result result--incorrect">
    違うよ…もう一度探してみて
  </p>
  <div class="container">
    <div
      v-for="(item, index) in items"
      :key="index"
      :ref="(el) => setCellRef(el, index)"
      class="cell"
     
      @mouseenter="handleMouseEnter(index)"
      @mouseleave="handleMouseLeave(index)"
      @click="handleClick(index)"
    >
      <div class="cell-content" :class="{
        'correct': isFinished && item === ODD_ONE,
        'wrong': wrongIndex === index,
      }">
        {{ item }}
      </div>
    </div>
  </div>
</main>
</template>

<style scoped>
.game {
  margin: 0 auto;
  padding: 20px;
}

.result {
  text-align: center;
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: bold;
}

.result--correct {
  color: #2e7d32;
}

.result--incorrect {
  color: #c62828;
}

.container {
  --cell-size: 36px;
  width: calc(var(--cell-size) * v-bind(GRID_SIZE));
  height: calc(var(--cell-size) * v-bind(GRID_SIZE));
  margin: 0 auto;
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
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.cell-content {
  font-size: 10px;
  font-weight: 900;
  line-height: 1;
  text-align: center;
  &.correct {
    background: #c8e6c9;
  }
  &.wrong {
    background: #ffcdd2;
  }
}

.cell--correct {
  background: #c8e6c9;
}

.cell--wrong {
  background: #ffcdd2;
}
</style>
