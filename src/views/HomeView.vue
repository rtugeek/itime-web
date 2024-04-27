<script setup lang="ts">

</script>

<template>
  <main>
    <div class="flex flex-col w-full">
      <nut-navbar title="添加代办事项" left-show></nut-navbar>
      <div class="flex flex-col mt-2 p-4">
        <nut-form>
          <nut-form-item label="代办事项" label-align="center">
            <nut-input placeholder="请输入内容"/>
          </nut-form-item>
          <nut-form-item label="提醒时间" label-align="center">
            <nut-input />
          </nut-form-item>
        </nut-form>

        <nut-button class="mt-4" block type="primary">保存</nut-button>
      </div>
    </div>
  </main>
</template>
