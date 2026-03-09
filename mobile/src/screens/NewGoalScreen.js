import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyInput from '../components/MyInput'; // Tái sử dụng hàng cũ "xịn"

export default function NewGoalScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateGoal = async () => {
    if (!title || !description) {
      Alert.alert("Thiếu thông tin", "Ông giáo đừng quên nhập tên và mô tả mục tiêu nhé!");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      // Gọi API POST mà ông đã test ở Day 8
      const response = await axios.post('http://192.168.0.102:3000/api/goals', 
        {
          title: title,
          description: description,
          cover_image_url: 'md-leaf' // Tạm thời để icon mặc định
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        Alert.alert("Thành công", "Mầm tre đã được gieo! 🎍");
        navigation.goBack(); // Quay lại màn Home
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không gieo được mầm rồi, check lại Server nhé!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mục tiêu mới</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Tên mục tiêu</Text>
          <MyInput 
            placeholder="Ví dụ: Học Tiếng Anh 6.5 IELTS..."
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Mô tả ngắn gọn</Text>
          <MyInput 
            placeholder="Ví dụ: Luyện nghe 30p mỗi sáng tại HUST..."
            value={description}
            onChangeText={setDescription}
            multiline={true}
          />

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.7 }]} 
            onPress={handleCreateGoal}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Đang gieo mầm..." : "GIEO MẦM NGAY 🎍"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, padding: 25 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, paddingTop: 20 },
  backBtn: { fontSize: 16, color: '#2d5a27', fontWeight: '600' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginLeft: 20 },
  form: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600', color: '#2d5a27', marginBottom: 8, marginLeft: 5 },
  button: { 
    backgroundColor: '#2d5a27', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 30,
    shadowColor: '#2d5a27',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});