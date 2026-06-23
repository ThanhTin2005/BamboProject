import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  ActivityIndicator,
  TouchableOpacity 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomContainer from '../components/customContainer';
import { BASE_URL } from '../config'; // Import BASE_URL từ config.js

const GoalTimelineScreen = ({ route, navigation }) => {
  // Lấy ID và Tên mục tiêu từ HomeScreen truyền sang
  const { goalId, goalName, isFriendView } = route.params || {}; 
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Hàm gọi API lấy danh sách nhật ký
  const fetchLogs = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await axios.get(`${BASE_URL}/logs/${goalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Đổ dữ liệu thật vào biến state
      setLogs(response.data.data || response.data); 
    } catch (error) {
      console.error("Lỗi Day 21 lấy Logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      // 1. Gọi lần đầu khi mở trang
      fetchLogs();

      // 2. Lắng nghe sự kiện 'focus' - mỗi khi quay lại màn hình này là tự load lại
      const unsubscribe = navigation.addListener('focus', () => {
        fetchLogs(); 
      });

      return unsubscribe; // Dọn dẹp thám tử khi không dùng nữa
  }, [navigation, goalId]); 

  // 3. Hàm vẽ từng cái "mầm tre" lên Timeline
  const renderLogItem = ({ item, index }) => {
    // Format lại ngày tháng cho đẹp (VD: 15/04/2026)
    const formattedDate = new Date(item.created_at).toLocaleDateString('vi-VN');

    return (
      <CustomContainer>
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
            {/* ⚡ CỤM AVATAR ĐỒNG ĐỘI KHÔNG SỐ */}
            {item.reactor_avatars && (
              <View style={styles.bumpClusterContainer}>
                {/* Cắt chuỗi trả về từ Backend thành mảng, lấy tối đa 4 người */}
                {item.reactor_avatars.split(',').slice(0, 4).map((avatarUrl, index) => {
                  // Nếu là người thứ 4, không hiện ảnh mà hiện dấu ...
                  if (index === 3) {
                    return (
                      <View key="more" style={[styles.avatarCircle, styles.moreCircle, { zIndex: 4 - index }]}>
                        <Text style={styles.moreText}>...</Text>
                      </View>
                    );
                  }
                  return (
                    <Image 
                      key={index} 
                      source={{ uri: avatarUrl }} 
                      style={[styles.avatarCircle, { zIndex: 4 - index }]} 
                    />
                  );
                })}
                <Text style={styles.bumpIconTiny}>🤜</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      </CustomContainer>
    );
  };

  return (
    <CustomContainer>
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

      {/* ⚡ NÚT CHECK-IN "MẦM SỐNG" SÁNG TẠO ⚡ */}
      {!isFriendView && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.creativeFabWrapper}
          onPress={() => navigation.navigate('CreateLog', { goalId: goalId })}
        >
          <View style={styles.creativeFabMain}>
            {/* Vẽ dấu + bằng CSS cho sắc nét */}
            <View style={styles.fabIconVertical} />
            <View style={styles.fabIconHorizontal} />
          </View>
        </TouchableOpacity>
      )}
    </CustomContainer>
  );
};

// CSS 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF8' },
  header: { padding: 20, paddingTop: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  goalTitle: { fontSize: 24, fontWeight: 'bold', color: '#2d5a27' },
  subTitle: { color: '#666', marginTop: 5 },
  listPadding: { padding: 20, paddingBottom: 100 }, // Tăng padding bottom để không bị nút đè lên bài cuối cùng
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
  
  // ⚡ CSS NÚT CHECK-IN MỚI SÁNG TẠO ⚡
  creativeFabWrapper: {
    position: 'absolute',
    bottom: 35,
    alignSelf: 'center',
    // ❌ Tuyệt đối không để shadow ở đây để tránh lỗi bóng hình vuông
  },
  creativeFabMain: {
    width: 72,
    height: 72,
    borderRadius: 36,           // Bo tròn tuyệt đối
    backgroundColor: '#2d5a27', // Xanh lá chủ đạo
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E8F5E9',     // Viền xanh lá cực nhạt tạo điểm nhấn
    
    // ✅ Bỏ shadow vào đúng cái hình tròn này
    elevation: 12,              // Cho Android
    shadowColor: '#2d5a27',     // Đổ bóng MÀU XANH LÁ tạo hiệu ứng phát sáng (Glow)
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  fabIconVertical: {
    position: 'absolute',
    width: 4,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  fabIconHorizontal: {
    position: 'absolute',
    width: 30,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  
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
  bumpClusterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 
    marginTop: 15,          
    borderTopWidth: 1,      
    borderColor: '#E0E0E0', 
    paddingTop: 12,         
    paddingBottom: 12,      
  },
  avatarCircle: {
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    borderWidth: 2,
    borderColor: '#FFF', 
    marginLeft: -12, 
    backgroundColor: '#E0E0E0',
  },
  moreCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  moreText: {
    fontSize: 12, 
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 4, 
  },
  bumpIconTiny: {
    fontSize: 20, 
    marginLeft: -6, 
    opacity: 0.9,
  }
});

export default GoalTimelineScreen;