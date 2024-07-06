import { type UseTransitionOptions, useTransition } from '@vueuse/core'
import { type MaybeRefOrGetter, computed } from 'vue'

export interface UseUnitTransition extends UseTransitionOptions {
  unit: 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh'
}
export function useUnitTransition(source: MaybeRefOrGetter<number>, option: UseUnitTransition) {
  const transitionValue = useTransition(source, option)
  const unitValue = computed(() => `${transitionValue.value}${option.unit}`)
  return unitValue
}
