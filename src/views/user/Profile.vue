<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Camera, Loader2, UserRound } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { useUserStore } from '@/stores/useUserStore'
import { UserApi } from '@/api/UserApi'
import { uploadAvatar } from '@/api/AvatarApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import AvatarCropper from '@/components/AvatarCropper.vue'

const store = useUserStore()
const displayName = computed(() => store.user?.nick || 'iTime 用户')
const editingNick = ref(false)
const editingAvatar = ref(false)
const cropper = ref<InstanceType<typeof AvatarCropper>>()
const cropReady = ref(false)
const nick = ref('')
const saving = ref(false)
const uploading = ref(false)
const busy = computed(() => saving.value || uploading.value)
const error = ref('')
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File>()
const preview = ref('')

function clearPreview() {
  if (preview.value) { URL.revokeObjectURL(preview.value) }
  preview.value = ''
  selectedFile.value = undefined
  cropReady.value = false
}
onBeforeUnmount(clearPreview)

function setNickOpen(open: boolean) {
  if (busy.value) { return }
  editingNick.value = open
  error.value = ''
}
function setAvatarOpen(open: boolean) {
  if (busy.value) { return }
  clearPreview()
  error.value = ''
  editingAvatar.value = open
}

function editNick() {
  nick.value = store.user?.nick || ''
  error.value = ''
  editingNick.value = true
}

async function saveNick() {
  if (busy.value) { return }
  const value = nick.value.trim()
  if (!value || value.length > 16) {
    error.value = '昵称不能为空，且不能超过 16 个字符（表情可能占多个字符）'
    return
  }
  saving.value = true
  error.value = ''
  const token = store.user?.accessToken
  let saved = false
  try {
    await UserApi.updateNick(value)
    saved = true
    if (store.user?.accessToken !== token) { throw new Error('登录状态已改变，请重新打开账户页面') }
    await store.refreshProfile()
    editingNick.value = false
    toast.success('昵称已更新')
  }
  catch (cause) {
    error.value = saved ? '昵称已保存，但资料刷新失败，请重新打开账户页面。' : cause instanceof Error ? cause.message : '昵称保存失败，请稍后重试'
  }
  finally { saving.value = false }
}

function selectAvatar(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || busy.value) { return }
  clearPreview()
  error.value = ''
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) {
    error.value = '请选择 5 MB 以内的 JPG、PNG 或 WebP 图片'
    return
  }
  selectedFile.value = file
  preview.value = URL.createObjectURL(file)
}

async function saveAvatar() {
  if (!selectedFile.value || !cropReady.value || !cropper.value || busy.value) { return }
  uploading.value = true
  error.value = ''
  const token = store.user?.accessToken
  let uploaded = false
  try {
    const croppedFile = await cropper.value.getCroppedFile()
    await uploadAvatar(croppedFile, store.user?.uuid || '', () => !!token && store.user?.accessToken === token)
    uploaded = true
    if (store.user?.accessToken !== token) { throw new Error('登录状态已改变，请重新打开账户页面') }
    await store.refreshProfile()
    clearPreview()
    editingAvatar.value = false
    toast.success('头像已更新')
  }
  catch (cause) {
    error.value = uploaded ? '头像已上传，但资料刷新失败，请重新打开账户页面。' : cause instanceof Error ? cause.message : '头像上传失败，请稍后重试'
  }
  finally { uploading.value = false }
}
</script>

