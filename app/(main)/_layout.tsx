import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal', // iOS-style modal (slide from bottom)
        animation: 'fade_from_bottom', // or 'slide_from_right'
        gestureEnabled: true,
      }}
    />
  );
}
import { router } from 'expo-router';

// opens as modal
