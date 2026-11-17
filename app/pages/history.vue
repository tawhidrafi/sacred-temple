<script setup lang="ts">
// Clean 301 redirect to the dynamic sacred history section on About page
await navigateTo("/about", { redirectCode: 301, replace: true });
</script>

<template>
  <div class="redirect-container" style="padding: 6rem 2rem; text-align: center; color: var(--text-secondary, #475569);">
    <p>Redirecting to <NuxtLink to="/about" style="color: var(--accent, #6E0516); font-weight: 700;">Sacred Temple History &amp; Heritage</NuxtLink>...</p>
  </div>
</template>
