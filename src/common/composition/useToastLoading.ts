import { toast } from 'vue-sonner'

export function useToastLoading(func: (...args: any) => Promise<any>, options: { message: string, id?: string }) {
  const message = options.message ?? 'Loading'
  const id = options.id ?? 'loading'
  const toastId = toast.loading(message, { id })
  return func().finally(async () => {
    toast.dismiss(toastId)
  })
}
