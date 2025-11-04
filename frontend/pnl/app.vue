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
// Load user on app mount
const auth = useAuthStore();

onMounted(() => {
  const token = useCookie("token");
  if (token.value) {
    auth.initializeAuth();
  }
});
</script>
