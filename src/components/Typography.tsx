import { Text, type TextProps } from 'react-native';

import { colors } from '@/theme/colors';
import { fontFamilies } from '@/theme/fonts';

/** Hero / screen title — display-small */
export function Display(props: TextProps) {
  const { style, ...rest } = props;
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fontFamilies.display,
          color: colors.onSurface,
          fontSize: 28,
          lineHeight: 36,
        },
        style,
      ]}
    />
  );
}

/** Section titles — title-medium; override with className e.g. `text-lg` */
export function Heading(props: TextProps) {
  const { style, ...rest } = props;
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fontFamilies.heading,
          color: colors.onSurface,
          fontSize: 20,
          lineHeight: 28,
        },
        style,
      ]}
    />
  );
}

/** Prominent line — title-large */
export function Title(props: TextProps) {
  const { style, ...rest } = props;
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fontFamilies.heading,
          color: colors.onSurface,
          fontSize: 22,
          lineHeight: 28,
        },
        style,
      ]}
    />
  );
}

/** Body — body-large */
export function Body(props: TextProps) {
  const { style, ...rest } = props;
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fontFamilies.body,
          color: colors.onSurfaceVariant,
          fontSize: 16,
          lineHeight: 24,
        },
        style,
      ]}
    />
  );
}

/** Meta, legend — body-small */
export function Caption(props: TextProps) {
  const { style, ...rest } = props;
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fontFamilies.body,
          color: colors.textMuted,
          fontSize: 12,
          lineHeight: 16,
        },
        style,
      ]}
    />
  );
}

/** Labels, dense UI — label-large */
export function Label(props: TextProps) {
  const { style, ...rest } = props;
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fontFamilies.bodySemiBold,
          color: colors.onSurface,
          fontSize: 14,
          lineHeight: 20,
          letterSpacing: 0.1,
        },
        style,
      ]}
    />
  );
}

/** Primary actions on filled buttons — label-large on primary */
export function ButtonText(props: TextProps) {
  const { style, ...rest } = props;
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fontFamilies.bodySemiBold,
          color: colors.onPrimary,
          fontSize: 14,
          lineHeight: 20,
          letterSpacing: 0.1,
        },
        style,
      ]}
    />
  );
}
