import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomContainer from '../components/customContainer'; 

import GoalOverviewScreen from './GoalOverviewScreen';
import GoalTimelineScreen from './GoalTimelineScreen'; 
import GoalGalleryScreen from './GoalGalleryScreen'; 
import { BASE_URL } from '../config'; 

const Tab = createMaterialTopTabNavigator();
import { useNavigation } from '@react-navigation/native';

const GoalDetailTabs = ({ route }) => {
  const navigation = useNavigation();
  const { goalId, goalName } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <CustomContainer>
      <View style={styles.headerWrapper}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} 
        >
          <Ionicons name="chevron-back" size={28} color="#1a3317" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {goalName}
        </Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2d5a27', 
          tabBarInactiveTintColor: '#888',  
          tabBarIndicatorStyle: { backgroundColor: '#2d5a27', height: 3 }, 
          tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold', textTransform: 'none' }, 
          tabBarStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 }, 
        }}
      >
        <Tab.Screen 
          name="Overview" 
          component={GoalOverviewScreen} 
          options={{ title: 'Tổng quan' }}
          initialParams={{ goalId: goalId, goalName: goalName }} 
        />

        <Tab.Screen 
          name="Timeline" 
          component={GoalTimelineScreen} 
          options={{ title: 'Hành trình' }}
          initialParams={{ goalId: goalId, goalName: goalName }} 
        />

        <Tab.Screen 
          name="Gallery" 
          component={GoalGalleryScreen} 
          options={{ title: 'Thư viện' }}
          initialParams={{ goalId: goalId, goalName: goalName }} 
        />
      </Tab.Navigator>
    </CustomContainer>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#fff', 
    paddingTop: 15,
    paddingBottom: 15, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0EAE0', 
    position: 'relative', 
  },
  backButton: {
    position: 'absolute', 
    left: 15, 
    zIndex: 10, 
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a3317', 
    maxWidth: '70%', 
  },
});

export default GoalDetailTabs;