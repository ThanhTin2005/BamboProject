// 1. Thêm useRef vào dòng import
import React, { useState, useCallback, useRef } from 'react';
import { View, FlatList, Image, StyleSheet, ActivityIndicator, Text, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../config';

const { width } = Dimensions.get('window');
const gap = 4;
const paddingHorizontal = 20;
const imageSize = (width - paddingHorizontal * 2 - gap * 2) / 3;

const GoalGalleryScreen = ({ route }) => {
  const { goalId } = route.params;
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ⚡ 2. Dùng useRef để ghi nhớ trạng thái load lần đầu (Không bao giờ bị reset)
  const isFirstLoad = useRef(true); 

  const fetchGallery = async () => {
    try {
      // Chỉ bật Loading nếu cuốn sổ ghi là "lần đầu tiên"
      if (isFirstLoad.current) {
        setLoading(true);
      }
      
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${BASE_URL}/logs/${goalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const logs = response.data.data || response.data;
      const logsWithImages = logs.filter(log => log.image_url && log.image_url.trim() !== '');
      
      setImages(logsWithImages);
    } catch (error) {
      console.error("Lỗi tải Thư viện ảnh:", error);
    } finally {
      // Tắt Loading và GẠCH BỎ chữ "lần đầu tiên" trong cuốn sổ
      if (isFirstLoad.current) {
        setLoading(false);
        isFirstLoad.current = false; 
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGallery();
    }, [goalId])
  );

  const renderImageItem = ({ item }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.image_url }} style={styles.image} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Cập nhật điều kiện hiển thị một chút cho mượt */}
      {loading && isFirstLoad.current ? (
        <ActivityIndicator size="large" color="#39FF14" style={{ marginTop: 50 }} />
      ) : images.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📷</Text>
          <Text style={styles.emptyText}>Chưa có bức ảnh nào.</Text>
          <Text style={styles.emptySubText}>Hãy gieo mầm và đính kèm minh chứng nhé!</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item) => item.log_id ? item.log_id.toString() : Math.random().toString()}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
    </View>
  );
};

// ... (Phần styles giữ nguyên y hệt bên dưới)

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF8', paddingHorizontal: 20, paddingTop: 15 },
  listContent: { paddingBottom: 100 },
  columnWrapper: { gap: gap, marginBottom: gap },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E0EAE0',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 60, opacity: 0.5, marginBottom: 10 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#666' },
  emptySubText: { fontSize: 13, color: '#999', marginTop: 5 },
});

export default GoalGalleryScreen;