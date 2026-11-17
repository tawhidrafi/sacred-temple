<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  status?: string | null;
}>();

const config = computed(() => {
  const s = (props.status || "new").toLowerCase();
  switch (s) {
    case "confirmed":
      return { label: "Confirmed", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" };
    case "in_progress":
      return { label: "In Progress", bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" };
    case "completed":
      return { label: "Completed", bg: "#F5F3FF", text: "#5B21B6", border: "#DDD6FE" };
    case "cancelled":
      return { label: "Cancelled", bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" };
    case "new":
    case "pending":
    default:
      return { label: "Pending Review", bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" };
  }
});
</script>

<template>
  <span
    class="portal-status-badge"
    :style="{
      backgroundColor: config.bg,
      color: config.text,
      borderColor: config.border,
    }"
  >
    <span class="status-dot" :style="{ backgroundColor: config.text }" />
    {{ config.label }}
  </span>
</template>

<style scoped>
.portal-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  padding: 4px 10px;
  border-radius: 9999px;
  border-width: 1px;
  border-style: solid;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
