import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  Image, ActivityIndicator, Keyboard, TouchableWithoutFeedback 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // THÊM IMPORT NÀY ĐỂ LẤY ICON ĐẸP
import CustomContainer from '../components/customContainer';
import { BASE_URL } from '../config'; 

const CreateLogScreen = ({ route, navigation }) => {
  const { goalId, goalName } = route.params; 

  const [caption, setCaption] = useState('');
  const [mood, setMood] = useState('');
  const [imageUri, setImageUri] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. HÀM CHỤP ẢNH TỪ CAMERA TRỰC TIẾP
  const pickFromCamera = async () => {
    // Xin quyền bật Camera
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Từ chối', 'Ông phải cấp quyền Máy ảnh trong Cài đặt để chụp ảnh trực tiếp.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Ép khung vuông 1:1 cho đẹp đội hình Timeline
      quality: 0.7,   // Nén ảnh xuống xíu cho server đỡ gánh
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // 2. HÀM CHỌN ẢNH TỪ THƯ VIỆN MÁY
  const pickFromGallery = async () => {
    // Xin quyền truy cập Thư viện ảnh
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Từ chối', 'Ông phải cấp quyền Truy cập ảnh trong Cài đặt để lấy ảnh cũ.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], 
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const submitLog = async () => {
    if (isSubmitting) return;

    if (!imageUri || !caption) {
      Alert.alert("Khoan đã!", "Ông phải cung cấp ảnh minh chứng và viết vài dòng caption chứ!");
      return;
    }

    setIsSubmitting(true); 

    const formData = new FormData();
    formData.append('goal_id', goalId);
    formData.append('caption', caption);
    formData.append('mood', mood || 'Happy');

    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `checkin_${Date.now()}.jpg`, 
    });

    try {
      const token = await AsyncStorage.getItem('userToken');
      const apiUrl = `${BASE_URL}/logs`; 

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Thành công!", "Mầm tre đã lớn thêm một chút 🌱");
        navigation.goBack();
      } else {
        Alert.alert("Lỗi từ Server", data.error || "Gieo mầm xịt rồi ông ơi!");
      }

    } catch (error) {
      console.error("Lỗi mạng:", error);
      Alert.alert("Lỗi kết nối", "Server sập hoặc đường truyền có vấn đề!");
    } finally {
      setIsSubmitting(false); 
    }
  };

  return (
    <CustomContainer>
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text style={styles.headerText}>Check-in: {goalName || `Mục tiêu #${goalId}`}</Text>

        {/* KHUNG HIỂN THỊ ẢNH XEM TRƯỚC */}
        <View style={styles.imageBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="image-outline" size={50} color="#999" />
              <Text style={styles.placeholderText}>Chưa có minh chứng</Text>
            </View>
          )}
        </View>

        {/* CỤM 2 NÚT CHỌN ẢNH NGANG HÀNG */}
        <View style={styles.mediaActionsContainer}>
          <TouchableOpacity style={[styles.mediaBtn, styles.cameraBtn]} onPress={pickFromCamera}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.mediaBtnText}>Chụp Ảnh</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.mediaBtn, styles.galleryBtn]} onPress={pickFromGallery}>
            <Ionicons name="images" size={20} color="#2d5a27" />
            <Text style={[styles.mediaBtnText, { color: '#2d5a27' }]}>Thư Viện</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Hôm nay bạn thấy thế nào?"
          value={caption}
          onChangeText={setCaption}
          style={[styles.input, { height: 80 }]}
          multiline
          blurOnSubmit={true} 
        />

        <TextInput
          placeholder="Cảm xúc (VD: Tuyệt vời, Mệt mỏi...)"
          value={mood}
          onChangeText={setMood}
          style={styles.input}
          returnKeyType="done" 
          onSubmitEditing={() => Keyboard.dismiss()} 
        />

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={submitLog}
          disabled={isSubmitting} 
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" /> 
          ) : (
            <Text style={styles.submitButtonText}>Check-in</Text>
          )}
        </TouchableOpacity>

      </View>
    </TouchableWithoutFeedback>
    </CustomContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8FAF8' },
  headerText: { fontSize: 18, fontWeight: 'bold', color: '#2d5a27', marginBottom: 15, textAlign: 'center' },
  
  // Khung ảnh vuông vắn
  imageBox: { 
    height: 250, backgroundColor: '#e8ece8', justifyContent: 'center', 
    alignItems: 'center', borderRadius: 15,
    borderWidth: 1, borderColor: '#d0d8d0', borderStyle: 'dashed',
    marginBottom: 15, overflow: 'hidden'
  },
  image: { width: '100%', height: '100%', borderRadius: 15, resizeMode: 'cover' },
  placeholderText: { color: '#666', fontSize: 14, marginTop: 10, fontStyle: 'italic' },
  
  // Cụm 2 nút Chụp/Chọn
  mediaActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  mediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    flex: 0.48, // Chiếm 48% chiều ngang mỗi nút
    elevation: 2,
  },
  cameraBtn: {
    backgroundColor: '#2d5a27',
  },
  galleryBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2d5a27',
  },
  mediaBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },

  input: { 
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', 
    padding: 15, marginTop: 15, borderRadius: 10, fontSize: 15
  },
  submitButton: {
    backgroundColor: '#2d5a27', padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 30,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }
  },
  submitButtonDisabled: { backgroundColor: '#999' },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default CreateLogScreen;