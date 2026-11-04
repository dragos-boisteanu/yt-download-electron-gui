<script setup lang="ts">
const value = defineModel<boolean>({ default: false })
</script>

<template>
  <div
    class="flex h-6 w-11 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200"
    :class="value ? 'bg-sky-500' : 'bg-gray-300'"
    @click="value = !value"
  >
    <div
      class="size-5 rounded-full bg-white shadow-md transition-transform duration-200"
      :class="value ? 'translate-x-5' : 'translate-x-0'"
    ></div>
  </div>
</template>

<style scoped></style>
