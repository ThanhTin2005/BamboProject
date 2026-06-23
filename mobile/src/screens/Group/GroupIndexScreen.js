import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, StatusBar, Image, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { Ionicons } from '@expo/vector-icons';

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

    // ⚡ HÀM TÙY CHỌN: Tối giản, đi thẳng vào vấn đề
    const handleOpenGroupOptions = () => {
        Alert.alert(
            "Tùy chọn nhóm", // Tiêu đề ngắn gọn
            "", // Bỏ trống phần mô tả
            [
                { text: "Hủy", style: "cancel" },
                { text: "Nhập mã tham gia", onPress: () => navigation.navigate('JoinGroup') },
                { text: "Tạo nhóm", onPress: () => navigation.navigate('CreateGroup') }
            ],
            { cancelable: true }
        );
    };

    const renderGroupItem = ({ item }) => (
        <TouchableOpacity 
          style={styles.goalRow} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('GroupMain', { 
            groupId: item.group_id, 
            group: item 
          })}
        >
          <Image 
            source={{ uri: item.group_image || 'https://ui-avatars.com/api/?name=Bambo+Group&background=4CAF50&color=fff&size=256' }} 
            style={styles.rowImage} 
          />
    
          <View style={styles.rowRight}>
            <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.rowDescription} numberOfLines={2}>
              {item.description || 'Chưa có mô tả cho nhóm này...'}
            </Text>
          </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Đang tải danh sách nhóm...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.listSection}>
                {/* ⚡ TIÊU ĐỀ: Đã đổi tên và sẽ được đẩy xuống tự động nhờ CSS listSection */}
                <Text style={styles.sectionTitle}>Các nhóm của ông</Text>
                
                {myGroups.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={80} color="#E0E0E0" />
                        <Text style={styles.emptyText}>Ông chưa tham gia nhóm nào cả.</Text>
                        <Text style={styles.emptySubText}>Hãy tạo hoặc tham gia nhóm ngay nhé!</Text>
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

            <TouchableOpacity style={styles.fabAdd} onPress={handleOpenGroupOptions}>
                <Text style={styles.fabAddText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7F4', paddingHorizontal: 20 }, 
    centerContent: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#999', marginTop: 15, fontSize: 14, fontStyle: 'italic' },

    // ⚡ CẬP NHẬT: Cộng thêm 30px vào paddingTop để toàn bộ cụm danh sách tụt xuống thấp cho cân đối
    listSection: { flex: 1, paddingTop: (StatusBar.currentHeight || 40) + 30 }, 
    sectionTitle: { color: '#2d5a27', fontSize: 20, fontWeight: 'bold', marginBottom: 20 }, 
    listContent: { paddingBottom: 100 },
    
    goalRow: { 
        flexDirection: 'row', 
        backgroundColor: '#fff', 
        marginHorizontal: 0, 
        marginBottom: 16, 
        borderRadius: 20, 
        overflow: 'hidden', 
        elevation: 3, 
        shadowColor: '#000', 
        shadowOpacity: 0.06, 
        shadowRadius: 8, 
        alignItems: 'stretch', 
        minHeight: 120 
    },
    rowImage: { 
        width: 120, 
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
        marginBottom: 8 
    },
    rowDescription: { 
        fontSize: 14, 
        color: '#666', 
        lineHeight: 22 
    },

    emptyState: { flex: 1, alignItems: 'center', marginTop: 80 },
    emptyText: { color: '#212121', fontSize: 16, fontWeight: '600', marginTop: 25 },
    emptySubText: { color: '#999', fontSize: 14, marginTop: 8, fontStyle: 'italic' },

    fabAdd: { 
        position: 'absolute', 
        bottom: 30, 
        right: 20, 
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        backgroundColor: '#F4F7F4', 
        justifyContent: 'center', 
        alignItems: 'center', 
        elevation: 6, 
        shadowColor: '#000', 
        shadowOpacity: 0.15, 
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        borderWidth: 1, 
        borderColor: '#E0EAE0' 
    },
    fabAddText: { 
        fontSize: 34, 
        color: '#4CAF50', 
        fontWeight: '300', 
        marginTop: -4 
    }
});