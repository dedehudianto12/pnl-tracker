<template>
  <!-- NOTE: Applying the dark theme class to the wrapper for consistency -->
  <div
    class="min-h-screen dark:bg-background bg-gray-50 dark:text-foreground text-gray-900"
  >
    <!-- Header -->
    <header
      class="bg-card dark:bg-card border-b border-border sticky top-0 z-40 shadow-sm"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <!-- Use text-primary for theme integration -->
            <NuxtLink to="/" class="text-xl font-bold text-primary">
              PNL Tracker
            </NuxtLink>
          </div>

          <!-- Navigation -->
          <nav class="hidden md:flex space-x-8">
            <NuxtLink
              to="/"
              active-class="text-primary border-b-2 border-primary"
              class="text-muted-foreground hover:text-green-500 px-3 py-2 text-sm font-medium transition-colors"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/projects"
              active-class="text-primary border-b-2 border-primary"
              class="text-muted-foreground hover:text-green-500 px-3 py-2 text-sm font-medium transition-colors"
            >
              Projects
            </NuxtLink>
          </nav>

          <!-- Right side -->
          <div class="flex items-center space-x-4">
            <!-- Notifications (Kept as is) -->
            <!-- <NotificationDropdown /> -->

            <!-- User Menu (Replaces UDropdown) -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <!-- Replaces UButton -->
                <Button variant="ghost" class="gap-2">
                  {{ auth.user?.name || "User" }}
                  <Icon name="lucide:chevron-down" class="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent class="w-56" align="end">
                <!-- Account Info (Replaces slot: "account") -->
                <DropdownMenuLabel class="flex flex-col">
                  <span class="font-normal">{{
                    auth.user?.name || "Guest"
                  }}</span>
                  <span class="text-xs text-muted-foreground font-light">{{
                    auth.user?.email || "No email"
                  }}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <!-- Profile Link -->
                <DropdownMenuItem @click="navigateTo('/profile')">
                  <Icon name="lucide:user" class="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <!-- Logout Action -->
                <DropdownMenuItem @click="auth.logout()">
                  <Icon name="lucide:log-out" class="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Sonner Toaster for Notifications -->
    <Toaster />
  </div>
</template>

<script setup lang="ts">
// Assuming these imports/utilities are correctly defined:
// 1. Your custom store
const auth = useAuthStore();
// 2. Navigation function
const navigateTo = useNuxtApp().$router.push;
</script>
