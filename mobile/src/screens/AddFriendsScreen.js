import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  FlatList, Image, Alert, ActivityIndicator, Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons'; // Sử dụng icon của Expo
import axios from 'axios';
import { BASE_URL } from '../config'; // Import BASE_URL từ config.js


export default function AddFriendsScreen({ navigation }) {
  const [myCode, setMyCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [friendsList, setFriendsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFriendsData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      // THAY ĐỔI: Sử dụng địa chỉ IP máy của ông nhé
      //const response = await axios.get('http://172.31.2.204:3000/api/social/friends', {
      const response = await axios.get(`${BASE_URL}/social/friends`, {

        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMyCode(response.data.myCode);
      setFriendsList(response.data.friends);
    } catch (error) {
      console.error("Lỗi tải data bạn bè:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(myCode);
    Alert.alert("Thành công!", "Đã sao chép mã mời. Gửi ngay cho bạn bè nào!");
  };

  const handleAddFriend = async () => {
    if (!inputCode.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mã mời của bạn bè!");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(
        //'http://172.31.2.204:3000/api/social/add-by-code',
        `${BASE_URL}/social/add-by-code`,

        { inviteCode: inputCode.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Tuyệt vời!", response.data.message);
      setInputCode(''); 
      fetchFriendsData(); 
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại!";
      Alert.alert("Oops!", errorMsg);
    }
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1B5E20" /></View>;
  }

  return (
    <View style={styles.container}>
      
      {/* TẦNG 1: HIỂN THỊ MÃ CỦA TÔI - STYLED EXACTLY LIKE IMAGE */}
      <View style={styles.card}>
        <Text style={styles.title}>MÃ MỜI CỦA BẠN</Text>
        <Text style={styles.subtitle}>Gửi mã này cho bạn bè để kết nối ngay!</Text>
        
        {/* HÀNG NGANG CHỨA MÃ VÀ NÚT COPY */}
        <View style={styles.codeContainerRow}>
          {/* HỘP CHỨA MÃ CÓ MÀU NỀN XANH NHẠT VÀ VIỀN */}
          <View style={styles.codeBox}>
            <Text style={styles.myCodeText}>{myCode}</Text>
          </View>
          
          {/* NÚT COPY MÀU XANH LÁ ĐẬM */}
          <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
            <Ionicons name="copy-outline" size={18} color="#fff" style={styles.copyIcon} />
            <Text style={styles.copyButtonText}>Sao chép</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TẦNG 2: Ô NHẬP MÃ BẠN BÈ - STYLED EXACTLY LIKE IMAGE */}
      <View style={styles.card}>
        <Text style={styles.title}>NHẬP MÃ BẠN BÈ</Text>
        <Text style={styles.subtitle}>Nhập mã họ gửi cho bạn để bắt đầu cày chung.</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mã mời vào đây..."
          value={inputCode}
          onChangeText={setInputCode}
          autoCapitalize="characters" 
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleAddFriend}>
          <Ionicons name="person-add" size={18} color="#fff" style={styles.submitIcon} />
          <Text style={styles.submitButtonText}>KẾT BẠN NGAY</Text>
        </TouchableOpacity>
      </View>

      {/* ĐƯỜNG PHÂN CÁCH MỜ */}
      <View style={styles.divider} />

      {/* TẦNG 3: DANH SÁCH BẠN BÈ - CLEAN AND MODERN */}
      <Text style={styles.listTitle}>Danh sách bạn bè ({friendsList.length})</Text>
      <FlatList
        data={friendsList}
        keyExtractor={(item) => item.user_id.toString()}
        // Sửa lại đoạn FlatList renderItem:
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.friendRow}
            onPress={() => navigation.navigate('FriendProfile', { friendId: item.user_id })}
          >
            <Image 
              source={{ uri: item.avatar_url || 'https://via.placeholder.com/150' }} 
              style={styles.avatar} 
            />
            <View>
              <Text style={styles.friendName}>{item.username}</Text>
              <Text style={styles.viewProfileLabel}>Xem hồ sơ</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Bạn chưa kết nối với ai. Hãy gửi mã mời ngay nhé!</Text>
        }
      />
    </View>
  );
}

// KHỐI CSS "BĂNG CAO CẤP" - POLISHED TO MATCH THE IMAGE
const styles = StyleSheet.create({
  // 1. Chỉnh nền xám nhạt toàn trang, tạo cảm giác card nổi lên
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // 2. STYLING CARD CAO CẤP: GÓC BO LỚN, CÓ BÓNG (SHADOW)
  card: { 
    backgroundColor: '#FFFFFF', 
    padding: 20, // Padding rộng hơn cho thoáng
    borderRadius: 12, // Bo góc 12 chuẩn thiết kế
    marginBottom: 20, 
    // BÓNG CHO ANDROID
    elevation: 4, 
    // BÓNG CHO IOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  title: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 4, letterSpacing: 0.5 },
  subtitle: { fontSize: 12, color: '#666', marginBottom: 15 },
  
  // 3. TÁI TẠO CHÍNH XÁC HÀNG CHỨA MÃ TRONG ẢNH
  codeContainerRow: { flexDirection: 'row', alignItems: 'center' },
  
  // Hộp chứa mã có nền xanh nhạt, viền mờ và phông MONOSPACE
  codeBox: { 
    flex: 1, // Chiếm hết phần còn lại
    flexDirection: 'row', 
    backgroundColor: '#E8F5E9', // Màu xanh nền của hộp
    borderRadius: 8, 
    borderWidth: 1,
    borderColor: '#C8E6C9',
    alignItems: 'center', 
    paddingHorizontal: 15, 
    paddingVertical: 12,
    marginRight: 10,
  },
  myCodeText: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1B5E20', // Màu xanh lá đậm cho chữ mã
    letterSpacing: 2, // Tạo khoảng cách giữa các chữ cho dễ đọc
    // ⚡ PHÔNG MONOSPACE CHO ĐÚNG THIẾT KẾ
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
  },
  
  // Nút Sao chép màu xanh lá đậm
  copyButton: { 
    flexDirection: 'row', // Thêm icon và chữ hàng ngang
    alignItems: 'center',
    backgroundColor: '#1B5E20', // Màu nút Copy đậm
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  copyIcon: { marginRight: 6 }, // Khoảng cách giữa icon và chữ
  copyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  // 4. STYLING Ô NHẬP LIỆU NHƯ TRONG ẢNH
  input: { 
    borderWidth: 1, 
    borderColor: '#E0E0E0', // Viền mờ hơn
    borderRadius: 8, 
    padding: 15, 
    fontSize: 16, 
    backgroundColor: '#FAFAFA', // Nền hơi xám cho ô nhập
    marginBottom: 20, // Khoảng cách rộng hơn
    color: '#333',
  },
  
  // Nút Kết bạn lớn, màu xanh lá thương hiệu, CÓ ICON
  submitButton: { 
    flexDirection: 'row', // Thêm icon và chữ hàng ngang
    justifyContent: 'center',
    backgroundColor: '#1B5E20', // Màu nút Kết bạn thương hiệu
    borderRadius: 8, 
    padding: 15, 
    alignItems: 'center',
    elevation: 2, // Bóng nhẹ cho nút
  },
  submitIcon: { marginRight: 10 },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // 5. ĐƯỜNG PHÂN CÁCH VÀ DANH SÁCH BẠN BÈ MẠCH LẠC
  divider: { height: 1, backgroundColor: '#E0E0E0', marginBottom: 20 },
  listTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 15 },
  
  friendRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10, 
    elevation: 1, // Bóng nhẹ cho mỗi dòng
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 15 },
  friendName: { fontSize: 16, fontWeight: '600', color: '#333' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 30, fontStyle: 'italic', paddingHorizontal: 20 }
});