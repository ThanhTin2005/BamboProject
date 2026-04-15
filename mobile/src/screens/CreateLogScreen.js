import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Đổi thư viện nếu dùng CLI thuần

const CreateLogScreen = ({ route, navigation }) => {
  // 1. Nhận goal_id từ trạm trung chuyển
  const { goalId } = route.params; 

  // 2. Khởi tạo các State
  const [caption, setCaption] = useState('');
  const [mood, setMood] = useState('Happy');
  const [imageUri, setImageUri] = useState(null);

  // 3. Hàm mở thư viện ảnh
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1, // Chất lượng cao nhất
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const submitLog = async () => {
  // --- 1. KIỂM TRA ĐẦU VÀO ---
  if (!imageUri || !caption) {
    Alert.alert("Khoan đã!", "Ông phải chọn ảnh và viết vài dòng caption chứ!");
    return;
  }

  // --- 2. TẠO THÙNG CONTAINER (FormData) ---
  const formData = new FormData();

  // Nhét chữ vào thùng (Giống hệt các trường trong Postman)
  formData.append('goal_id', goalId);
  formData.append('caption', caption);
  formData.append('mood', mood);

  // --- 3. NHÉT ẢNH VÀO THÙNG (CỰC KỲ QUAN TRỌNG) ---
  // Khác với web, React Native bắt buộc file ảnh phải được gói thành 1 object có đủ 3 thông số này:
  formData.append('image', {
    uri: imageUri,           // Đường dẫn thật của ảnh trên điện thoại
    type: 'image/jpeg',      // Ép kiểu định dạng ảnh
    name: 'checkin.jpg',     // Đặt bừa 1 cái tên file để backend nhận diện
  });

  try {
    // --- 4. CHUẨN BỊ VŨ KHÍ ---
    // TO-DO: Chỗ này ông tạm thời copy cái Token xịn bên Postman dán cứng vào đây để test trước
    const token = "DÁN_TOKEN_CỦA_ÔNG_VÀO_ĐÂY"; 

    // CHÚ Ý CHỖ NÀY DỄ LỖI NHẤT: ĐỊA CHỈ IP
    // - Nếu chạy máy ảo Android: Đổi localhost thành 10.0.2.2
    // - Nếu chạy máy ảo iOS: Giữ nguyên localhost
    // - Nếu test trên điện thoại thật: Thay bằng IP Wifi máy tính của ông (VD: 192.168.1.x)
    const apiUrl = 'http://10.0.2.2:3000/api/logs'; 

    // --- 5. KHAI HỎA (Gửi API) ---
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        // LƯU Ý: Không cần tự gõ 'Content-Type': 'multipart/form-data', thằng fetch() sẽ tự hiểu và tự thêm vào.
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    // --- 6. XỬ LÝ KẾT QUẢ ---
    if (response.ok) {
      Alert.alert("Thành công!", "Mầm tre đã lớn thêm một chút 🌱");
      // Thành công thì vứt ông dùng về trang trước
      navigation.goBack(); 
    } else {
      Alert.alert("Lỗi từ Server", data.error || "Gieo mầm xịt rồi ông ơi!");
      console.log("Chi tiết lỗi:", data);
    }

  } catch (error) {
    console.error("Lỗi mạng:", error);
    Alert.alert("Lỗi kết nối", "Server sập hoặc ông nhập sai địa chỉ IP rồi!");
  }
};

  return (
    <View style={{ padding: 20 }}>
      <Text>Đang check-in cho Mục tiêu số: {goalId}</Text>

      {/* Khu vực chọn ảnh */}
      <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text>+ Chọn ảnh minh chứng</Text>
        )}
      </TouchableOpacity>

      {/* Khu vực nhập Caption */}
      <TextInput
        placeholder="Hôm nay bạn thấy thế nào?"
        value={caption}
        onChangeText={setCaption}
        style={styles.input}
        multiline
      />

      {/* Khu vực chọn Mood (Tạm dùng TextInput cho nhanh, sau ông style lại thành nút Emoji sau) */}
      <TextInput
        placeholder="Cảm xúc (VD: Tuyệt vời, Mệt mỏi...)"
        value={mood}
        onChangeText={setMood}
        style={styles.input}
      />

      {/* Nút gửi dữ liệu (Sẽ viết ở Bước 4) */}
      <Button title="🚀 Hoàn thành Check-in" onPress={submitLog} />
    </View>
  );
};

// ... Thêm StyleSheet cơ bản ...
const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginTop: 15, borderRadius: 5 },
  imageBox: { height: 200, backgroundColor: '#e1e1e1', justifyContent: 'center', alignItems: 'center', marginTop: 15, borderRadius: 10 },
  image: { width: '100%', height: '100%', borderRadius: 10 }
});

export default CreateLogScreen;