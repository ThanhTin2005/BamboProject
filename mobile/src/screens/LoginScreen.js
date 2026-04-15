import React, { useState } from 'react';
import axios from 'axios';//axios giúp FE gọi API từ FE
import AsyncStorage from '@react-native-async-storage/async-storage';//asyncStorage giúp lưu trữ token trên bộ nhớ chính của thiết bị người dùng 
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard 
} from 'react-native';

// Gọi "đệ" MyInput từ folder components sang làm việc
import MyInput from '../components/Input';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

const handleLogin = async () => {
    //alert("Dữ liệu gửi đi: username=[" + username + "], password=[" + password + "]");
    
    console.log('Đang đăng nhập...');

  try {
    const response = await axios.post('http://192.168.0.106:3000/api/auth/login', {
      username: username,
      password: password
    });
    console.log("Dữ liệu Server trả về:", response.data);

    if (response.data.token) {
      // 1. Lưu token vào "ví" AsyncStorage
      await AsyncStorage.setItem('userToken', response.data.token);
      
      // 2. Lưu thông tin user nếu cần
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));

      alert("Chào mừng " + response.data.user.username + " đến với Bambo!");
      // 3. Nhảy vào màn hình chính (Ngày 7 mình sẽ làm màn Home)
      // navigation.navigate('Home'); 
      navigation.replace('Home');//Không dùng navigate để tránh người dùng lỡ back lại màn hình đăng nhập  
    }
  }  catch (error) {
    if (error.response) {
        // TRƯỜNG HỢP 1: Server đã nhận request nhưng trả về lỗi (401, 400, 500)
        console.log("Lỗi từ Server:", error.response.data);
        alert("Server bảo: " + (error.response.data.error || "Lỗi gì đó từ Server"));
    } else if (error.request) {
        // TRƯỜNG HỢP 2: Đã gửi request nhưng không nhận được phản hồi (Mất mạng, Server sập)
        console.log("Không nhận được phản hồi từ Server");
        alert("Server không phản hồi, check lại IP máy tính xem!");
    } else {
        // TRƯỜNG HỢP 3: Lỗi xảy ra khi thiết lập request hoặc lỗi ở các lệnh await bên trên
        console.log("Lỗi tại App (Có thể là AsyncStorage):", error.message);
        alert("Lỗi App: " + error.message);
    }
  }
};

  return (
    // Giúp giao diện đẩy lên khi bàn phím xuất hiện
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Bấm ra ngoài để ẩn bàn phím - cực kỳ tinh tế */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          
          <View style={styles.header}>
            <Text style={styles.logo}>BAMBO 🎍</Text>
            <Text style={styles.tagline}>Grow your habits, step by step.</Text>
          </View>

          <View style={styles.form}>
            {/* Sử dụng Component MyInput đã tạo */}
            <MyInput 
              label="Username"
              placeholder="Nhập tài khoản HUST của ông..."
              value={username}
              onChangeText={setUsername}
            />

            <MyInput 
              label="Password"
              placeholder="Mật khẩu bí mật..."
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#2d5a27', // Màu xanh tre đặc trưng
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  form: {
    width: '100%',
  },
  button: {
    backgroundColor: '#2d5a27',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    // Đổ bóng cho nút bấm trông "xịn" hơn
    shadowColor: '#2d5a27',
    //shadowColor : 'red',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  footerText: {
    color: '#666',
  },
  link: {
    color: '#2d5a27',
    fontWeight: 'bold',
  }
});