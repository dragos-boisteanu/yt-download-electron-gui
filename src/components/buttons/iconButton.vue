<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)
</script>

<template>
  <!--  TODO: disabled btn color-->
  <button
    :disabled="props.disabled"
    class="inset-shadow cursor-pointer rounded-full p-2 transition-colors ease-in-out hover:bg-zinc-100 active:bg-zinc-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 disabled:opacity-60 [&_*]:disabled:pointer-events-none"
  >
    <slot></slot>
  </button>
</template>

<style scoped></style>
