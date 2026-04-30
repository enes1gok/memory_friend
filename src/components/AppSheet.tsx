import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
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

/**
 * Bottom sheet wrapper. Uses controlled `index` only (no imperative snap/close)
 * to avoid Fabric mount races. Backdrop is self-contained — do not nest BlurView
 * inside BottomSheetBackdrop; that caused IllegalViewOperationException on Android.
 */
export function AppSheet({
  visible,
  children,
  snapPoints = ['42%', '76%'],
  onDismiss,
  testID,
}: Props) {
  const points = useMemo(() => snapPoints, [snapPoints]);

  const renderBackdrop = useCallback(
    (props: Parameters<typeof BottomSheetBackdrop>[0]) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.55}
      />
    ),
    [],
  );

  return (
    <BottomSheet
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
