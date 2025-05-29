import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../theme';
import GradientButton from '../components/GradientButton';
import IconButton from '../components/IconButton';

interface Contact {
  id: string;
  name: string;
  phone: string;
  onApp: boolean;
}

// Mock contacts data
const mockContacts: Contact[] = [
  { id: '1', name: 'John Doe', phone: '+1234567890', onApp: true },
  { id: '2', name: 'Jane Smith', phone: '+0987654321', onApp: false },
  { id: '3', name: 'Mike Johnson', phone: '+1122334455', onApp: true },
  { id: '4', name: 'Sarah Williams', phone: '+5544332211', onApp: false },
];

export default function InviteFriends() {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const toggleContact = (id: string) => {
    setSelectedContacts(prev =>
      prev.includes(id)
        ? prev.filter(contactId => contactId !== id)
        : [...prev, id]
    );
  };

  const handleInvite = () => {
    // Send invites to selected contacts
    console.log('Inviting:', selectedContacts);
    handleFinish();
  };

  const handleFinish = () => {
    // Clear navigation and go to app
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace('/(tabs)');
  };

  const renderContact = ({ item }: { item: Contact }) => {
    const isSelected = selectedContacts.includes(item.id);
    
    return (
      <TouchableOpacity
        style={styles.contactItem}
        onPress={() => !item.onApp && toggleContact(item.id)}
        disabled={item.onApp}
      >
        <View style={styles.contactInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name[0]}</Text>
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactPhone}>
              {item.onApp ? 'Already on Muckd' : item.phone}
            </Text>
          </View>
        </View>
        
        {item.onApp ? (
          <View style={styles.onAppBadge}>
            <Text style={styles.onAppText}>On App</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.checkbox, isSelected && styles.checkboxSelected]}
            onPress={() => toggleContact(item.id)}
          >
            {isSelected && <Ionicons name="checkmark" size={16} color={colors.bg[1]} />}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <IconButton
        iosName="chevron.backward"
        androidName="arrow-back"
        containerStyle={{ position: 'absolute', top: spacing.xl+25, left: spacing.xl, zIndex: 10 }}
        onPress={() => router.back()}
      />
      <View style={styles.header}>
        <Text style={styles.title}>Invite friends</Text>
        <Text style={styles.subtitle}>
          Birds of a feather muck together
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text[2]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts"
          placeholderTextColor={colors.text[2]}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={filteredContacts}
        keyExtractor={item => item.id}
        renderItem={renderContact}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.buttons}>
        {selectedContacts.length > 0 ? (
          <GradientButton 
            style={styles.button}
            onPress={handleInvite}
          >
            <Text style={styles.buttonText}>
              Invite {selectedContacts.length} friend{selectedContacts.length !== 1 ? 's' : ''}
            </Text>
          </GradientButton>
        ) : (
          <GradientButton 
            style={styles.button}
            onPress={handleFinish}
          >
            <Text style={styles.buttonText}>Start using Muckd</Text>
          </GradientButton>
        )}

        <TouchableOpacity style={styles.skipButton} onPress={handleFinish}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text[1],
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.medium,
    color: colors.text[2],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    height: 48,
    backgroundColor: colors.bg[2],
    borderRadius: 12,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.medium,
    color: colors.text[1],
  },
  listContent: {
    paddingHorizontal: spacing.xl,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bg[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.text[1],
    fontSize: fontSizes.large,
    fontWeight: '600',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    color: colors.text[1],
    fontSize: fontSizes.medium,
    fontWeight: '500',
  },
  contactPhone: {
    color: colors.text[2],
    fontSize: fontSizes.small,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.acc.p1,
    borderColor: colors.acc.p1,
  },
  onAppBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.bg[2],
    borderRadius: 12,
  },
  onAppText: {
    color: colors.text[2],
    fontSize: fontSizes.small,
  },
  buttons: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  button: {
    marginBottom: spacing.md,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: fontSizes.medium,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  skipButtonText: {
    color: colors.text[2],
    fontSize: fontSizes.medium,
  },
}); 