import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../lib/configs/firebase-config';
import { useAuthStore } from '../lib/hooks/use-auth-store';
import { api } from '../lib/configs/api';
import { useSession } from '../lib/hooks/use-session';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const session = useSession();
  const authStore = useAuthStore();
  const loginMutation = api.auth.login.useMutation({
    onSuccess: (data) => {
      authStore.set({
        status: 'authenticated',
        user: data.body,
      });
      navigate('/dashboard');
    },
  });
  async function handleSignIn(): Promise<void> {
    try {
      const userCredentials = await signInWithGoogle();
      const accessToken = await userCredentials.user.getIdToken();
      await loginMutation.mutateAsync({
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: null,
      });
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div>
      {/* will invoke the sign in so we mark it as void as we're not going to use that then or await the function, we just need to invoke it  */}
      <button
        onClick={() => {
          void handleSignIn();
        }}
        disabled={session.status === 'authenticated'}
      >
        {session.status === 'loading'
          ? 'Loading...'
          : session.status === 'authenticated'
          ? 'Signed In'
          : 'Sign In'}
      </button>
    </div>
  );
};
