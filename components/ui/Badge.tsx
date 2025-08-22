import React from 'react';
import { Text, View } from 'react-native';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
  
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
    outline: 'border border-gray-300 bg-transparent text-gray-700',
  };

  return (
    <View className={cn(baseClasses, variantClasses[variant], className)}>
      <Text className={cn('text-xs font-medium', variantClasses[variant])}>
        {children}
      </Text>
    </View>
  );
} 