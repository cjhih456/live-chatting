import type { ComponentType, ReactElement, ReactNode } from 'react';
import { styled } from 'nativewind';
import {
  FlatList as RNFlatList,
  Pressable as RNPressable,
  Text as RNText,
  TextInput as RNTextInput,
  View as RNView,
  type FlatListProps,
  type PressableProps,
  type TextInputProps,
  type TextProps,
  type ViewProps,
} from 'react-native';

type WithClassName<T> = T & { className?: string };

function withClassName<P>(Component: ComponentType<P>) {
  return styled(Component as ComponentType<object>) as unknown as (
    props: WithClassName<P>,
  ) => ReactElement | null;
}

export const View = withClassName(
  RNView as ComponentType<ViewProps & { children?: ReactNode }>,
);

export const Text = withClassName(
  RNText as ComponentType<TextProps & { children?: ReactNode }>,
);

export const TextInput = withClassName(
  RNTextInput as ComponentType<TextInputProps>,
);

export const Pressable = withClassName(
  RNPressable as ComponentType<PressableProps & { children?: ReactNode }>,
);

export const FlatList = withClassName(
  RNFlatList as ComponentType<FlatListProps<unknown>>,
) as unknown as <ItemT>(
  props: WithClassName<FlatListProps<ItemT>>,
) => ReactElement | null;
