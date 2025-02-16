<script setup lang="ts">
import { BirthdayCake } from '@icon-park/vue-next'
import { type PropType, computed } from 'vue'
import { MenuApi } from '@widget-js/core'
import type { Birthday } from '@/data/Birthday'
import { BirthdayWrapper } from '@/data/BirthdayWrapper'

const props = defineProps({ birthday: { type: Object as PropType<Birthday>, required: true } })
const birthdayWrapper = computed(() => new BirthdayWrapper(props.birthday))
function onItemClick() {
  MenuApi.showMenu({
    menuItems: [
      {
        label: '编辑',
        id: `edit-${props.birthday.id}`,
      },
      {
        label: '删除',
        id: `delete-${props.birthday.id}`,
      },
    ],
  })
}
</script>

<template>
  <div class="list" :class="{ active: birthdayWrapper.isToday() }" @click="onItemClick">
    <div class="left">
      <div class="name">
        <template v-if="birthdayWrapper.isOverDDL()&&birthday.single_event">
          <div class="name-yuqivalue">
          {{ birthday.name }} ---已逾期---
          </div>
        </template>
        <template v-else>
          <div class="name-value">
          {{ birthday.name }}
          </div>
        </template>
        <div class="intro-value">
          {{ birthday.introduction }}
        </div>
      </div>
      <div class="dates flex items-center">
        <div v-if="birthday.dateType == 1" class="date">
          <div class="date-type">
            农
          </div>
          <div class="date-value">
            {{ birthdayWrapper.toString() }}
          </div>
        </div>
        <template v-if="birthday.single_event">
          <div class="date">
            <div class="date-type">
              公
            </div>
            <div class="date-value">
              {{ birthdayWrapper.toString(2) }}
            </div>
          </div>
        </template>
        <template v-else>
          <div class="date">
            <div class="date-type">
              公
            </div>
            <div class="date-value">
              {{ birthdayWrapper.toString(0) }}
            </div>
          </div>
        </template>


      </div>
    </div>
    <div class="right" :class="{ active: birthday.qty == 0 }">
      <template v-if="birthday.single_event">
        <template v-if="birthdayWrapper.isOverDDL()">
          <div class="qtyuqiy">
              {{ birthdayWrapper.countdownsingle() }}
            </div>
            <div class="unit">
              天
            </div>
        </template>
        <template v-else>
          <template v-if="birthdayWrapper.isTenDayLeft()">
            <div class="qt10y">
              {{ birthdayWrapper.countdownsingle() }}
            </div>
            <div class="unit">
              天
            </div>
          </template>
          <template v-else>
            <div class="qty">
              {{ birthdayWrapper.countdownsingle() }}
            </div>
            <div class="unit">
              天
            </div>
          </template>
        </template>
      </template>
      <template v-else>
        <template v-if="birthdayWrapper.isTenDayLeft()">
          <div class="qt10y">
            {{ birthdayWrapper.countdown() }}
          </div>
          <div class="unit">
            天
          </div>
        </template>
        <template v-else>
          <div class="qty">
            {{ birthdayWrapper.countdown() }}
          </div>
          <div class="unit">
            天
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.list {
  //margin-top: 12px;
  padding: 12px;
  background-color: #FAF3E3;
  border-radius: 10px;
  display: flex;
  cursor: pointer;
  justify-content: space-between;
  z-index: 1;

  &.active {
    background: linear-gradient(90deg, #FC9F12 0%, #FAD960 100%);
    box-shadow: 1px 1px 4px 0px rgba(221, 221, 221, 0.25);
    border: 1px solid;
    border-color: #FAD960;

    .left {
      color: white;
    }

    .date {
      .date-type {
        background-color: #FFF0C5;
      }
    }
  }

  .left {
    color: #303133;
    display: flex;
    flex-flow: column;
    justify-content: space-between;

    .name {
      display: flex;
      align-items: baseline;

      .name-value {
        font-size: 16px;
        font-weight: bold;
        margin-right: 10px;
      }
      .name-yuqivalue {
        color: #a40e0e;
        font-size: 16px;
        font-weight: bold;
        margin-right: 10px;
      }
      .intro-value {
        font-size: 16px;
        font-weight: normal;
        margin-right: 10px;
      }

      .date {
        margin-top: 0px;
      }
    }

    .dates {
      gap: 6px;
      display: flex;
      align-items: center;
    }

    .date {
      display: flex;
      gap: 4px;
      font-weight: 400;
      justify-content: center;
      align-items: center;

      .date-type {
        color: #986105;
        background-color: #FAE4B1;
        font-size: 10px;
        border-radius: 4px;
        text-align: center;
        //padding: 3px;
        width: 16px;
        height: 16px;
      }

      .date-value {
        font-size: 14px;
      }
    }
  }

  .right {
    background-color: #FAE4B1;
    border-radius: 5px;
    width: 50px;
    height: 50px;
    text-align: center;

    &.active {
      border-radius: 25px;
      background-color: #FF9716;
      font-size: 22px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #FF9716;
    }

    .qty {
      color: #470a0e;
      font-size: 24px;
      font-weight: 400;
      margin: 2px;
    }

    .qt10y {
      color: #000000;
      background-color: #ba3a3a;
      font-weight: bold;
      font-size: 24px;
      font-weight: 400;
      margin: 2px;
    }
    .qtyuqiy {
      color: #000000;
      background-color: #686767;
      font-weight: bold;
      font-size: 24px;
      font-weight: 400;
      margin: 2px;
    }

    .unit {
      display: block;
      color: #47310A;
      background-color: #FADC98;
      font-size: 12px;
      height: 20px;
    }
  }
}
</style>
