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

const items = createShuffledGridItems("鳥", "烏");


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
</script>

<template>
  <h1>仲間はずれを探せ！</h1>
  <div class="container">
    <div
      v-for="(i, index) in items"
      :key="index"
      :ref="(el) => setCellRef(el, index)"
      class="cell"
      @mouseenter="handleMouseEnter(index)"
      @mouseleave="handleMouseLeave(index)"
    >
      <div class="cell-content">
        {{ i }}
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  
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
}
</style>
