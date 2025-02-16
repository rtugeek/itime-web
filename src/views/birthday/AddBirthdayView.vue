<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Calendar, User,Word } from '@icon-park/vue-next'
import consola from 'consola'
import { showNotify, showToast } from '@nutui/nutui'
import { useI18n } from 'vue-i18n'
import BaseView from '@/components/BaseView.vue'
import { useBirthdayStore } from '@/stores/useBirthdayStore'
import { BirthdayUtils } from '@/utils/BirthdayUtils'
import { BirthdayWrapper } from '@/data/BirthdayWrapper'

const birthdayStore = useBirthdayStore()
const route = useRoute()
const { t } = useI18n()
const showDatePicker = ref(false)
const id = Number.parseInt((route.query.id ?? '0') as string)
const title = ref(t('birthday.add'))
const birthday = ref(BirthdayUtils.new())
const birthdayWrapper = ref(new BirthdayWrapper(birthday.value))
if (id > 0) {
  title.value = t('birthday.edit')
  birthdayStore.find(id.toString()).then((res) => {
    if (res) {
      birthday.value = res
      birthdayWrapper.value = new BirthdayWrapper(res)
    }
  })
}

const sourceSolarDate = computed<Date | undefined>({
  get: () => {
    return birthdayWrapper.value.getSourceSolarDate()
  },
  set: (val: Date) => {
    birthdayWrapper.value.setDate(val)
  },
})

const dateTypeModel = computed({
  get: () => {
    return birthday.value.dateType
  },
  set: (val) => {
    birthdayWrapper.value.setDateType(val)
  },
})
async function save() {
  if (!birthday.value.name.trim()) {
    showNotify.danger(t('birthday.placeholder.contact'))
    return
  }
  showToast.loading(t('saving'), { id: 'loading' })
  try {
    await birthdayStore.save(birthday.value)
  }
  catch (e) {
    consola.error(e)
  }
  showToast.hide('loading')
  window.close()
}
</script>

<template>
  <BaseView :title="title">
    <div class="flex flex-col mt-2 p-4">
      <nut-form>
        <nut-form-item :label-width="30" label-align="center">
          <template #label>
            <User />
          </template>
          <nut-input v-model="birthday.name" :placeholder="t('birthday.placeholder.contact')" />
        </nut-form-item>
        <nut-form-item :label-width="30" label-align="center">
          <template #label>
            <Word />
          </template>
          <nut-input v-model="birthday.introduction" :placeholder="t('birthday.placeholder.introduction')" />
        </nut-form-item>
        <nut-form-item :label-width="30" label-align="center" @click="showDatePicker = true">
          <template #label>
            <div class="flex items-center justify-center content-center h-full">
              <Calendar />
            </div>
          </template>
          <DateInput v-model="sourceSolarDate" v-model:date-type="dateTypeModel" lunar />
        </nut-form-item>

        <nut-form-item :label-width="30" label-align="center">
          <template #label>
              <Word />
          </template>
          <nut-radio-group v-model="birthday.single_event" direction="horizontal" @click.stop="">
            <nut-radio :label="true">
              单一事件
            </nut-radio>
            <nut-radio :label="false">
              循环事件
            </nut-radio>
          </nut-radio-group>
        </nut-form-item>
        
        
      </nut-form>
      <nut-button class="mt-4" block type="primary" @click="save">
        {{ t('save') }}
      </nut-button>
    </div>
  </BaseView>
</template>
