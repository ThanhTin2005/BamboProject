import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Modal, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../config';

export default function GroupTimelineTab({ route }) {
    // ⚡ Lấy role từ GroupMainScreen truyền sang để biết có phải Leader không
    const { groupId, role } = route.params; 
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State cho Thanh Lọc
    const [filter, setFilter] = useState('all'); // 'all', 'pending', 'verified', 'rejected'

    // State cho Modal Duyệt Bài của Leader
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [selectedLogId, setSelectedLogId] = useState(null);
    const [isReviewing, setIsReviewing] = useState(false);

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
        if (isFocused) fetchTimeline();
    }, [isFocused]);

    // ⚡ HÀM DUYỆT BÀI CHO LEADER
    const handleReview = async (newStatus) => {
        setIsReviewing(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.put(`${BASE_URL}/groups/${groupId}/logs/${selectedLogId}/review`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Cập nhật lại UI ngay lập tức (Không xóa bài, chỉ đổi trạng thái)
            setLogs(currentLogs => currentLogs.map(log => 
                log.log_id === selectedLogId ? { ...log, status: newStatus } : log
            ));
            
            setReviewModalVisible(false);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể duyệt bài lúc này!");
            console.error(error);
        } finally {
            setIsReviewing(false);
        }
    };

    const renderStatusBadge = (status) => {
        switch(status) {
            case 'pending': return <View style={[styles.badge, { backgroundColor: '#FFF3E0' }]}><Text style={[styles.badgeText, { color: '#FF9800' }]}>⏳ Chờ duyệt</Text></View>;
            case 'verified': return <View style={[styles.badge, { backgroundColor: '#E8F5E9' }]}><Text style={[styles.badgeText, { color: '#4CAF50' }]}>✅ Đã duyệt</Text></View>;
            case 'rejected': return <View style={[styles.badge, { backgroundColor: '#FFEBEE' }]}><Text style={[styles.badgeText, { color: '#F44336' }]}>❌ Yêu cầu làm lại</Text></View>;
            case 'auto_approved': return <View style={[styles.badge, { backgroundColor: '#E3F2FD' }]}><Text style={[styles.badgeText, { color: '#2196F3' }]}>🤖 Auto-Duyệt</Text></View>;
            default: return null;
        }
    };

    // ⚡ LOGIC LỌC BÀI VIẾT
    const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.status === filter);

    const renderLogItem = ({ item }) => (
        <TouchableOpacity 
            activeOpacity={1} // Tắt hiệu ứng mờ khi bấm nhẹ để nhường chỗ cho Nút bên dưới
            onLongPress={() => {
                // Chỉ Leader mới được bật bảng Duyệt khi nhấn giữ
                if (role === 'leader') {
                    setSelectedLogId(item.log_id);
                    setReviewModalVisible(true);
                }
            }}
        >
            <View style={styles.card}>
                {/* HEADER */}
                <View style={styles.cardHeader}>
                    <Image source={{ uri: item.avatar_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={styles.avatar} />
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{item.username || 'Đồng đội'}</Text>
                        <Text style={styles.timeText}>{new Date(item.created_at).toLocaleString('vi-VN')}</Text>
                    </View>
                    {renderStatusBadge(item.status)}
                </View>
                
                {/* BODY (ẢNH + CAPTION) */}
                <Image source={{ uri: item.image_url }} style={styles.logImage} />
                <View style={styles.cardBody}>
                    <Text style={styles.caption}><Text style={styles.mood}>{item.mood} </Text>{item.caption}</Text>
                </View>

                {/* FOOTER (NÚT TƯƠNG TÁC Y HỆT BẢNG TIN CÁ NHÂN) */}
                <View style={styles.cardFooter}>
                    <View style={styles.interactionBar}>
                        <TouchableOpacity style={styles.actionBtnUI} activeOpacity={0.6}>
                            <Text style={styles.actionEmoji}>🤜</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtnUI} activeOpacity={0.6}>
                            <Text style={[styles.actionEmoji, { opacity: 0.6 }]}>💬</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;

    return (
        <View style={styles.container}>
            {/* ⚡ THANH LỌC (FILTER BAR) */}
            <View style={styles.filterContainer}>
                <TouchableOpacity onPress={() => setFilter('all')} style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}>
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Tất cả</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilter('pending')} style={[styles.filterChip, filter === 'pending' && styles.filterChipActive]}>
                    <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>⏳ Chờ</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilter('verified')} style={[styles.filterChip, filter === 'verified' && styles.filterChipActive]}>
                    <Text style={[styles.filterText, filter === 'verified' && styles.filterTextActive]}>✅ Xong</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilter('rejected')} style={[styles.filterChip, filter === 'rejected' && styles.filterChipActive]}>
                    <Text style={[styles.filterText, filter === 'rejected' && styles.filterTextActive]}>❌ Lỗi</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredLogs}
                keyExtractor={(item) => item.log_id.toString()}
                renderItem={renderLogItem}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text style={styles.emptyText}>Không có minh chứng nào ở mục này.</Text>}
            />

            {/* NÚT FAB NỘP BÀI */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateGroupLog', { groupId })}>
                
                <Text style={styles.fabText}> Nộp minh chứng</Text>
            </TouchableOpacity>

            {/* ⚡ MODAL QUYỀN LỰC CỦA LEADER */}
            <Modal visible={reviewModalVisible} transparent={true} animationType="fade" onRequestClose={() => setReviewModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>👑 Đặc quyền Trưởng Nhóm</Text>
                        <Text style={styles.modalDesc}>Kiểm tra kỹ minh chứng này trước khi đưa ra quyết định nhé.</Text>
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.reviewBtn, { backgroundColor: '#F44336' }]} onPress={() => handleReview('rejected')} disabled={isReviewing}>
                                <Text style={styles.reviewBtnText}>❌ Từ chối</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.reviewBtn, { backgroundColor: '#4CAF50' }]} onPress={() => handleReview('verified')} disabled={isReviewing}>
                                <Text style={styles.reviewBtnText}>✅ Duyệt hợp lệ</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setReviewModalVisible(false)}>
                            <Text style={styles.cancelModalText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    // --- CSS THANH LỌC ---
    // --- CSS THANH LỌC (STYLE HIỆN ĐẠI - SEGMENTED CONTROL) ---
    filterContainer: { 
        flexDirection: 'row', 
        backgroundColor: '#EEEEEE', // Nền xám nhạt ôm toàn bộ nút
        borderRadius: 10,           // Bo góc nhẹ vuông vắn
        padding: 4,                 // Khoảng không cho nút bên trong "thở"
        marginHorizontal: 16, 
        marginTop: 15, 
        marginBottom: 5,
    },
    filterChip: { 
        flex: 1,                    // Chia đều tăm tắp 4 nút
        paddingVertical: 8, 
        borderRadius: 8,            // Nút bên trong cũng vuông vắn
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterChipActive: { 
        backgroundColor: '#FFFFFF', // Nút đang chọn sẽ nổi màu trắng
        elevation: 2,               // Đổ bóng cho Android
        shadowColor: '#000',        // Đổ bóng cho iOS
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 2 
    },
    filterText: { 
        fontSize: 13, 
        color: '#888888',           // Chữ nút thường màu xám
        fontWeight: '600' 
    },
    filterTextActive: { 
        color: '#212121',           // Chữ nút chọn màu đen tuyền mạnh mẽ
        fontWeight: 'bold' 
    },

    listPadding: { paddingBottom: 100 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontStyle: 'italic' },
    
    // --- CSS CARD (Floating Card Giống SocialFeed) ---
    card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 15, marginBottom: 5, paddingVertical: 15, borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 5 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: '#EEE' },
    userInfo: { flex: 1 },
    userName: { fontSize: 15, fontWeight: 'bold', color: '#212121' },
    timeText: { fontSize: 12, color: '#999', marginTop: 2 },
    
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 11, fontWeight: 'bold' },
    
    logImage: { width: '100%', height: 300, marginVertical: 10, backgroundColor: '#FAFAFA' },
    cardBody: { paddingHorizontal: 15, marginBottom: 10 },
    caption: { fontSize: 14, color: '#333', lineHeight: 20 },
    mood: { fontSize: 14, fontWeight: 'bold' },

    // --- CSS TƯƠNG TÁC DƯỚI ĐÁY ---
    cardFooter: { paddingHorizontal: 15 },
    interactionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
    actionBtnUI: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingVertical: 1, paddingHorizontal: 4, marginRight: 8 },
    actionEmoji: { fontSize: 16 },

    fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#4CAF50', flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, elevation: 5 },
    fabText: { color: '#FFF', fontWeight: 'bold' },

    // --- CSS MODAL ---
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 16, padding: 24, elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#212121' },
    modalDesc: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    reviewBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
    reviewBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
    cancelModalBtn: { marginTop: 15, paddingVertical: 10, alignItems: 'center' },
    cancelModalText: { color: '#999', fontWeight: 'bold', fontSize: 15 }
});