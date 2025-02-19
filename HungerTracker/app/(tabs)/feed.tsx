import { View, Text, StyleSheet } from "react-native";


export default function Create() {
  return (
    <View style={styles.container}>
        <Text>This is the feed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});