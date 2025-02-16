<script lang="ts" setup>
import { BrowserWindowApi } from '@widget-js/core'
import { computed, reactive, toRaw } from 'vue'
import 'vue3-emoji-picker/css'
import { useRoute, useRouter } from 'vue-router'
import { showDialog, showNotify } from '@nutui/nutui'
import { Calendar, Delete, Notes, Time } from '@icon-park/vue-next'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import { useCountdownEventStore } from '@/stores/useCountdownEventStore'
import { CountdownEvent } from '@/data/CountdownEvent'
import { CountdownEventRepository } from '@/data/repository/CountdownEventRepository'
import { AppUtils } from '@/utils/AppUtils'
import DateInput from '@/components/DateInput.vue'
import FloatingActionButton from '@/components/FloatingActionButton.vue'
import RecurrenceFormItem from '@/components/form/RecurrenceFormItem.vue'

BrowserWindowApi.setAlwaysOnTop(true)
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const id = route.query.id as string

const countdownEventStore = useCountdownEventStore()
const title = computed(
  () => id ? t('countdown.edit') : t('countdown.add'),
)

const event = reactive<CountdownEvent>(new CountdownEvent('', new Date()))

if (id) {
  CountdownEventRepository.get(id).then((res) => {
    event.id = id
    if (res) {
      Object.assign(event, res)
    }
  })
}

function save() {
  if (!event.name.trim()) {
    showNotify.warn(t('countdown.nameEmptyWarning'))
    return
  }
  countdownEventStore.save(toRaw(event))
  AppUtils.back(router)
}

function deleteCountdown() {
  showDialog({
    title: t('countdown.deleteConfirm', { name: event.name }),
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
          <nut-input v-model="event.name" :placeholder="t('countdown.namePlaceholder')" :max-length="15">
            <template #left>
              <Calendar />
            </template>
          </nut-input>
        </nut-form-item>
        <nut-form-item>
          <nut-input v-model="event.note" :placeholder="t('countdown.note')">
            <template #left>
              <Notes />
            </template>
          </nut-input>
        </nut-form-item>
        <nut-form-item>
          <DateInput v-model="dateTimeModel" v-model:date-type="event.dateType">
            <template #left>
              <Time />
            </template>
          </DateInput>
        </nut-form-item>
        <RecurrenceFormItem v-show="event.dateType == 0" v-model="event.recurrence" />
      </nut-form>
    </div>
    <div class="fixed-right-bottom gap-2 flex">
      <FloatingActionButton @click="save" />
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
