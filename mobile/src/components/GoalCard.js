import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity ,Image} from 'react-native';//THêm image tại ngày 14 
import { Ionicons } from '@expo/vector-icons';

// Nhận props riêng biệt, không split chuỗi nữa cho nó nhẹ máy
const GoalCard = ({ title, description, progress = 0, coverImage, color = '#2d5a27' }) => { //thay iconName = 'leaf' bằng coverImage tại ngày 14
  // Kiểm tra xem coverImage là tên Icon hay là Link ảnh thật
  // Mẹo: Ảnh thật thường có đuôi .jpg, .png hoặc chứa đường dẫn /uploads/
  //const isImageUrl = coverImage && (coverImage.includes('/') || coverImage.includes('.'));
  
  // Logic kiểm tra: Nếu là link (bắt đầu bằng http) thì là ảnh Cloudinary
  // Nếu không phải link, ta coi như đó là tên Icon (Day 12)
  const isFullUrl = coverImage && coverImage.startsWith('http');

  const BASE_URL = 'http://192.168.0.106:3000/uploads/'; // Thay bằng IP MacBook của ông
  return (
    <View style={styles.card} >
      {/* Container Icon: Màu nền nhạt bằng cách thêm độ trong suốt 20 (Hex Alpha) */}
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}> 
        {isFullUrl ? (
          <Image 
            source={{ uri: coverImage }} // Dùng trực tiếp link từ Cloudinary
            style={styles.imageContent} 
          />
        ) : (
          <Ionicons name={coverImage || 'leaf'} size={28} color={color} />
        )}
      </View>
      
      <View style={styles.info}>
        <Text style={[styles.title, { color: color }]}>{title}</Text>
        <Text style={styles.description} numberOfLines={1}>{description}</Text>
      </View>
      
      <View style={[styles.progressCircle, { borderColor: color }]}>
        <Text style={[styles.progressText, { color: color }]}>{progress}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Đổ bóng chuẩn UI/UX
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  imageContent: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    resizeMode: 'cover',
  },
  // Bổ sung style còn thiếu đây ông giáo nhé
  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow : 'hidden',
  },
  info: { flex: 1 },
  title: { fontSize: 17, fontWeight: 'bold', marginBottom: 3 },
  description: { fontSize: 13, color: '#888' },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10
  },
  progressText: { fontSize: 11, fontWeight: 'bold' },
});

export default GoalCard;