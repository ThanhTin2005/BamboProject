import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  SafeAreaView, 
  ActivityIndicator,
  TouchableOpacity 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomContainer from '../components/customContainer';

const GoalTimelineScreen = ({ route,navigation }) => {
  // Lấy ID và Tên mục tiêu từ HomeScreen truyền sang
  const { goalId, goalName , isFriendView } = route.params || {}; // Thêm isFriendView để biết có phải đang xem timeline của bạn bè hay không
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Hàm gọi API lấy danh sách nhật ký
  const fetchLogs = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // NHỚ THAY LẠI BẰNG ĐỊA CHỈ IP WIFI CỦA ÔNG
      const response = await axios.get(`http://Phams-MacBook-Air.local:3000/api/logs/${goalId}`, {
      //const response = await axios.get(`http://172.31.43.77:3000/api/logs/${goalId}`, {
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
  // useEffect(() => {
  //   fetchLogs();
  // }, [goalId]);
  useEffect(() => {
      // 1. Gọi lần đầu khi mở trang
      fetchLogs();

      // 2. Lắng nghe sự kiện 'focus' - mỗi khi quay lại màn hình này là tự load lại
      const unsubscribe = navigation.addListener('focus', () => {//navigation.addListener('focus', callback) sẽ thiết lập một "thám tử" để lắng nghe sự kiện 'focus' trên
        fetchLogs(); 
      });

      return unsubscribe;// Dọn dẹp thám tử khi không dùng nữa
  }, [navigation, goalId]); // Thêm navigation và goalId vào mảng phụ thuộc

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
      {!isFriendView && (
        <TouchableOpacity
          style={styles.fabCheckIn}
          onPress={() => navigation.navigate('CreateLog', { goalId: goalId })}
        >
          <Text style={styles.fabText}>✍️ Check-in Hôm nay</Text>
        </TouchableOpacity>
      )}
    </CustomContainer>
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
  fabCheckIn: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    left: 20, // Kéo dài ra 2 bên
    backgroundColor: '#2d5a27',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    marginTop: 15,          // Đẩy cách phần nội dung nhật ký ở trên xuống 15px
    borderTopWidth: 1,      // ⚡ Đường kẻ mờ đây rồi
    borderColor: '#E0E0E0', // ⚡ Đổi sang màu này đậm hơn #F0F0F0 một tí cho dễ nhìn
    
    // ⚡ VIẾT TƯỜNG MINH ĐỂ TRỊ LỖI MẤT VIỀN:
    paddingTop: 12,         // Khoảng cách từ đường kẻ đẩy xuống Avatar
    paddingBottom: 12,      // Khoảng cách từ Avatar đẩy xuống mép đáy Card
  },
  avatarCircle: {
    width: 36, // ⚡ TĂNG MẠNH (từ 26 lên 36)
    height: 36, // ⚡ TĂNG MẠNH (từ 26 lên 36)
    borderRadius: 18, // ⚡ (36 / 2)
    borderWidth: 2,
    borderColor: '#FFF', // ⚡ Viền trắng dầy lên nhìn nó mới tách bạch
    marginLeft: -12, // ⚡ Tăng độ xếp chồng âm (từ -8 lên -12) cho nó khít
    backgroundColor: '#E0E0E0',
  },
  moreCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  moreText: {
    fontSize: 12, // ⚡ TĂNG (từ 10 lên 12) cho dễ đọc
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 4, // ⚡ Căn chỉnh lại cho chữ "..." nằm giữa vòng tròn
  },
  bumpIconTiny: {
    fontSize: 20, // ⚡ TĂNG MẠNH (từ 16 lên 20) cho nó hoành tráng
    marginLeft: -6, // ⚡ Tăng khoảng cách so với avatar (từ 8 lên 12)
    opacity: 0.9,
  }
});

export default GoalTimelineScreen;