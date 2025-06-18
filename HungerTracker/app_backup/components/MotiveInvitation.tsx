import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

interface MotiveInvitationProps {
  onNotNow?: () => void;
}

export default function MotiveInvitation({ onNotNow }: MotiveInvitationProps) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Motive Invitation</Text>
        <View style={styles.avatars}>
          {/* Placeholder for avatars */}
          <View style={styles.avatar} />
          <View style={[styles.avatar, { left: 20, backgroundColor: '#6EC1E4' }]} />
          <View style={[styles.avatar, { left: 40, backgroundColor: '#B388FF' }]} />
        </View>
      </View>

      {/* Place Row */}
      <View style={styles.row}>
        <Ionicons name="location" size={22} color={colors.text[2]} style={styles.icon} />
        <Text style={styles.rowText}>Place</Text>
      </View>

      {/* Time Row */}
      <View style={styles.row}>
        <Ionicons name="time" size={22} color={colors.text[2]} style={styles.icon} />
        <Text style={styles.rowText}>Time</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notNowButton} onPress={onNotNow}>
          <Text style={styles.notNowButtonText}>Not Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CARD_RADIUS = 24;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg[2],
    borderRadius: CARD_RADIUS,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 24,
    width: 320,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerText: {
    color: colors.text[1],
    fontWeight: 'bold',
    fontSize: 19,
    flex: 1,
  },
  avatars: {
    flexDirection: 'row',
    marginLeft: spacing.md,
    position: 'relative',
    width: 60,
    height: 32,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#B0B0B0',
    borderWidth: 2,
    borderColor: colors.bg[2],
    position: 'absolute',
    left: 0,
    top: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginLeft: 2,
  },
  icon: {
    marginRight: 12,
  },
  rowText: {
    color: colors.text[2],
    fontSize: 17,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 12,
  },
  joinButton: {
    flex: 1,
    backgroundColor: colors.acc.p1,
    paddingVertical: 13,
    borderRadius: 22,
    alignItems: 'center',
    marginRight: 0,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notNowButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.acc.p1,
    paddingVertical: 13,
    borderRadius: 22,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  notNowButtonText: {
    color: colors.acc.p1,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
