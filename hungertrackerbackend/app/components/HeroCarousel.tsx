import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { colors } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Track Your Meals',
    description: 'Keep a record of your favorite dishes and discover new ones.',
    image: require('../../assets/images/muckd-icon-prototype1.png'),
  },
  {
    id: '2',
    title: 'Share with Friends',
    description: 'Connect with friends and share your food journey.',
    image: require('../../assets/images/muckd-icon-prototype1.png'),
  },
  {
    id: '3',
    title: 'Discover New Spots',
    description: 'Find the best restaurants and food spots around you.',
    image: require('../../assets/images/muckd-icon-prototype1.png'),
  },
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = (index: number) => {
    if (slidesRef.current) {
      slidesRef.current.scrollToIndex({ index });
    }
  };

  const renderItem = ({ item }: { item: typeof slides[0] }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  const Pagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />
      <Pagination />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  slide: {
    width: SCREEN_WIDTH - 40,
    alignItems: 'center',
    padding: 20,
    justifyContent: 'flex-start',
    height: '100%',
    paddingTop: 80,
  },
  image: {
    width: '80%',
    height: 300,
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text[1],
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 40,
  },
  description: {
    fontSize: 16,
    color: colors.text[2],
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
    marginBottom: 40,
  },
  paginationContainer: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.acc.p1,
    marginHorizontal: 4,
  },
});
