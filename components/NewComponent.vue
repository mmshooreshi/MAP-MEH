<template>
  <div>{{ formatdate(props.date) }}</div>
</template>

<script setup lang="ts">
defineProps<{
  formatdate: (dateTimeString: any) => string;
  props: {readonly date: Date; readonly mode: number};
}>();
</script>
