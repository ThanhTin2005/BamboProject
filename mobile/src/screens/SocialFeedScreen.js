import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, RefreshControl, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; 
import { Animated, Easing } from 'react-native'; 
import { BASE_URL } from '../config'; 
import { Ionicons } from '@expo/vector-icons'; // ⚡ ĐÃ THÊM IMPORT ICON CHO HEADER

// ⚡ COMPONENT NÚT ĐẤM TAY (Có Animation)
const FistBumpButton = ({ logId, initialHasBumped }) => {
  const [hasBumped, setHasBumped] = useState(initialHasBumped > 0);
  const scaleValue = useState(new Animated.Value(1))[0];
  const shakeValue = useState(new Animated.Value(0))[0];

  const handleBump = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await axios.post(`${BASE_URL}/social/bump`, 
        { logId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setHasBumped(res.data.action === 'added');
      Animated.sequence([
        Animated.timing(scaleValue, { toValue: 1.4, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleValue, { toValue: 1, duration: 150, useNativeDriver: true })
      ]).start();

    } catch (error) {
      console.log("Lỗi khi đấm tay:", error.response ? error.response.data : error.message);
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
          styles.actionBtnUI, 
          hasBumped && styles.actionBtnUIActive 
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

  const fetchFeed = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await axios.get(`${BASE_URL}/social/getFeed`, {
            headers: { Authorization: `Bearer ${token}` }
        }); 
        setFeedData(response.data);
    } catch (error) {
        console.error("Lỗi tải bảng tin:", error);
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

  const handleSendComment = async () => {
    if (!commentText.trim()) {
      Alert.alert("Nhắc nhở", "Nhập vài chữ để cổ vũ đồng đội đã ông ơi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post(`${BASE_URL}/social/comment`, {
        logId: activeLogId,
        message: commentText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert("Thành công", "Đã gửi lời động viên bí mật! 💌");
      setCommentText('');
      setIsCommentModalVisible(false);
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Không thể kết nối đến máy chủ.";
      Alert.alert("Thất bại", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFeedItem = ({ item }) => (
    <View style={styles.card}>
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

      {item.log_image && (
        <Image source={{ uri: item.log_image }} style={styles.logImage} resizeMode="cover" />
      )}
      <Text style={styles.captionText}>
        <Text style={styles.moodText}>{item.mood} </Text>
        {item.caption}
      </Text>

      <View style={styles.cardFooter}>
        <View style={[styles.goalTag, { backgroundColor: item.goal_color || '#e0e0e0' }]}>
          <Text style={styles.goalTagText}> {item.goal_title}</Text>
        </View>
        
        <View style={styles.interactionBar}>
          <FistBumpButton logId={item.log_id} initialHasBumped={item.has_bumped} />
          <TouchableOpacity 
            style={styles.actionBtnUI} 
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
      {/* ⚡ HEADER CỐ ĐỊNH Ở TRÊN CÙNG */}
      <View style={styles.feedHeader}>
        <Text style={styles.headerTitle}>Bảng tin</Text>
      </View>

      <FlatList
        data={feedData}
        keyExtractor={(item) => item.log_id.toString()}
        renderItem={renderFeedItem}
        showsVerticalScrollIndicator={false} // Ẩn thanh cuộn cho đẹp
        contentContainerStyle={{ paddingBottom: 30 }} // Cho người dùng lướt mượt hơn ở đáy
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Bảng tin trống.</Text>
          </View>
        }
      />

      <Modal
        visible={isCommentModalVisible}
        animationType="fade" 
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
                  setCommentText(''); 
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
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

  // ⚡ CSS CHO HEADER
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 10,
    backgroundColor: '#f5f5f5', // Tiệp màu nền để không bị đứt đoạn khối
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d5a27', // Xanh đậm chất Bambo
    letterSpacing: 0.5,
  },
  bellBtn: {
    padding: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
  },

  card: { 
    backgroundColor: '#fff', 
    marginHorizontal: 16, 
    marginTop: 5,         // Sửa nhẹ lại margin vì có header rồi
    marginBottom: 15,
    paddingVertical: 15,  
    borderRadius: 16,     
    borderWidth: 1,       
    borderColor: '#F0F0F0',
    elevation: 3,         
    shadowColor: '#000',  
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    overflow: 'hidden',   
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  creatorName: { fontWeight: 'bold', fontSize: 15 },
  timeText: { fontSize: 12, color: '#777' },
  logImage: { width: '100%', height: 300, marginVertical: 12 }, 
  captionText: { paddingHorizontal: 12, fontSize: 14, marginVertical: 6 },
  moodText: { fontSize: 16 },
  
  cardFooter: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  goalTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12, 
  },
  goalTagText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  interactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', 
  },
  actionBtnUI: {
    backgroundColor: '#FFFFFF', 
    borderWidth: 1,
    borderColor: '#E0E0E0',     
    borderRadius: 12,           
    paddingVertical: 1,
    paddingHorizontal: 4,      
    marginRight: 8,            
  },
  actionBtnUIActive: {
    backgroundColor: '#E8F5E9', 
    borderColor: '#4CAF50',     
  },
  actionEmoji: {
    fontSize: 16, 
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', 
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
    elevation: 6, 
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
    textAlignVertical: 'top', 
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
    backgroundColor: '#4CAF50', 
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