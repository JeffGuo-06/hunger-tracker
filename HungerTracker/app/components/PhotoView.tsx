import { Image } from "expo-image";
import { Alert, View, Text, StyleSheet, TextInput } from "react-native";
import IconButton from "./IconButton";
import { shareAsync } from "expo-sharing";
import { saveToLibraryAsync } from "expo-media-library";
import CustomButton from "./CustomButton";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { colors } from "../theme";
import { posts } from "../services/api";
import { useState } from "react";

interface PhotoViewProps {
  photo: string;
  setPhoto: React.Dispatch<React.SetStateAction<string>>;
}

export default function PhotoView({ photo, setPhoto }: PhotoViewProps) {
  const [caption, setCaption] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePost = async () => {
    try {
      setIsLoading(true);
      
      // Create form data for the image upload
      const formData = new FormData();
      formData.append('image', {
        uri: photo,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);
      formData.append('caption', caption);

      // Send the post request
      await posts.create(formData);
      
      // Clear the photo and caption
      setPhoto("");
      setCaption("");
      
      Alert.alert("Success", "Your post has been created successfully!");
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Animated.View
      layout={LinearTransition}
      entering={FadeIn}
      exiting={FadeOut}
    >
      <View
        style={{
          position: "absolute",
          zIndex: 1,
          paddingTop: 50,
          right: 20,
        }}
      >
        <IconButton
          onPress={() => setPhoto("")}
          iosName={"xmark"}
          androidName="close"
        />
      </View>
      <Image
        source={photo}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: 5,
        }}
      />
      <View style={styles.buttonContainer}>
        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption..."
          placeholderTextColor={colors.text[2]}
          value={caption}
          onChangeText={setCaption}
          multiline
        />
        <CustomButton
          title="Post"
          handlePress={handlePost}
          containerStyles="bg-acc-p1 rounded-xl min-h-[56px]"
          textStyles="text-white font-psemibold text-lg"
          isLoading={isLoading}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 16,
    paddingHorizontal: 16,
    width: "100%",
  },
  captionInput: {
    backgroundColor: colors.bg[2],
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: colors.text[1],
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
