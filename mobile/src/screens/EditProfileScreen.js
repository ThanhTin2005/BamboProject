import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomContainer from '../components/customContainer';
import { BASE_URL } from '../config'; 

const EditProfileScreen = ({ route, navigation }) => {
  const { currentName, currentSlogan } = route.params;

  const [name, setName] = useState(currentName);
  const [slogan, setSlogan] = useState(currentSlogan);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim()) return Alert.alert("Lỗi", "Tên không được bỏ trống");

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.put(`${BASE_URL}/users/profile`, 
        { name, slogan },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        Alert.alert("Thành công", "Thông tin đã được cập nhật!");
        navigation.goBack(); 
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật thông tin lúc này");
    } finally {
      setLoading(false);
    }
  };

  // ⚡ 2. HÀM XỬ LÝ ĐĂNG XUẤT 
  const handleLogout = () => {
      Alert.alert(
          "Đăng xuất",
          "Ông có chắc chắn muốn rời khỏi Bambo không?",
          [
              { text: "Hủy", style: "cancel" },
              { 
                  text: "Đăng xuất", 
                  style: "destructive", 
                  onPress: async () => {
                      try {
                          await AsyncStorage.removeItem('userToken');
                          navigation.reset({
                              index: 0,
                              routes: [{ name: 'Login' }], 
                          });
                      } catch (error) {
                          console.error("Lỗi khi đăng xuất:", error);
                      }
                  } 
              }
          ]
      );
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

        {/* ⚡ NÚT ĐĂNG XUẤT ĐƯỢC THÊM VÀO ĐÂY */}
        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutBtnText}>Đăng xuất</Text>
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
    backgroundColor: '#4CAF50', padding: 18, borderRadius: 15, 
    alignItems: 'center', marginTop: 10,
    elevation: 5, shadowColor: '#4CAF50', shadowOpacity: 0.3, shadowRadius: 10
  },
  btnText: { color: '#1a3317', fontWeight: 'bold', fontSize: 18 },

  // ⚡ CSS CHO NÚT ĐĂNG XUẤT
  logoutBtn: { 
    marginTop: 20, // Cách nút Lưu một khoảng
    padding: 18, 
    borderRadius: 15, 
    backgroundColor: '#FFF0F0', // Nền đỏ siêu nhạt
    borderWidth: 1,
    borderColor: '#FFD6D6', // Viền đỏ nhạt
    alignItems: 'center',
  },
  logoutBtnText: { 
    color: '#FF3B30', // Chữ đỏ thuần Apple
    fontWeight: 'bold', 
    fontSize: 18 
  }
});

export default EditProfileScreen;