import { signInWithGoogle } from '../lib/configs/firebase-config';

export const HomePage: React.FC = () => {
  async function handleSignIn(): Promise<void> {
    try {
      const userCredentials = await signInWithGoogle();
      const accessToken = await userCredentials.user.getIdToken();
      console.log(accessToken);
    } catch (error: unknown) {
      console.error(error);
    }
  }
  return (
    <div>
      {/* will invoke the sign in so we mark it as void as we're not going to use that then or await the function, we just need to invoke it  */}
      <button
        onClick={() => {
          void handleSignIn();
        }}
      >
        Sign In
      </button>
    </div>
  );
};
