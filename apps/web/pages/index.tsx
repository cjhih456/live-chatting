import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    void router.replace('/login');
  }, [router]);
  return null;
}
