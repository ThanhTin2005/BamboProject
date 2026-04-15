import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import 2 màn hình ông vừa code xong
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import NewGoalScreen from './src/screens/NewGoalScreen';
import GoalDetailScreen from './src/screens/GoalDetailScreen';
import CreateLogScreen from './src/screens/CreateLogScreen';


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
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NewGoal" component={NewGoalScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreateLog" component={CreateLogScreen} options={{ headerShown: false }} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}