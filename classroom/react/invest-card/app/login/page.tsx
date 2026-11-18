import { Suspense } from 'react';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  // AuthForm lê o `?next=` com useSearchParams, que precisa de um boundary.
  return (
    <Suspense>
      <AuthForm mode="signin" />
    </Suspense>
  );
}
