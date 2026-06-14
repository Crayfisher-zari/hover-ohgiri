<script setup lang="ts">
import { animate,utils } from "animejs";
import { onMounted } from "vue";

const biggerAnimation = (target: HTMLElement) => {
  animate(target, {
    scale: 1.5,
    duration: 300,
  });
};

const resetAnimation = (target: HTMLElement) => {
  animate(target, {
    scale: 1,
    duration: 300,
  });
}

onMounted(() => {
  const cells = document.querySelectorAll<HTMLElement>(".cell");
  cells.forEach((cell) => {
    cell.addEventListener("mouseenter", () => {
      biggerAnimation(cell);
    });
    cell.addEventListener("mouseleave", () => {
      utils.set(cell,{scale:1.5});
      resetAnimation(cell);
    });
  });
});
</script>
<template>
  <div class="container">
    <div v-for="i in 100" class="cell">
      {{ i }}
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
</style>
