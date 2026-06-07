import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, RefreshControl, ActivityIndicator,TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // hoặc fetch tùy dự án của ông
import { Animated, Easing } from 'react-native'; // Nhớ import cái này

// ⚡ COMPONENT NÚT ĐẤM TAY (Có Animation)
const FistBumpButton = ({ logId, initialHasBumped }) => {
  const [hasBumped, setHasBumped] = useState(initialHasBumped > 0);
  const scaleValue = useState(new Animated.Value(1))[0];
  const shakeValue = useState(new Animated.Value(0))[0];

  const handleBump = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      // 1. Gọi API
      const res = await axios.post('http://Phams-MacBook-Air.local:3000/api/social/bump', 
      //const res = await axios.post('http://172.31.43.77:3000/api/social/bump', 
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
      <TouchableOpacity onPress={handleBump} activeOpacity={0.7} style={{ padding: 10 }}>
        <Text style={{ fontSize: 24, opacity: hasBumped ? 1 : 0.4 }}>🤜</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SocialFeedScreen({navigation}) {
  const [feedData, setFeedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hàm gọi API lấy dữ liệu bảng tin
  const fetchFeed = async () => {
    try {
        // 2. Lấy token đã lưu từ lúc Đăng nhập thành công
        // (Ông check lại xem lúc Login ông lưu key tên là 'token' hay 'userToken' nhé)
        const token = await AsyncStorage.getItem('userToken');

        // 3. Đính kèm Token vào Header theo chuẩn Bearer
        const response = await axios.get('http://Phams-MacBook-Air.local:3000/api/social/getFeed', {
        //const response = await axios.get('http://172.31.43.77:3000/api/social/getFeed', {
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

  // Hàm render từng chiếc Card Nhật ký
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
      <View style={styles.cardFooter}>
        <View style={[styles.goalTag, { backgroundColor: item.goal_color || '#e0e0e0' }]}>
          <Text style={styles.goalTagText}> {item.goal_title}</Text>
        </View>
        
        <FistBumpButton logId={item.log_id} initialHasBumped={item.has_bumped} />
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
            <Text style={styles.emptyText}>Bảng tin trống rồi. Rủ bạn bè vào cày chung thôi! 🎍</Text>
          </View>
        }
      />
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
  emptyText: { color: '#666', textAlign: 'center', fontSize: 15 }
});