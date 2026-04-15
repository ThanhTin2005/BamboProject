import React, { useState } from 'react';
import axios from 'axios';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  Alert 
} from 'react-native';

// Tiếp tục dùng "đệ" MyInput để tiết kiệm thời gian code
import MyInput from '../components/Input';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {   
  if (password !== confirmPassword) {
    alert("Mật khẩu không khớp!");
    return;
  }

  try {
    // THAY IP_CUA_ONG bằng địa chỉ IP thật của máy Mac
    const response = await axios.post('http://192.168.0.106:3000/api/auth/register', {
      //http://192.168.0.104:3000/api/auth/register
      username: username,
      password: password
    });

    if (response.status === 201) {
      alert("Đăng ký thành công! Đăng nhập thôi Tín ơi.");
      navigation.navigate('Login');
    }
  }  catch (error) {
    // Nó sẽ hiện cụ thể là Network Error, Timeout, hay 404...
    console.log("Lỗi chi tiết:", error.message);
    alert("Lỗi rồi: " + error.message); 
}
};

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          
          <View style={styles.header}>
            <Text style={styles.logo}>JOIN BAMBO 🎍</Text>
            <Text style={styles.tagline}>Start your journey today.</Text>
          </View>

          <View style={styles.form}>
            <MyInput 
              label="Username"
              placeholder="Chọn một cái tên thật kêu..."
              value={username}
              onChangeText={setUsername}
            />

            <MyInput 
              label="Password"
              placeholder="Mật khẩu mạnh vào nhé..."
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />

            <MyInput 
              label="Confirm Password"
              placeholder="Nhập lại mật khẩu lần nữa..."
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
            />

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>ĐĂNG KÝ NGAY</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản rồi? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.link}>Đăng nhập</Text>
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
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d5a27',
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  form: {
    width: '100%',
  },
  button: {
    backgroundColor: '#2d5a27',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#2d5a27',
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