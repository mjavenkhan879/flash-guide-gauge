import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import { THEME } from '../constants/theme';

/**
 * Press feedback the way this stack wants it: the <Pressable> stays the PARENT and
 * drives an Animated.View that lives INSIDE it. Native driver on transform only.
 */
export function usePressScale(target: number = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: target,
      tension: THEME.animation.buttonSpring.tension,
      friction: THEME.animation.buttonSpring.friction,
      useNativeDriver: true,
    }).start();
  }, [scale, target]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: THEME.animation.buttonSpring.tension,
      friction: THEME.animation.buttonSpring.friction,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return { scale, onPressIn, onPressOut };
}

export default usePressScale;
