import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyACHy5lbmVR82TE_nhXXwJTsHmFY1lfLPs",
  authDomain: "zhor-d0b03.firebaseapp.com",
  projectId: "zhor-d0b03",
  storageBucket: "zhor-d0b03.firebasestorage.app",
  messagingSenderId: "107527212861",
  appId: "1:107527212861:web:e8833652eb0a2755c6bf54"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export default app