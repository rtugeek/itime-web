import { showToast } from '@nutui/nutui'

export function useToastLoading(func: (...args: any) => Promise<any>, options: { message: string, id?: string }) {
  const message = options.message ?? 'Loading'
  const id = options.id ?? 'loading'
  showToast.loading(message, { id })
  return func().finally(async () => {
    showToast.hide(id)
  })
}
