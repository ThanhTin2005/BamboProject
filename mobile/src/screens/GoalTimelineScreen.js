import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomContainer from '../components/customContainer';
import { BASE_URL } from '../config'; 
import { Ionicons } from '@expo/vector-icons'; // ⚡ THÊM IMPORT ICON

const GoalTimelineScreen = ({ route, navigation }) => {
  const { goalId, goalName, isFriendView } = route.params || {}; 
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${BASE_URL}/logs/${goalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data.data || response.data); 
    } catch (error) {
      console.error("Lỗi lấy Logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchLogs();
      const unsubscribe = navigation.addListener('focus', () => fetchLogs());
      return unsubscribe; 
  }, [navigation, goalId]); 

  // ⚡ HÀM XÓA LOGS (Bật Alert Menu)
  const handleLogOptions = (logId) => {
    Alert.alert(
      "Tùy chọn minh chứng",
      "Xoá bài",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive", 
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              await axios.delete(`${BASE_URL}/logs/${logId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              fetchLogs(); // Reload lại sau khi xóa thành công
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa bài viết lúc này.");
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  const renderLogItem = ({ item, index }) => {
    const formattedDate = new Date(item.created_at).toLocaleDateString('vi-VN');

    return (
      <CustomContainer>
      <View style={styles.logContainer}>
        <View style={styles.timelineLeft}>
          <View style={styles.dot} />
          {index !== logs.length - 1 && <View style={styles.verticalLine} />}
        </View>

        <View style={styles.logContent}>
          <Text style={styles.logDate}>{formattedDate}</Text>
          <View style={styles.logCard}>
            
            {/* ⚡ NÚT 3 CHẤM Ở GÓC TRÊN CÙNG BÊN PHẢI CỦA ẢNH */}
            {!isFriendView && (
              <TouchableOpacity 
                style={styles.moreBtnAbsolute}
                onPress={() => handleLogOptions(item.log_id)}
              >
                <Ionicons name="ellipsis-horizontal" size={22} color="#333" />
              </TouchableOpacity>
            )}

            <Image source={{ uri: item.image_url }} style={styles.logImage} />
            
            {item.is_verified === 1 || item.is_verified === true ? (
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>✅ AI Verified</Text>
              </View>
            ) : null}

            <View style={styles.cardInfo}>
              <Text style={styles.logCaption}>{item.caption}</Text>
              {item.mood && <Text style={styles.logMood}>Cảm xúc: {item.mood}</Text>}
            </View>

            {item.reactor_avatars && (
              <View style={styles.bumpClusterContainer}>
                {item.reactor_avatars.split(',').slice(0, 4).map((avatarUrl, index) => {
                  if (index === 3) {
                    return (
                      <View key="more" style={[styles.avatarCircle, styles.moreCircle, { zIndex: 4 - index }]}>
                        <Text style={styles.moreText}>...</Text>
                      </View>
                    );
                  }
                  return <Image key={index} source={{ uri: avatarUrl }} style={[styles.avatarCircle, { zIndex: 4 - index }]} />;
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
            <Text style={styles.emptyText}>Chưa có mầm tre nào được gieo. Hãy Check-in ngay hôm nay!</Text>
          }
        />
      )}

      {!isFriendView && (
        <TouchableOpacity style={styles.creativeFabWrapper} onPress={() => navigation.navigate('CreateLog', { goalId: goalId })}>
          <View style={styles.creativeFabMain}>
            <View style={styles.fabIconVertical} />
            <View style={styles.fabIconHorizontal} />
          </View>
        </TouchableOpacity>
      )}
    </CustomContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF8' },
  header: { padding: 20, paddingTop: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  goalTitle: { fontSize: 24, fontWeight: 'bold', color: '#2d5a27' },
  subTitle: { color: '#666', marginTop: 5 },
  listPadding: { padding: 20, paddingBottom: 100 }, 
  logContainer: { flexDirection: 'row', marginBottom: 0 },
  timelineLeft: { alignItems: 'center', width: 20, marginRight: 15 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2d5a27', zIndex: 1 },
  verticalLine: { width: 2, flex: 1, backgroundColor: '#2d5a27', opacity: 0.2 },
  logContent: { flex: 1, paddingBottom: 30 },
  logDate: { fontSize: 14, color: '#999', marginBottom: 8, fontWeight: '600' },
  logCard: { backgroundColor: '#fff', borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, overflow: 'hidden', position: 'relative' },
  logImage: { width: '100%', height: 200, resizeMode: 'cover' },
  cardInfo: { padding: 12 },
  logCaption: { fontSize: 16, color: '#333', lineHeight: 22 },
  logMood: { fontSize: 12, color: '#2d5a27', marginTop: 8, fontStyle: 'italic' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontStyle: 'italic', paddingHorizontal: 20 },
  
  // ⚡ CSS CHO NÚT 3 CHẤM BAY Ở GÓC TRÊN CÙNG
  moreBtnAbsolute: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 6,
    paddingHorizontal: 8
  },

  creativeFabWrapper: { position: 'absolute', bottom: 35, alignSelf: 'center' },
  creativeFabMain: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#2d5a27', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#E8F5E9', elevation: 12, shadowColor: '#2d5a27', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10 },
  fabIconVertical: { position: 'absolute', width: 4, height: 30, backgroundColor: '#FFFFFF', borderRadius: 2 },
  fabIconHorizontal: { position: 'absolute', width: 30, height: 4, backgroundColor: '#FFFFFF', borderRadius: 2 },
  aiBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(255, 255, 255, 0.95)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  bumpClusterContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15, borderTopWidth: 1, borderColor: '#E0E0E0', paddingTop: 12, paddingBottom: 12 },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#FFF', marginLeft: -12, backgroundColor: '#E0E0E0' },
  moreCircle: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  moreText: { fontSize: 12, fontWeight: 'bold', color: '#888', marginBottom: 4 },
  bumpIconTiny: { fontSize: 20, marginLeft: -6, opacity: 0.9 }
});

export default GoalTimelineScreen;