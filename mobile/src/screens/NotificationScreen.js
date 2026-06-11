import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config'; // Import BASE_URL từ config.js

export default function NotificationScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      // Đổi IP theo máy của ông nhé
      const response = await axios.get(`${BASE_URL}/social/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.log('Lỗi fetch notif:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  const handlePressNotification = async (notif) => {
    // 1. Đánh dấu đã đọc trên UI ngay lập tức cho mượt
    setNotifications(prev => prev.map(n => n.notif_id === notif.notif_id ? { ...n, is_read: 1 } : n));

    // 2. Gọi API ngầm để lưu vào Database
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.put(`${BASE_URL}/social/notifications/${notif.notif_id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.log('Lỗi update read status', error);
    }

    // 3. Chuyển hướng đến bài Log (Nếu ông có màn hình LogDetail, bật dòng dưới lên)
    navigation.navigate('LogDetail', { logId: notif.reference_id });
  };

  const renderNotification = ({ item }) => {
    const isUnread = item.is_read === 0;
    
    // Tùy biến text theo action
    let actionText = '';
    let icon = '';
    if (item.action_type === 'BUMP') {
      actionText = `đã đấm tay 🤜 cổ vũ mục tiêu`;
      icon = '🔥';
    } else if (item.action_type === 'COMMENT') {
      actionText = `đã để lại một lời nhắn 💬 ở mục tiêu`;
      icon = '💌';
    }

    return (
      <TouchableOpacity 
        style={[styles.notifCard, isUnread && styles.notifCardUnread]}
        onPress={() => handlePressNotification(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {item.actor_avatar ? (
            <Image source={{ uri: item.actor_avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}><Text>{icon}</Text></View>
          )}
          {isUnread && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.mainText}>
            <Text style={styles.boldText}>{item.actor_name} </Text>
            {actionText} <Text style={styles.boldText}>{item.goal_title}</Text>
          </Text>
          
          {/* Hiện đoạn trích comment nếu có */}
          {item.action_type === 'COMMENT' && item.comment_snippet && (
            <Text style={styles.commentSnippet}>"{item.comment_snippet}"</Text>
          )}
          
          <Text style={styles.timeText}>{new Date(item.created_at).toLocaleString('vi-VN')}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) return <View style={styles.center}><Text>Đang tải thông báo...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Thông báo 🔔</Text>
      
      {notifications.length === 0 ? (
        <View style={styles.center}><Text style={styles.emptyText}>Chưa có thông báo nào cả!</Text></View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.notif_id.toString()}
          renderItem={renderNotification}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

// --- CSS CHUẨN DESIGN SYSTEM ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', padding: 20, paddingTop: 50, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 16 },
  listContainer: { paddingBottom: 20 },
  
  notifCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notifCardUnread: {
    backgroundColor: '#F0FDF4', // Màu xanh nền nhạt báo hiệu chưa đọc
  },
  avatarContainer: {
    marginRight: 14,
    position: 'relative',
  },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#E0E0E0' },
  avatarPlaceholder: { 
    width: 46, height: 46, borderRadius: 23, 
    backgroundColor: '#F1F3F5', justifyContent: 'center', alignItems: 'center' 
  },
  unreadDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#4CAF50', // Chấm xanh
    position: 'absolute', top: -2, right: -2,
    borderWidth: 2, borderColor: '#FFF',
  },
  contentContainer: { flex: 1, justifyContent: 'center' },
  mainText: { fontSize: 15, color: '#333', lineHeight: 22 },
  boldText: { fontWeight: 'bold', color: '#111' },
  commentSnippet: { 
    fontSize: 14, fontStyle: 'italic', color: '#555', 
    marginTop: 6, backgroundColor: '#F8F9FA', padding: 8, borderRadius: 6
  },
  timeText: { fontSize: 12, color: '#999', marginTop: 6 },
});