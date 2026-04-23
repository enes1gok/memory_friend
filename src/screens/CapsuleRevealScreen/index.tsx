import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Video, ResizeMode } from 'expo-av';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, Heading } from '@/components/Typography';
import { SafeScreen } from '@/components/SafeScreen';
import { inferMediaKind, isCapsuleViewable } from '@/features/capsule/logic/capsuleStatus';
import type { Capsule } from '@/models/Capsule';
import { useDatabase } from '@nozbe/watermelondb/react';
import { colors } from '@/theme/colors';
import { hapticLight } from '@/utils/haptics';

import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CapsuleReveal'>;

function uriForDisplay(path: string | undefined | null): { uri: string } | null {
  if (!path) return null;
  return { uri: path.startsWith('file://') ? path : `file://${path}` };
}

export function CapsuleRevealScreen({ navigation, route }: Props) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const database = useDatabase();
  const { capsuleId } = route.params;
  const [capsule, setCapsule] = useState<Capsule | null | undefined>(undefined);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void database
      .get<Capsule>('capsules')
      .find(capsuleId)
      .then((row) => {
        if (!cancelled) {
          setCapsule(row);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setCapsule(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [capsuleId, database]);

  const viewable =
    capsule != null && isCapsuleViewable(capsule);
  const mediaKind = capsule ? inferMediaKind(capsule.mediaPath) : 'none';
  const previewUri = capsule ? uriForDisplay(capsule.mediaPath) : null;
  const recordedOn = capsule
    ? new Date(capsule.createdAt).toLocaleDateString(i18n.language, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const openDateStr = capsule
    ? new Date(capsule.unlocksAt).toLocaleDateString(i18n.language, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  if (capsule === undefined && !loadError) {
    return (
      <SafeScreen testID="capsule:reveal:loading">
        <View className="flex-1 items-center justify-center" style={{ paddingTop: insets.top }}>
          <ActivityIndicator size="large" color={colors.accentBlue} />
        </View>
      </SafeScreen>
    );
  }

  if (loadError || capsule === null) {
    return (
      <SafeScreen testID="capsule:reveal:error">
        <View className="flex-1 justify-center px-6" style={{ paddingTop: insets.top }}>
          <Body className="text-slate-400">{t('common.error')}</Body>
          <Pressable
            testID="capsule:reveal:dismiss"
            onPress={() => navigation.goBack()}
            className="mt-6 rounded-xl bg-slate-800 py-4"
            accessibilityRole="button"
            accessibilityLabel={t('capsule.reveal.dismiss')}
          >
            <Body className="text-center font-semibold text-white">{t('capsule.reveal.dismiss')}</Body>
          </Pressable>
        </View>
      </SafeScreen>
    );
  }

  if (!viewable) {
    return (
      <SafeScreen testID="capsule:reveal:locked">
        <View className="flex-1 justify-center px-6" style={{ paddingTop: insets.top }}>
          <Heading className="mb-2">{t('capsule.card.lockedStatus')}</Heading>
          <Body className="mb-6 text-slate-400">{t('capsule.card.opensOn', { date: openDateStr })}</Body>
          <Pressable
            testID="capsule:reveal:dismiss"
            onPress={() => navigation.goBack()}
            className="rounded-xl bg-slate-800 py-4"
            accessibilityLabel={t('capsule.reveal.dismiss')}
          >
            <Body className="text-center font-semibold text-white">{t('capsule.reveal.dismiss')}</Body>
          </Pressable>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen testID="capsule:reveal:root">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 20,
        }}
      >
        <View className="mb-2 flex-row items-center justify-between">
          <Pressable
            testID="capsule:reveal:close"
            onPress={() => {
              hapticLight();
              navigation.goBack();
            }}
            accessibilityRole="button"
            accessibilityLabel={t('capsule.reveal.dismiss')}
          >
            <Body className="text-slate-400">{t('capsule.reveal.dismiss')}</Body>
          </Pressable>
        </View>

        <Heading className="mb-1 text-3xl" accessibilityRole="header">
          {t('capsule.reveal.title')}
        </Heading>
        <Body className="mb-2 text-slate-400">
          {t('capsule.reveal.subtitle')}
        </Body>
        <Body className="mb-6 text-sm text-slate-500" testID="capsule:reveal:recorded-on">
          {recordedOn}
        </Body>

        <Heading className="mb-3 text-xl">{capsule.title}</Heading>

        {mediaKind === 'video' && previewUri ? (
          <View className="mb-6 h-64 overflow-hidden rounded-2xl bg-black">
            <Video
              source={previewUri}
              style={{ width: '100%', height: '100%' }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
            />
          </View>
        ) : null}

        {mediaKind === 'photo' && previewUri ? (
          <Image
            source={previewUri}
            className="mb-6 h-64 w-full rounded-2xl bg-slate-900"
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : null}

        {capsule.text ? (
          <Body className="mb-8 text-lg leading-relaxed text-slate-200">{capsule.text}</Body>
        ) : null}
      </ScrollView>
    </SafeScreen>
  );
}
