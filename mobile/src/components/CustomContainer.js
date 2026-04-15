// file: components/CustomContainer.js
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomContainer = ({ children, style }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ flex: 1, paddingTop: insets.top, backgroundColor: '#F8FAF8' }, style]}>
      {children}
    </View>
  );
};
export default CustomContainer;