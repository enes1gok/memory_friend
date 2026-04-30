import { useMemo, useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { getAccentColor } from '@/theme/accent';
import { colors } from '@/theme/colors';
import { fontFamilies } from '@/theme/fonts';
import { useUIStore } from '@/stores/useUIStore';

type Props = TextInputProps & {
  error?: boolean;
};

export function AppTextInput({ error = false, style, onFocus, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const accentProgress = useUIStore((s) => s.accentProgress);
  const accent = useMemo(() => getAccentColor(accentProgress), [accentProgress]);

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
          borderRadius: 16,
          borderWidth: 1,
          borderColor: error ? colors.warning : focused ? accent : colors.borderSubtle,
          backgroundColor: colors.surfaceElevated,
          color: colors.textPrimary,
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
