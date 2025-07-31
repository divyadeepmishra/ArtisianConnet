// // in app/_layout.tsx

// import "../global.css";
// import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
// import { Slot, useRouter } from "expo-router";
// import * as SecureStore from "expo-secure-store";
// import React from "react";

// const tokenCache = {
//   async getToken(key: string) {
//     try {
//       return SecureStore.getItemAsync(key);
//     } catch (err) {
//       return null;
//     }
//   },
//   async saveToken(key: string, value: string) {
//     try {
//       return SecureStore.setItemAsync(key, value);
//     } catch (err) {
//       return;
//     }
//   },
// };

// const SignedOutLayout = () => {
//   const router = useRouter();
//   React.useEffect(() => {
//     router.replace('/login');
//   }, []);
//   return <Slot />;
// };

// export default function RootLayout() {
//   const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

//   if (!publishableKey) {
//     throw new Error("Missing Clerk Publishable Key. Please set it in your .env file.");
//   }

//   return (
//     <ClerkProvider
//       tokenCache={tokenCache}
//       publishableKey={publishableKey}
//     >
//       <SignedIn>
//         <Slot />
//       </SignedIn>
//       <SignedOut>
//         <SignedOutLayout />
//       </SignedOut>
//     </ClerkProvider>
//   );
// }

// import "../global.css";
// import { Slot } from "expo-router";

// // This simplified layout will now be the entry point of your app
// export default function RootLayout() {
//   // It will render the (tabs) layout by default
//   return <Slot />;
// }


// in app/_layout.tsx

import "../global.css";
import { ClerkProvider } from "@clerk/clerk-expo";
import { Slot } from "expo-router";
import * as SecureStore from "expo-secure-store";

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("Missing Clerk Publishable Key. Please set it in your .env file.");
  }

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={publishableKey}
    >
      {/* The Slot will render the current page */}
      <Slot />
    </ClerkProvider>
  );
}