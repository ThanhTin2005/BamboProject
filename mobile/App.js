import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import các màn hình cũ
import SocialTabNavigator from './src/navigation/SocialTabNavigator'; 
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

// --- PHẦN IMPORT CHO TÍNH NĂNG NHÓM ---
import CreateGroupScreen from './src/screens/Group/CreateGroupScreen';
import JoinGroupScreen from './src/screens/Group/JoinGroupScreen';
import GroupMainScreen from './src/screens/Group/GroupMainScreen';
// ⚡ 1. IMPORT MÀN HÌNH NỘP MINH CHỨNG NHÓM
import CreateGroupLogScreen from './src/screens/Group/CreateGroupLogScreen'; 
// ----------------------------------------

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }} 
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="NewGoal" component={NewGoalScreen} />
        <Stack.Screen name="GoalTimeline" component={GoalTimelineScreen} />
        <Stack.Screen name="CreateLog" component={CreateLogScreen} />
        <Stack.Screen name="GoalDetail" component={GoalDetailTabs} 
          options={({ route }) => ({ 
            title: route.params.goalName,
            headerTintColor: '#2d5a27',
            headerBackTitleVisible: false,
            headerStyle: { elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 } 
          })} 
        />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="EditGoal" component={EditGoalScreen} />
        <Stack.Screen name="SocialTab" component={SocialTabNavigator} />
        <Stack.Screen 
          name="FriendProfile" 
          component={HomeScreen} 
          options={{ 
            headerShown: true, 
            title: 'Hồ sơ kỷ luật',
            headerTintColor: '#1B5E20', 
            headerTitleStyle: { fontWeight: 'bold' },
          }} 
        />
        <Stack.Screen name="LogDetail" component={LogDetailScreen} />

        {/* --- KHAI BÁO ĐƯỜNG ĐI CHO TÍNH NĂNG NHÓM --- */}
        <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
        <Stack.Screen name="JoinGroup" component={JoinGroupScreen} />
        <Stack.Screen name="GroupMain" component={GroupMainScreen} />
        {/* ⚡ 2. ĐĂNG KÝ MÀN HÌNH NỘP MINH CHỨNG VÀO ĐÂY */}
        <Stack.Screen name="CreateGroupLog" component={CreateGroupLogScreen} /> 
        {/* (Đã xóa dòng GroupIndexScreen dư thừa ở đây) */}
        {/* ---------------------------------------- */}

      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}