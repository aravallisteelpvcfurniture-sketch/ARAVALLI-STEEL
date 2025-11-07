"use client";

import { useState, useEffect, useContext } from 'react';
import type { User } from 'firebase/auth';
import { FirebaseContext, useAuth } from '@/firebase/provider';


export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    // This hook might be used in a component that hasn't been wrapped in the provider yet
    // during a transitional state (e.g. adding login pages). We can return a loading state.
    return { user: null, isUserLoading: true, userError: null };
  }

  const { user, isUserLoading, userError } = context;
  return { user, isUserLoading, userError };
};
