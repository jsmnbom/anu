import type { MaybeComputedRef } from '@vueuse/core'
import type { Ref } from 'vue'
import { ref, unref } from 'vue'

export function useGroupModel2<T, V>(params: {
  multi: MaybeComputedRef<boolean>
  options: MaybeComputedRef<T[]>
  value: Ref<V | Set<V> | undefined>
  extractValue: (option: T) => V
}) {
  const multi = ref(params.multi) as Ref<boolean>
  const options = ref(params.options) as Ref<T[]>

  // Make one way binding to value
  const _value = ref() as Ref<V | Set<V> | undefined>
  watch(params.value, () => {
    _value.value = params.value.value
  })
  const extractValue = params.extractValue

  const _select = (option: T) => {
    const optionValue = extractValue(option)

    // If multiple selection is enabled
    if (unref(multi)) {
      // If value is not set (Means previously multi was false) => Initialize new set and assign it to value
      if (!(_value.value instanceof Set)) {
        _value.value = new Set([optionValue])
      }
      else {
        // Else toggle option in set
        if (_value.value.has(optionValue))
          _value.value.delete(optionValue)
        else _value.value.add(optionValue)
      }
    }
    else {
      _value.value = optionValue
    }
  }

  const _options = ref([]) as Ref<Array<T & { isSelected: boolean }>>

  watch([options, _value], () => {
    _options.value = options.value.map(option => {
      const optionValue = extractValue(option)
      const val = toRaw(_value.value)
      const isSelected = (unref(multi)) ? ((val instanceof Set) && val.has(optionValue)) : val === optionValue

      return {
        ...option,
        isSelected,
      }
    })
  })

  return {
    options: _options,
    select: _select,
    value: _value,
  }
}
