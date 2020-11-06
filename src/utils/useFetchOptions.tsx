/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  RecordJSON,
  ApiClient,
  PropertyJSON,
  ReduxState,
  CurrentAdmin,
} from 'admin-bro';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

export type ReferenceFieldFilterType =
  | StringFilter
  | ReferenceFilter
  | OwnerFilter;

interface StringFilter {
  type: 'string';
  value: string;
}

interface ReferenceFilter {
  type: 'reference';
  field: string;
}

interface OwnerFilter {
  type: 'owner';
  source?: string;
}

interface Options {
  record: RecordJSON;
  property: PropertyJSON;
  resourceId: string;
  searchProperty: string;
  filters: Record<string, ReferenceFieldFilterType>;
  selectedIds: string[];
}

export const useFetchOptions = ({
  record,
  resourceId,
  searchProperty,
  filters,
  selectedIds,
}: Options) => {
  const user = useSelector<ReduxState, CurrentAdmin>(s => s.session as any);
  const parseFilters = getFilterParser(user, record);
  const [cache, setCache] = useState<Record<string, RecordJSON>>({});
  const [error, setError] = useState<string | null>(null);
  const search = async (input: string): Promise<RecordJSON[]> => {
    try {
      const response = await new ApiClient().resourceAction({
        resourceId,
        actionName: 'list',
        params: {
          perPage: Number.MAX_SAFE_INTEGER,
          ...parseFilters(filters),
          [`filters.${searchProperty}`]: input,
        },
      });
      const incomingRecords = (response?.data?.records?.filter?.(
        r => r.id !== record.id
      ) ?? []) as RecordJSON[];
      setCache(prev => {
        const copy = { ...prev };
        incomingRecords.forEach(r => {
          copy[r.id] = r;
        });
        return copy;
      });
      return incomingRecords;
    } catch (e) {
      setError(e.response?.data?.message ?? e.message);
      return [];
    }
  };
  useEffect(() => {
    const getOption = async (id: string) => {
      if (cache[id]) {
        return;
      }
      const result = await new ApiClient().recordAction({
        resourceId,
        recordId: id,
        actionName: 'show',
      });
      const r = result.data.record as RecordJSON | undefined;
      if (r) {
        setCache(prev => ({ ...prev, [r.id]: r }));
      }
    };
    selectedIds.forEach(getOption);
  }, [cache, resourceId, selectedIds]);
  return {
    search,
    error,
    selected: Object.values(cache).filter(c => selectedIds.includes(c.id)),
  };
};

const getFilterParser = (user: CurrentAdmin, record: RecordJSON) => (
  filters: Options['filters']
): Record<string, string> => {
  const results: Record<string, string> = {};
  Object.entries(filters).forEach(([key, filter]) => {
    switch (filter.type) {
      case 'owner': {
        const { source } = filter;
        const value =
          (source
            ? (record.params[source] as string | undefined)
            : undefined) ?? user.id;
        results[`filters.${key}`] = value as any;
        break;
      }
      case 'reference': {
        const { field } = filter;
        const value = record.params[field] as string | undefined;
        if (!value) {
          throw new Error(`Fill "${field} field first"`);
        }
        results[`filters.${key}`] = value;
        break;
      }
      case 'string': {
        const { value } = filter;
        results[`filters.${key}`] = value;
        break;
      }
      default: {
        throw new Error('Incorrect filter type');
      }
    }
  });
  return results;
};
