/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormGroup, FormMessage, Label } from '@adminjs/design-system'
import { BasePropertyProps, EditPropertyProps, flat } from 'adminjs'
import React, { FC } from 'react'
import { SelectAsync } from '@adminjs/design-system'
import { CleanPropertyComponent } from 'adminjs'
import {
  ReferenceFieldFilterType,
  useFetchOptions,
} from '../utils/useFetchOptions'

const SingleReferenceField: FC<BasePropertyProps> = props => {
  const { where } = props

  if (where === 'edit') {
    return <SingleReferenceEdit {...(props as any)} />
  }

  return <CleanPropertyComponent {...props} />
}

export interface SingleReferenceFieldCustomProps {
  filters?: Record<string, ReferenceFieldFilterType>
  searchProperty?: string
  resourceId?: string
}

const SingleReferenceEdit: FC<EditPropertyProps> = props => {
  const { property, record, onChange } = props
  const { custom } = property
  const {
    filters = {},
    searchProperty = 'name',
    resourceId = property.reference,
  } = custom as SingleReferenceFieldCustomProps

  if (!resourceId) {
    throw new Error(
      'ReferenceField component must either be used on a reference field or be passed `resourceId` custom prop.'
    )
  }

  const isMulti = property.isArray
  const selectedRaw = flat.get(record.params, property.path) as
    | string
    | string[]
  const selectedIds = Array.isArray(selectedRaw)
    ? selectedRaw
    : [selectedRaw].filter(Boolean)

  const { search, error, selected } = useFetchOptions({
    filters,
    property,
    record,
    searchProperty,
    resourceId,
    selectedIds,
  })

  const handleChange = (type): void => {
    if (!type) {
      onChange(property.path, null)
    } else if (Array.isArray(type)) {
      onChange(
        property.path,
        type.map(t => t.id)
      )
    } else {
      onChange(property.path, (type as any).id)
    }
  }

  const actualSelected = isMulti ? selected : selected[0] ?? null

  return (
    <FormGroup>
      <Label htmlFor={property.path}>{property.label}</Label>
      <SelectAsync
        value={actualSelected}
        cacheOptions
        loadOptions={(input, callback) => {
          search(input).then(callback)
        }}
        onChange={handleChange}
        isDisabled={property.isDisabled}
        defaultOptions
        getOptionLabel={option =>
          option.params?.[searchProperty] ?? option[searchProperty]
        }
        getOptionValue={option => option.id}
        isMulti={isMulti ?? false}
        isClearable
        {...property.props}
      />
      <FormMessage color="error">{error}</FormMessage>
    </FormGroup>
  )
}

export default SingleReferenceField
