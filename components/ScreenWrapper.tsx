import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import React, { PropsWithChildren } from 'react';

export default function ScreenWrapper({ children }: PropsWithChildren<{}>) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top - 15,
        paddingBottom: insets.bottom - 35,
        backgroundColor:  '#F9FAFB',
      }}
    >
      {children}
    </SafeAreaView>
  );
}
