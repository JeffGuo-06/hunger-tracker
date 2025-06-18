import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { colors } from "../theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { auth, users } from "../services/api";
import Friends from "../components/Friends";

interface Friend {
  id: number;
  sender: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  receiver: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export default function FriendsPage() {
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [searchUsername, setSearchUsername] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load current user profile
      const profile = await users.getProfile();
      setCurrentUser(profile);

      // Load friends
      await fetchFriends();
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load friends data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await auth.getFriends();
      const friendships = response.data;

      // Filter accepted friends
      const acceptedFriends = friendships.filter((f: Friend) => f.status === 'accepted');
      setFriends(acceptedFriends);

      // Filter pending requests where current user is receiver
      const pendingRequests = friendships.filter((f: Friend) =>
        f.status === 'pending' && f.receiver.id === currentUser?.user?.id
      );
      setPendingRequests(pendingRequests);

    } catch (err) {
      console.error('Error fetching friends:', err);
      setError('Failed to load friends');
    }
  };

  const handleSendFriendRequest = async () => {
    if (!searchUsername.trim()) return;

    try {
      setSearchLoading(true);
      await auth.sendFriendRequest(searchUsername.trim());
      Alert.alert('Success', 'Friend request sent!');
      setSearchUsername("");
      await fetchFriends(); // Refresh the list
    } catch (err: any) {
      console.error('Error sending friend request:', err);
      Alert.alert('Error', err.message || 'Failed to send friend request');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAcceptRequest = async (friendshipId: number) => {
    try {
      await auth.acceptFriendRequest(friendshipId);
      await fetchFriends(); // Refresh the list
    } catch (err) {
      console.error('Error accepting friend request:', err);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (friendshipId: number) => {
    try {
      await auth.rejectFriendRequest(friendshipId);
      await fetchFriends(); // Refresh the list
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const filteredFriends = friends.filter(friend => {
    const friendData = friend.sender.id === currentUser?.user?.id ? friend.receiver : friend.sender;
    const fullName = `${friendData.first_name} ${friendData.last_name}`.toLowerCase();
    const username = friendData.username.toLowerCase();
    const searchTerm = search.toLowerCase();
    return fullName.includes(searchTerm) || username.includes(searchTerm);
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Text style={styles.title}>Friends</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.acc.p1} />
          <Text style={styles.loadingText}>Loading friends...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
      </View>

      {/* Add Friend Section */}
      <View style={styles.addFriendSection}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter username to add friend..."
            placeholderTextColor={colors.text[2]}
            value={searchUsername}
            onChangeText={setSearchUsername}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleSendFriendRequest}
            disabled={searchLoading || !searchUsername.trim()}
          >
            {searchLoading ? (
              <ActivityIndicator size="small" color={colors.text[1]} />
            ) : (
              <Ionicons name="add" size={20} color={colors.text[1]} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends ({friends.length})
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
            {pendingRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingRequests.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {activeTab === 'friends' && (
        <>
          {/* Search Bar for Friends */}
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color={colors.text[2]}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends..."
              placeholderTextColor={colors.text[2]}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <ScrollView style={styles.scrollContainer}>
            {filteredFriends.length > 0 ? (
              <Friends
                friends={filteredFriends}
                currentUser={currentUser}
                onRefresh={fetchFriends}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={80} color={colors.text[3]} />
                  <Text style={styles.emptyTitle}>
                    {friends.length === 0 ? "No Friends Yet" : "No friends found"}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {friends.length === 0
                      ? "Add friends to see their food adventures and share your own!"
                      : "Try searching with a different name or username"
                    }
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </>
      )}

      {activeTab === 'requests' && (
        <ScrollView style={styles.scrollContainer}>
          {pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <View key={request.id} style={styles.requestItem}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>
                    {request.sender.first_name} {request.sender.last_name}
                  </Text>
                  <Text style={styles.requestUsername}>@{request.sender.username}</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAcceptRequest(request.id)}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleRejectRequest(request.id)}
                  >
                    <Text style={styles.buttonText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyState}>
                <Ionicons name="mail-outline" size={80} color={colors.text[3]} />
                <Text style={styles.emptyTitle}>No Friend Requests</Text>
                <Text style={styles.emptySubtitle}>
                  You don't have any pending friend requests at the moment.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg[1],
  },
  header: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: colors.text[1],
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  addFriendSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  searchBar: {
    width: "90%",
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg[2],
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignSelf: "center",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text[1],
    fontSize: 16,
  },
  addButton: {
    backgroundColor: colors.acc.p1,
    padding: 8,
    borderRadius: 8,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text[2],
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyState: {
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text[1],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text[2],
    textAlign: 'center',
    lineHeight: 24,
  },
  requestItem: {
    backgroundColor: colors.bg[2],
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    color: colors.text[1],
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  requestUsername: {
    color: colors.text[2],
    fontSize: 14,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: colors.acc.p1,
  },
  rejectButton: {
    backgroundColor: colors.bg[3],
  },
  buttonText: {
    color: colors.text[1],
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: colors.acc.p1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: colors.text[1],
    fontWeight: '600',
  },
});
