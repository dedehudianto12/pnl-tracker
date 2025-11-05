<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Add Team Member</DialogTitle>
        <DialogDescription>
          Invite a team member to collaborate on this project
        </DialogDescription>
      </DialogHeader>

      <form @submit="onSubmit" class="space-y-4">
        <!-- Email -->
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <div class="relative">
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  v-bind="componentField"
                  class="pl-10"
                />
                <Icon
                  name="lucide:mail"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5"
                />
              </div>
            </FormControl>
            <FormDescription>
              Enter the email of the person you want to add
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Role -->
        <FormField v-slot="{ componentField }" name="role">
          <FormItem>
            <FormLabel>Role</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="VIEWER">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:eye" class="h-4 w-4" />
                      <span class="font-medium">Viewer</span>
                    </div>
                    <p class="text-xs text-muted-foreground">
                      Can view project details (read-only)
                    </p>
                  </div>
                </SelectItem>
                <SelectItem value="MEMBER">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:user" class="h-4 w-4" />
                      <span class="font-medium">Member</span>
                    </div>
                    <p class="text-xs text-muted-foreground">
                      Can add expenses and milestones
                    </p>
                  </div>
                </SelectItem>
                <SelectItem value="EDITOR">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:edit" class="h-4 w-4" />
                      <span class="font-medium">Editor</span>
                    </div>
                    <p class="text-xs text-muted-foreground">
                      Can edit project and all its data
                    </p>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Choose the level of access for this member
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Error Alert -->
        <Alert v-if="error" variant="destructive">
          <Icon name="lucide:alert-circle" class="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{{ error }}</AlertDescription>
        </Alert>

        <!-- Actions -->
        <DialogFooter>
          <Button type="button" variant="outline" @click="isOpen = false">
            Cancel
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            <Icon
              v-if="isSubmitting"
              name="lucide:loader-2"
              class="mr-2 h-4 w-4 animate-spin"
            />
            Add Member
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import {
  AddMemberSchema,
  type AddMemberFormValues,
} from "~/validations/project";

interface Props {
  projectId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  added: [];
}>();

const isOpen = defineModel<boolean>("open", { required: true });
const toast = useToast();
const { addMember } = useProjects();
const error = ref<string | null>(null);

const formSchema = toTypedSchema(AddMemberSchema);

const { handleSubmit, isSubmitting, resetForm } = useForm<AddMemberFormValues>({
  validationSchema: formSchema,
  initialValues: {
    email: "",
    role: "MEMBER",
  },
});

const onSubmit = handleSubmit(async (values) => {
  error.value = null;

  try {
    await addMember(props.projectId, values.email, values.role);
    toast.success("Success", "Member added successfully");
    isOpen.value = false;
    resetForm();
    emit("added");
  } catch (err: any) {
    error.value = err.data?.error || "Failed to add member";
  }
});
</script>
