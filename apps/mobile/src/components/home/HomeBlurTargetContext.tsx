import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react';
import type { View } from 'react-native';

type HomeBlurTargetState = {
  ref: RefObject<View | null>;
  ready: boolean;
  setReady: Dispatch<SetStateAction<boolean>>;
};

export const HomeBlurTargetContext = createContext<HomeBlurTargetState | null>(
  null,
);

export function useHomeBlurTarget(): HomeBlurTargetState | null {
  return useContext(HomeBlurTargetContext);
}
