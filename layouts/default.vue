<script lang="ts" setup></script>
<template>
  <div class="flex flex-col min-h-screen">
    <LandingHeader hide-hero />
    <div
      class="flex-1 max-w-screen w-full h-full max-h-screen mx-auto z-0 overflow-hidden"
    >
      <slot />
    </div>
    <LandingFooter />
  </div>
</template>
