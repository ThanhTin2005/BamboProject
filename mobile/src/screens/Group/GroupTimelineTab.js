import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../config';

export default function GroupTimelineTab({ route }) {
    const { groupId } = route.params; // Nhận từ GroupMainScreen truyền sang
    const navigation = useNavigation();
    const isFocused = useIsFocused(); // Tự động load lại trang khi quay lại từ màn chụp ảnh

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTimeline = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.get(`${BASE_URL}/groups/${groupId}/timeline`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(response.data.data);
        } catch (error) {
            console.error('Lỗi tải timeline:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) { fetchTimeline(); }
    }, [isFocused]);

    // Hàm render cái Tem trạng thái
    const renderStatusBadge = (status) => {
        switch(status) {
            case 'pending': return <View style={[styles.badge, { backgroundColor: '#FFF3E0' }]}><Text style={[styles.badgeText, { color: '#FF9800' }]}>⏳ Chờ duyệt</Text></View>;
            case 'verified': return <View style={[styles.badge, { backgroundColor: '#E8F5E9' }]}><Text style={[styles.badgeText, { color: '#4CAF50' }]}>✅ Đã duyệt</Text></View>;
            case 'rejected': return <View style={[styles.badge, { backgroundColor: '#FFEBEE' }]}><Text style={[styles.badgeText, { color: '#F44336' }]}>❌ Từ chối</Text></View>;
            case 'auto_approved': return <View style={[styles.badge, { backgroundColor: '#E3F2FD' }]}><Text style={[styles.badgeText, { color: '#2196F3' }]}>🤖 Auto-Duyệt</Text></View>;
            default: return null;
        }
    };

    const renderLogItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                {/* Lấy avatar user, nếu null thì để avatar mặc định */}
                <Image source={{ uri: item.avatar_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={styles.avatar} />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.username || 'Đồng đội'}</Text>
                    <Text style={styles.timeText}>{new Date(item.created_at).toLocaleString('vi-VN')}</Text>
                </View>
                {renderStatusBadge(item.status)}
            </View>
            
            <Image source={{ uri: item.image_url }} style={styles.logImage} />
            
            <View style={styles.cardBody}>
                <Text style={styles.caption}><Text style={{fontWeight: 'bold'}}>{item.username || 'Đồng đội'}</Text> {item.caption}</Text>
                {item.mood && <Text style={styles.mood}>Cảm xúc: {item.mood}</Text>}
            </View>
        </View>
    );

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;

    return (
        <View style={styles.container}>
            <FlatList
                data={logs}
                keyExtractor={(item) => item.log_id.toString()}
                renderItem={renderLogItem}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text style={styles.emptyText}>Chưa có minh chứng nào được nộp. Khởi động ngay thôi!</Text>}
            />

            {/* Nút FAB Nộp Bài trôi nổi góc dưới */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateGroupLog', { groupId })}>
                <Ionicons name="camera" size={24} color="#FFF" />
                <Text style={styles.fabText}> Nộp Minh Chứng</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listPadding: { padding: 15, paddingBottom: 100 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontStyle: 'italic' },
    
    card: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 20, overflow: 'hidden', elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: '#EEE' },
    userInfo: { flex: 1 },
    userName: { fontSize: 15, fontWeight: 'bold', color: '#212121' },
    timeText: { fontSize: 12, color: '#999', marginTop: 2 },
    
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 11, fontWeight: 'bold' },
    
    logImage: { width: '100%', height: 350, resizeMode: 'cover', backgroundColor: '#FAFAFA' },
    
    cardBody: { padding: 15 },
    caption: { fontSize: 14, color: '#333', lineHeight: 20 },
    mood: { fontSize: 12, color: '#4CAF50', fontStyle: 'italic', marginTop: 5 },

    fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#4CAF50', flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, elevation: 5 }
});