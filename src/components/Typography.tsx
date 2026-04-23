import { Text, type TextProps } from 'react-native';

import { colors } from '@/theme/colors';
import { fontFamilies } from '@/theme/fonts';

export function Heading(props: TextProps) {
  const { style, ...rest } = props;
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fontFamilies.headingBold,
          color: colors.textPrimary,
          fontSize: 24,
          lineHeight: 32,
        },
        style,
      ]}
    />
  );
}

export function Body(props: TextProps) {
  const { style, ...rest } = props;
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fontFamilies.body,
          color: colors.textMuted,
          fontSize: 16,
          lineHeight: 24,
        },
        style,
      ]}
    />
  );
}
