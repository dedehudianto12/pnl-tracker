<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Palette, Check } from "lucide-vue-next";

type Theme =
  | "financial-blue"
  | "warm-neutral"
  | "minimalist"
  | "dark-professional";
type Mode = "light" | "dark";

interface ThemeOption {
  value: Theme;
  label: string;
  description: string;
}

const themes: ThemeOption[] = [
  {
    value: "financial-blue",
    label: "Financial Blue",
    description: "Professional and modern",
  },
  {
    value: "warm-neutral",
    label: "Warm Neutral",
    description: "Traditional banking style",
  },
  {
    value: "minimalist",
    label: "Minimalist",
    description: "Clean grayscale design",
  },
  {
    value: "dark-professional",
    label: "Dark Professional",
    description: "Sophisticated dark theme",
  },
];

const currentTheme = ref<Theme>("financial-blue");
const currentMode = ref<Mode>("light");

// Load theme from localStorage on mount
onMounted(() => {
  if (process.client) {
    const savedTheme = localStorage.getItem("pnl-theme") as Theme;
    const savedMode = localStorage.getItem("pnl-mode") as Mode;

    if (savedTheme) currentTheme.value = savedTheme;
    if (savedMode) currentMode.value = savedMode;

    applyTheme();
  }
});

// Watch for theme changes
watch([currentTheme, currentMode], () => {
  applyTheme();
});

const applyTheme = () => {
  if (!process.client) return;

  const html = document.documentElement;

  // Remove all theme classes
  html.classList.remove(
    "financial-blue",
    "warm-neutral",
    "minimalist",
    "dark-professional"
  );
  html.classList.remove("light", "dark");

  // Apply new theme and mode
  html.classList.add(currentTheme.value);
  html.classList.add(currentMode.value);

  // Save to localStorage
  localStorage.setItem("pnl-theme", currentTheme.value);
  localStorage.setItem("pnl-mode", currentMode.value);
};

const selectTheme = (theme: Theme) => {
  currentTheme.value = theme;
};

const toggleMode = () => {
  currentMode.value = currentMode.value === "light" ? "dark" : "light";
};

const isThemeActive = (theme: Theme) => {
  return currentTheme.value === theme;
};
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Theme Selector Dropdown -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" size="icon" class="relative">
          <Palette class="h-4 w-4" />
          <span class="sr-only">Select theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-56">
        <DropdownMenuLabel>Color Scheme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          v-for="theme in themes"
          :key="theme.value"
          @click="selectTheme(theme.value)"
          class="cursor-pointer"
        >
          <div class="flex items-center justify-between w-full">
            <div class="flex flex-col">
              <span class="font-medium">{{ theme.label }}</span>
              <span class="text-xs text-muted-foreground">{{
                theme.description
              }}</span>
            </div>
            <Check
              v-if="isThemeActive(theme.value)"
              class="h-4 w-4 text-primary"
            />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <!-- Light/Dark Mode Toggle -->
    <Button variant="outline" size="icon" @click="toggleMode" class="relative">
      <svg
        v-if="currentMode === 'light'"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
      <span class="sr-only"
        >Toggle {{ currentMode === "light" ? "dark" : "light" }} mode</span
      >
    </Button>
  </div>
</template>
