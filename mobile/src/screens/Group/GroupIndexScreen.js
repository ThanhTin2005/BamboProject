import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function GroupIndexScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [myGroups, setMyGroups] = useState([]);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const fetchGroups = async () => {
                try {
                    const token = await AsyncStorage.getItem('userToken'); 
                    const response = await axios.get(`${BASE_URL}/groups/my-groups`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (isActive) {
                        setMyGroups(response.data.groups);
                        setLoading(false);
                    }
                } catch (error) {
                    console.log('Lỗi tải danh sách nhóm:', error);
                    if (isActive) setLoading(false);
                }
            };

            fetchGroups();
            return () => { isActive = false; };
        }, [])
    );

    const renderGroupItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.groupCard}
            onPress={() => navigation.navigate('GroupMain', { group: { id: item.group_id, title: item.title, role: item.role } })}
            activeOpacity={0.7} 
        >
            <View style={styles.cardHeader}>
                <Text style={styles.groupTitle}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={18} color="#999" />
            </View>
            
            <Text style={styles.groupDesc} numberOfLines={2}>
                {item.description ? item.description : 'Không có mô tả cho khế ước này.'}
            </Text>
            
            <View style={styles.cardFooter}>
                <View style={[styles.roleBadge, item.role === 'leader' ? styles.leaderBadge : styles.memberBadge]}>
                    <Text style={[styles.roleText, item.role === 'leader' ? styles.leaderText : styles.memberText]}>
                        {item.role === 'leader' ? '👑 Trưởng nhóm' : 'Thành viên'}
                    </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.memberCount}>4/4 </Text>
                    <Ionicons name="people" size={12} color="#999" />
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Đang tải danh sách Bụi tre...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            
            <View style={styles.actionHeader}>
                <TouchableOpacity style={[styles.actionBtn, styles.createBtn]} onPress={() => navigation.navigate('CreateGroup')}>
                    <Ionicons name="add-circle" size={18} color="#FFFFFF" style={styles.btnIcon} />
                    <Text style={styles.createBtnText}>Tạo Khế Ước</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.joinBtn]} onPress={() => navigation.navigate('JoinGroup')}>
                    <FontAwesome5 name="key" size={14} color="#4CAF50" style={styles.btnIcon} />
                    <Text style={styles.joinBtnText}>Nhập Mã</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>Các khế ước của ông</Text>
                
                {myGroups.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="leaf-outline" size={80} color="#E0E0E0" />
                        <Text style={styles.emptyText}>Ông chưa tham gia Bụi tre nào cả.</Text>
                        <Text style={styles.emptySubText}>Hãy lập khế ước ngay với đồng đội!</Text>
                    </View>
                ) : (
                    <FlatList
                        data={myGroups}
                        keyExtractor={(item) => item.group_id.toString()}
                        renderItem={renderGroupItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20 },
    centerContent: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#999', marginTop: 15, fontSize: 14, fontStyle: 'italic' },

    actionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 20, marginTop: StatusBar.currentHeight || 40 },
    actionBtn: { flex: 1, flexDirection: 'row', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 1 },
    btnIcon: { marginRight: 8 },
    
    createBtn: { backgroundColor: '#4CAF50', marginRight: 7 }, 
    createBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
    
    joinBtn: { backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0', marginLeft: 7 }, 
    joinBtnText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 15 },
    
    listSection: { flex: 1 },
    sectionTitle: { color: '#212121', fontSize: 18, fontWeight: 'bold', marginBottom: 20, letterSpacing: 0.5 },
    listContent: { paddingBottom: 30 },
    
    groupCard: { backgroundColor: '#F9F9F9', padding: 20, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#EBF0EB' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    groupTitle: { color: '#212121', fontSize: 17, fontWeight: '700' },
    groupDesc: { color: '#666666', fontSize: 14, marginBottom: 15, lineHeight: 20 },
    
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    leaderBadge: { backgroundColor: 'rgba(76, 175, 80, 0.1)' }, 
    memberBadge: { backgroundColor: '#EEEEEE' },
    roleText: { fontSize: 11, fontWeight: 'bold' },
    leaderText: { color: '#4CAF50' },
    memberText: { color: '#666666' },
    
    memberCount: { color: '#999', fontSize: 12 },

    emptyState: { flex: 1, alignItems: 'center', marginTop: 80 },
    emptyText: { color: '#212121', fontSize: 16, fontWeight: '600', marginTop: 25 },
    emptySubText: { color: '#999', fontSize: 14, marginTop: 8, fontStyle: 'italic' }
});