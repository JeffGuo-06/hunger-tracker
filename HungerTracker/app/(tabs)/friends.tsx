import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme";

export default function Profile() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>You have no friends</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg[2],
  },
  text: {
    color: colors.text[1],
    fontSize: 20,
    fontWeight: "bold",
  },
});