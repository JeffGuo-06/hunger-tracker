import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, fontSizes } from "./theme";

export default function HeroPage() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image 
          source={require('../assets/images/muckd-icon-prototype1.png')} 
          style={styles.heroImage}
          resizeMode="contain"
        />
        <Text style={styles.title}>Muckd</Text>
        <Text style={styles.subtitle}>Track your meals, share with friends, and discover new food spots together.</Text>
      </View>

      {/* CTA Buttons */}
      <View style={styles.buttonContainer}>
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/(auth)/login" asChild>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  heroImage: {
    width: '80%',
    height: 300,
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text[1],
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.text[2],
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
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