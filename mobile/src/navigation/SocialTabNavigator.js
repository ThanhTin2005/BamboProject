import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 

// Import đầy đủ 4 màn hình cốt lõi
import ProfileScreen from '../screens/HomeScreen'; 
import SocialFeedScreen from '../screens/SocialFeedScreen';
import GroupIndexScreen from '../screens/Group/GroupIndexScreen'; 
import AddFriendsScreen from '../screens/AddFriendsScreen';
import NotificationScreen from '../screens/NotificationScreen'; // Màn hình Ngày 43 của ông đây

const Tab = createBottomTabNavigator();

export default function SocialTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Profile" // ĐẶT MẶC ĐỊNH: Mở app ra là nhảy thẳng vào Profile của mình
      screenOptions={({ route }) => ({
        // Cấu hình hiển thị Icon động cho cả 4 Tab
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'; // Icon Cá nhân
          } else if (route.name === 'SocialFeed') {
            iconName = focused ? 'images' : 'images-outline'; // Icon Bảng tin
          } else if (route.name === 'GroupIndex') {
            iconName = focused ? 'people' : 'people-outline'; // Icon Nhóm
          } else if (route.name === 'AddFriends') {
            iconName = focused ? 'person-add' : 'person-add-outline'; // Icon Thêm bạn
          } else if (route.name === 'Notifications') {
            // ⚡ LOGIC ICON CHO TAB THÔNG BÁO MỚI: Hình cái chuông
            iconName = focused ? 'notifications' : 'notifications-outline'; 
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',  // Màu xanh lá kỷ luật của Bambo
        tabBarInactiveTintColor: 'gray',   // Màu khi không chọn
        headerShown: false,                // Ẩn Header mặc định để tối ưu không gian
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
        name="GroupIndex" 
        component={GroupIndexScreen} 
        options={{ title: 'Nhóm' }} 
      />
      {/* ⚡ MÀN HÌNH THÔNG BÁO ĐƯỢC CHÈN VÀO ĐÂY ⚡ */}
      <Tab.Screen 
        name="Notifications" 
        component={NotificationScreen} 
        options={{ title: 'Thông báo' }} 
      />
      
      <Tab.Screen 
        name="AddFriends" 
        component={AddFriendsScreen} 
        options={{ title: 'Kết nối' }} 
      />
    </Tab.Navigator>
  );
}