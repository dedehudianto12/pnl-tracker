<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster position="bottom-right" />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from "./components/ui/sonner";
import "vue-sonner/style.css";
import { useTheme } from "./composables/useTheme";
const auth = useAuthStore();
const { initTheme, watchSystemTheme } = useTheme();

onMounted(() => {
  const token = useCookie("token");
  if (token.value) {
    auth.initializeAuth();
  }

  initTheme();
  watchSystemTheme();
});
</script>
