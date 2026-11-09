<script setup lang="ts"></script>

<template>
  <VMenu popper-class="[&_.v-popper\_\_arrow-container]:hidden ">
    <slot name="trigger"></slot>

    <template #popper>
      <div class="bg-zinc-100 p-2 shadow-lg">
        <slot name="content" />
      </div>
    </template>
  </VMenu>
</template>

<style scoped></style>
