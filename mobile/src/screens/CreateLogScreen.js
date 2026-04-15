import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  Image, ActivityIndicator, Keyboard, TouchableWithoutFeedback 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomContainer from '../components/customContainer';

const CreateLogScreen = ({ route, navigation }) => {
  const { goalId, goalName } = route.params; 

  const [caption, setCaption] = useState('');
  const [mood, setMood] = useState('');
  const [imageUri, setImageUri] = useState(null);
  
  // 1. STATE BẢO VỆ NÚT BẤM
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const submitLog = async () => {
    // Nếu đang gửi dở rồi thì chặn luôn, cấm bấm tiếp
    if (isSubmitting) return;

    if (!imageUri || !caption) {
      Alert.alert("Khoan đã!", "Ông phải chọn ảnh và viết vài dòng caption chứ!");
      return;
    }

    // Khóa nút, bật loading
    setIsSubmitting(true); 

    const formData = new FormData();
    formData.append('goal_id', goalId);
    formData.append('caption', caption);
    formData.append('mood', mood || 'Happy');

    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `checkin_${Date.now()}.jpg`, // Random tên file cho khỏi trùng
    });

    try {
      const token = await AsyncStorage.getItem('userToken');
      // Đảm bảo IP này đang đúng
      const apiUrl = 'http://192.168.0.106:3000/api/logs'; 

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
        
        // 2. CHỮA BỆNH VĂNG VỀ HOME: 
        // Thay vì goBack(), ta điều hướng đích danh về trang GoalTimeline cho an toàn
        //navigation.navigate('GoalTimeline', { goalId: goalId, goalName: goalName || "Hành trình" });
        // DÙNG LỆNH NÀY: Để đóng màn hình CreateLog và quay lại đúng màn hình Detail trước đó
        navigation.goBack();
      } else {
        Alert.alert("Lỗi từ Server", data.error || "Gieo mầm xịt rồi ông ơi!");
      }

    } catch (error) {
      console.error("Lỗi mạng:", error);
      Alert.alert("Lỗi kết nối", "Server sập hoặc ông nhập sai địa chỉ IP rồi!");
    } finally {
      // Dù thành công hay thất bại cũng phải mở khóa nút lại
      setIsSubmitting(false); 
    }
  };

  return (
    // 3. CHIÊU THỨC ẨN BÀN PHÍM: Bọc toàn bộ bằng TouchableWithoutFeedback
    <CustomContainer>
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text style={styles.headerText}>Đang check-in cho Mục tiêu số: {goalId}</Text>

        {/* Nút chọn ảnh */}
        <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.placeholderText}>+ Nhấn để chọn ảnh minh chứng</Text>
          )}
        </TouchableOpacity>

        {/* Ô nhập Caption */}
        <TextInput
          placeholder="Hôm nay bạn thấy thế nào?"
          value={caption}
          onChangeText={setCaption}
          style={[styles.input, { height: 80 }]}
          multiline
          blurOnSubmit={true} // Bấm Enter/Done tự động cất bàn phím
        />

        {/* Ô nhập Cảm xúc */}
        <TextInput
          placeholder="Cảm xúc (VD: Tuyệt vời, Mệt mỏi...)"
          value={mood}
          onChangeText={setMood}
          style={styles.input}
          returnKeyType="done" // Đổi nút dưới cùng bên phải bàn phím thành chữ "Done"
          onSubmitEditing={() => Keyboard.dismiss()} // Bấm Done là cất bàn phím, KHÔNG GỬI FORM
        />

        {/* Nút Gửi xịn xò */}
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={submitLog}
          disabled={isSubmitting} // Nếu đang loading thì nút này vô dụng
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" /> // Hiện vòng tròn xoay xoay
          ) : (
            <Text style={styles.submitButtonText}>🚀 Hoàn thành Check-in</Text>
          )}
        </TouchableOpacity>

      </View>
    </TouchableWithoutFeedback>
    </CustomContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8FAF8' },
  headerText: { fontSize: 16, fontWeight: 'bold', color: '#2d5a27', marginBottom: 10 },
  input: { 
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', 
    padding: 15, marginTop: 15, borderRadius: 10, fontSize: 15
  },
  imageBox: { 
    height: 220, backgroundColor: '#e8ece8', justifyContent: 'center', 
    alignItems: 'center', marginTop: 10, borderRadius: 15,
    borderWidth: 1, borderColor: '#d0d8d0', borderStyle: 'dashed'
  },
  image: { width: '100%', height: '100%', borderRadius: 15 },
  placeholderText: { color: '#666', fontSize: 16 },
  
  // Style cho nút xịn
  submitButton: {
    backgroundColor: '#2d5a27', padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 30,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }
  },
  submitButtonDisabled: {
    backgroundColor: '#999', // Đổi màu xám khi đang loading
  },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default CreateLogScreen;