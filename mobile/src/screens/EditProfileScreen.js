import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomContainer from '../components/customContainer';

const EditProfileScreen = ({ route, navigation }) => {
  // Lấy dữ liệu cũ truyền từ màn hình Profile sang để người dùng sửa
  const { currentName, currentSlogan } = route.params;

  const [name, setName] = useState(currentName);
  const [slogan, setSlogan] = useState(currentSlogan);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim()) return Alert.alert("Lỗi", "Tên không được bỏ trống");

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      // NHỚ IP: 192.168.0.106 // Phams-MacBook-Air.local
      //const response = await axios.put('http://172.31.43.77:3000/api/user/profile', 
      const response = await axios.put('http://Phams-MacBook-Air.local:3000/api/user/profile', 
        { name, slogan },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        Alert.alert("Thành công", "Thông tin đã được cập nhật!");
        navigation.goBack(); // Quay lại trang Dashboard
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật thông tin lúc này");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomContainer>
      <View style={styles.form}>
        <Text style={styles.label}>Tên hiển thị</Text>
        <TextInput 
          style={styles.input} 
          value={name} 
          onChangeText={setName} 
          placeholder="Nhập tên của ông..."
        />

        <Text style={styles.label}>Slogan Kỷ luật</Text>
        <TextInput 
          style={[styles.input, { height: 100 }]} 
          value={slogan} 
          onChangeText={setSlogan} 
          placeholder="Ví dụ: Kỷ luật là tự do..."
          multiline
        />

        <TouchableOpacity 
          style={[styles.btn, loading && { backgroundColor: '#ccc' }]} 
          onPress={handleUpdate}
          disabled={loading}
        >
          <Text style={styles.btnText}>{loading ? "Đang lưu..." : "Lưu thay đổi"}</Text>
        </TouchableOpacity>
      </View>
    </CustomContainer>
  );
};

const styles = StyleSheet.create({
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#2d5a27', marginBottom: 8 },
  input: { 
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', 
    borderRadius: 12, padding: 15, marginBottom: 20, fontSize: 16 
  },
  btn: { 
    backgroundColor: '#39FF14', padding: 18, borderRadius: 15, 
    alignItems: 'center', marginTop: 10,
    elevation: 5, shadowColor: '#39FF14', shadowOpacity: 0.3, shadowRadius: 10
  },
  btnText: { color: '#1a3317', fontWeight: 'bold', fontSize: 18 }
});

export default EditProfileScreen;