import { Location } from './types';

const emptyFunction = (): void => undefined;

const getQuery = ({ search }: Location): string => search.replace(/^\?/, '');

export {
  emptyFunction,
  getQuery,
};
