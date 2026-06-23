import React, { useState, useEffect } from 'react';
import { ImageBackground, View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomContainer from '../components/customContainer'; 
import { BASE_URL } from '../config'; 
// ⚡ IMPORT THƯ VIỆN XEM ẢNH FULL MÀN HÌNH
import ImageViewing from 'react-native-image-viewing';

const HomeScreen = ({ route, navigation }) => {
  
  const friendId = route?.params?.friendId;
  const isFriendView = !!friendId; 

  const [userProfile, setUserProfile] = useState({
    name: isFriendView ? 'Đang tải...' : 'Người dùng Bambo',
    avatar_url: null,
    cover_url: null,
    slogan: 'Học tập là hành trình',
  });

  const [goals, setGoals] = useState([]);
  
  // ⚡ STATE QUẢN LÝ TRẠNG THÁI XEM ẢNH TO
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);

  // Hàm hỗ trợ mở ảnh to
  const openImageViewer = (imageUrl) => {
    setViewerImages([{ uri: imageUrl }]);
    setIsViewerVisible(true);
  };

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      const response = await axios.get(`${BASE_URL}/users/profile`, {
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
      const response = await axios.get(`${BASE_URL}/goals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) setGoals(response.data);
    } catch (error) {
      console.error('Lỗi khi fetch goals:', error.message);
    }
  };

  const fetchFriendData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      const response = await axios.get(`${BASE_URL}/social/friend-profile/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setUserProfile({
          name: response.data.profile.username, 
          slogan: 'Thành viên Bambo 🎍',
          avatar_url: response.data.profile.avatar_url,
          cover_url: response.data.profile.cover_url || null,
        });
        setGoals(response.data.goals);
      }
    } catch (error) {
      console.error('Lỗi tải data bạn bè:', error.message);
    }
  };

  useEffect(() => {
    if (isFriendView) {
      fetchFriendData(); 
    } else {
      fetchUserProfile(); 
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
  }, [navigation, isFriendView]); 

  const pickImage = async (uploadType) => {
    if (isFriendView) return; 

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: uploadType === 'avatar' ? [1, 1] : [16, 9],
      quality: 1,
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
        const response = await axios.post(`${BASE_URL}/users/upload-image`, formData, {
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

  const renderHeader = () => {
    const defaultCover = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000';
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=39FF14&color=1a3317&size=150&bold=true`;

    return (
      <View>
        <View style={styles.headerContainer}>
          
          <TouchableOpacity 
            style={styles.coverWrapper}
            activeOpacity={0.9}
            // ⚡ CẬP NHẬT: Nhấn 1 lần -> Xem ảnh to
            onPress={() => openImageViewer(userProfile.cover_url || defaultCover)}
            // Nhấn giữ -> Đổi ảnh bìa
            onLongPress={() => {
              if (!isFriendView) {
                Alert.alert("Ảnh bìa", "Bạn muốn thay đổi ảnh bìa?", [
                  { text: "Hủy", style: "cancel" },
                  { text: "Đồng ý", onPress: () => pickImage('cover') }
                ]);
              }
            }}
            delayLongPress={500}
          >
            <ImageBackground 
              source={{ uri: userProfile.cover_url || defaultCover }} 
              style={styles.coverImage}
              imageStyle={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
            >
              <View style={styles.coverOverlay}>
                {!isFriendView && (
                  <TouchableOpacity 
                    style={styles.btnEditInfo}
                    onPress={() => navigation.navigate('EditProfile', { 
                      currentName: userProfile.name, 
                      currentSlogan: userProfile.slogan 
                    })}
                  >
                    <Text style={styles.btnEditInfoText}>⚙️</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ImageBackground>
          </TouchableOpacity>

          <View style={styles.profileInfoSection}>
            <View style={styles.avatarWrapper}>
              
              <TouchableOpacity 
                style={styles.avatarContainer} 
                // ⚡ CẬP NHẬT: Nhấn 1 lần -> Xem ảnh to
                onPress={() => openImageViewer(userProfile.avatar_url || defaultAvatar)}
                // Nhấn giữ -> Đổi ảnh đại diện
                onLongPress={() => {
                  if (!isFriendView) {
                    Alert.alert("Ảnh đại diện", "Bạn muốn thay đổi ảnh đại diện?", [
                      { text: "Hủy", style: "cancel" },
                      { text: "Đồng ý", onPress: () => pickImage('avatar') }
                    ]);
                  }
                }}
                delayLongPress={500}
              >
                <Image source={{ uri: userProfile.avatar_url || defaultAvatar }} style={styles.avatar} />
              </TouchableOpacity>
              
            </View>

            <View style={styles.userTextSection}>
              <Text style={styles.userNameText}>{userProfile.name}</Text>
              <Text style={styles.sloganText}>{userProfile.slogan}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {isFriendView ? 'Mục tiêu đang cày' : 'Mục tiêu của tôi'}
        </Text>
      </View>
    );
  };

  const renderGoalCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.goalRow} 
      activeOpacity={0.8}
      onPress={() => {
        if (isFriendView) {
          navigation.navigate('GoalTimeline', { 
            goalId: item.goal_id, 
            goalTitle: item.title,
            isFriendView: true 
          });
        } else {
          navigation.navigate('GoalDetail', { 
            goalId: item.goal_id, 
            goalName: item.title 
          });
        }
      }}
      onLongPress={() => {
        if (!isFriendView) { 
          Alert.alert(
            "Tùy chọn mục tiêu",
            `Bạn muốn làm gì với mục tiêu "${item.title}"?`,
            [
              { text: "Hủy", style: "cancel" },
              { text: "Chỉnh sửa mục tiêu", onPress: () => navigation.navigate('EditGoal', { goalId: item.goal_id }) }
            ],
            { cancelable: true } 
          );
        }
      }}
      delayLongPress={500} 
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
        <Text style={styles.rowDescription} numberOfLines={2}>
          {item.description || 'Chưa có mô tả cho mục tiêu này...'}
        </Text>
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
      
      {!isFriendView && (
        <TouchableOpacity style={styles.fabAdd} onPress={() => navigation.navigate('NewGoal')}>
          <Text style={styles.fabAddText}>+</Text>
        </TouchableOpacity>
      )}

      {/* ⚡ COMPONENT HIỂN THỊ ẢNH TO TOÀN MÀN HÌNH */}
      <ImageViewing
        images={viewerImages}
        imageIndex={0}
        visible={isViewerVisible}
        onRequestClose={() => setIsViewerVisible(false)} // Bấm X hoặc vuốt để đóng
        swipeToCloseEnabled={true} // Cho phép vuốt xuống để đóng y hệt Facebook
        doubleTapToZoomEnabled={true} // Bấm đúp để zoom
      />
    </CustomContainer>
  );
};

const styles = StyleSheet.create({
  listPadding: { paddingBottom: 100 },
  row: { justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15 },
  headerContainer: { backgroundColor: '#fff', paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 10 },
  coverWrapper: { height: 180, width: '100%', position: 'relative', },
  coverImage: { flex: 1, width: '100%', height: '100%', },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, },
  
  btnEditInfo: { position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, zIndex: 10 },
  btnEditInfoText: { fontSize: 13, color: '#1a3317', fontWeight: 'bold' },
  profileInfoSection: { paddingHorizontal: 20, position: 'relative', flexDirection: 'row', marginTop: -10 },
  avatarWrapper: { 
    position: 'absolute', left: 20, top: -65, 
    width: 120, height: 120, 
    borderRadius: 55, 
    borderWidth: 4, borderColor: '#fff', backgroundColor: '#fff', 
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, zIndex: 20 
  },
  avatarContainer: { width: '100%', height: '100%', borderRadius: 51 }, 
  avatar: { width: '100%', height: '100%', borderRadius: 51 },
  
  userTextSection: { flex: 1, paddingLeft: 125, paddingTop: 12 },
  userNameText: { fontSize: 22, fontWeight: 'bold', color: '#1a3317' },
  sloganText: { fontSize: 14, color: '#666', marginTop: 3, fontStyle: 'italic' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d5a27', marginTop: 22, marginBottom: 12, paddingHorizontal: 20 },
  
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
    alignItems: 'stretch', 
    minHeight: 130 
  },
  rowImage: { width: 120, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, resizeMode: 'cover' },
  rowIconContainer: { width: 120, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, justifyContent: 'center', alignItems: 'center' },
  rowIcon: { fontSize: 48 }, 
  
  rowRight: { 
    flex: 1, 
    paddingVertical: 16, 
    paddingHorizontal: 16, 
    justifyContent: 'center' 
  },
  rowTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a3317', marginBottom: 8 }, 
  rowDescription: { fontSize: 14, color: '#666', lineHeight: 22 }, 
  
  fabAdd: { 
    position: 'absolute', 
    bottom: 30, 
    right: 20, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#F4F7F4', 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 6, 
    shadowColor: '#000', 
    shadowOpacity: 0.15, 
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1, 
    borderColor: '#E0EAE0' 
  },
  fabAddText: { 
    fontSize: 34, 
    color: '#4CAF50', 
    fontWeight: '300', 
    marginTop: -4 
  }
});

export default HomeScreen;