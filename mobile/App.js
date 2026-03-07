import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import 2 màn hình ông vừa code xong
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* initialRouteName="Login" nghĩa là mở App ra sẽ thấy màn Login đầu tiên */}
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }} // Ẩn cái thanh tiêu đề mặc định của hệ thống cho đẹp
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}