import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../config'; // Import BASE_URL từ config.js


// Truyền navigation vào để tí nữa bẻ lái sang màn Timeline
export default function FriendProfileScreen({ route, navigation }) {
  const { friendId } = route.params;
  
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFriendData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await axios.get(`${BASE_URL}/social/friend-profile/${friendId}`, {
        //const response = await axios.get(`http://172.31.2.204:3000/api/social/friend-profile/${friendId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProfile(response.data.profile);
        setGoals(response.data.goals);
      } catch (error) {
        console.error("Lỗi tải profile bạn bè:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFriendData();
  }, [friendId]);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1B5E20" /></View>;
  }

  if (!profile) return <View style={styles.center}><Text>Không tìm thấy thông tin.</Text></View>;

  return (
    <View style={styles.container}>
      {/* KHỐI 1: HEADER */}
      <View style={styles.header}>
        <Image source={{ uri: profile.avatar_url || 'https://via.placeholder.com/150' }} style={styles.avatar} />
        <Text style={styles.username}>{profile.username}</Text>
        <Text style={styles.badge}>Thành viên Bambo</Text>
      </View>

      {/* KHỐI 2: DANH SÁCH GOALS CÔNG KHAI */}
      <Text style={styles.sectionTitle}>Mục tiêu đang cày ({goals.length})</Text>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.goal_id.toString()}
        renderItem={({ item }) => (
          // BẤM VÀO ĐÂY LÀ NHẢY THẲNG SANG TIMELINE
          <TouchableOpacity 
            style={[styles.goalCard, { borderLeftColor: item.color || '#4CAF50' }]}
            onPress={() => navigation.navigate('GoalTimeline', { 
              goalId: item.goal_id,
              goalTitle: item.title,
              isFriendView: true // ⚡ Truyền biến này sang để khóa các nút "Thêm Log" lại
            })}
          >
            <View style={styles.goalIconContainer}>
              <Text style={styles.goalIcon}>{item.icon || '🎯'}</Text>
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>{item.title}</Text>
              <Text style={styles.goalDesc} numberOfLines={1}>
                {item.description || 'Đang âm thầm cày cuốc...'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Người này chưa công khai mục tiêu nào.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { backgroundColor: '#fff', alignItems: 'center', paddingVertical: 35, borderBottomWidth: 1, borderColor: '#E0E0E0', elevation: 2 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, borderWidth: 3, borderColor: '#1B5E20' },
  username: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  badge: { backgroundColor: '#E8F5E9', color: '#1B5E20', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, marginTop: 10, fontSize: 13, fontWeight: 'bold', overflow: 'hidden' },
  
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 20, marginTop: 25, marginBottom: 15, color: '#333', textTransform: 'uppercase' },
  
  goalCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    marginHorizontal: 20, 
    marginBottom: 12, 
    padding: 15, 
    borderRadius: 12, 
    borderLeftWidth: 6, // Vạch màu phân biệt Goal
    elevation: 2 
  },
  goalIconContainer: { width: 50, height: 50, backgroundColor: '#F5F5F5', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  goalIcon: { fontSize: 24 },
  goalInfo: { flex: 1 },
  goalTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  goalDesc: { fontSize: 13, color: '#666' },
  
  emptyText: { textAlign: 'center', color: '#888', marginTop: 30, fontStyle: 'italic' }
});