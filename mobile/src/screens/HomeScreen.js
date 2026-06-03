import React, { useState, useEffect } from 'react';
import { ImageBackground, View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomContainer from '../components/customContainer'; 

const HomeScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState({
    name: 'Người dùng Bambo',
    avatar_url: null,
    cover_url: null,
    slogan: 'Học tập là hành trình',
  });

  const [goals, setGoals] = useState([
    // { id: '1', name: 'Đọc sách 30 phút', icon: '📚', progress: 12 },
    // { id: '2', name: 'Code Project Bambo', icon: '💻', progress: 8 },
    // { id: '3', name: 'Tập Gym / Đá bóng', icon: '⚽', progress: 4 },
    // { id: '4', name: 'Học IELTS 6.5', icon: '🇬🇧', progress: 15 },
  ]);

  const renderHeader = () => {
    const defaultCover = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000';
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=39FF14&color=1a3317&size=150&bold=true`;

    return (
      <View style={styles.headerContainer}>
        {/* 1. KHU VỰC ẢNH BÌA (COVER) */}
        <View style={styles.coverWrapper}>
          <ImageBackground 
            source={{ uri: userProfile.cover_url || defaultCover }} 
            style={styles.coverImage}
            imageStyle={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
          >
            <View style={styles.coverOverlay}>
              {/* Nút bấm đổi ảnh bìa */}
              <TouchableOpacity style={styles.btnEditCover} onPress={() => pickImage('cover')}>
                <Text style={styles.btnEditCoverText}>📷 Thay ảnh bìa</Text>
              </TouchableOpacity>

              {/* Nút Sửa Profile Info */}
              <TouchableOpacity 
                style={styles.btnEditInfo}
                onPress={() => navigation.navigate('EditProfile', { 
                  currentName: userProfile.name, 
                  currentSlogan: userProfile.slogan 
                })}
              >
                <Text style={styles.btnEditInfoText}>⚙️ Chỉnh sửa</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* 2. CỤM AVATAR VÀ THÔNG TIN NẰM DƯỚI ẢNH BÌA */}
        <View style={styles.profileInfoSection}>
          <View style={styles.avatarWrapper}>
            {/* Nút bấm đổi ảnh đại diện */}
            <TouchableOpacity style={styles.avatarContainer} onPress={() => pickImage('avatar')}>
              <Image 
                source={{ uri: userProfile.avatar_url || defaultAvatar }} 
                style={styles.avatar} 
              />
              <View style={styles.cameraBadgeMini}>
                <Text style={{ fontSize: 10, color: '#fff' }}>📷</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Tên và Slogan dịch phải né Avatar */}
          <View style={styles.userTextSection}>
            <Text style={styles.userNameText}>{userProfile.name}</Text>
            <Text style={styles.sloganText}>{userProfile.slogan || "Kỷ luật là tự do 🎍"}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Mục tiêu của tôi</Text>
      </View>
    );
  };

  const pickImage = async (uploadType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: uploadType === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.6, // Nén nhẹ xuống 0.6 để tải ảnh nhanh hơn, đỡ tốn RAM
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      // Đổi tên thành mimeType để tránh ghi đè lên biến uploadType
      const mimeType = match ? `image/${match[1]}` : `image/jpeg`; 

      const formData = new FormData();
      
      // 1. Đóng gói file ảnh với key tĩnh là 'image' để chiều lòng Multer Backend
      formData.append('image', { 
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''), 
        name: `${uploadType}_${Date.now()}.jpg`, 
        type: mimeType 
      });

      // 2. Gửi kèm theo một biến text tên là 'type' để Backend biết đây là ảnh bìa hay đại diện
      formData.append('type', uploadType);

      try {
        const token = await AsyncStorage.getItem('userToken');
        // FIX LẠI ĐÚNG IP .102 ĐỒNG BỘ
        const response = await axios.post('http://Phams-MacBook-Air.local:3000/api/users/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        });

        // Backend trả về link ảnh nằm trong đối tượng response.data.url
        // Xoá khối if-else cũ và dán khối này vào:
        const responseData = response.data;
        
        // Chấp nhận cả trường hợp Server trả về 'success: true' hoặc HTTP 200
        if (responseData.success || response.status === 200) {
          
          // Lấy link ảnh (Ưu tiên imageUrl của Cloudinary, nếu không có thì lấy url)
          const newImgUrl = responseData.imageUrl || responseData.url;
          
          if (newImgUrl) {
            setUserProfile(prev => ({
              ...prev,
              [uploadType === 'avatar' ? 'avatar_url' : 'cover_url']: newImgUrl
            }));
            alert('Cập nhật ảnh thành công! 🎉');
          } else {
            alert('Cập nhật thất bại: Backend không trả về link ảnh!');
            console.log("Dữ liệu Backend trả về:", responseData); // In ra để xem Backend thực sự trả về gì
          }
          
        } else {
          alert('Cập nhật ảnh thất bại: ' + (responseData.message || 'Lỗi không xác định'));
        }
      } catch (error) {
        console.error('Lỗi tải ảnh lên:', error.response?.data || error.message);
        alert('Đã có lỗi xảy ra khi tải ảnh lên server.');
      }
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      
      // FIX LẠI ĐÚNG IP .102 ĐỒNG BỘ
      const response = await axios.get('http://Phams-MacBook-Air.local:3000/api/users/profile', {
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
      console.error('Lỗi khi fetch user profile:', error.response?.data || error.message);
    }
  };

  const fetchGoals = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      // Gọi API lấy danh sách goal với domain local của máy ông
      const response = await axios.get('http://Phams-MacBook-Air.local:3000/api/goals', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setGoals(response.data); // Đổ dữ liệu thật vào State
      }
    } catch (error) {
      console.error('Lỗi khi fetch goals:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchGoals();// 🔥 1. Gọi lấy dữ liệu khi vừa mở app
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserProfile();
      fetchGoals();// 🔥 2. Gọi làm mới dữ liệu khi màn hình được focus lại (người dùng chọn back lại bằng cách vuốt cạnh màn hình)
    });
    return unsubscribe;
  }, [navigation]);

  const renderGoalCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.goalRow} 
      activeOpacity={0.8}
      onPress={() => navigation.navigate('GoalDetail', { goalId: item.goal_id, goalName: item.title })}
    >
      {/* 1. BÊN TRÁI: ĐỂ ẢNH HOẶC ICON LÀM CON TRỰC TIẾP, KHÔNG BỌC VIEW NỮA */}
      {item.cover_image_url && item.cover_image_url.startsWith('http') ? (
        <Image source={{ uri: item.cover_image_url }} style={styles.rowImage} />
      ) : (
        <View style={[styles.rowIconContainer, { backgroundColor: item.color || '#F0F5F0' }]}>
          <Text style={styles.rowIcon}>{item.icon || '🎍'}</Text>
        </View>
      )}

      {/* 2. BÊN PHẢI: KHỐI THÔNG TIN TEXT GIỮ NGUYÊN */}
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

  // const renderGoalCard = ({ item }) => (
  //   <TouchableOpacity 
  //     style={styles.goalRow} 
  //     activeOpacity={0.8}
  //     onPress={() => navigation.navigate('GoalDetail', { goalId: item.goal_id, goalName: item.title })}
  //   >
  //     {/* 1. BÊN TRÁI: ẢNH BÌA HOẶC ICON CỦA GOAL */}
  //     <View style={styles.rowLeft}>
  //       {item.cover_image_url && item.cover_image_url.startsWith('http') ? (
  //         <Image source={{ uri: item.cover_image_url }} style={styles.rowImage} />
  //       ) : (
  //         <View style={[styles.rowIconContainer, { backgroundColor: item.color || '#F0F5F0' }]}>
  //           <Text style={styles.rowIcon}>{item.icon || '🎍'}</Text>
  //         </View>
  //       )}
  //     </View>

  //     {/* 2. BÊN PHẢI: TOÀN BỘ THÔNG TIN TEXT & TIẾN ĐỘ */}
  //     <View style={styles.rowRight}>
  //       <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
  //       <Text style={styles.rowDescription} numberOfLines={1}>{item.description || 'Chưa có mô tả cho mục tiêu này...'}</Text>
        
  //       {/* Thanh tiến độ */}
  //       <View style={styles.rowProgressBar}>
  //         <View style={[styles.rowProgressFill, { width: `${((item.progress || 0) / 30) * 100}%`, backgroundColor: item.color || '#39FF14' }]} /> 
  //       </View>
        
  //       {/* Chỉ số Ngày & Streak hiển thị song song */}
  //       <View style={styles.rowStats}>
  //         <Text style={styles.rowProgressText}>⏳ {item.progress || 0}/30 ngày</Text>
  //         <Text style={styles.rowStreakText}>🔥 {item.streak || 0} ngày liên tiếp</Text>
  //       </View>
  //     </View>
  //   </TouchableOpacity>
  // );

  // const renderGoalCard = ({ item }) => (
  //   <TouchableOpacity 
  //     style={styles.goalCard}
  //     activeOpacity={0.8}
  //     // 🛑 Đổi item.id -> item.goal_id và item.name -> item.title
  //     onPress={() => navigation.navigate('GoalDetail', { goalId: item.goal_id, goalName: item.title })}
  //   >
  //     <View style={styles.cardIconContainer}>
  //       {/* Tạm thời dùng icon mặc định nếu DB chưa phân tách trường này */}
  //       <Text style={styles.cardIcon}>{item.icon || '🎍'}</Text>
  //     </View>
  //     {/* 🛑 Đổi item.name -> item.title */}
  //     <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      
  //     <View style={styles.progressBar}>
  //       {/* Lấy tiến độ, nếu chưa có log tính toán thì mặc định thanh tiến độ chạy theo màu của Goal */}
  //       <View style={[styles.progressFill, { width: `${((item.progress || 0) / 30) * 100}%`, backgroundColor: item.color || '#39FF14' }]} /> 
  //     </View>
  //     <Text style={styles.progressText}>{item.progress || 0}/30 ngày</Text>
  //   </TouchableOpacity>
  // );

  // const renderGoalCard = ({ item }) => (
  //   <TouchableOpacity 
  //     style={styles.goalCard}
  //     activeOpacity={0.8}
  //     onPress={() => navigation.navigate('GoalDetail', { goalId: item.goal_id, goalName: item.title })}
  //   >
  //     <View style={styles.cardIconContainer}>
  //       <Text style={styles.cardIcon}>{item.icon}</Text>
  //     </View>
  //     <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
  //     <View style={styles.progressBar}>
  //       <View style={[styles.progressFill, { width: `${(item.progress / 30) * 100}%` }]} /> 
  //     </View>
  //     <Text style={styles.progressText}>{item.progress}/30 ngày</Text>
  //   </TouchableOpacity>
  // );

  return (
    <CustomContainer backgroundColor="#F4F7F4">
      <FlatList 
        data={goals}
        renderItem={renderGoalCard}
        keyExtractor={item => item.goal_id.toString()}
        //numColumns={2} 
        //columnWrapperStyle={styles.row} 
        ListHeaderComponent={renderHeader} 
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity style={styles.fabAdd} onPress={() => navigation.navigate('NewGoal')}>
        <Text style={styles.fabAddText}>+</Text>
      </TouchableOpacity>
    </CustomContainer>
  );
};

const styles = StyleSheet.create({
  listPadding: { paddingBottom: 100 },
  row: { justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15 },
  
  headerContainer: { 
    backgroundColor: '#fff', 
    paddingBottom: 20,
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 10,
    marginBottom: 10 
  },
  coverWrapper: {
    height: 180, 
    width: '100%',
    position: 'relative',
  },
  coverImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.15)', 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
  },
  btnEditCover: { 
    position: 'absolute', 
    top: 20, 
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.8)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20,
    zIndex: 10
  },
  btnEditCoverText: { fontSize: 13, color: '#1a3317', fontWeight: 'bold' },
  btnEditInfo: { 
    position: 'absolute', 
    top: 20, 
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.8)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    zIndex: 10
  },
  btnEditInfoText: { fontSize: 13, color: '#1a3317', fontWeight: 'bold' },

  profileInfoSection: { 
    paddingHorizontal: 20, 
    position: 'relative', 
    flexDirection: 'row', 
    marginTop: -10 
  },
  avatarWrapper: {
    position: 'absolute',
    left: 20,
    top: -55, 
    width: 90, 
    height: 90,
    borderRadius: 45,
    borderWidth: 4, 
    borderColor: '#fff', 
    backgroundColor: '#fff', 
    elevation: 5, 
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowRadius: 5,
    zIndex: 20 
  },
  avatarContainer: { width: '100%', height: '100%', borderRadius: 41 },
  avatar: { width: '100%', height: '100%', borderRadius: 41 },
  cameraBadgeMini: {
    position: 'absolute', 
    bottom: 0, 
    right: 0,
    backgroundColor: '#2d5a27', 
    width: 26, 
    height: 26, 
    borderRadius: 13, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1.5, 
    borderColor: '#fff',
    zIndex: 25
  },
  userTextSection: { 
    flex: 1, 
    paddingLeft: 105, 
    paddingTop: 12 
  },
  userNameText: { fontSize: 22, fontWeight: 'bold', color: '#1a3317' },
  sloganText: { fontSize: 14, color: '#666', marginTop: 3, fontStyle: 'italic' },

  sectionTitle: { 
    fontSize: 18, fontWeight: 'bold', color: '#2d5a27', 
    marginTop: 25, marginBottom: 15, paddingHorizontal: 20 
  },
  goalCard: {
    backgroundColor: '#fff', width: '48%', 
    borderRadius: 16, padding: 15,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  goalRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden', 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    alignItems: 'stretch', // Ép các con trực tiếp phải kéo giãn chiều cao bằng nhau
  },
  rowImage: {
    width: 120, // Cố định chiều rộng chiếm hơn 1/3 cái khung
    // Ép bo tròn góc trực tiếp vào ảnh để sửa lỗi hiển thị trên Android
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    resizeMode: 'cover', 
  },
  rowIconContainer: {
    width: 120, // Bằng chiều rộng với bên ảnh để đều phân khúc
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowIcon: { fontSize: 36 },
  rowRight: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a3317', marginBottom: 4 },
  rowDescription: { fontSize: 14, color: '#666', marginBottom: 12 },
  rowProgressBar: { height: 8, backgroundColor: '#E0EAE0', borderRadius: 4, marginBottom: 8, overflow: 'hidden' },
  rowProgressFill: { height: '100%', borderRadius: 4 },
  rowStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowProgressText: { fontSize: 12, color: '#777', fontWeight: '600' },
  rowStreakText: { fontSize: 12, color: '#ff4500', fontWeight: 'bold' },
  cardIconContainer: { 
    width: 40, height: 40, borderRadius: 20, 
    backgroundColor: '#F0F5F0', justifyContent: 'center', alignItems: 'center', 
    marginBottom: 10 
  },
  cardIcon: { fontSize: 20 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 15, height: 40 },
  progressBar: { height: 6, backgroundColor: '#E0EAE0', borderRadius: 3, marginBottom: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#39FF14', borderRadius: 3 },
  progressText: { fontSize: 11, color: '#888', fontWeight: '500' },
  fabAdd: {
    position: 'absolute', bottom: 30, right: 20,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#2d5a27', justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 3 }
  },
  fabAddText: { fontSize: 30, color: '#fff', fontWeight: 'bold', marginTop: -3 }
});

export default HomeScreen;