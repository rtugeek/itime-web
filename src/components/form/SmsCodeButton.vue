<script setup lang="ts">

import { useIntervalFn, useStorage } from '@vueuse/core'
import { AppConfig } from '@/common/AppConfig'
import { onMounted, ref, nextTick } from 'vue'

const countdown = useStorage<Date|undefined>(AppConfig.KEY_GET_SMS_CODE_TIME,undefined,undefined,{
  serializer:{
    read(str){
      if(str == ''){
        return undefined
      }
      return new Date(str)
    },
    write(date) {
      if(date == undefined){
        return ''
      }
      return date.toISOString()
    }
  }
})
const countdownText = ref(`60`)
function getCode(){
  countdownText.value = '60'
  countdown.value = new Date()
  resume()
}

const {resume} = useIntervalFn(()=>{
  if(countdown.value){
    const now = new Date()
    console.log(countdown.value)
    const diff = now.getTime() - countdown.value.getTime()
    if(diff >= 60 * 1000){
      countdown.value = undefined
    }else{
      countdownText.value = `${60 - Math.floor(diff / 1000)}`
    }
  }
},1000,{immediate:false})

onMounted(async ()=>{
  await nextTick()
  if (countdown.value != undefined) {
    resume()
  }
})

</script>

<template>
  <nut-button :disabled="countdown != undefined" size="small" @click="getCode">
    {{countdown == undefined ? '获取验证码' : countdownText}}
  </nut-button>
</template>

<style scoped lang="scss">

</style>
