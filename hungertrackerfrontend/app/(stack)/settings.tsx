import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes } from '../theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log('Logout pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text[1]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg[2],
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSizes.large,
    color: colors.text[1],
    marginLeft: spacing.sm,
  },
  logoutButton: {
   background: colors.grad[1],
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.text[1],
    fontSize: fontSizes.medium,
    fontWeight: '600',
  },
}); 