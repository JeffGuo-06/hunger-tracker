import { Stack } from "expo-router/stack";
import "react-native-gesture-handler";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
