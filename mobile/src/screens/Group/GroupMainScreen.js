import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';

import GroupOverviewTab from './GroupOverviewTab';
import GroupTimelineTab from './GroupTimelineTab';

const Tab = createMaterialTopTabNavigator();

export default function GroupMainScreen({ route, navigation }) {
    const { group } = route.params; 
    const groupId = group.id || group.group_id;

    return (
        <View style={styles.container}>
            
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={30} color="#212121" />
                    </TouchableOpacity>
                    <Text style={styles.groupTitle} numberOfLines={1}>{group.title}</Text>
                    <View style={styles.spacer} />
                </View>
            </View>

            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: '#4CAF50', 
                    tabBarInactiveTintColor: '#666666',    
                    tabBarStyle: { backgroundColor: '#FFFFFF' },
                    tabBarIndicatorStyle: { backgroundColor: '#4CAF50', height: 2 }, 
                    tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold', textTransform: 'none' },
                }}
            >
                <Tab.Screen 
                    name="Timeline" 
                    component={GroupTimelineTab} 
                    options={{ title: 'Dòng thời gian' }} 
                    initialParams={{ groupId: groupId, role: group.role }} // ⚡ CHUYỀN ID VÀ ROLE SANG TAB
                />
                <Tab.Screen 
                    name="Thư viện ảnh" 
                    component={GroupOverviewTab} 
                    // ⚡ PHẢI CÓ DÒNG NÀY: Để ném cái groupId từ MainScreen xuống cho Tab Tổng quan dùng
                    initialParams={{ groupId: groupId, role: group.role }} 
                />
            </Tab.Navigator>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { paddingHorizontal: 20, paddingTop: StatusBar.currentHeight || 40, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEEEEE', backgroundColor: '#FFFFFF' },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    backBtn: { padding: 5, marginLeft: -5 },
    groupTitle: { color: '#212121', fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center', paddingHorizontal: 10 },
    spacer: { width: 24 },
    headerInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    roleBadge: { backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#E0E0E0' },
    roleText: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold' },
    inviteWrapper: { flexDirection: 'row', alignItems: 'center' },
    inviteCode: { color: '#666666', fontSize: 13, fontWeight: '600' }
});