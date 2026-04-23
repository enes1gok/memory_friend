import { useDatabase } from '@nozbe/watermelondb/react';
import { useCallback, useState } from 'react';

import { createCapsule, type CreateCapsuleInput } from '../logic/createCapsule';
import type { Capsule } from '@/models/Capsule';

export function useCreateCapsule() {
  const database = useDatabase();
  const [isLoading, setIsLoading] = useState(false);

  const create = useCallback(
    async (input: CreateCapsuleInput): Promise<Capsule> => {
      setIsLoading(true);
      try {
        return await createCapsule(database, input);
      } finally {
        setIsLoading(false);
      }
    },
    [database],
  );

  return { create, isLoading };
}
