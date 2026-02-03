import { type User, createClient } from '@supabase/supabase-js'
import { BroadcastApi, type BroadcastEvent, Channel, ElectronApi, UserApi, UserApiEvent } from '@widget-js/core'
import consola from 'consola'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY0MDAwMDAwLCJleHAiOjE5MjE3NjY0MDB9.3nGFAW2q2bzxWmx1T-ycnmklITh9OcEvA1kZPXz4dBs'
const supabaseUrl = 'https://supabase.widgetjs.cn'

export const useSupabaseStore = defineStore('supabase', () => {
  const user = ref<User | null>(null)

  function newClient() {
    return createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  const client = ref(newClient())

  const isLogin = computed(() => {
    return !!user.value
  })

  async function init() {
    BroadcastApi.register(UserApiEvent.SIGNED_IN, UserApiEvent.TOKEN_REFRESHED, UserApiEvent.SIGNED_OUT)

    // Initial session check
    const session = await UserApi.getSession()
    if (session) {
      const res = await client.value.auth.setSession(session)
      if (res.error) {
        consola.error('Failed to restore Supabase session on app start', res.error)
      }
      else {
        consola.info('Supabase session restored on app start', res.data)
        user.value = res.data.user
      }
    }

    // Listeners
    ElectronApi.addIpcListener(Channel.BROADCAST, async (...args: any[]) => {
      const event = args[0] as BroadcastEvent
      if (event.event == UserApiEvent.SIGNED_OUT) {
        client.value = newClient()
        user.value = null
      }
      else if (event.event == UserApiEvent.SIGNED_IN || event.event == UserApiEvent.TOKEN_REFRESHED) {
        consola.info('User token updated', event)
        client.value = newClient()
        const res = await client.value.auth.setSession(event.payload)
        user.value = res.data.user
        if (res.data) {
          CountdownSync.sync()
        }
      }
    })
  }

  return {
    user,
    client,
    isLogin,
    init,
  }
})
