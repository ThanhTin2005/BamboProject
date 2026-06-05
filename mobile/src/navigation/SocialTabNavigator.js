import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 

// Import đầy đủ 3 màn hình cốt lõi
import ProfileScreen from '../screens/HomeScreen'; // Ông nhớ check lại đúng đường dẫn file Profile của ông nhé
import SocialFeedScreen from '../screens/SocialFeedScreen';
import AddFriendsScreen from '../screens/AddFriendsScreen';

const Tab = createBottomTabNavigator();

export default function SocialTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Profile" // ĐẶT MẶC ĐỊNH: Mở app ra là nhảy thẳng vào Profile của mình
      screenOptions={({ route }) => ({
        // Cấu hình hiển thị Icon động cho cả 3 Tab
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'; // Icon Cá nhân
          } else if (route.name === 'SocialFeed') {
            iconName = focused ? 'images' : 'images-outline'; // Icon Bảng tin ảnh Locket
          } else if (route.name === 'AddFriends') {
            iconName = focused ? 'person-add' : 'person-add-outline'; // Icon Thêm bạn
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50', // Màu xanh lá kỷ luật của Bambo
        tabBarInactiveTintColor: 'gray',   // Màu khi không chọn
        headerShown: false,                // Ẩn Header mặc định để tối ưu không gian hiển thị
      })}
    >
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Cá nhân' }} 
      />
      <Tab.Screen 
        name="SocialFeed" 
        component={SocialFeedScreen} 
        options={{ title: 'Bảng tin' }} 
      />
      <Tab.Screen 
        name="AddFriends" 
        component={AddFriendsScreen} 
        options={{ title: 'Kết nối' }} 
      />
    </Tab.Navigator>
  );
}