<script setup lang="ts">
import { QueueListIcon } from '@heroicons/vue/24/outline'
import IconButton from '@/components/buttons/iconButton.vue'
import { useQueueStore } from '@/stores/queue'
import MenuComponent from '@/components/menuComponent.vue'
import QueueItem from '@/components/queue/queueItem.vue'

const queueStore = useQueueStore()
</script>

<template>
  <menu-component>
    <template #trigger>
      <icon-button>
        <QueueListIcon class="size-5" />
      </icon-button>
    </template>

    <template #content>
      <div v-if="queueStore.hasItems" class="rounded-2xl bg-neutral-50">
        <queue-item :item="item" v-for="item in queueStore.list" :key="item.uniqueId" />
      </div>
      <div v-else class="text-xs text-neutral-800">No queened downloads</div>
    </template>
  </menu-component>
</template>

<style scoped></style>
