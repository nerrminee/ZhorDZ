import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyACHy5lbmVR82TE_nhXXwJTsHmFY1lfLPs",
  authDomain: "zhor-d0b03.firebaseapp.com",
  projectId: "zhor-d0b03",
  storageBucket: "zhor-d0b03.firebasestorage.app",
  messagingSenderId: "107527212861",
  appId: "1:107527212861:web:e8833652eb0a2755c6bf54"
}

export const firebaseApp = initializeApp(firebaseConfig)

export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
export const storage = getStorage(firebaseApp)

export default firebaseApp
