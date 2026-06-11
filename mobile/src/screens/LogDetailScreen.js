import React, { useState, useEffect } from 'react';
import { View, Text,Image, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config'; // Import BASE_URL từ config.js


export default function LogDetailScreen({ route, navigation }) {
  const { logId } = route.params; // Lấy ID từ thông báo truyền sang
  const [logData, setLogData] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        // Nhớ đổi IP nhé ông
        const res = await axios.get(`${BASE_URL}/social/logs/${logId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogData(res.data.log);
        setComments(res.data.privateComments);
      } catch (error) {
        console.log("Lỗi fetch log detail", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [logId]);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
  }

  if (!logData) {
    return <View style={styles.center}><Text>Không tìm thấy bài viết này.</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết hành trình</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* THÂN BÀI VIẾT (Giao diện y hệt Bảng tin) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            {logData.avatar_url ? (
              <Image source={{ uri: logData.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="person" size={20} color="#888" />
              </View>
            )}
            <Text style={styles.username}>{logData.username}</Text>
          </View>
          
          <View style={styles.cardBody}>
            <Text style={styles.caption}>{logData.caption}</Text>
            {logData.image_url ? (
              <Image 
                source={{ uri: logData.image_url }} 
                style={styles.logImage} 
                resizeMode="contain" 
              />
            ) : null}
          </View>

          <View style={styles.cardFooter}>
            <View style={[styles.goalTag, { backgroundColor: logData.goal_color || '#e0e0e0' }]}>
              <Text style={styles.goalTagText}> {logData.goal_title}</Text>
            </View>
          </View>
        </View>

        {/* MẢNH GIẤY BÍ MẬT (Chỉ hiện khi có comment) */}
        {comments.length > 0 && (
          <View style={styles.stickyNoteContainer}>
            <Text style={styles.noteTitle}>💌 Lời nhắn ẩn dành cho bạn:</Text>
            {comments.map((cmt, index) => (
              <View key={index} style={styles.stickyNote}>
                <Text style={styles.noteText}>"{cmt.message}"</Text>
                <Text style={styles.noteAuthor}>- {cmt.username} -</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Cấu trúc CSS đơn giản
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 50, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#E0E0E0'
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 16 },
  
  // Style Card (giống Feed)
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#CCC', marginRight: 10 },
  username: { fontWeight: 'bold', fontSize: 16 },
  //caption: { fontSize: 15, marginBottom: 12 },
  caption: { fontSize: 15, marginBottom: 8 },
  
  // ⚡ Thêm CSS cho tấm ảnh
  logImage: {
    width: '100%',
    height: 350,        // Tùy chỉnh độ cao ảnh cho vừa mắt
    borderRadius: 8,    // Bo góc cho ảnh mượt mà tiệp với khung Card
    marginTop: 8,
    backgroundColor: '#F0F0F0', // Màu nền chờ trong lúc load ảnh
  },
  cardFooter: {
    marginTop: 16, // Tạo khoảng trống khoa học giữa ảnh và thẻ Goal
  },
  goalTag: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  goalTagText: { fontSize: 12, fontWeight: 'bold' ,color: '#FFFFFF' },

  // Style Mảnh giấy bí mật
  stickyNoteContainer: { marginTop: 10 },
  noteTitle: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 10, marginLeft: 4 },
  stickyNote: {
    backgroundColor: '#FFF9C4', // Màu vàng nhạt của giấy note
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D', // Viền trái vàng đậm tạo điểm nhấn
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2
  },
  noteText: { fontSize: 15, fontStyle: 'italic', color: '#333', lineHeight: 22 },
  noteAuthor: { fontSize: 13, color: '#666', textAlign: 'right', marginTop: 8, fontWeight: 'bold' }
});