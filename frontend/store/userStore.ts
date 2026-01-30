import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    name: string;
}

interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    profileComplete: boolean;
    currentStage: string;
    setUser: (user: User | null) => void;
    setProfileStatus: (complete: boolean, stage: string) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    isAuthenticated: false,
    profileComplete: false,
    currentStage: 'ONBOARDING',

    setUser: (user) =>
        set({
            user,
            isAuthenticated: !!user,
        }),

    setProfileStatus: (complete, stage) =>
        set({
            profileComplete: complete,
            currentStage: stage,
        }),

    logout: () =>
        set({
            user: null,
            isAuthenticated: false,
            profileComplete: false,
            currentStage: 'ONBOARDING',
        }),
}));
