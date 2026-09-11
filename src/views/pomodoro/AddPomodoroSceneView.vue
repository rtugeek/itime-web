<script lang="ts" setup>
import { reactive, ref, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import { toast } from 'vue-sonner'
import { Save, Trash2 } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import type { PomodoroScene } from '@/data/PomodoroScene'
import { PomodoroSceneRepository } from '@/data/repository/PomodoroSceneRepository'
import { usePomodoroStore } from '@/stores/usePomodoroStore'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const router = useRouter()
const route = useRoute()
const id = route.query.id as string
const { t } = useI18n()
const pomodoroStore = usePomodoroStore()

const sence = reactive<PomodoroScene>({
  id: undefined,
  icon: '🔨',
  name: '',
  duration: 0,
})

if (id) {
  PomodoroSceneRepository.get(id).then((res) => {
    sence.id = Number.parseInt(id)
    if (res) {
      sence.createTime = res.createTime
      sence.icon = res.icon
      sence.name = res.name
      sence.duration = res.duration ?? 0
    }
  })
}

const showEmojiPicker = ref(false)

function onSelectEmoji(newEmoji: any) {
  sence.icon = newEmoji.i
  showEmojiPicker.value = false
}

function save() {
  if (!sence.name.trim()) {
    toast.warning(t('pomodoro.error.name'))
    return
  }
  pomodoroStore.saveScene(toRaw(sence))
  router.push({ name: 'Pomodoro' })
}

function deleteScene() {
  pomodoroStore.deleteScene(sence.id!)
  router.push({ name: 'Pomodoro' })
}
</script>

<template>
  <section class="scene-editor">
    <Sheet v-model:open="showEmojiPicker">
      <SheetContent side="bottom" class="h-auto" style="padding: 30px 50px; background-color: transparent;">
        <EmojiPicker :native="true" display-recent @select="onSelectEmoji" />
      </SheetContent>
    </Sheet>
    <div class="editor-card">
      <div class="editor-section">
        <div class="editor-field">
          <div class="field-label">
            <label>{{ t('pomodoro.iconAndName') }}</label>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="scene-name">{{ t('pomodoro.scene.placeholder') }}</Label>
            <div class="flex items-center gap-2">
              <Avatar class="cursor-pointer w-10 h-10 rounded-md bg-[#ece8da]" @click="showEmojiPicker = true">
                <div class="flex items-center justify-center emoji text-xl h-full">
                  {{ sence.icon }}
                </div>
              </Avatar>
              <Input id="scene-name" v-model="sence.name" :placeholder="t('pomodoro.scene.placeholder')" class="editor-input" />
            </div>
          </div>
        </div>
      </div>
      <footer class="editor-footer">
        <Button v-if="id" class="delete-button" type="button" variant="destructive" aria-label="删除场景" @click="deleteScene">
          <Trash2 class="size-4" />
          删除
        </Button>
        <Button type="button" variant="outline" @click="router.push({ name: 'Pomodoro' })">
          {{ t('cancel') }}
        </Button>
        <Button type="button" @click="save">
          <Save class="size-4" />
          {{ t('save') }}
        </Button>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.scene-editor {
  width: 100%;
  max-width: 640px;
  margin-inline: auto;
  padding-block: 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field-label,
.editor-footer {
  display: flex;
  align-items: center;
}

.field-label {
  justify-content: space-between;
  gap: 16px;
}

.editor-card {
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--card);
  color: var(--card-foreground);
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 28px;
}

.editor-field { display: grid; min-width: 0; gap: 10px; }
.field-label { font-size: 13px; font-weight: 500; }
.editor-input { width: 100%; }
.editor-footer {
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 28px;
  border-top: 1px solid var(--border);
  border-radius: 0 0 16px 16px;
  background: var(--muted);
}

.editor-footer :deep(.delete-button) { margin-right: auto; flex: none; }

@media (max-width: 639px) {
  .scene-editor { padding-block: 8px 16px; gap: 20px; }
  .editor-section { padding: 20px 16px; }
  .editor-footer { padding: 10px 16px; }
}
</style>
