import React, { useState, useEffect } from 'react';
import { ImageBackground, View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomContainer from '../components/customContainer'; 

// ⚡ BỔ SUNG: Nhận thêm 'route' để check xem có friendId truyền sang không
const HomeScreen = ({ route, navigation }) => {
  
  // ⚡ LOGIC KIỂM TRA: Đang xem của mình hay của bạn?
  const friendId = route?.params?.friendId;
  const isFriendView = !!friendId; // Nếu có friendId => true (Chế độ xem bạn bè)

  const [userProfile, setUserProfile] = useState({
    name: isFriendView ? 'Đang tải...' : 'Người dùng Bambo',
    avatar_url: null,
    cover_url: null,
    slogan: 'Học tập là hành trình',
  });

  const [goals, setGoals] = useState([]);

  // --- API LẤY DỮ LIỆU ---
  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      //const response = await axios.get('http://Phams-MacBook-Air.local:3000/api/users/profile', {
      const response = await axios.get('http://172.31.2.204:3000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setUserProfile({
          name: response.data.name || 'Người dùng Bambo',
          slogan: response.data.slogan || 'Học tập là hành trình',
          avatar_url: response.data.avatar_url || null,
          cover_url: response.data.cover_url || null,
        });
      }
    } catch (error) {
      console.error('Lỗi khi fetch user profile:', error.message);
    }
  };

  const fetchGoals = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      //const response = await axios.get('http://Phams-MacBook-Air.local:3000/api/goals', {
      const response = await axios.get('http://172.31.2.204:3000/api/goals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) setGoals(response.data);
    } catch (error) {
      console.error('Lỗi khi fetch goals:', error.message);
    }
  };

  // ⚡ API MỚI: Dành riêng để bốc dữ liệu của bạn bè
  const fetchFriendData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      //const response = await axios.get(`http://Phams-MacBook-Air.local:3000/api/social/friend-profile/${friendId}`, {
      const response = await axios.get(`http://172.31.2.204:3000/api/social/friend-profile/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        // Map dữ liệu bạn bè vào state userProfile
        setUserProfile({
          name: response.data.profile.username, 
          slogan: 'Thành viên Bambo 🎍', // Có thể cập nhật lấy slogan từ DB nếu ông có
          avatar_url: response.data.profile.avatar_url,
          cover_url: response.data.profile.cover_url || null,
        });
        setGoals(response.data.goals);
      }
    } catch (error) {
      console.error('Lỗi tải data bạn bè:', error.message);
    }
  };

  // --- USE EFFECT ĐIỀU HƯỚNG CALL API ---
  useEffect(() => {
    if (isFriendView) {
      fetchFriendData(); // Nếu là bạn thì gọi API bạn
    } else {
      fetchUserProfile(); // Nếu là mình thì gọi API mình
      fetchGoals();
    }

    const unsubscribe = navigation.addListener('focus', () => {
      if (isFriendView) {
        fetchFriendData();
      } else {
        fetchUserProfile();
        fetchGoals();
      }
    });
    return unsubscribe;
  }, [navigation, isFriendView]); // Thêm isFriendView vào dependency

  // --- XỬ LÝ ẢNH (Khóa lại nếu là bạn bè) ---
  const pickImage = async (uploadType) => {
    if (isFriendView) return; // Bảo mật: Không cho chạy hàm nếu là bạn bè

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: uploadType === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.6,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : `image/jpeg`; 

      const formData = new FormData();
      formData.append('image', { 
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''), 
        name: `${uploadType}_${Date.now()}.jpg`, 
        type: mimeType 
      });
      formData.append('type', uploadType);

      try {
        const token = await AsyncStorage.getItem('userToken');
        //const response = await axios.post('http://Phams-MacBook-Air.local:3000/api/users/upload-image', formData, {
        const response = await axios.post('http://172.31.2.204:3000/api/users/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
        });

        const responseData = response.data;
        if (responseData.success || response.status === 200) {
          const newImgUrl = responseData.imageUrl || responseData.url;
          if (newImgUrl) {
            setUserProfile(prev => ({
              ...prev,
              [uploadType === 'avatar' ? 'avatar_url' : 'cover_url']: newImgUrl
            }));
            alert('Cập nhật ảnh thành công! 🎉');
          }
        }
      } catch (error) {
        alert('Đã có lỗi xảy ra khi tải ảnh lên server.');
      }
    }
  };

  // --- RENDER GIAO DIỆN CHÍNH ---
  const renderHeader = () => {
    const defaultCover = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000';
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=39FF14&color=1a3317&size=150&bold=true`;

    return (
      <View style={styles.headerContainer}>
        <View style={styles.coverWrapper}>
          <ImageBackground 
            source={{ uri: userProfile.cover_url || defaultCover }} 
            style={styles.coverImage}
            imageStyle={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
          >
            <View style={styles.coverOverlay}>
              {/* ⚡ ĐIỀU KIỆN 1: Ẩn nút thay ảnh bìa và Sửa info nếu là bạn bè */}
              {!isFriendView && (
                <>
                  <TouchableOpacity style={styles.btnEditCover} onPress={() => pickImage('cover')}>
                    <Text style={styles.btnEditCoverText}>📷</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.btnEditInfo}
                    onPress={() => navigation.navigate('EditProfile', { 
                      currentName: userProfile.name, 
                      currentSlogan: userProfile.slogan 
                    })}
                  >
                    <Text style={styles.btnEditInfoText}>⚙️</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ImageBackground>
        </View>

        <View style={styles.profileInfoSection}>
          <View style={styles.avatarWrapper}>
            {/* ⚡ ĐIỀU KIỆN 2: Tắt tính năng bấm vào Avatar nếu là bạn bè */}
            <TouchableOpacity 
              style={styles.avatarContainer} 
              onPress={() => pickImage('avatar')}
              disabled={isFriendView} // Disable luôn nút bấm
            >
              <Image source={{ uri: userProfile.avatar_url || defaultAvatar }} style={styles.avatar} />
              
              {/* ⚡ ĐIỀU KIỆN 3: Ẩn icon camera mini */}
              {!isFriendView && (
                <View style={styles.cameraBadgeMini}>
                  <Text style={{ fontSize: 10, color: '#fff' }}>📷</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.userTextSection}>
            <Text style={styles.userNameText}>{userProfile.name}</Text>
            <Text style={styles.sloganText}>{userProfile.slogan}</Text>
          </View>
        </View>

        {/* ⚡ ĐIỀU KIỆN 4: Thay đổi tiêu đề danh sách */}
        <Text style={styles.sectionTitle}>
          {isFriendView ? 'Mục tiêu đang cày' : 'Mục tiêu của tôi'}
        </Text>
      </View>
    );
  };
//renderGoalCard dùng để hiển thị từng mục tiêu trong FlatList, khi bấm vào sẽ dẫn đến GoalDetail. Nếu đang xem của bạn bè thì sẽ truyền thêm biến isFriendView để khóa tính năng viết log lại.
  const renderGoalCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.goalRow} 
      activeOpacity={0.8}
      // ⚡ QUAN TRỌNG: Truyền isFriendView sang màn hình GoalDetail để chặn viết log
      onPress={() => {
        if (isFriendView) {
          // 1. Nếu là BẠN BÈ: Bỏ qua cụm Tab GoalDetail, bay THẲNG vào màn hình đơn GoalTimeline
          navigation.navigate('GoalTimeline', { 
            goalId: item.goal_id, 
            goalTitle: item.title,
            isFriendView: true // Truyền sang để ẩn nút Check-in như anh em mình làm lúc nãy
          });
        } else {
          // 2. Nếu là CHÍNH MÌNH: Vào cụm Tab GoalDetail (Overview + Timeline) như bình thường
          navigation.navigate('GoalDetail', { 
            goalId: item.goal_id, 
            goalName: item.title 
          });
        }
      }}
    >
      {item.cover_image_url && item.cover_image_url.startsWith('http') ? (
        <Image source={{ uri: item.cover_image_url }} style={styles.rowImage} />
      ) : (
        <View style={[styles.rowIconContainer, { backgroundColor: item.color || '#F0F5F0' }]}>
          <Text style={styles.rowIcon}>{item.icon || '🎍'}</Text>
        </View>
      )}

      <View style={styles.rowRight}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.rowDescription} numberOfLines={1}>{item.description || 'Chưa có mô tả cho mục tiêu này...'}</Text>
        
        <View style={styles.rowProgressBar}>
          <View style={[styles.rowProgressFill, { width: `${((item.progress || 0) / 30) * 100}%`, backgroundColor: item.color || '#39FF14' }]} /> 
        </View>
        
        <View style={styles.rowStats}>
          <Text style={styles.rowProgressText}>⏳ {item.progress || 0}/30 ngày</Text>
          <Text style={styles.rowStreakText}>🔥 {item.streak || 0} ngày liên tiếp</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <CustomContainer backgroundColor="#F4F7F4">
      <FlatList 
        data={goals}
        renderItem={renderGoalCard}
        keyExtractor={item => item.goal_id.toString()}
        ListHeaderComponent={renderHeader} 
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />
      
      {/* ⚡ ĐIỀU KIỆN 5: Ẩn nút dấu CỘNG thêm goal nếu đang ở nhà người ta */}
      {!isFriendView && (
        <TouchableOpacity style={styles.fabAdd} onPress={() => navigation.navigate('NewGoal')}>
          <Text style={styles.fabAddText}>+</Text>
        </TouchableOpacity>
      )}
    </CustomContainer>
  );
};

