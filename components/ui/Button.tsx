import React from 'react';
import { Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { cn } from '../../lib/utils';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  variant = 'default',
  size = 'md',
  onPress,
  disabled = false,
  className,
  style,
  textStyle,
}: ButtonProps) {
  const baseClasses = 'flex-row items-center justify-center rounded-lg font-semibold';
  
  const variantClasses = {
    default: 'bg-blue-600 active:bg-blue-700',
    outline: 'border border-gray-300 bg-transparent active:bg-gray-50',
    secondary: 'bg-gray-100 active:bg-gray-200',
    destructive: 'bg-red-600 active:bg-red-700',
    ghost: 'bg-transparent active:bg-gray-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const textClasses = {
    default: 'text-white',
    outline: 'text-gray-700',
    secondary: 'text-gray-900',
    destructive: 'text-white',
    ghost: 'text-gray-700',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50',
        className
      )}
      style={style}
    >
      <Text
        className={cn(
          textClasses[variant],
          textSizeClasses[size],
          'font-semibold'
        )}
        style={textStyle}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
} 