import { SideEffects } from './outbox/state';

// Constructs a type that must include all properties of T apart from 'type' and 'stage'
export type Properties<T> = Pick<T, Exclude<keyof T, 'type' | 'stage'>> & { [x: string]: any };

export interface StateWithSideEffects<T> {
  state: T;
  sideEffects?: SideEffects;
}

export interface TransactionExists {
  transactionHash: string;
}