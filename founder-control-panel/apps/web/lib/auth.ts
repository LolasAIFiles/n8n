'use client';

import { useEffect, useState } from 'react';

export function useRequireAuth() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('fcp_token');
    if (!token) {
      window.location.href = '/auth';
      return;
    }
    setReady(true);
  }, []);
  return ready;
}
