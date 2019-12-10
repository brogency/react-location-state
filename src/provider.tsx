import React, {
  createContext as createReactContext,
  useContext,
  useEffect,
} from 'react';
import partial from 'lodash/partial';

import {
  Schema,
  State,
  History,
  Location,
  Options,
  StoreLocation,
  CreatedState,
} from './types';
import {
  mapState,
  updateLocationFromState,
  useStore,
} from './store';


function createState<StateType extends State>({
  // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
  initialState = {} as StateType,
}: { initialState: StateType }): CreatedState {
  const Context = createReactContext<{
    location: StoreLocation;
    schema: Schema;
    push: CallableFunction;
    includes?: string[];
    excludes?: string[];
    options: Options;
  }>({
    location: {
      search: '',
      pathname: '',
    },
    schema: {},
    push: (): void => undefined,
    options: {},
  });

  function Provider<OptionsType extends Options>({
    history,
    children,
    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    initialOptions = {} as OptionsType,
    schema = {},
    includes,
    excludes,
  }: {
    children: React.ReactNode;
    history: History;
    initialOptions?: OptionsType;
    schema?: Schema;
    includes?: string[];
    excludes?: string[];
  }): React.ReactElement {
    const {
      state,
      update,
    } = useStore({
      location: history.location,
      options: initialOptions,
    });

    useEffect(
      (): (void | (() => void | undefined)) => {
        const unlisten = history ? history.listen(
          (location: Location): void => update(location),
        ) : undefined;

        return unlisten ? (): void => unlisten() : undefined;
      },
      [],
    );

    const push = (path: string, options: Options): void => history.push(path, options);

    const {
      location,
      options,
    } = state;

    return (
      <Context.Provider value={{
        location,
        options,
        schema,
        includes,
        excludes,
        push,
      }}
      >
        {children}
      </Context.Provider>
    );
  }

  function useState({
    includes: consumerIncludes,
    excludes: consumerExcludes,
    schema: consumerSchema,
  }: {
    includes?: string[];
    excludes?: string[];
    schema?: Schema;
  } = {}): {
      setState: CallableFunction;
      state: State;
      options: Options;
    } {
    const {
      options,
      location,
      push,
      schema: globalSchema,
      includes: globalIncludes,
      excludes: globalExcludes,
    } = useContext(Context);
    const includes = consumerIncludes || globalIncludes;
    const excludes = consumerExcludes || globalExcludes;
    const schema = consumerSchema || globalSchema;
    const setState = partial(
      updateLocationFromState,
      location,
      push,
      schema,
    );

    const state = mapState(
      initialState,
      location,
      {
        includes,
        excludes,
        schema,
      },
    );

    return {
      state,
      options,
      setState,
    };
  }

  return {
    Provider,
    useState,
  };
}

export default createState;