// ... Khối CSS Styles giữ Y NGUYÊN không cần sửa một chữ nào
const styles = StyleSheet.create({
  // (Đoạn style cũ của ông giữ nguyên)
  listPadding: { paddingBottom: 100 },
  row: { justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15 },
  headerContainer: { backgroundColor: '#fff', paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 10 },
  coverWrapper: { height: 180, width: '100%', position: 'relative', },
  coverImage: { flex: 1, width: '100%', height: '100%', },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, },
  btnEditCover: { position: 'absolute', top: 20, left: 20, backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, zIndex: 10 },
  btnEditCoverText: { fontSize: 13, color: '#1a3317', fontWeight: 'bold' },
  btnEditInfo: { position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, zIndex: 10 },
  btnEditInfoText: { fontSize: 13, color: '#1a3317', fontWeight: 'bold' },
  profileInfoSection: { paddingHorizontal: 20, position: 'relative', flexDirection: 'row', marginTop: -10 },
  avatarWrapper: { position: 'absolute', left: 20, top: -55, width: 90, height: 90, borderRadius: 45, borderWidth: 4, borderColor: '#fff', backgroundColor: '#fff', elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, zIndex: 20 },
  avatarContainer: { width: '100%', height: '100%', borderRadius: 41 },
  avatar: { width: '100%', height: '100%', borderRadius: 41 },
  cameraBadgeMini: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2d5a27', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#fff', zIndex: 25 },
  userTextSection: { flex: 1, paddingLeft: 105, paddingTop: 12 },
  userNameText: { fontSize: 22, fontWeight: 'bold', color: '#1a3317' },
  sloganText: { fontSize: 14, color: '#666', marginTop: 3, fontStyle: 'italic' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d5a27', marginTop: 25, marginBottom: 15, paddingHorizontal: 20 },
  goalCard: { backgroundColor: '#fff', width: '48%', borderRadius: 16, padding: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  goalRow: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 16, borderRadius: 20, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, alignItems: 'stretch', },
  rowImage: { width: 120, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, resizeMode: 'cover', },
  rowIconContainer: { width: 120, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, justifyContent: 'center', alignItems: 'center', },
  rowIcon: { fontSize: 36 },
  rowRight: { flex: 1, paddingVertical: 16, paddingHorizontal: 16, justifyContent: 'center', },
  rowTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a3317', marginBottom: 4 },
  rowDescription: { fontSize: 14, color: '#666', marginBottom: 12 },
  rowProgressBar: { height: 8, backgroundColor: '#E0EAE0', borderRadius: 4, marginBottom: 8, overflow: 'hidden' },
  rowProgressFill: { height: '100%', borderRadius: 4 },
  rowStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowProgressText: { fontSize: 12, color: '#777', fontWeight: '600' },
  rowStreakText: { fontSize: 12, color: '#ff4500', fontWeight: 'bold' },
  cardIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F5F0', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardIcon: { fontSize: 20 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 15, height: 40 },
  progressBar: { height: 6, backgroundColor: '#E0EAE0', borderRadius: 3, marginBottom: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#39FF14', borderRadius: 3 },
  progressText: { fontSize: 11, color: '#888', fontWeight: '500' },
  fabAdd: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#2d5a27', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 3 } },
  fabAddText: { fontSize: 30, color: '#fff', fontWeight: 'bold', marginTop: -3 }
});

export default HomeScreen;