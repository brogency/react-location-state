import React from 'react';
import {
  History as BrowserHistory,
  Location as BrowserLocation,
// eslint-disable-next-line import/no-duplicates
} from 'history';

import HistoryObserver, { LocationCast } from 'history-observer';
import { SchemaType } from './schema';
// eslint-disable-next-line import/no-duplicates
import { StaticHistory } from './history';


export type paramValueType = undefined | string | number | boolean | (string | number)[];

export type History = StaticHistory | BrowserHistory | HistoryObserver;
export type Location = StaticLocation | BrowserLocation | LocationCast;

export interface State{
  [paramName: string]: paramValueType;
}

export interface LocationState extends State{
  [paramName: string]: string | string[];
}

export interface Options {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [paramName: string]: any;
}

export interface Schema {
  [paramName: string]: typeof SchemaType;
}

export interface StaticLocation {
  pathname: string;
  search: string;
}

export enum StoreActionTypes {
  UPDATE = 'UPDATE',
}

interface UpdateActionPayload {
  search: string;
  pathname: string;
  state: Options;
}

export interface Action {
  type: StoreActionTypes.UPDATE;
  payload: UpdateActionPayload;
}

export interface StoreLocation {
  search: string;
  pathname: string;
}

export interface ProviderStore {
  location: StoreLocation;
  options: Options;
}

export interface CreatedState {
  Provider: React.JSXElementConstructor<{
    children: React.ReactNode;
    history: History;
    initialOptions?: {};
    schema?: Schema;
    includes?: string[];
    excludes?: string[];}>;
  useState: CallableFunction;
}

export interface CreatedBrowserState {
  Provider: React.JSXElementConstructor<{
    children: React.ReactNode;
    initialOptions?: {};
    schema?: Schema;
    includes?: string[];
    excludes?: string[];}>;
  useState: CallableFunction;
}

