# Firebase Admin Panel Integration

This document explains how the `AdminPanel` component works and what Firebase rules you should consider.

Overview
- `AdminPanel` uploads images to Firebase Storage and writes product metadata to Cloud Firestore (`products` collection).
- Upload progress is handled with `uploadBytesResumable` and a percentage is shown in the UI.

Security rules (recommended)

Firestore (allow authenticated writes from admins only):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

Storage (allow admin uploads):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

Notes
- The example client-side admin auth in this repo is for development only. For production, use Firebase Authentication with a server-managed admin claim.
- After updating rules, ensure the Firebase SDK in the app is authenticated as a user with the `admin` custom claim.
