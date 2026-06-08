import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView, KeyboardAvoidingView, Platform, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyInput from '../components/Input';
import * as ImagePicker from 'expo-image-picker';
import CustomContainer from '../components/customContainer';

const ICONS = ['book', 'fitness', 'code-working', 'walk', 'leaf'];
const COLORS = ['#2d5a27', '#4A90E2', '#F5A623', '#D0021B'];

export default function EditGoalScreen({ route, navigation }) {
  const { goalId } = route.params;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('leaf');
  const [selectedColor, setSelectedColor] = useState('#2d5a27');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    const fetchGoalDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
const response = await axios.get(`http://172.31.2.204:3000/api/goals/${goalId}`, {//Phương thức get này đang là muốn lấy dữ liệu của cái goal đó , chứ chưa phải cập nhật , cái cập nhật là cái hanldeUpdate ở dưới cơ
//const response = await axios.get(`http://Phams-MacBook-Air.local:3000/api/goals/${goalId}`, {//Phương thức get này đang là muốn lấy dữ liệu của cái goal đó , chứ chưa phải cập nhật , cái cập nhật là cái hanldeUpdate ở dưới cơ
          headers: { Authorization: `Bearer ${token}` }
        });
        const goal = response.data;
        setTitle(goal.title);
        setDescription(goal.description);
        setSelectedColor(goal.color);
        //setIsPublic(goal.is_public);
        setIsPublic(goal.is_public === 1 || goal.is_public === true); // Convert 1/0 hoặc true/false thành boolean do cái switch chỉ nhận boolean thôi

        if (goal.cover_image_url && goal.cover_image_url.startsWith('http')) {
          setCurrentImageUrl(goal.cover_image_url);
          setImage(goal.cover_image_url); // Populate image state for display
        } else {
          setSelectedIcon(goal.cover_image_url || 'leaf');
        }

      } catch (error) {
        console.error('Failed to fetch goal details:', error);
        Alert.alert('Lỗi', 'Không thể tải chi tiết mục tiêu.');
      }
    };
    fetchGoalDetails();
  }, [goalId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setCurrentImageUrl(null); // Clear current image if a new one is picked
    }
  };

  const handleUpdateGoal = async () => {
    if (!title.trim() || !description.trim()) {
      return Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ Tên và Mô tả!");
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('color', selectedColor);
    formData.append('is_public', isPublic);

    if (image && image !== currentImageUrl) { // Only append new image if it's actually new
      const localUri = image;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      formData.append('image', { uri: localUri, name: filename, type });
    } else if (!image && currentImageUrl) {
        // No new image selected, but there was a previous image, so keep it.
        // If image is cleared, it implies user wants to remove it or use icon.
        // For now, we assume if image is null, and no new image, then it uses selectedIcon
        formData.append('cover_image_url', selectedIcon);
    } else if (!image) {
        formData.append('cover_image_url', selectedIcon);
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      //await axios.put(`http://Phams-MacBook-Air.local:3000/api/goals/${goalId}`, formData, {
      await axios.put(`http://172.31.2.204:3000/api/goals/${goalId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      Alert.alert("Thành công", "Mục tiêu đã được cập nhật!");
      navigation.goBack();
    } catch (error) {
      console.error('Lỗi cập nhật mục tiêu:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật mục tiêu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.inner}>
          <Text style={styles.headerTitle}>Chỉnh sửa mục tiêu 📝</Text>

          <Text style={styles.label}>Tên mục tiêu</Text>
          <MyInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ví dụ: IELTS 6.5..."
          />

          <Text style={styles.label}>Mô tả chi tiết</Text>
          <MyInput
            value={description}
            onChangeText={setDescription}
            placeholder="Kế hoạch cụ thể của ông là gì?"
            multiline={true}
            numberOfLines={3}
          />

          <Text style={styles.label}>Ảnh bìa thực tế (Tùy chọn)</Text>
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {image ? (
              <Image source={{ uri: image }} style={styles.preview} />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="camera-outline" size={30} color="#999" />
                <Text style={{ color: '#999', marginTop: 5 }}>Thêm ảnh bìa 📸</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Chọn biểu tượng</Text>
          <View style={styles.list}>
            {ICONS.map(icon => (
              <TouchableOpacity
                key={icon}
                style={[styles.iconBox, selectedIcon === icon && { backgroundColor: selectedColor }]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Ionicons
                  name={icon}
                  size={24}
                  color={selectedIcon === icon ? '#fff' : selectedColor}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Chọn màu chủ đạo</Text>
          <View style={styles.list}>
            {COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[styles.colorBox, { backgroundColor: color }, selectedColor === color && styles.activeColor]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>

          {/* Công tắc Public/Private */}
          {/* Thay thế cả cụm switchContainer cũ bằng cụm này */}
            <View style={styles.switchContainer}>
            <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.switchLabel}>Công khai mục tiêu này</Text>
                <Text style={{ fontSize: 12, color: '#666', fontStyle: 'italic' }}>Mọi người có thể thấy tiến độ của bạn</Text>
            </View>
            <Switch
                trackColor={{ false: "#767577", true: selectedColor }}
                thumbColor={isPublic ? "#f4f3f4" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setIsPublic}
                value={isPublic}
            />
            </View>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: selectedColor }]}
            onPress={handleUpdateGoal}
            disabled={loading}
          >
            <Text style={styles.btnText}>{loading ? "Đang cập nhật..." : "CẬP NHẬT MỤC TIÊU"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </CustomContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 25, paddingBottom: 50 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 25, paddingTop: 10 },
  label: { fontSize: 16, fontWeight: '600', color: '#666', marginTop: 15, marginBottom: 8 },
  list: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  iconBox: {
    width: 50, height: 50, borderRadius: 12, backgroundColor: '#f5f5f5',
    justifyContent: 'center', alignItems: 'center'
  },
  colorBox: { width: 45, height: 45, borderRadius: 25 },
  activeColor: { borderWidth: 4, borderColor: '#eee' },
  btn: { padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 35 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  imagePicker: {
    width: '100%',
    height: 180,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginVertical: 10,
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  }
});