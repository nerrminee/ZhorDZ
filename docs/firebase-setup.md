# Firebase Setup

## 1. Create a Firebase web app

In Firebase Console:

1. Open your Firebase project.
2. Go to Project settings.
3. Under Your apps, create or select a Web app.
4. Copy the Firebase config values.

## 2. Add local environment values

Create a file named `.env.local` in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Restart the dev server after editing `.env.local`.

## 3. Use Firebase in the app

```js
import { auth, db, storage } from '../config/firebase'
```

- `auth`: Firebase Authentication.
- `db`: Cloud Firestore.
- `storage`: Firebase Storage.
