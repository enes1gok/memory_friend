import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';

import { colors } from '@/theme/colors';

type Props = {
  visible: boolean;
  children: ReactNode;
  snapPoints?: (string | number)[];
  onDismiss?: () => void;
  testID?: string;
};

const styles = StyleSheet.create({
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  background: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    backgroundColor: colors.borderStrong,
    width: 44,
  },
  handleContainer: {
    paddingTop: 10,
  },
});

export function AppSheet({
  visible,
  children,
  snapPoints = ['42%', '76%'],
  onDismiss,
  testID,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const points = useMemo(() => snapPoints, [snapPoints]);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: Parameters<typeof BottomSheetBackdrop>[0]) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.55}
      >
        {Platform.OS === 'ios' ? <BlurView intensity={18} tint="dark" style={styles.blur} /> : null}
      </BottomSheetBackdrop>
    ),
    [],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={visible ? 0 : -1}
      snapPoints={points}
      enablePanDownToClose
      onClose={onDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
      handleStyle={styles.handleContainer}
    >
      <BottomSheetView>
        <View testID={testID}>{children}</View>
      </BottomSheetView>
    </BottomSheet>
  );
}
