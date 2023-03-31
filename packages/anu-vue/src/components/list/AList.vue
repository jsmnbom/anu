<script lang="ts" setup>
import type { ExtractPropTypes } from 'vue'
import { toRef } from 'vue'
import type { ListPropItems } from './props'
import { listProps } from './props'
import type { listSlots } from './slots'
import { listItemSlotsPrefix } from './slots'
import { prefixObjectKeysWithMeta } from '@/utils/helpers'
import { listItemSlots as listItemComponentSlots } from '@/components/list-item/slots'
import { AListItem } from '@/components/list-item'
import { useGroupModel2 } from '@/composables'

const props = defineProps(listProps)

const emit = defineEmits<{
  (e: 'update:modelValue', value: (ExtractPropTypes<typeof props>)['modelValue']): void

  // ℹ️ Fix type => (e: 'click:item', value: (ExtractPropTypes<typeof props>)['items'][number]): void
  (e: 'click:item', value: { item: ListPropItems[number]; value: any }): void
}>()

defineOptions({
  name: 'AList',
})

defineSlots<typeof listSlots>()

const { options, select, value } = useGroupModel2({
  value: toRef(props, 'modelValue'),
  options: toRef(props, 'items'),
  multi: toRef(props, 'multi'),
  extractValue: (item: ListPropItems[number]) => {
    if (typeof item === 'string' || typeof item === 'number')
      return item

    return item.value
  },
})

const handleListItemClick = (index: number) => {
  select(options.value[index])
  emit('update:modelValue', value.value)
  const item = props.items[index]
  emit('click:item', {
    value: value.value,
    item,
  })
}

const listItemPrefixedSlots = prefixObjectKeysWithMeta(listItemComponentSlots, listItemSlotsPrefix)
</script>

<template>
  <ul class="a-list grid">
    <!-- 👉 Slot: before -->
    <li v-if="$slots.before">
      <slot name="before" />
    </li>

    <!-- 👉 Slot: default -->
    <slot :handle-list-item-click="handleListItemClick">
      <AListItem
        v-for="(option, index) in options"
        :key="index"
        :text="typeof option === 'string' || typeof option === 'number' ? option : undefined"
        v-bind="typeof option === 'string' ? {} : option"
        :avatar-append="props.avatarAppend"
        :icon-append="props.iconAppend"
        :color="props.color"
        :variant="props.variant"
        :states="props.states"
        :is-active="option.isSelected as unknown as boolean"
        @click="handleListItemClick(index)"
      >
        <!-- ℹ️ Recursively pass down slots to child -->
        <template
          v-for="{ originalKey: originalSlotName, prefixedKey: updatedSlotName } in listItemPrefixedSlots"
          #[originalSlotName]="slotProps"
        >
          <slot
            :name="updatedSlotName"
            :index="index"
            v-bind="slotProps || {}"
          />
        </template>
      </AListItem>
    </slot>
    <li v-if="$slots.after">
      <slot name="after" />
    </li>
  </ul>
</template>
