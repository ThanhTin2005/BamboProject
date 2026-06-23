import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Modal, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../config';

export default function GroupTimelineTab({ route }) {
    const { groupId, role } = route.params; 
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); 
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [selectedLogId, setSelectedLogId] = useState(null);
    const [isReviewing, setIsReviewing] = useState(false);
    
    // ⚡ STATE LƯU ID CỦA NGƯỜI DÙNG ĐANG ĐĂNG NHẬP
    const [currentUserId, setCurrentUserId] = useState(null);

    const fetchTimeline = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            
            // ⚡ Lấy User ID từ AsyncStorage (Hồi Login ông có lưu cái object 'user')
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const userObj = JSON.parse(userStr);
                setCurrentUserId(userObj.id);
            }

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

    const handleReview = async (newStatus) => {
        setIsReviewing(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            await axios.put(`${BASE_URL}/groups/${groupId}/logs/${selectedLogId}/review`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setLogs(currentLogs => currentLogs.map(log => 
                log.log_id === selectedLogId ? { ...log, status: newStatus } : log
            ));
            setReviewModalVisible(false);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể duyệt bài lúc này!");
        } finally {
            setIsReviewing(false);
        }
    };

    // ⚡ HÀM XÓA LOG NHÓM BẬT LÊN KHI BẤM 3 CHẤM
    const handleLogOptions = (logId) => {
        Alert.alert(
            "Tùy chọn",
            "Xoá minh chứng. (Không thể hoàn tác)",
            [
                { text: "Hủy", style: "cancel" },
                { 
                    text: "Xoá", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('userToken');
                            await axios.delete(`${BASE_URL}/logs/${logId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            fetchTimeline(); // Xóa xong reload lại ngay
                            
                        } catch (error) {
                            Alert.alert("Lỗi", "Không thể thu hồi minh chứng.");
                        }
                    }
                }
            ],
            { cancelable: true }
        );
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

    const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.status === filter);

    const renderLogItem = ({ item }) => (
        <TouchableOpacity 
            activeOpacity={1} 
            onLongPress={() => {
                if (role === 'leader') {
                    setSelectedLogId(item.log_id);
                    setReviewModalVisible(true);
                }
            }}
        >
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Image source={{ uri: item.avatar_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={styles.avatar} />
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{item.username || 'Đồng đội'}</Text>
                        <Text style={styles.timeText}>{new Date(item.created_at).toLocaleString('vi-VN')}</Text>
                    </View>
                    
                    {renderStatusBadge(item.status)}

                    {/* ⚡ NÚT 3 CHẤM NẰM NGAY CẠNH TRẠNG THÁI (CHỈ HIỆN KHI LÀ BÀI CỦA MÌNH) */}
                    {String(item.user_id) === String(currentUserId) && currentUserId != null && (                        <TouchableOpacity 
                            style={{ padding: 5, marginLeft: 5 }} 
                            onPress={() => handleLogOptions(item.log_id)}
                        >
                            <Ionicons name="ellipsis-vertical" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
                
                <Image source={{ uri: item.image_url }} style={styles.logImage} />
                <View style={styles.cardBody}>
                    <Text style={styles.caption}><Text style={styles.mood}>{item.mood} </Text>{item.caption}</Text>
                </View>

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

            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateGroupLog', { groupId })}>
                <Text style={styles.fabText}> Nộp minh chứng</Text>
            </TouchableOpacity>

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
    filterContainer: { flexDirection: 'row', backgroundColor: '#EEEEEE', borderRadius: 10, padding: 4, marginHorizontal: 16, marginTop: 15, marginBottom: 5 },
    filterChip: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    filterChipActive: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    filterText: { fontSize: 13, color: '#888888', fontWeight: '600' },
    filterTextActive: { color: '#212121', fontWeight: 'bold' },
    listPadding: { paddingBottom: 100 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontStyle: 'italic' },
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
    cardFooter: { paddingHorizontal: 15 },
    interactionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
    actionBtnUI: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingVertical: 1, paddingHorizontal: 4, marginRight: 8 },
    actionEmoji: { fontSize: 16 },
    fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#4CAF50', flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, elevation: 5 },
    fabText: { color: '#FFF', fontWeight: 'bold' },
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