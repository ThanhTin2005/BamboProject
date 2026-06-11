import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, RefreshControl, ActivityIndicator,TouchableOpacity,Modal,TextInput,Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // hoặc fetch tùy dự án của ông
import { Animated, Easing } from 'react-native'; // Nhớ import cái này
import { BASE_URL } from '../config'; // Import BASE_URL từ config.js

// ⚡ COMPONENT NÚT ĐẤM TAY (Có Animation)
const FistBumpButton = ({ logId, initialHasBumped }) => {
  const [hasBumped, setHasBumped] = useState(initialHasBumped > 0);
  const scaleValue = useState(new Animated.Value(1))[0];
  const shakeValue = useState(new Animated.Value(0))[0];

  const handleBump = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      // 1. Gọi API
      const res = await axios.post(`${BASE_URL}/social/bump`, 
      //const res = await axios.post('http://172.31.2.204:3000/api/social/bump', 
        { logId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Nếu thành công -> Animation Phóng to thu nhỏ (Nảy)
      setHasBumped(res.data.action === 'added');
      Animated.sequence([
        Animated.timing(scaleValue, { toValue: 1.4, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleValue, { toValue: 1, duration: 150, useNativeDriver: true })
      ]).start();

    } catch (error) {
      console.log("Lỗi khi đấm tay:", error.response ? error.response.data : error.message);
      // 3. Nếu lỗi 400 (Hết 3 lượt) -> Animation Lắc ngang từ chối
      if (error.response && error.response.status === 400) {
        Animated.sequence([
          Animated.timing(shakeValue, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeValue, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeValue, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeValue, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
      }
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }, { translateX: shakeValue }] }}>
      <TouchableOpacity 
        onPress={handleBump} 
        activeOpacity={0.7} 
        style={[
          styles.actionBtnUI, // Style mặc định (trắng, viền xám)
          hasBumped && styles.actionBtnUIActive // Style khi đã bấm (nền xanh, viền xanh)
        ]}
      >
        <Text style={[styles.actionEmoji, { opacity: hasBumped ? 1 : 0.4 }]}>🤜</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SocialFeedScreen({navigation}) {
  const [feedData, setFeedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Comment Modal State
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [activeLogId, setActiveLogId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hàm gọi API lấy dữ liệu bảng tin
  const fetchFeed = async () => {
    try {
        // 2. Lấy token đã lưu từ lúc Đăng nhập thành công
        // (Ông check lại xem lúc Login ông lưu key tên là 'token' hay 'userToken' nhé)
        const token = await AsyncStorage.getItem('userToken');

        // 3. Đính kèm Token vào Header theo chuẩn Bearer
        const response = await axios.get(`${BASE_URL}/social/getFeed`, {
        //const response = await axios.get('http://172.31.2.204:3000/api/social/getFeed', {
        headers: {
            Authorization: `Bearer ${token}`
        }
        }); 

        setFeedData(response.data);
    } catch (error) {
        console.error("Lỗi tải bảng tin:", error);
        // Đoạn này chính là cái Toast đang hiển thị dưới màn hình của ông đây
        alert("Lỗi tải bảng tin: " + error); 
    } finally {
        setIsLoading(false);
        setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchFeed();
  };

  // HÀM GỌI API GỬI BÌNH LUẬN RIÊNG TƯ
  const handleSendComment = async () => {
    if (!commentText.trim()) {
      Alert.alert("Nhắc nhở", "Nhập vài chữ để cổ vũ đồng đội đã ông ơi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // Gọi đúng API vừa dựng ở Day 40
      await axios.post(`${BASE_URL}/social/comment`, {
      //await axios.post('http://172.31.2.204:3000/api/social/comment', {
        logId: activeLogId,
        message: commentText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert("Thành công", "Đã gửi lời động viên bí mật! 💌");
      setCommentText('');
      setIsCommentModalVisible(false);
    } catch (error) {
      console.log("Lỗi gửi lời nhắn:", error.response ? error.response.data : error.message);
      const errorMsg = error.response?.data?.error || "Không thể kết nối đến máy chủ.";
      Alert.alert("Thất bại", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm render từng chiếc Card Nhật ký
  const renderFeedItem = ({ item }) => (
    <View style={styles.card}>
      {/* 1. HEADER: Avatar + Tên + Thời gian */}
      <TouchableOpacity 
        style={styles.postHeader} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('FriendProfile', { friendId: item.user_id })} 
      >
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.creator_avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
        <View>
          <Text style={styles.creatorName}>{item.creator_name}</Text>
          <Text style={styles.timeText}>{new Date(item.log_created_at).toLocaleDateString()}</Text>
        </View>
      </View>
      </TouchableOpacity>

      {/* 2. BODY: Ảnh log + Caption */}
      {item.log_image && (
        <Image source={{ uri: item.log_image }} style={styles.logImage} resizeMode="cover" />
      )}
      <Text style={styles.captionText}>
        <Text style={styles.moodText}>{item.mood} </Text>
        {item.caption}
      </Text>

      {/* 3. FOOTER: Bọc Tag mục tiêu và Nút Đấm tay nằm ngang hàng */}
      {/* 3. FOOTER: Thẻ mục tiêu ở trên, Cụm tương tác dạt trái ở dưới */}
      <View style={styles.cardFooter}>
        
        {/* Hàng 1: Thẻ Mục tiêu */}
        <View style={[styles.goalTag, { backgroundColor: item.goal_color || '#e0e0e0' }]}>
          <Text style={styles.goalTagText}> {item.goal_title}</Text>
        </View>
        
        {/* Hàng 2: Cụm nút tương tác kiểu Facebook (Dạt trái) */}
        <View style={styles.interactionBar}>
          
          {/* Nút đấm tay */}
          <FistBumpButton logId={item.log_id} initialHasBumped={item.has_bumped} />
          
          {/* Nút bình luận */}
          <TouchableOpacity 
            style={styles.actionBtnUI} // Dùng chung style nền trắng viền xám
            activeOpacity={0.6}
            onPress={() => {
              setActiveLogId(item.log_id);
              setIsCommentModalVisible(true);
            }}
          >
            <Text style={[styles.actionEmoji, { opacity: 0.6 }]}>💬</Text>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={feedData}
        keyExtractor={(item) => item.log_id.toString()}
        renderItem={renderFeedItem}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Bảng tin trống .</Text>
          </View>
        }
      />
      <Modal
        visible={isCommentModalVisible}
        animationType="fade" // Hiệu ứng hiện mờ nhẹ nhàng thanh lịch
        transparent={true}
        onRequestClose={() => setIsCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gửi lời nhắn riêng tư 💌</Text>
            
            <TextInput
              style={styles.inputStyle}
              placeholder="Hôm nay cày cháy quá ông ơi! Cố lên... (Tối đa 150 ký tự)"
              placeholderTextColor="#A0A0A0"
              maxLength={150}
              multiline={true}
              value={commentText}
              onChangeText={setCommentText}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.cancelBtn]} 
                onPress={() => {
                  setIsCommentModalVisible(false);
                  setCommentText(''); // Xóa nội dung nháp khi hủy
                }}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionBtn, styles.submitBtn]} 
                onPress={handleSendComment}
                disabled={isSubmitting}
              >
                <Text style={styles.submitBtnText}>
                  {isSubmitting ? "Đang gửi..." : "Gửi đi"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' ,paddingTop: 40},
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#fff', marginBottom: 12, paddingVertical: 12, borderRadius: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  creatorName: { fontWeight: 'bold', fontSize: 15 },
  timeText: { fontSize: 12, color: '#777' },
  // ⚡ Đã sửa lỗi 'my' thành 'marginVertical'
  logImage: { width: '100%', height: 300, marginVertical: 8 }, 
  captionText: { paddingHorizontal: 12, fontSize: 14, marginVertical: 6 },
  moodText: { fontSize: 16 },
  // ⚡ Thêm cardFooter để căn chỉnh Nút đấm tay
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 10 },
  goalTag: { alignSelf: 'flex-start', marginLeft: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  goalTagText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  emptyText: { color: '#666', textAlign: 'center', fontSize: 15 },
  // Style căn chỉnh cụm nút đấm + bình luận nằm ngang hàng
  // --- CSS MỚI CHO CARD FOOTER & NÚT TƯƠNG TÁC ---
  cardFooter: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  goalTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12, // ⚡ Đẩy cách cụm nút bên dưới ra một chút
  },
  interactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // ⚡ Ép toàn bộ dạt sang trái
  },
  
  // Nút bấm mặc định (Chưa tương tác)
  actionBtnUI: {
    backgroundColor: '#FFFFFF', // Nền trắng tiệp màu thẻ
    borderWidth: 1,
    borderColor: '#E0E0E0',     // Viền xám nhạt
    borderRadius: 12,           // Bo tròn 2 đầu dạng viên thuốc (Pill)
    paddingVertical: 1,
    paddingHorizontal: 4,      // Độ rộng của nút
    marginRight: 8,            // Cách nhau ra một chút
  },
  // Nút bấm khi ĐÃ tương tác (Dành riêng cho Đấm tay)
  actionBtnUIActive: {
    backgroundColor: '#E8F5E9', // Nền xanh lá cực nhạt
    borderColor: '#4CAF50',     // Viền xanh lá đậm lên
  },
  actionEmoji: {
    fontSize: 16, // ⚡ Thu nhỏ size lại theo ý ông (trước đó là 24 và 22)
  },

  // Cấu trúc CSS cho khung Modal tinh tế
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // Làm tối mờ nền phía sau chuẩn điện ảnh
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6, // Hiệu ứng đổ bóng mượt trên Android
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
    color: '#222222',
  },
  inputStyle: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 10,
    padding: 14,
    height: 90,
    textAlignVertical: 'top', // Ép chữ bắt đầu từ đỉnh ô trên cả Android lẫn iOS
    fontSize: 14,
    color: '#333333',
    marginBottom: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F1F3F5',
    marginRight: 8,
  },
  submitBtn: {
    backgroundColor: '#4CAF50', // Sắc xanh lá kỷ luật đại diện của tre Bambo
    marginLeft: 8,
  },
  cancelBtnText: {
    color: '#495057',
    fontWeight: '600',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  }
});