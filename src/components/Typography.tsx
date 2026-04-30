import { Text, type TextProps } from 'react-native';

import { colors } from '@/theme/colors';
import { fontFamilies } from '@/theme/fonts';

/** Hero / screen title scale */
export function Display(props: TextProps) {
  const { style, ...rest } = props;
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fontFamilies.display,
          color: colors.textPrimary,
          fontSize: 28,
          lineHeight: 36,
        },
        style,
      ]}
    />
  );
}

/** Section titles — default ~20px; override with className e.g. `text-lg` */
export function Heading(props: TextProps) {
  const { style, ...rest } = props;
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fontFamilies.heading,
          color: colors.textPrimary,
          fontSize: 20,
          lineHeight: 28,
        },
        style,
      ]}
    />
  );
}

/** Body copy — readable on dark canvas */
export function Body(props: TextProps) {
  const { style, ...rest } = props;
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fontFamilies.body,
          color: colors.textSecondary,
          fontSize: 16,
          lineHeight: 24,
        },
        style,
      ]}
    />
  );
}

/** Meta, legend, hints */
export function Caption(props: TextProps) {
  const { style, ...rest } = props;
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fontFamilies.body,
          color: colors.textMuted,
          fontSize: 13,
          lineHeight: 18,
        },
        style,
      ]}
    />
  );
}

/** Primary actions on filled buttons */
export function ButtonText(props: TextProps) {
  const { style, ...rest } = props;
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fontFamilies.bodySemiBold,
          color: colors.textPrimary,
          fontSize: 16,
          lineHeight: 22,
        },
        style,
      ]}
    />
  );
}
