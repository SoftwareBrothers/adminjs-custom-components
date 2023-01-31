import React, { useMemo } from 'react'
import { BasePropertyComponent, EditPropertyProps } from 'adminjs'

const NotEditableInput: React.FC<EditPropertyProps> = props => {
  const { property, record: initialRecord } = props

  const cleanProperty = useMemo(
    () => ({ ...property, components: {} }),
    [property]
  )

  // Casting to any to be able to pass any prop.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BaseComponent = BasePropertyComponent as any
  if (!initialRecord?.id) {
    cleanProperty.isDisabled = false
    return <BaseComponent {...props} property={cleanProperty} />
  }

  cleanProperty.isDisabled = true
  return <BaseComponent {...props} property={cleanProperty} isDisabled />
}

export default NotEditableInput
