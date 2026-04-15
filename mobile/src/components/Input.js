import React from 'react';
import { StyleSheet, TextInput, View, Text } from 'react-native';

// Chúng ta nhận các "props" để tùy biến từng ô nhập liệu cụ thể
const MyInput = ({ label, placeholder, value, onChangeText, secureTextEntry = false }) => {
  return (
    <View style={styles.container}>
      {/* Hiện nhãn nếu có truyền vào */}
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        // Thêm các thuộc tính mặc định để tăng trải nghiệm người dùng
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5a27', // Màu xanh tre Bambo
    //color:'red',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    fontSize: 16,
    color: '#333',
  },
});

export default MyInput;