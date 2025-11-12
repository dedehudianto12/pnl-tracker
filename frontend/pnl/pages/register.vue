<template>
  <Card>
    <CardHeader class="pb-4">
      <CardTitle class="text-2xl font-bold text-center"
        >Create Account</CardTitle
      >
      <CardDescription class="text-center text-muted-foreground mt-2">
        Please fill in the details to create your account
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form class="space-y-6" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <div class="relative">
                <Input
                  placeholder="John Doe"
                  v-bind="componentField"
                  class="pl-10"
                />
                <Icon
                  name="lucide:user"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <div class="relative">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  v-bind="componentField"
                  class="pl-10"
                />
                <Icon
                  name="lucide:mail"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <div class="relative">
                <Input
                  type="password"
                  placeholder="••••••••"
                  v-bind="componentField"
                  class="pl-10"
                />
                <Icon
                  name="lucide:lock"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5"
                />
              </div>
            </FormControl>
            <FormDescription>Must be at least 6 characters</FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <Alert v-if="error" variant="destructive">
          <Icon name="lucide:alert-circle" class="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{{ error }}</AlertDescription>
        </Alert>

        <Button type="submit" class="w-full" :disabled="isSubmitting">
          <Icon
            v-if="isSubmitting"
            name="lucide:loader-2"
            class="mr-2 h-4 w-4 animate-spin"
          />
          {{ isSubmitting ? "Creating Account..." : "Create Account" }}
        </Button>
      </form>
    </CardContent>

    <CardFooter class="flex flex-col items-center">
      <p class="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?
        <NuxtLink to="/login" class="text-primary hover:underline font-medium">
          Login here
        </NuxtLink>
      </p>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { RegisterSchema, type RegisterFormValues } from "~/validations/auth";

definePageMeta({
  layout: "auth",
  middleware: "guest",
});

const auth = useAuthStore();
const toast = useToast();
const error = ref<string | null>(null);

const formSchema = toTypedSchema(RegisterSchema);

const { handleSubmit, isSubmitting } = useForm<RegisterFormValues>({
  validationSchema: formSchema,
  initialValues: {
    name: "",
    email: "",
    password: "",
  },
});

const onSubmit = handleSubmit(async (values) => {
  error.value = null;

  try {
    await auth.register(values);
    toast.success("Success", "Account created successfully");
    navigateTo("/");
  } catch (err: any) {
    error.value = err.data?.error || "Registration failed";
  }
});
</script>
