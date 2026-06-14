<script setup lang="ts">
import { animate, eases  } from "animejs";
import { type ComponentPublicInstance, ref } from "vue";
import { getAffectedCells, getScaleForDistance } from "./utils/gridHover";

const MAX_SCALE = 6;

const cellRefs = ref<HTMLElement[]>([]);

const setCellRef = (
  el: Element | ComponentPublicInstance | null,
  index: number,
) => {
  if (el instanceof HTMLElement) cellRefs.value[index] = el;
};

const handleMouseEnter = (hoveredIndex: number) => {
  const affected = getAffectedCells(hoveredIndex);

  affected.forEach(({ index, distance }) => {
    const cell = cellRefs.value[index];
    if (!cell) return;
    const target = cell.querySelector<HTMLElement>(".cell-content");
    if (!target) return;
    animate(target, {
      scale: getScaleForDistance(distance,MAX_SCALE),
      duration: 800,
      ease: "outExpo",
    });
  });
};

const handleMouseLeave = (hoveredIndex: number) => {
  const cell = cellRefs.value[hoveredIndex];
  if (!cell) return;
  // const target = cell.querySelector<HTMLElement>(".cell-content");
  // if (!target) return;
  // utils.set(target, {
  //   scale: 6,
  // });
  // animate(target, {
  //   scale: 1,
  //   duration: 300,
  // });
  const affected = getAffectedCells(hoveredIndex);

  affected.forEach(({ index, distance }) => {
    const cell = cellRefs.value[index];
    if (!cell) return;
    const target = cell.querySelector<HTMLElement>(".cell-content");
    if (!target) return;
    // utils.set(target, {
    //   scale: getScaleForDistance(distance,MAX_SCALE),
    // });
    animate(target, {
      scale: 1,
      duration: 800,
      ease: eases.outQuint,
    });
  });
};
</script>

<template>
  <div class="container">
    <div
      v-for="i in 100"
      :key="i"
      :ref="(el) => setCellRef(el, i - 1)"
      class="cell"
      @mouseenter="handleMouseEnter(i - 1)"
      @mouseleave="handleMouseLeave(i - 1)"
    >
      <div class="cell-content">
        {{ i }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 480px;
  height: 480px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(10, 48px);
  grid-template-rows: repeat(10, 48px);
  place-items: center;
}

.cell {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.cell-content {
  /* will-change: scale; */
}
</style>
