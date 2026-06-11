import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import 2 màn hình ông vừa code xong
import SocialTabNavigator from './src/navigation/SocialTabNavigator'; // Ông nhớ check lại đúng đường dẫn file SocialTabNavigator của ông nhé
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import NewGoalScreen from './src/screens/NewGoalScreen';
import GoalTimelineScreen from './src/screens/GoalTimelineScreen';
import CreateLogScreen from './src/screens/CreateLogScreen';
import GoalDetailTabs from './src/screens/GoalDetailTabs';
import EditProfileScreen from './src/screens/EditProfileScreen';
import EditGoalScreen from './src/screens/EditGoalScreen';
import SocialFeedScreen from './src/screens/SocialFeedScreen';
import FriendProfileScreen from './src/screens/FriendProfileScreen';
import LogDetailScreen from './src/screens/LogDetailScreen';


const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
    <NavigationContainer>
      {/* initialRouteName="Login" nghĩa là mở App ra sẽ thấy màn Login đầu tiên */}
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }} // Ẩn cái thanh tiêu đề mặc định của hệ thống cho đẹp
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        {/*<Stack.Screen name="Home" component={HomeScreen} />*/}
        <Stack.Screen name="NewGoal" component={NewGoalScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GoalTimeline" component={GoalTimelineScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreateLog" component={CreateLogScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GoalDetail" component={GoalDetailTabs} 
          options={({ route }) => ({ 
            title: route.params.goalName, // Lấy tên Goal làm Tiêu đề trên cùng luôn
            headerTintColor: '#2d5a27',
            headerBackTitleVisible: false,
            headerStyle: { elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 } // Xóa đường kẻ dưới Header
          })} 
        />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EditGoal" component={EditGoalScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SocialTab" component={SocialTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen 
          name="FriendProfile" 
          component={HomeScreen} 
          options={{ 
            headerShown: true, // Để hiện nút Back quay lại cho dễ
            title: 'Hồ sơ kỷ luật',
            headerTintColor: '#1B5E20', // Màu xanh đậm Bambo cho nút Back
            headerTitleStyle: { fontWeight: 'bold' },
          }} 
        />
        <Stack.Screen name="LogDetail" component={LogDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}