<script lang="ts" setup>
import { BrowserWindowApi } from '@widget-js/core'
import { computed, reactive, toRaw } from 'vue'
import 'vue3-emoji-picker/css'
import { useRoute, useRouter } from 'vue-router'
import { showDialog, showNotify } from '@nutui/nutui'
import { Calendar, Delete, Time } from '@icon-park/vue-next'
import dayjs from 'dayjs'
import { useCountdownEventStore } from '@/stores/useCountdownEventStore'
import { CountdownEvent } from '@/data/CountdownEvent'
import { CountdownEventRepository } from '@/data/repository/CountdownEventRepository'
import { AppUtils } from '@/utils/AppUtils'

BrowserWindowApi.setAlwaysOnTop(true)
const router = useRouter()
const route = useRoute()
const id = route.query.id as string

const countdownEventStore = useCountdownEventStore()
const title = computed(
  () => id ? '编辑倒计时' : '添加倒计时',
)

const event = reactive<CountdownEvent>(new CountdownEvent('', new Date()))

if (id) {
  CountdownEventRepository.get(id).then((res) => {
    event.id = id
    if (res) {
      event.createTime = res.createTime
      event.name = res.name
    }
  })
}

function save() {
  if (!event.name.trim()) {
    showNotify.warn('名称不能为空')
    return
  }
  countdownEventStore.save(toRaw(event))
  AppUtils.back(router)
}

function deleteCountdown() {
  showDialog({
    title: `确定要删除 ${event.name}?`,
    footerDirection: 'vertical',
    onOk: () => {
      countdownEventStore.deleteCountdown(event.id!)
      AppUtils.back(router)
    },
  })
}

const dateTimeModel = computed<Date>({
  get: () => dayjs(event.sourceDateTime).toDate(),
  set: (val: Date) => {
    event.setSourceDateTime(val)
  },
})
</script>

<template>
  <BaseView :title="title">
    <template #actions>
      <nut-button v-if="event.id" size="small" @click="deleteCountdown">
        <template #icon>
          <div class="flex justify-center">
            <Delete />
          </div>
        </template>
      </nut-button>
    </template>
    <div class="section p-4">
      <nut-form label-position="top">
        <nut-form-item>
          <nut-input v-model="event.name" placeholder="请输入倒计时名称" :max-length="15">
            <template #left>
              <Calendar />
            </template>
          </nut-input>
        </nut-form-item>
        <nut-form-item>
          <DateInput v-model="dateTimeModel">
            <template #left>
              <Time />
            </template>
          </DateInput>
        </nut-form-item>
      </nut-form>
    </div>
    <div class="fixed-right-bottom gap-2 flex">
      <FloatingActionButton icon="check" @click="save" />
    </div>
  </BaseView>
</template>

<style lang="scss">
@import url('@/assets/common.scss');
.section{
  h5{
    padding-left: 1rem;
  }
}
</style>
