import React, { useState } from 'react';
import { 
  View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyInput from '../components/Input';
import * as ImagePicker from 'expo-image-picker';
import CustomContainer from '../components/customContainer';


// Bộ Icon đã fix tên theo Ionicons 7 (bỏ md-/ios-)
const ICONS = ['book', 'fitness', 'code-working', 'walk', 'leaf'];
const COLORS = ['#2d5a27', '#4A90E2', '#F5A623', '#D0021B'];

export default function NewGoalScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('leaf');
  const [selectedColor, setSelectedColor] = useState('#2d5a27');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  // Hàm mở thư viện ảnh
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreateGoal = async () => {
    const formData = new FormData(); // Tạo thùng bưu kiện
    formData.append('title', title);
    formData.append('description', description);
    formData.append('color', selectedColor);

    if (image) {
      // Nếu có chọn ảnh thật
      const localUri = image;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('image', { uri: localUri, name: filename, type });
    } else {
      // Nếu không chọn ảnh, dùng icon làm mặc định
      formData.append('cover_image_url', selectedIcon);
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post('http://192.168.0.106:3000/api/goals', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Chỉ định gửi file
          'Authorization': `Bearer ${token}`
        },
      });
      navigation.goBack();
    } catch (error) {
      console.log("Lỗi Day 13:", error);
    }
  };

  // const handleCreateGoal = async () => {
  //   if (!title.trim() || !description.trim()) {
  //     return Alert.alert("Thiếu thông tin", "Ông giáo điền nốt Tên và Mô tả đã nhé!");
  //   }
    
  //   try {
  //     setLoading(true);
  //     const token = await AsyncStorage.getItem('userToken');
      
  //     await axios.post('http://192.168.57.129:3000/api/goals', 
  //       {
  //         title: title,
  //         description: description,
  //         cover_image_url: selectedIcon, 
  //         color: selectedColor          
  //       },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     navigation.goBack();
  //   } catch (error) {
  //     Alert.alert("Lỗi", "Server đang bận gieo tre, thử lại sau nhé!");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
  
    <CustomContainer>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.inner}>
          <Text style={styles.headerTitle}>Gieo mầm mới 🎍</Text>

          {/* Ô nhập Tên */}
          <Text style={styles.label}>Tên mục tiêu</Text>
          <MyInput 
            value={title} 
            onChangeText={setTitle} 
            placeholder="Ví dụ: IELTS 6.5..." 
          />

          {/* Ô nhập Mô tả - Thêm multiline cho chuyên nghiệp */}
          <Text style={styles.label}>Mô tả chi tiết</Text>
          <MyInput 
            value={description} 
            onChangeText={setDescription} 
            placeholder="Kế hoạch cụ thể của ông là gì?" 
            multiline={true} // Cho phép xuống dòng
            numberOfLines={3}
          />

          {/* 3. ĐÂY LÀ VỊ TRÍ THÊM NÚT CHỌN ẢNH (MỚI) */}
          <Text style={styles.label}>Ảnh bìa thực tế (Tùy chọn)</Text>
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {image ? (
              <Image source={{ uri: image }} style={styles.preview} />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="camera-outline" size={30} color="#999" />
                <Text style={{ color: '#999', marginTop: 5 }}>Thêm ảnh bìa 📸</Text>
              </View>
            )}
          </TouchableOpacity>


          {/* Bộ chọn Icon */}
          <Text style={styles.label}>Chọn biểu tượng</Text>
          <View style={styles.list}>
            {ICONS.map(icon => (
              <TouchableOpacity 
                key={icon} 
                style={[styles.iconBox, selectedIcon === icon && { backgroundColor: selectedColor }]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Ionicons 
                  name={icon} 
                  size={24} 
                  color={selectedIcon === icon ? '#fff' : selectedColor} 
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Bộ chọn Màu sắc */}
          <Text style={styles.label}>Chọn màu chủ đạo</Text>
          <View style={styles.list}>
            {COLORS.map(color => (
              <TouchableOpacity 
                key={color} 
                style={[styles.colorBox, { backgroundColor: color }, selectedColor === color && styles.activeColor]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: selectedColor }]} 
            onPress={handleCreateGoal}
            disabled={loading}
          >
            <Text style={styles.btnText}>{loading ? "Đang gieo mầm..." : "GIEO MẦM NGAY"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </CustomContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 25, paddingBottom: 50 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 25, paddingTop: 10 },
  label: { fontSize: 16, fontWeight: '600', color: '#666', marginTop: 15, marginBottom: 8 },
  list: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  iconBox: { 
    width: 50, height: 50, borderRadius: 12, backgroundColor: '#f5f5f5', 
    justifyContent: 'center', alignItems: 'center' 
  },
  colorBox: { width: 45, height: 45, borderRadius: 25 },
  activeColor: { borderWidth: 4, borderColor: '#eee' },
  btn: { padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 35 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  imagePicker: {
    width: '100%',
    height: 180, // Tỉ lệ ảnh bìa
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed', // Nét đứt nhìn cho "nghệ"
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Để ảnh preview không bị tràn ra ngoài bo góc
    marginVertical: 10,
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
  }
});

// import React, { useState } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   SafeAreaView, 
//   Alert,
//   KeyboardAvoidingView,
//   Platform
// } from 'react-native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import MyInput from '../components/MyInput'; // Tái sử dụng hàng cũ "xịn"

// export default function NewGoalScreen({ navigation }) {
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleCreateGoal = async () => {
//     if (!title || !description) {
//       Alert.alert("Thiếu thông tin", "Ông giáo đừng quên nhập tên và mô tả mục tiêu nhé!");
//       return;
//     }

//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem('userToken');
      
//       // Gọi API POST mà ông đã test ở Day 8
//       const response = await axios.post('http://192.168.0.106:3000/api/goals', 
//         {
//           title: title,
//           description: description,
//           cover_image_url: 'md-leaf' // Tạm thời để icon mặc định
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.status === 201) {
//         Alert.alert("Thành công", "Mầm tre đã được gieo! 🎍");
//         navigation.goBack(); // Quay lại màn Home
//       }
//     } catch (error) {
//       console.error(error);
//       Alert.alert("Lỗi", "Không gieo được mầm rồi, check lại Server nhé!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView 
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.inner}
//       >
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Text style={styles.backBtn}>← Quay lại</Text>
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Mục tiêu mới</Text>
//         </View>

//         <View style={styles.form}>
//           <Text style={styles.label}>Tên mục tiêu</Text>
//           <MyInput 
//             placeholder="Ví dụ: Học Tiếng Anh 6.5 IELTS..."
//             value={title}
//             onChangeText={setTitle}
//           />

//           <Text style={styles.label}>Mô tả ngắn gọn</Text>
//           <MyInput 
//             placeholder="Ví dụ: Luyện nghe 30p mỗi sáng tại HUST..."
//             value={description}
//             onChangeText={setDescription}
//             multiline={true}
//           />

//           <TouchableOpacity 
//             style={[styles.button, loading && { opacity: 0.7 }]} 
//             onPress={handleCreateGoal}
//             disabled={loading}
//           >
//             <Text style={styles.buttonText}>
//               {loading ? "Đang gieo mầm..." : "GIEO MẦM NGAY 🎍"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   inner: { flex: 1, padding: 25 },
//   header: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, paddingTop: 20 },
//   backBtn: { fontSize: 16, color: '#2d5a27', fontWeight: '600' },
//   headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginLeft: 20 },
//   form: { flex: 1 },
//   label: { fontSize: 16, fontWeight: '600', color: '#2d5a27', marginBottom: 8, marginLeft: 5 },
//   button: { 
//     backgroundColor: '#2d5a27', 
//     padding: 18, 
//     borderRadius: 15, 
//     alignItems: 'center', 
//     marginTop: 30,
//     shadowColor: '#2d5a27',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 5
//   },
//   buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
// });