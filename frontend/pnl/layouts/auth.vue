<template>
  <div
    class="min-h-screen bg-linear-to-br from-primary-500 to-primary-700 flex items-center justify-center px-4"
  >
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary mb-2">PNL Tracker</h1>
        <p class="text-foreground">Project Profit & Loss Management</p>
      </div>

      <div class="rounded-lg shadow-xl">
        <slot />
      </div>

      <p class="mt-4 text-center text-primary-100 text-sm">
        © 2025 PNL Tracker. All rights reserved.
      </p>
    </div>
  </div>
</template>
