{
  "name": "academia-app",
  "version": "1.0.0",
  "description": "App de exercícios para academia",
  "main": "index.html",
  "scripts": {
    "start": "npx serve .",
    "build": "npx cap sync",
    "android": "npx cap open android",
    "generate-icons": "npx capacitor-assets generate --android"
  },
  "dependencies": {
    "@capacitor/android": "^5.0.0",
    "@capacitor/cli": "^5.0.0",
    "@capacitor/core": "^5.0.0"
  },
  "devDependencies": {
    "@capacitor/assets": "^3.0.0"
  }
}