import {getApps, getApp, initializeApp} from 'firebase/app'
import {GoogleAuthProvider, getAuth, signInWithPopup} from 'firebase/auth'
export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
}) 
export const auth = getAuth(firebaseApp)
export const googleAuthProvider = new GoogleAuthProvider()

//chay function nay thi no se mo len popup dang nhap voi google
export function signInWithGoogle(): ReturnType<typeof signInWithPopup> {
    return signInWithPopup(auth, googleAuthProvider)
}