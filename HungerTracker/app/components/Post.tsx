import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
    useAnimatedStyle, 
    useSharedValue, 
    withSpring,
    runOnJS,
    useAnimatedReaction
} from 'react-native-reanimated';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PostProps {
    post: {
        id: string;
        user: {
            name: string;
            profileImage: string;
        };
        image: string;
        caption: string;
        created_at: string;
        comments_count: number;
    };
}

export default function Post({ post }: PostProps) {
    const scale = useSharedValue(1);
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const initialFocalX = useSharedValue(0);
    const initialFocalY = useSharedValue(0);
    const isInitialPinch = useSharedValue(true);
    const lastScale = useSharedValue(1);
    const lastOffsetX = useSharedValue(0);
    const lastOffsetY = useSharedValue(0);
    const isZoomed = useSharedValue(false);

    // Sensitivity factors
    const ZOOM_SENSITIVITY = 0.7;  // Reduce zoom sensitivity
    const PAN_SENSITIVITY = 0.6;   // Reduce pan sensitivity

    // Format the timestamp
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    // Track zoom state
    useAnimatedReaction(
        () => scale.value,
        (currentScale) => {
            isZoomed.value = currentScale > 1;
        }
    );

    const pinchGesture = Gesture.Pinch()
        .onStart((e) => {
            const imageCenter = SCREEN_WIDTH / 2;
            initialFocalX.value = e.focalX - imageCenter;
            initialFocalY.value = e.focalY - imageCenter;
            isInitialPinch.value = true;
        })
        .onUpdate((e) => {
            // Apply zoom sensitivity with spring animation
            const targetScale = 1 + (e.scale - 1) * ZOOM_SENSITIVITY;
            scale.value = withSpring(targetScale, {
                damping: 50,
                stiffness: 400,
                mass: 0.5
            });
            
            if (scale.value > 1) {
                const imageCenter = SCREEN_WIDTH / 2;
                const currentFocalX = e.focalX - imageCenter;
                const currentFocalY = e.focalY - imageCenter;

                if (isInitialPinch.value) {
                    // Initial zoom - use focal point with reduced sensitivity
                    offsetX.value = withSpring(-initialFocalX.value * (scale.value - 1) * PAN_SENSITIVITY, {
                        damping: 50,
                        stiffness: 400,
                        mass: 0.5
                    });
                    offsetY.value = withSpring(-initialFocalY.value * (scale.value - 1) * PAN_SENSITIVITY, {
                        damping: 50,
                        stiffness: 400,
                        mass: 0.5
                    });
                    isInitialPinch.value = false;
                } else {
                    // Panning - use the difference with reduced sensitivity and spring animation
                    const targetOffsetX = (currentFocalX - initialFocalX.value) * scale.value * PAN_SENSITIVITY;
                    const targetOffsetY = (currentFocalY - initialFocalY.value) * scale.value * PAN_SENSITIVITY;
                    offsetX.value = withSpring(targetOffsetX, {
                        damping: 50,
                        stiffness: 400,
                        mass: 0.5
                    });
                    offsetY.value = withSpring(targetOffsetY, {
                        damping: 50,
                        stiffness: 400,
                        mass: 0.5
                    });
                }
            }
        })
        .onEnd(() => {
            scale.value = withSpring(1, {
                damping: 50,
                stiffness: 400,
                mass: 0.5
            });
            offsetX.value = withSpring(0, {
                damping: 50,
                stiffness: 400,
                mass: 0.5
            });
            offsetY.value = withSpring(0, {
                damping: 50,
                stiffness: 400,
                mass: 0.5
            });
            isInitialPinch.value = true;
        });

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            if (isZoomed.value) {
                offsetX.value = withSpring(e.translationX * PAN_SENSITIVITY, {
                    damping: 50,
                    stiffness: 400,
                    mass: 0.5
                });
                offsetY.value = withSpring(e.translationY * PAN_SENSITIVITY, {
                    damping: 50,
                    stiffness: 400,
                    mass: 0.5
                });
            }
        })
        .minPointers(2)
        .maxPointers(2)
        .simultaneousWithExternalGesture(pinchGesture);

    const composed = Gesture.Simultaneous(pinchGesture, panGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: offsetX.value },
            { translateY: offsetY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{ uri: post.user.profileImage }}
                    style={styles.profileImage}
                    contentFit="cover"
                />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{post.user.name}</Text>
                    <Text style={styles.subtitle}>{formatTimestamp(post.created_at)}</Text>
                </View>
            </View>
            <GestureDetector gesture={composed}>
                <Animated.View style={styles.imageContainer}>
                    <Animated.Image 
                        source={{ uri: post.image }} 
                        style={[styles.image, animatedStyle]}
                        resizeMode="cover"
                    />
                </Animated.View>
            </GestureDetector>
            {post.caption && (
                <View style={styles.captionContainer}>
                    <Text style={styles.caption}>{post.caption}</Text>
                </View>
            )}
            <View style={styles.infoContainer}>
                <Ionicons name="chatbubble-outline" size={24} color={colors.acc.p1} />
                <Text style={styles.comments}>{post.comments_count}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        backgroundColor: colors.bg[2],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userInfo: { 
        marginLeft: 10,
    },
    userName: { 
        fontWeight: 'bold', 
        fontSize: 16,
        color: colors.text[1],
    },
    subtitle: {
        fontSize: 12,
        color: colors.text[2],
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    captionContainer: {
        padding: 10,
    },
    caption: {
        fontSize: 14,
        color: colors.text[1],
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    comments: {
        marginLeft: 5,
        color: colors.text[2],
    },
});