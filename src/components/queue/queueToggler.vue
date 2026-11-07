<script setup lang="ts">
import { QueueListIcon } from '@heroicons/vue/24/outline'
import IconButton from '@/components/buttons/iconButton.vue'
</script>

<template>
  <VMenu popper-class="[&_.v-popper\_\_arrow-container]:hidden">
    <icon-button>
      <QueueListIcon class="size-5" />
    </icon-button>

    <template #popper>
      <div class="bg-zinc-100 p-2 shadow-lg">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
        <div>Item 4</div>
      </div>
    </template>
  </VMenu>
</template>

<style scoped></style>
