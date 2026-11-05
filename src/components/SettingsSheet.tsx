import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';
import { Chip } from './Chip';
import { SecondaryButton } from './SecondaryButton';
import type { Units } from '../utils/format';

type Props = {
  visible: boolean;
  units: Units;
  defaultIso: number;
  onUnits: (u: Units) => void;
  onIso: (iso: number) => void;
  onClose: () => void;
};

const ISO_CHOICES = [100, 200, 400, 800];

export function SettingsSheet({ visible, units, defaultIso, onUnits, onIso, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close settings" />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <Text style={styles.heading} numberOfLines={1}>
          STUDIO SETTINGS
        </Text>

        <Text style={styles.section} numberOfLines={1}>
          UNITS
        </Text>
        <View style={styles.row}>
          <Chip label="METRES" active={units === 'metres'} onPress={() => onUnits('metres')} />
          <Chip label="FEET" active={units === 'feet'} onPress={() => onUnits('feet')} />
        </View>

        <Text style={styles.section} numberOfLines={1}>
          DEFAULT ISO
        </Text>
        <View style={styles.row}>
          {ISO_CHOICES.map(iso => (
            <Chip
              key={iso}
              label={String(iso)}
              active={defaultIso === iso}
              onPress={() => onIso(iso)}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <SecondaryButton label="DONE" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(10,7,15,0.72)' },
  sheet: {
    backgroundColor: THEME.colors.bg.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.ui.borderStrong,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 26,
  },
  grabber: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(243,239,250,0.18)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  heading: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    lineHeight: 18,
    color: THEME.colors.text.primary,
    textAlign: 'center',
  },
  section: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.4,
    lineHeight: 13,
    color: THEME.colors.text.muted,
    marginTop: 18,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 8 },
  footer: { marginTop: 22 },
});

export default SettingsSheet;
