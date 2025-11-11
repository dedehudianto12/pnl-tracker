<template>
  <div class="space-y-4">
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {{ members.length + 1 }} total members (including owner)
            </CardDescription>
          </div>
          <Button v-if="isOwner" size="sm" @click="openAddDialog">
            <Icon name="lucide:user-plus" class="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <!-- Owner -->
          <div
            class="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
          >
            <div class="flex items-center gap-3 flex-1">
              <div
                class="h-10 w-10 rounded-full bg-primary flex items-center justify-center"
              >
                <span class="text-sm font-medium text-primary-foreground">
                  {{ getInitials(owner.name) }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-medium">{{ owner.name }}</p>
                  <Badge>Owner</Badge>
                </div>
                <p class="text-sm text-muted-foreground truncate">
                  {{ owner.email }}
                </p>
              </div>
            </div>
            <Icon name="lucide:crown" class="h-5 w-5 text-yellow-500" />
          </div>

          <!-- Members -->
          <div
            v-for="member in members"
            :key="member.id"
            class="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
          >
            <div class="flex items-center gap-3 flex-1">
              <div
                class="h-10 w-10 rounded-full bg-secondary flex items-center justify-center"
              >
                <span class="text-sm font-medium">
                  {{ getInitials(member.user.name) }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-medium">{{ member.user.name }}</p>
                  <Badge :variant="getRoleBadgeVariant(member.role)">
                    {{ member.role }}
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground truncate">
                  {{ member.user.email }}
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                  Added {{ formatRelativeTime(member.addedAt) }}
                </p>
              </div>
            </div>

            <!-- Actions (Only visible to owner) -->
            <DropdownMenu v-if="isOwner">
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon">
                  <Icon name="lucide:more-vertical" class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="openChangeRoleDialog(member)">
                  <Icon name="lucide:shield" class="mr-2 h-4 w-4" />
                  Change Role
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  class="text-destructive"
                  @click="handleRemove(member.userId)"
                >
                  <Icon name="lucide:user-minus" class="mr-2 h-4 w-4" />
                  Remove Member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <!-- Empty State for Members -->
          <div v-if="members.length === 0" class="text-center py-8">
            <Icon
              name="lucide:users"
              class="h-12 w-12 text-muted-foreground mx-auto mb-4"
            />
            <p class="text-muted-foreground mb-4">No team members yet</p>
            <Button v-if="isOwner" @click="openAddDialog" size="sm">
              <Icon name="lucide:user-plus" class="mr-2 h-4 w-4" />
              Add First Member
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Permissions Info -->
    <Card>
      <CardHeader>
        <CardTitle class="text-sm">Role Permissions</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm">
        <div class="flex items-start gap-2">
          <Icon name="lucide:crown" class="h-4 w-4 mt-0.5 text-yellow-500" />
          <div>
            <p class="font-medium">Owner</p>
            <p class="text-muted-foreground text-xs">
              Full control: Can edit, delete project, and manage team members
            </p>
          </div>
        </div>
        <div class="flex items-start gap-2">
          <Icon name="lucide:edit" class="h-4 w-4 mt-0.5" />
          <div>
            <p class="font-medium">Editor</p>
            <p class="text-muted-foreground text-xs">
              Can edit project details, expenses, and milestones
            </p>
          </div>
        </div>
        <div class="flex items-start gap-2">
          <Icon name="lucide:user" class="h-4 w-4 mt-0.5" />
          <div>
            <p class="font-medium">Member</p>
            <p class="text-muted-foreground text-xs">
              Can add and edit expenses and milestones
            </p>
          </div>
        </div>
        <div class="flex items-start gap-2">
          <Icon name="lucide:eye" class="h-4 w-4 mt-0.5" />
          <div>
            <p class="font-medium">Viewer</p>
            <p class="text-muted-foreground text-xs">
              Read-only access to project information
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Add Member Dialog -->
    <AddMemberDialog
      v-model:open="isAddDialogOpen"
      :project-id="projectId"
      @added="handleAdded"
    />

    <!-- Change Role Dialog -->
    <Dialog v-model:open="isChangeRoleOpen">
      <DialogContent class="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Change Member Role</DialogTitle>
          <DialogDescription>
            Update the role for {{ selectedMember?.user.name }}
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <Select v-model="newRole">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIEWER">Viewer</SelectItem>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="EDITOR">Editor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isChangeRoleOpen = false">
            Cancel
          </Button>
          <Button @click="handleChangeRole"> Update Role </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { User, ProjectMember } from "~/types/models";
import AddMemberDialog from "./AddMemberDialog.vue";

interface Props {
  projectId: string;
  owner: User;
  members: ProjectMember[];
  isOwner: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  refresh: [];
}>();

const toast = useToast();
const { removeMember, updateMemberRole } = useProjects();

const isAddDialogOpen = ref(false);
const isChangeRoleOpen = ref(false);
const selectedMember = ref<ProjectMember | null>(null);
const newRole = ref<"VIEWER" | "MEMBER" | "EDITOR">("MEMBER");

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getRoleBadgeVariant = (role: string) => {
  const variants: Record<string, any> = {
    VIEWER: "outline",
    MEMBER: "secondary",
    EDITOR: "default",
  };
  return variants[role] || "outline";
};

const openAddDialog = () => {
  isAddDialogOpen.value = true;
};

const openChangeRoleDialog = (member: ProjectMember) => {
  selectedMember.value = member;
  newRole.value = member.role as any;
  isChangeRoleOpen.value = true;
};

const handleAdded = () => {
  emit("refresh");
};

const handleChangeRole = async () => {
  if (!selectedMember.value) return;

  try {
    await updateMemberRole(
      props.projectId,
      selectedMember.value.userId,
      newRole.value
    );
    const memberToUpdate = props.members.find(
      (m) => m.userId === selectedMember.value!.userId
    );

    if (memberToUpdate) {
      memberToUpdate.role = newRole.value;
    }
    toast.success("Success", "Member role updated successfully");
    isChangeRoleOpen.value = false;
    emit("refresh");
  } catch (err: any) {
    toast.error("Error", err.data?.error || "Failed to update member role");
  }
};

const handleRemove = async (memberId: string) => {
  if (
    !confirm("Are you sure you want to remove this member from the project?")
  ) {
    return;
  }

  try {
    await removeMember(props.projectId, memberId);
    toast.success("Success", "Member removed successfully");
    emit("refresh");
  } catch (err: any) {
    toast.error("Error", err.data?.error || "Failed to remove member");
  }
};
</script>
