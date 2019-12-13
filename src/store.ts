import React, { useReducer } from 'react';
import { parse, stringify } from 'querystring';
import get from 'lodash/get';
import partial from 'lodash/partial';
import pickBy from 'lodash/pickBy';
import isEmpty from 'lodash/isEmpty';

import {
  Action,
  Location,
  LocationState,
  Options,
  Schema,
  State,
  ProviderStore,
  StoreActionTypes,
  StoreLocation,
} from './types';
import { getQuery } from './utils';

function reducer(state: ProviderStore, action: Action): ProviderStore {
  let newState = {};
  const {
    type,
    payload,
  } = action;

  if (type === StoreActionTypes.UPDATE) {
    const {
      search,
      pathname,
      state: options,
    } = payload;

    newState = {
      location: {
        pathname,
        search,
      },
      options,
    };
  }

  return {
    ...state,
    ...newState,
  };
}

function updateStore(dispatch: React.Dispatch<Action>, location: Location): void {
  const pathname = get(location, 'pathname', '');
  const search = get(location, 'search', '');
  const state = get(location, 'state', {});

  dispatch({
    type: StoreActionTypes.UPDATE,
    payload: {
      pathname,
      search,
      state,
    },
  });
}

function useStore<OptionsTypes extends Options>({ location, options }: { location: Location; options?: OptionsTypes }): {
  state: ProviderStore;
  update: CallableFunction;
} {
  const initialOptions: OptionsTypes = {
    ...get(location, 'state', {}),
    ...options,
  };
  const initialPathname = get(location, 'pathname', '');
  const initialSearch = get(location, 'search', '');
  const initialState = {
    location: {
      pathname: initialPathname,
      search: initialSearch,
    },
    options: initialOptions,
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  const update = partial(updateStore, dispatch);

  return {
    state,
    update,
  };
}

class QuerySet<StateType extends State> {
  protected readonly state: StateType;

  public constructor(state: StateType) {
    this.state = state;
  }

  private isSuitableField = (
    fieldName: string,
    {
      includes,
      excludes,
    }: {
      includes?: string[];
      excludes?: string[];
    },
  ): boolean => (!includes || includes.includes(fieldName)) && (!excludes || !excludes.includes(fieldName));

  protected selectState = ({ includes, excludes }: { includes?: string[]; excludes?: string[] }): StateType => Object.keys(
    this.state,
  ).reduce<StateType>(
    (state, fieldName): StateType => (this.isSuitableField(fieldName, { includes, excludes }) ? {
      ...state,
      [fieldName]: this.state[fieldName],
    } : state),
    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    {} as StateType,
  );
}

class ObjectQuerySet<StateType extends State> extends QuerySet<StateType> {
  public select = ({ includes, excludes }: { includes?: string[]; excludes?: string[] }): ObjectQuerySet<StateType> => {
    const selectedState = this.selectState({ includes, excludes });
    return new ObjectQuerySet<StateType>(selectedState);
  };

  public convertState = (schema: Schema): LocationState => Object.keys(this.state).reduce<LocationState>(
    (convertedState, fieldName): LocationState => {
      const originalValue = this.state[fieldName];
      const fieldType = schema[fieldName];

      return {
        ...convertedState,
        ...(fieldType ? { [fieldName]: fieldType.parseForLocation(originalValue) } : {}),
      };
    },
    {},
  );

  public convertToString = (schema: Schema, mergedState: LocationState = {}): string => {
    const convertedState = this.convertState(schema);
    const filledState = pickBy({
      ...mergedState,
      ...convertedState,
    }, value => !!value);

    return stringify(filledState);
  };
}

function getStateFromLocation(location: StoreLocation): LocationState {
  const query = getQuery(location);
  return parse(query);
}

class LocationQuerySet<StateType extends State> extends QuerySet<StateType> {
  public parse = (location: Location): LocationQuerySet<StateType> => {
    const queryState = getStateFromLocation(location);
    const mergedState = {
      ...this.state,
      ...queryState,
    };

    return new LocationQuerySet<StateType>(mergedState);
  };

  public select = ({ includes, excludes }: { includes?: string[]; excludes?: string[] }): LocationQuerySet<StateType> => {
    const selectedState = this.selectState({ includes, excludes });
    return new LocationQuerySet<StateType>(selectedState);
  };

  public convertToObject = (schema: Schema): StateType => Object.keys(this.state).reduce(
    (convertedState, fieldName): StateType => {
      const originalValue = this.state[fieldName];
      const fieldType = schema[fieldName];
      const fieldValue = fieldType.parseForStore(originalValue);

      return {
        ...convertedState,
        ...(fieldType && (typeof fieldValue === 'object' ? !isEmpty(fieldValue) : !!fieldValue) ? { [fieldName]: fieldValue } : {}),
      };
    },
    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    {} as StateType,
  );
}

function updateLocationFromState<StateType extends State>(
  location: StoreLocation,
  push: CallableFunction,
  schema: Schema = {},
  state: StateType,
  options: Options = {},
): void {
  const store = new ObjectQuerySet(state);
  const { pathname } = location;
  const searchState = getStateFromLocation(location);
  const mergedSearch = store.convertToString(schema, searchState);
  const path = mergedSearch ? `${pathname}?${mergedSearch}` : pathname;

  push(path, options);
}

function mapState<StateType extends State>(
  initialState: StateType,
  location: StoreLocation,
  {
    schema = {},
    includes,
    excludes,
  }: {
    schema: Schema;
    includes?: string[];
    excludes?: string[];
  },
): StateType {
  const queryset = new LocationQuerySet(initialState);
  const parsedQueryset = queryset.parse(location);
  const selectedQueryset = parsedQueryset.select({ includes, excludes });

  return selectedQueryset.convertToObject(schema);
}

export {
  mapState,
  updateLocationFromState,
  getStateFromLocation,
  ObjectQuerySet,
  useStore,
};
