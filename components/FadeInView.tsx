// import React, { useEffect } from 'react';
// import { ViewStyle, StyleProp } from 'react-native';
// import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

// interface FadeInViewProps {
//   children: React.ReactNode;
//   style?: StyleProp<ViewStyle>; // Use StyleProp<ViewStyle> for better type safety
//   duration?: number;
// }

// export const FadeInView: React.FC<FadeInViewProps> = ({ children, style, duration = 500 }) => {
//   const opacity = useSharedValue(0);

//   useEffect(() => {
//     opacity.value = withTiming(1, {
//       duration: duration,
//       easing: Easing.out(Easing.ease),
//     });
//   }, []);

//   // The incorrect "of" keyword has been removed from the line below
//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       opacity: opacity.value,
//     };
//   });

//   return (
//     <Animated.View style={[style, animatedStyle]}>
//       {children}
//     </Animated.View>
//   );
// };