import React, { useRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import MapScreen from "../components/MapScreen";
import FriendsBottomSheet from "../components/FriendsBottomSheet";
import { colors, spacing } from "../theme";

export default function Index() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const handlePresentPress = () => {
    console.log('Button pressed');
    if (bottomSheetRef.current) {
      console.log('Presenting bottom sheet');
      bottomSheetRef.current.present();
    } else {
      console.log('Bottom sheet ref is null');
    }
  };

  return (
    <View style={styles.container}> 
      <MapScreen/>
      <TouchableOpacity 
        style={styles.friendsButton}
        onPress={handlePresentPress}
      >
        <Ionicons name="people-outline" size={24} color={colors.text[1]} />
      </TouchableOpacity>
      <FriendsBottomSheet bottomSheetRef={bottomSheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  friendsButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.acc.p1,
    padding: spacing.md,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
});