<template>
  <section class="flex w-full max-w-3xl flex-col gap-6">
    <h1 class="text-xl font-semibold tracking-tight text-foreground">
      账户信息
    </h1>
    <div class="overflow-hidden rounded-xl border bg-card text-card-foreground" :aria-busy="busy">
      <div class="flex flex-wrap items-center gap-5 border-b p-5 sm:p-6">
        <Avatar class="size-20 shrink-0 rounded-2xl">
          <AvatarImage v-if="store.user?.avatar" :src="store.user.avatar" :alt="displayName" class="object-cover" />
          <AvatarFallback class="rounded-2xl bg-muted">
            <UserRound class="size-8 text-muted-foreground" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
        <div class="min-w-0 flex-1">
          <h2 class="break-words text-lg font-semibold">
            {{ displayName }}
          </h2>
        </div>
        <Button class="ml-auto shrink-0" variant="outline" size="sm" :disabled="busy" @click="setAvatarOpen(true)">
          <Camera class="size-4" aria-hidden="true" />
          修改头像
        </Button>
      </div>
      <div class="px-5 sm:px-6">
        <div class="grid gap-3 py-5 sm:grid-cols-[6rem_minmax(0,1fr)] sm:items-start">
          <span id="profile-nick-label" class="text-sm text-muted-foreground sm:pt-2">昵称</span>
          <div class="flex min-w-0 items-center justify-between gap-3">
            <span class="break-all text-sm">{{ store.user?.nick || '未设置' }}</span>
            <Button size="sm" variant="ghost" :disabled="busy" @click="editNick">
              修改
            </Button>
          </div>
        </div>
      </div>
    </div>
    <Dialog :open="editingNick" @update:open="setNickOpen">
      <DialogContent class="gap-6 p-6 sm:p-8" :show-close-button="!busy" @interact-outside="busy && $event.preventDefault()" @escape-key-down="busy && $event.preventDefault()">
        <DialogHeader class="gap-3 pr-6 text-left">
          <DialogTitle>修改昵称</DialogTitle>
          <DialogDescription class="leading-relaxed">
            最多 16 个字符，表情可能占多个字符。
          </DialogDescription>
        </DialogHeader>
        <form class="grid gap-6" @submit.prevent="saveNick">
          <div class="grid gap-3">
            <label for="edit-profile-nick" class="text-sm font-medium">昵称</label>
            <Input id="edit-profile-nick" v-model="nick" class="h-11" autocomplete="nickname" :disabled="busy" placeholder="请输入昵称" />
          </div>
          <p v-if="error" role="alert" class="text-sm text-destructive">
            {{ error }}
          </p>
          <DialogFooter class="gap-3 border-t pt-5">
            <Button type="button" class="min-w-24" variant="outline" :disabled="busy" @click="setNickOpen(false)">
              取消
            </Button>
            <Button type="submit" class="min-w-24" :disabled="busy">
              <Loader2 v-if="saving" class="size-4 animate-spin" aria-hidden="true" />
              {{ saving ? '保存中…' : '保存昵称' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <Dialog :open="editingAvatar" @update:open="setAvatarOpen">
      <DialogContent class="max-h-[90svh] overflow-y-auto" :show-close-button="!busy" @interact-outside="busy && $event.preventDefault()" @escape-key-down="busy && $event.preventDefault()">
        <DialogHeader>
          <DialogTitle>修改头像</DialogTitle>
          <DialogDescription>选择图片并裁剪为正方形后保存。支持 5 MB 以内的 JPG、PNG、WebP。</DialogDescription>
        </DialogHeader>
        <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" aria-label="选择新头像" :disabled="busy" @change="selectAvatar">
        <AvatarCropper v-if="preview" ref="cropper" :src="preview" :disabled="busy" @ready="cropReady = $event" @error="error = $event" />
        <Button type="button" variant="outline" :disabled="busy" @click="fileInput?.click()">
          <Camera class="size-4" aria-hidden="true" />
          {{ selectedFile ? '重新选择图片' : '选择图片' }}
        </Button>
        <p v-if="error" role="alert" class="text-sm text-destructive">
          {{ error }}
        </p>
        <DialogFooter>
          <Button type="button" variant="outline" :disabled="busy" @click="setAvatarOpen(false)">
            取消
          </Button>
          <Button type="button" :disabled="busy || !cropReady" @click="saveAvatar">
            <Loader2 v-if="uploading" class="size-4 animate-spin" aria-hidden="true" />
            {{ uploading ? '上传中…' : '裁剪并保存' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
</template>
