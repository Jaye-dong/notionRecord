import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="add-transaction"
          options={{
            title: '快速记账',
            presentation: 'modal'
          }}
        />
      </Stack>
    </>
  );
}
