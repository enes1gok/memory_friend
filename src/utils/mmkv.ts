import { createMMKV } from 'react-native-mmkv';

/** Single MMKV instance for the app. Prefer typed helpers that use {@link MMKV_KEYS}. */
export const storage = createMMKV({ id: 'memory_friend' });
