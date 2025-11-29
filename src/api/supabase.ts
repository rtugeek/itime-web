import { createClient } from '@supabase/supabase-js'
import type { BroadcastEvent } from '@widget-js/core'
import { BroadcastApi, Channel, ElectronApi, UserApi, UserApiEvent } from '@widget-js/core'
import consola from 'consola'

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY0MDAwMDAwLCJleHAiOjE5MjE3NjY0MDB9.3nGFAW2q2bzxWmx1T-ycnmklITh9OcEvA1kZPXz4dBs'
const supabaseUrl = 'https://supabase.widgetjs.cn'
function newClient() {
  return createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
const supabase = newClient()
function getSupabaseClient() {
  return supabase
}

function setupBroadcast() {
  BroadcastApi.register(UserApiEvent.SIGNED_IN, UserApiEvent.TOKEN_REFRESHED, UserApiEvent.SIGNED_OUT)
  UserApi.getSession().then(async (session) => {
    if (session) {
      const res = await supabase.auth.setSession(session)
      if (res.error) {
        consola.error('Failed to restore Supabase session on app start', res.error)
      }
      else {
        consola.info('Supabase session restored on app start', res.data)
      }
    }
  })
  ElectronApi.addIpcListener(Channel.BROADCAST, (...args: any[]) => {
    const event = args[0] as BroadcastEvent
    if (event.event == UserApiEvent.SIGNED_OUT) {
      consola.info('App User sign out', event)
    }
    else if (event.event == UserApiEvent.SIGNED_IN || event.event == UserApiEvent.TOKEN_REFRESHED) {
      consola.info('User token updated', event)
    }
  })
}
setupBroadcast()

export { getSupabaseClient }
