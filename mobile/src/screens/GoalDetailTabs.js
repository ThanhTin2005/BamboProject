import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { View } from 'react-native';
import CustomContainer from '../components/customContainer'; // Căn phòng đặc biệt có khả năng tự động "né" các vùng bị che khu

// Import 2 "căn phòng" vừa tạo
import GoalOverviewScreen from './GoalOverviewScreen';
import GoalTimelineScreen from './GoalTimelineScreen'; // Tên mới của GoalDetailScreen cũ

const Tab = createMaterialTopTabNavigator();

const GoalDetailTabs = ({ route }) => {
  // Lấy dữ liệu ID và Tên mục tiêu từ HomeScreen
  const { goalId, goalName } = route.params;

  // 2. Kêu thám tử đo đạc 4 viền màn hình của CÁI MÁY ĐANG CHẠY APP
  const insets = useSafeAreaInsets();

  return (
    <CustomContainer>
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2d5a27', // Màu chữ khi được chọn (Xanh Bambo)
        tabBarInactiveTintColor: '#888',  // Màu chữ khi không chọn
        tabBarIndicatorStyle: { backgroundColor: '#2d5a27', height: 3 }, // Thanh gạch chân
        tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold', textTransform: 'none' }, // Chữ không bị in hoa toàn bộ
        tabBarStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 }, // Phẳng, không đổ bóng
      }}
    >
      {/* TAB 1: Tổng quan (Truyền ID xuống qua initialParams) */}
      <Tab.Screen 
        name="Overview" 
        component={GoalOverviewScreen} 
        options={{ title: 'Tổng quan' }}
        initialParams={{ goalId: goalId, goalName: goalName }} 
      />

      {/* TAB 2: Hành trình (Truyền ID xuống qua initialParams) */}
      <Tab.Screen 
        name="Timeline" 
        component={GoalTimelineScreen} 
        options={{ title: 'Hành trình' }}
        initialParams={{ goalId: goalId, goalName: goalName }} 
      />
    </Tab.Navigator>
    </CustomContainer>
  );
};

export default GoalDetailTabs;