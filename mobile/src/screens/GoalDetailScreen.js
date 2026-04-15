import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  SafeAreaView, 
  ActivityIndicator 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GoalDetailScreen = ({ route }) => {
  // Lấy ID và Tên mục tiêu từ HomeScreen truyền sang
  const { goalId, goalName } = route.params; 
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Hàm gọi API lấy danh sách nhật ký
  const fetchLogs = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // NHỚ THAY LẠI BẰNG ĐỊA CHỈ IP WIFI CỦA ÔNG
      const response = await axios.get(`http://192.168.0.106:3000/api/logs/${goalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Đổ dữ liệu thật vào biến state
      // (Tùy thuộc vào backend Day 19 ông viết trả về response.data hay response.data.data)
      setLogs(response.data.data || response.data); 
    } catch (error) {
      console.error("Lỗi Day 21 lấy Logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Chạy hàm lấy dữ liệu ngay khi vừa mở màn hình
  useEffect(() => {
    fetchLogs();
  }, [goalId]);

  // 3. Hàm vẽ từng cái "mầm tre" lên Timeline
  const renderLogItem = ({ item, index }) => {
    // Format lại ngày tháng cho đẹp (VD: 15/04/2026)
    const formattedDate = new Date(item.created_at).toLocaleDateString('vi-VN');

    return (
      <View style={styles.logContainer}>
        {/* Cột trái: Cột mốc thời gian */}
        <View style={styles.timelineLeft}>
          <View style={styles.dot} />
          {index !== logs.length - 1 && <View style={styles.verticalLine} />}
        </View>

        {/* Cột phải: Nội dung bài đăng */}
        <View style={styles.logContent}>
          <Text style={styles.logDate}>{formattedDate}</Text>
          <View style={styles.logCard}>
            
            {/* Hiển thị ảnh thật lấy từ link Cloudinary */}
            <Image source={{ uri: item.image_url }} style={styles.logImage} />
            
            {/* Chỗ này để sẵn cho tính năng AI Verified sau này mình làm */}
            {item.is_verified === 1 || item.is_verified === true ? (
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>✅ AI Verified</Text>
              </View>
            ) : null}

            <View style={styles.cardInfo}>
              <Text style={styles.logCaption}>{item.caption}</Text>
              {item.mood && <Text style={styles.logMood}>Cảm xúc: {item.mood}</Text>}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.goalTitle}>{goalName}</Text>
        <Text style={styles.subTitle}>Hành trình của mầm tre 🎍</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2d5a27" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={logs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.log_id ? item.log_id.toString() : Math.random().toString()} 
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Chưa có mầm tre nào được gieo. Hãy Check-in ngay hôm nay!
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

// CSS giữ nguyên bản sắc
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF8' },
  header: { padding: 20, paddingTop: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  goalTitle: { fontSize: 24, fontWeight: 'bold', color: '#2d5a27' },
  subTitle: { color: '#666', marginTop: 5 },
  listPadding: { padding: 20, paddingBottom: 50 },
  logContainer: { flexDirection: 'row', marginBottom: 0 },
  timelineLeft: { alignItems: 'center', width: 20, marginRight: 15 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2d5a27', zIndex: 1 },
  verticalLine: { width: 2, flex: 1, backgroundColor: '#2d5a27', opacity: 0.2 },
  logContent: { flex: 1, paddingBottom: 30 },
  logDate: { fontSize: 14, color: '#999', marginBottom: 8, fontWeight: '600' },
  logCard: { backgroundColor: '#fff', borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, overflow: 'hidden' },
  logImage: { width: '100%', height: 200, resizeMode: 'cover' },
  cardInfo: { padding: 12 },
  logCaption: { fontSize: 16, color: '#333', lineHeight: 22 },
  logMood: { fontSize: 12, color: '#2d5a27', marginTop: 8, fontStyle: 'italic' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontStyle: 'italic', paddingHorizontal: 20 },
  
  // Dành cho AI sau này
  aiBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#2d5a27' }
});

export default GoalDetailScreen;