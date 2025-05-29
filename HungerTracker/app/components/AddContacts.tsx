  import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import * as Contacts from 'expo-contacts';
import { BlurView } from 'expo-blur';
import { colors } from '../theme';
import { Ionicons } from '@expo/vector-icons';

type Contact = Contacts.Contact;

export default function AddContacts() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [permission, setPermission] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkPermission();
    }, []);

    const checkPermission = async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        setPermission(status === 'granted');
        if (status === 'granted') {
            loadContacts();
        }
        setLoading(false);
    };

    const loadContacts = async () => {
        const { data } = await Contacts.getContactsAsync({
            fields: [
                Contacts.Fields.PhoneNumbers,
                Contacts.Fields.Image,
                Contacts.Fields.Name,
            ],
        });
        setContacts(data || []);
    };

    const handleInvite = (contact: Contact) => {
        // TODO: Implement invite functionality
        console.log('Invite:', contact.name);
    };

    const handleAdd = (contact: Contact) => {
        // TODO: Implement add functionality
        console.log('Add:', contact.name);
    };

    const renderContact = ({ item }: { item: Contact }) => (
        <View style={styles.contactItem}>
            <View style={styles.contactInfo}>
                {item.imageAvailable && item.image ? (
                    <Image source={{ uri: item.image.uri }} style={styles.contactImage} />
                ) : (
                    <View style={styles.contactImagePlaceholder}>
                        <Text style={styles.contactInitial}>
                            {item.name?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                    </View>
                )}
                <View style={styles.contactDetails}>
                    <Text style={styles.contactName}>{item.name || 'Unknown'}</Text>
                    {item.phoneNumbers && item.phoneNumbers[0] && (
                        <Text style={styles.contactNumber}>{item.phoneNumbers[0].number}</Text>
                    )}
                </View>
            </View>
            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleInvite(item)}
            >
                <Text style={styles.buttonText}>Invite</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (permission === false) {
        return (
            <View style={styles.container}>
                
                <BlurView intensity={20} style={styles.blurContainer}>
                    <Text style={styles.permissionText}>Allow Contact Access?</Text>
                    <Text style={styles.permissionSubtext}>
                        Allow Muckd to access your contacts to find friends
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={checkPermission}
                    >
                        <Text style={styles.permissionButtonText}>Allow Contact Access</Text>
                    </TouchableOpacity>
                </BlurView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.subtitle}>Add Your Contacts</Text>
            </View>
            <FlatList
                
                data={contacts}
                renderItem={renderContact}
                keyExtractor={(item) => item.id || item.name || Math.random().toString()}
                contentContainerStyle={styles.listContainer}
                style={styles.list}
                scrollEnabled={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',	
    },
    header: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    subtitle: {
        color: colors.text[1],
        fontSize: 20,
        fontWeight: "medium",
        textAlign: 'left',
    },
    list: {
        width: '100%',
    },
    listContainer: {
        padding: 16,
        width: '100%',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.bg[2],
        width: '100%',
    },
    contactInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        width: '100%',
    },
    contactImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    contactImagePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.acc.p1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactInitial: {
        color: colors.text[1],
        fontSize: 24,
        fontWeight: 'bold',
    },
    contactDetails: {
        marginLeft: 12,
        flex: 1,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text[1],
    },
    contactNumber: {
        fontSize: 14,
        color: colors.text[2],
        marginTop: 2,
    },
    actionButton: {
        backgroundColor: colors.text[3],
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    buttonText: {
        color: colors.text[1],
        fontWeight: '600',
    },
    blurContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    permissionText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text[1],
        marginBottom: 12,
    },
    permissionSubtext: {
        fontSize: 16,
        color: colors.text[2],
        textAlign: 'center',
        marginBottom: 24,
    },
    permissionButton: {
       background: colors.grad[1],
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    permissionButtonText: {
        color: colors.text[1],
        fontSize: 16,
        fontWeight: '600',
    },
});