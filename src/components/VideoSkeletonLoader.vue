<script setup lang="ts"></script>

<template>
  <div
    class="my-2 flex w-full animate-pulse flex-wrap items-center gap-2 rounded-lg bg-zinc-50 p-2 shadow"
  >
    <!-- Left section matching structure and min-width -->
    <div class="flex min-w-96 flex-1 items-start gap-x-4">
      <!-- Thumbnail placeholder (h-16 w-26) -->
      <div class="h-16 w-26 shrink-0 rounded-lg bg-zinc-300"></div>

      <!-- Details block -->
      <div class="flex min-w-0 flex-1 items-center gap-x-4">
        <div class="flex min-w-0 flex-1 flex-col justify-start gap-y-2 py-1">
          <!-- Title line placeholder -->
          <div class="h-4 w-3/4 rounded bg-zinc-300"></div>

          <!-- Meta info (Duration & Size) placeholders -->
          <div class="flex items-center gap-x-4">
            <div class="h-3 w-20 rounded bg-zinc-200"></div>
            <div class="h-3 w-16 rounded bg-zinc-200"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right section (Tags + Download button) -->
    <div class="flex w-full items-center justify-between gap-4 md:w-fit">
      <div class="flex items-center gap-x-4">
        <!-- Resolution tag placeholder (w-20) -->
        <div class="h-6 w-20 rounded-md bg-zinc-200"></div>

        <!-- Codec tag placeholder (w-12) -->
        <div class="h-6 w-12 rounded-md bg-zinc-200"></div>
      </div>

      <!-- Download button placeholder -->
      <div class="h-9 w-24 shrink-0 rounded bg-zinc-300"></div>
    </div>
  </div>
</template>

<style scoped></style>
