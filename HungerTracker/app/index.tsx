import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from "./theme";
import HeroCarousel from './components/HeroCarousel';

export default function HeroPage() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <HeroCarousel />
      </View>

      {/* CTA Buttons */}
      <View style={styles.buttonContainer}>
        <Link href="/(auth)/signup" push asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/(auth)/login" push asChild>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
    padding: 20,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: colors.acc.p1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.acc.p1,
  },
  secondaryButtonText: {
    color: colors.acc.p1,
    fontSize: 18,
    fontWeight: '600',
  },
}); 