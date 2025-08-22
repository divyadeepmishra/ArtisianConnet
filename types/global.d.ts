declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';

declare module 'react-native-vector-icons/*' {
  import { Component } from 'react';
    import { TextProps } from 'react-native';
  
  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  
  export default class Icon extends Component<IconProps> {}
}

declare module 'expo-linear-gradient' {
  import { Component } from 'react';
    import { ViewProps } from 'react-native';
  
  interface LinearGradientProps extends ViewProps {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: number[];
  }
  
  export default class LinearGradient extends Component<LinearGradientProps> {}
}

declare module 'base64-arraybuffer' {
  export function decode(base64: string): ArrayBuffer;
  export function encode(buffer: ArrayBuffer): string;
}

declare module 'clsx' {
  export function clsx(...inputs: any[]): string;
}

declare module 'tailwind-merge' {
  export function twMerge(...inputs: string[]): string;
} 