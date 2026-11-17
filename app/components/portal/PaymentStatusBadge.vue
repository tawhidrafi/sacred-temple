<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  status?: string | null;
}>();

const config = computed(() => {
  const s = (props.status || "unpaid").toLowerCase();
  switch (s) {
    case "paid":
      return { label: "Paid", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" };
    case "pending_verification":
      return { label: "Pending Verification", bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" };
    case "failed":
      return { label: "Failed", bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" };
    case "refunded":
      return { label: "Refunded", bg: "#F1F5F9", text: "#475569", border: "#CBD5E1" };
    case "unpaid":
    default:
      return { label: "Unpaid", bg: "#F3F4F6", text: "#4B5563", border: "#E5E7EB" };
  }
});
</script>

<template>
  <span
    class="portal-payment-badge"
    :style="{
      backgroundColor: config.bg,
      color: config.text,
      borderColor: config.border,
    }"
  >
    {{ config.label }}
  </span>
</template>

<style scoped>
.portal-payment-badge {
  display: inline-flex;
  align-items: center;
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
</style>
