import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../theme";
import { SafeAreaView } from "react-native-safe-area-context";
import FriendsList from "../components/FriendsList";
import AddFriendModal from "../components/AddFriendModal";
import FriendRequests from "../components/FriendRequests";
import { useState, useEffect } from "react";
import { auth } from "../services/api";

export default function Friends() {
  const [isAddFriendModalVisible, setIsAddFriendModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const fetchPendingRequestsCount = async () => {
    try {
      const response = await auth.getFriends();
      const pendingRequests = response.data.filter(
        (friend: any) => friend.status === 'pending' && friend.receiver.id === response.data.user?.id
      );
      setPendingRequestsCount(pendingRequests.length);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  useEffect(() => {
    fetchPendingRequestsCount();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddFriendModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Friend</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <View style={styles.requestsTab}>
            <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
              Requests
            </Text>
            {pendingRequestsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingRequestsCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'friends' ? <FriendsList /> : <FriendRequests />}
      
      <AddFriendModal
        visible={isAddFriendModalVisible}
        onClose={() => setIsAddFriendModalVisible(false)}
        onFriendAdded={() => {
          setIsAddFriendModalVisible(false);
          fetchPendingRequestsCount();
        }}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text[1],
  },
  addButton: {
    backgroundColor: colors.acc.p1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.bg[1],
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.acc.p1,
  },
  tabText: {
    fontSize: 16,
    color: colors.text[2],
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.text[1],
    fontWeight: '600',
  },
  requestsTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: colors.acc.p1,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: colors.bg[1],
    fontSize: 12,
    fontWeight: 'bold',
  },
});