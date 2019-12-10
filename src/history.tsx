import React from 'react';

import HistoryObserver from 'history-observer';
import createState from './provider';
import {
  State,
  Schema,
  StaticLocation,
  History,
  Options,
  CreatedBrowserState,
} from './types';
import { emptyFunction } from './utils';

const createEmptyLocation = (): StaticLocation => ({
  search: '',
  pathname: '',
});

class StaticHistory {
  public readonly location: StaticLocation;

  public constructor(location: StaticLocation = createEmptyLocation()) {
    this.location = location;
  }

  // eslint-disable-next-line class-methods-use-this
  public listen(): Function {
    // eslint-disable-next-line no-console
    console.warn('StaticHistory cannot have subscriptions.');
    return emptyFunction;
  }

  // eslint-disable-next-line class-methods-use-this
  public push(): void {
    throw Error('Push is not allowed in StaticHistory');
  }
}

const createHistory = (initialLocation: StaticLocation): History => (typeof window === 'undefined'
  ? new StaticHistory(initialLocation)
  : new HistoryObserver());

// eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
function createBrowserHistoryState<StateType extends State>({ initialState = {} as StateType }: { initialState: StateType }): CreatedBrowserState {
  const { useState, Provider } = createState<StateType>({ initialState });

  function BrowserHistoryProvider<OptionsType extends Options>({
    children,
    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    initialOptions = {} as OptionsType,
    initialLocation = createEmptyLocation(),
    schema = {},
    includes,
    excludes,
    ...props
  }: {
    children: React.ReactNode;
    initialOptions?: OptionsType;
    initialLocation?: StaticLocation;
    schema?: Schema;
    includes?: string[];
    excludes?: string[];
  }): React.ReactElement {
    const history = createHistory(initialLocation);

    return (
      <Provider
        history={history}
        {...{
          initialOptions,
          schema,
          includes,
          excludes,
          ...props,
        }}
      >
        {children}
      </Provider>
    );
  }

  return {
    Provider: BrowserHistoryProvider,
    useState,
  };
}

export {
  StaticHistory,
};
export default createBrowserHistoryState;
