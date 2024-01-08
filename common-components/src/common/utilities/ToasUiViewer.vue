<script setup>
  import { onMounted } from 'vue'
  import '@toast-ui/editor/dist/toastui-editor-viewer.css';
  import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';

  const props = defineProps({
    options: Object,
    initialValue: String,
    height: {
      type: String,
      default: '300px',
    },
  });


  const container = {
    viewer: null,
  };
  onMounted(() => {
    const el = document.querySelector('#toastuiViewer');
    const options = {
      ...props.options,
      initialValue: props.initialValue,
      height: props.height,
      el,
    };
    container.viewer = new Viewer(options);
  });

  function invoke(methodName, ...args) {
    let result = null;

    if (container.viewer[methodName]) {
      result = container.viewer[methodName](...args);
    }
    return result;
  };

  defineExpose({
    invoke,
  });

</script>

<template>
  <div id="toastuiViewer"></div>
</template>

<style scoped>

</style>
