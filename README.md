# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

   ## Authentication (Login/Register)

   This project now includes a simple Firebase Authentication flow with the following pages:
   - `app/login.tsx` — email + password login and "Login as Guest" button (anonymous sign-in)
   - `app/register.tsx` — register a new user with email + password

   New feature:
   - `app/(tabs)/map.tsx` — Map tab using `react-native-maps` (Google provider)

   To enable authentication, install Firebase and start the app:

   ```bash
   npm install firebase
   npx expo start
   ```

   Notes:
   - Firebase config is already present in `lib/firebase.ts` for convenience. You should replace it with environment variables for production.
   - After successful login (or guest login), the app redirects to the main tabs (`/`).
   - Map tab is available in the bottom tabs after login. It uses `react-native-maps` and defaults to the Google provider on platforms that support it. To fully use Google Maps on Android, follow `react-native-maps` setup and add an API key if needed.
   - Use the Sign out button on the Home tab to sign out and get redirected back to the login screen.


In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
