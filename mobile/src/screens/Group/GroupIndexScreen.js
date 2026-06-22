import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, StatusBar, Image } from 'react-native';
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
          style={styles.goalRow} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('GroupMain', { 
            groupId: item.group_id, 
            group: item 
          })}
        >
          {/* CỘT TRÁI: ẢNH NHÓM TRÀN MÉP */}
          <Image 
            source={{ uri: item.group_image || 'https://ui-avatars.com/api/?name=Bambo+Group&background=4CAF50&color=fff&size=256' }} 
            style={styles.rowImage} 
          />
    
          {/* CỘT PHẢI: THÔNG TIN */}
          <View style={styles.rowRight}>
            <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.rowDescription} numberOfLines={1}>
              {item.description || 'Chưa có mô tả cho khế ước này...'}
            </Text>
            
            {/* THANH PROGRESS: Đại diện cho số lượng thành viên đã join */}
            <View style={styles.rowProgressBar}>
              <View style={[
                styles.rowProgressFill, 
                { 
                  width: `${((item.member_count || 1) / 4) * 100}%`, 
                  backgroundColor: '#4CAF50' 
                }
              ]} /> 
            </View>
            
            {/* THỐNG KÊ Ở ĐÁY */}
            <View style={styles.rowStats}>
              <Text style={styles.rowProgressText}>👥 {item.member_count || 1}/4 thành viên</Text>
              <Text style={styles.rowStreakText}>🔥 Sinh tồn nhóm</Text>
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
    container: { flex: 1, backgroundColor: '#F4F7F4', paddingHorizontal: 20 }, // Sửa màu nền xám nhẹ giống HomeScreen
    centerContent: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#999', marginTop: 15, fontSize: 14, fontStyle: 'italic' },

    actionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 20, marginTop: StatusBar.currentHeight || 40 },
    actionBtn: { flex: 1, flexDirection: 'row', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 1 },
    btnIcon: { marginRight: 8 },
    
    createBtn: { backgroundColor: '#4CAF50', marginRight: 7 }, 
    createBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
    
    joinBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', marginLeft: 7 }, 
    joinBtnText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 15 },
    
    listSection: { flex: 1 },
    sectionTitle: { color: '#2d5a27', fontSize: 18, fontWeight: 'bold', marginBottom: 20 }, // Đổi màu chữ xanh lá đậm cho tone-sur-tone
    listContent: { paddingBottom: 100 },
    
    // --- CSS ĐỒNG BỘ 100% VỚI THẺ CÁ NHÂN ---
    goalRow: { 
        flexDirection: 'row', 
        backgroundColor: '#fff', 
        marginHorizontal: 0, // ⚡ Đã sửa về 0 để thẻ bung ra hết chiều ngang màn hình
        marginBottom: 16, 
        borderRadius: 20, 
        overflow: 'hidden', 
        elevation: 3, 
        shadowColor: '#000', 
        shadowOpacity: 0.06, 
        shadowRadius: 8, 
        alignItems: 'stretch', 
    },
    rowImage: { 
        width: 120, 
        minHeight: 120, // ⚡ Giúp ảnh luôn vuông vắn, không bị xẹp khi chữ quá ít
        borderTopLeftRadius: 20, 
        borderBottomLeftRadius: 20, 
        resizeMode: 'cover', 
        backgroundColor: '#F0F5F0' 
    },
    rowRight: { 
        flex: 1, 
        paddingVertical: 16, 
        paddingHorizontal: 16, 
        justifyContent: 'center', 
    },
    rowTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#1a3317', 
        marginBottom: 4 
    },
    rowDescription: { 
        fontSize: 14, 
        color: '#666', 
        marginBottom: 12 
    },
    rowProgressBar: { 
        height: 8, 
        backgroundColor: '#E0EAE0', 
        borderRadius: 4, 
        marginBottom: 8, 
        overflow: 'hidden' 
    },
    rowProgressFill: { 
        height: '100%', 
        borderRadius: 4 
    },
    rowStats: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
    },
    rowProgressText: { 
        fontSize: 12, 
        color: '#777', 
        fontWeight: '600' 
    },
    rowStreakText: { 
        fontSize: 12, 
        color: '#ff4500', 
        fontWeight: 'bold' 
    },

    emptyState: { flex: 1, alignItems: 'center', marginTop: 80 },
    emptyText: { color: '#212121', fontSize: 16, fontWeight: '600', marginTop: 25 },
    emptySubText: { color: '#999', fontSize: 14, marginTop: 8, fontStyle: 'italic' }
});