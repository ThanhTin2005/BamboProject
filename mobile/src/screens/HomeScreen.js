import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, 
  Image, TouchableOpacity 
} from 'react-native';
// Đảm bảo đường dẫn này khớp với thư mục của ông
import CustomContainer from '../components/CustomContainer.js'; 

const HomeScreen = ({ navigation }) => {
  // 1. MOCK DATA: Dữ liệu giả cho Profile (Day 27 mình sẽ kéo API thật)
  const userProfile = {
    name: 'Phạm Thành Tín',
    avatar: 'https://i.pravatar.cc/150?img=11', // Link avatar tạm thời
    totalLogs: 24,
    consistency: 95
  };

  // 2. MOCK DATA: Danh sách Mục tiêu (Tạm thời để render giao diện)
  const [goals, setGoals] = useState([
    { id: '1', name: 'Đọc sách 30 phút', icon: '📚', progress: 12 },
    { id: '2', name: 'Code Project Bambo', icon: '💻', progress: 8 },
    { id: '3', name: 'Tập Gym / Đá bóng', icon: '⚽', progress: 4 },
    { id: '4', name: 'Học IELTS 6.5', icon: '🇬🇧', progress: 15 },
  ]);

  // 3. VẼ PHẦN TRÊN CÙNG (HEADER PROFILE)
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.profileSection}>
        <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
        <Text style={styles.userName}>{userProfile.name}</Text>
        
        {/* Dải thông số Kỷ luật */}
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statText}>🌱 {userProfile.totalLogs} Mầm đã gieo</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statText}>⚡ {userProfile.consistency}% Kỷ luật</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Mục tiêu đang rèn luyện</Text>
    </View>
  );

  // 4. VẼ TỪNG CÁI THẺ MỤC TIÊU DẠNG LƯỚI
  const renderGoalCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.goalCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('GoalDetail', { goalId: item.id, goalName: item.name })}
    >
      <View style={styles.cardIconContainer}>
        <Text style={styles.cardIcon}>{item.icon}</Text>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
      
      {/* Thanh tiến độ Mini (Giả lập) */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(item.progress / 30) * 100}%` }]} /> 
      </View>
      <Text style={styles.progressText}>{item.progress}/30 ngày</Text>
    </TouchableOpacity>
  );

  return (
    <CustomContainer backgroundColor="#F4F7F4">
      <FlatList 
        data={goals}
        renderItem={renderGoalCard}
        keyExtractor={item => item.id}
        
        // CHIÊU THỨC ĂN TIỀN CỦA DAY 26:
        numColumns={2} // Tự động bẻ thành 2 cột đều tăm tắp
        columnWrapperStyle={styles.row} // Căn giữa 2 cột
        
        // Nhét cả cái Profile Header vào làm "Trưởng tàu" cho FlatList
        // Giúp toàn bộ trang cuộn mượt mà không bị khựng
        ListHeaderComponent={renderHeader} 
        
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />

      {/* Nút Cộng Mục Tiêu Mới (Floating Action Button) */}
      <TouchableOpacity style={styles.fabAdd}>
        <Text style={styles.fabAddText}>+</Text>
      </TouchableOpacity>
    </CustomContainer>
  );
};

const styles = StyleSheet.create({
  listPadding: { paddingBottom: 100 },
  row: { justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15 },
  
  // --- Header Styles ---
  headerContainer: { marginBottom: 10 },
  profileSection: {
    backgroundColor: '#39FF14', // XANH NEON RỰC RỠ
    paddingTop: 40, paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    elevation: 10, shadowColor: '#39FF14', shadowOpacity: 0.3, shadowRadius: 10
  },
  avatar: { 
    width: 90, height: 90, borderRadius: 45, 
    borderWidth: 4, borderColor: '#fff', marginBottom: 10 
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1a3317' },
  statsRow: { flexDirection: 'row', marginTop: 15, gap: 10 },
  statBadge: { 
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 
  },
  statText: { fontSize: 13, fontWeight: 'bold', color: '#2d5a27' },
  
  // --- Body Styles ---
  sectionTitle: { 
    fontSize: 18, fontWeight: 'bold', color: '#2d5a27', 
    marginTop: 25, marginBottom: 15, paddingHorizontal: 20 
  },
  
  // --- GoalCard Styles (Dạng Lưới) ---
  goalCard: {
    backgroundColor: '#fff', width: '48%', // Chiếm gần nửa màn hình
    borderRadius: 16, padding: 15,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  cardIconContainer: { 
    width: 40, height: 40, borderRadius: 20, 
    backgroundColor: '#F0F5F0', justifyContent: 'center', alignItems: 'center', 
    marginBottom: 10 
  },
  cardIcon: { fontSize: 20 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 15, height: 40 },
  progressBar: { height: 6, backgroundColor: '#E0EAE0', borderRadius: 3, marginBottom: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#39FF14', borderRadius: 3 },
  progressText: { fontSize: 11, color: '#888', fontWeight: '500' },

  // --- Nút Thêm (+) ---
  fabAdd: {
    position: 'absolute', bottom: 30, right: 20,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#2d5a27', justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 3 }
  },
  fabAddText: { fontSize: 30, color: '#fff', fontWeight: 'bold', marginTop: -3 }
});

export default HomeScreen;
// import React, { useEffect, useState } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   FlatList, 
//   SafeAreaView, 
//   ActivityIndicator,
//   RefreshControl, // Thêm cái này để vuốt xuống tải lại trang
//   TouchableOpacity
// } from 'react-native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import GoalCard from '../components/goalCard';
// import CustomContainer from '../components/customContainer';

// export default function HomeScreen({navigation}) {
//   const [goals, setGoals] = useState([]); // 1. Khởi tạo mảng rỗng
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   // 2. Hàm gọi API "thần thánh"
//   const fetchGoals = async () => {//fetch = get : lấy dữ liệu
//     try {
//       const token = await AsyncStorage.getItem('userToken');
      
//       // Thay đúng IP máy tính của ông vào đây
//       const response = await axios.get('http://192.168.0.106:3000/api/goals', {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       setGoals(response.data); // 3. Đổ dữ liệu thật vào biến trạng thái goals để hiển thị ra màn hình . 
//     } catch (error) {
//       console.error("Lỗi Day 10:", error.response?.data || error.message);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // 4. Tự động chạy khi vừa mở App
//   // useEffect(() => {
//   //   fetchGoals();
//   // }, []);//Mảng phụ thuộc là một mảng rỗng thì hàm useEffect sẽ chỉ thực hiện một lần 
//   useEffect(() => {
//   // 1. Gọi lấy dữ liệu lần đầu tiên khi App vừa load
//   fetchGoals();

//   // 2. Thiết lập "thám tử" lắng nghe sự kiện 'focus'
//   // 'focus' là sự kiện xảy ra mỗi khi người dùng nhìn thấy màn hình này
//   const unsubscribe = navigation.addListener('focus', () => {
//     console.log("Màn hình Home đã được focus - Đang làm mới dữ liệu...");
//     fetchGoals(); 
//   });

//   // 3. Quan trọng: Dọn dẹp thám tử khi không dùng nữa để App không bị tốn RAM
//   return unsubscribe;
// }, [navigation]);

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchGoals();
//   };//Mỗi khi onRefresh được gọi thì biến refresh sẽ được cập nhật thành true và gọi đến hàm fetchGoals()

//   return (
//     <CustomContainer>
//       <View style={styles.header}>
//         <Text style={styles.greeting}>Hành trình Bambo 🎍</Text>
//         <Text style={styles.subGreeting}>Dữ liệu thật từ Database của ông đây!</Text>
//       </View>

//       {loading ? (
//         <ActivityIndicator size="large" color="#2d5a27" style={{ marginTop: 50 }} />
//       ) : (
//         <FlatList
//           data={goals}
//           keyExtractor={(item) => item.goal_id.toString()} // MySQL dùng goal_id
//           renderItem={({ item }) => (
//             // Bọc TouchableOpacity ra ngoài GoalCard để nhận sự kiện bấm
//             <TouchableOpacity 
//               activeOpacity={0.8} // Làm mờ nhẹ khi bấm cho có cảm giác tương tác
//               onPress={() => {
//                 console.log("Đã bấm vào Goal ID:", item.goal_id); // Dòng này siêu quan trọng để test
//                 // Kích hoạt chuyển trang sang GoalTimeline
//                 // Chú ý: Cột ID trong DB của ông tên là goal_id nên mình dùng item.goal_id nhé
//                 navigation.navigate('GoalDetail', { 
//                   goalId: item.goal_id, 
//                   goalName: item.title 
//                 });
//               }}
//             >
//               <GoalCard 
//                 title={item.title} 
//                 description={item.description} 
//                 progress={0} 
//                 coverImage={item.cover_image_url || 'leaf'} 
//                 color={item.color || '#2d5a27'} 
//               />
//             </TouchableOpacity>
//           )}
//           contentContainerStyle={styles.listContent}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>Chưa có "mầm tre" nào trong DB. Hãy dùng Thunder Client thêm thử 1 cái!</Text>
//           }
//         />
        
        
//       )}
//         <TouchableOpacity 
//           style={styles.fab} 
//           onPress={() => navigation.navigate('NewGoal')}
//         >
//           <Text style={styles.fabText}>+</Text>
//         </TouchableOpacity>
      
//     </CustomContainer>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8FAF8' },
//   header: { padding: 25, paddingTop: 40, marginBottom: 10 },
//   greeting: { fontSize: 28, fontWeight: 'bold', color: '#2d5a27' },
//   subGreeting: { fontSize: 16, color: '#666', marginTop: 5 },
//   listContent: { paddingHorizontal: 20, paddingBottom: 100 },
//   emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontStyle: 'italic' },
//   fab: {
//   position: 'absolute',
//   bottom: 30,
//   right: 30,
//   backgroundColor: '#2d5a27',
//   width: 65,
//   height: 65,
//   borderRadius: 33,
//   justifyContent: 'center',
//   alignItems: 'center',
//   elevation: 8,
//   shadowColor: '#000',
//   shadowOffset: { width: 0, height: 4 },
//   shadowOpacity: 0.3,
//   shadowRadius: 5,
// },
// fabText: { color: '#fff', fontSize: 35, fontWeight: '300' }
// });