import { useMemo, useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { useUIStore } from '@/stores/useUIStore';
import { getAccentColor } from '@/theme/accent';
import { colors } from '@/theme/colors';
import { fontFamilies } from '@/theme/fonts';
import { radius } from '@/theme/radius';

type Props = TextInputProps & {
  error?: boolean;
};

export function AppTextInput({ error = false, style, onFocus, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const accentProgress = useUIStore((s) => s.accentProgress);
  const accent = useMemo(() => getAccentColor(accentProgress), [accentProgress]);

  const borderColor = error ? colors.error : focused ? accent : colors.outline;

  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      selectionColor={accent}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={[
        {
          minHeight: 48,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor,
          backgroundColor: colors.surfaceContainerLow,
          color: colors.onSurface,
          fontFamily: fontFamilies.body,
          fontSize: 16,
          paddingHorizontal: 16,
          paddingVertical: 12,
        },
        style,
      ]}
      {...rest}
    />
  );
}
