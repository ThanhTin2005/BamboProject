import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  ActivityIndicator,
  RefreshControl, // Thêm cái này để vuốt xuống tải lại trang
  TouchableOpacity
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoalCard from '../components/GoalCard';

export default function HomeScreen({navigation}) {
  const [goals, setGoals] = useState([]); // 1. Khởi tạo mảng rỗng
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 2. Hàm gọi API "thần thánh"
  const fetchGoals = async () => {//fetch = get : lấy dữ liệu
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // Thay đúng IP máy tính của ông vào đây
      const response = await axios.get('http://192.168.0.104:3000/api/goals', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setGoals(response.data); // 3. Đổ dữ liệu thật vào biến trạng thái goals để hiển thị ra màn hình . 
    } catch (error) {
      console.error("Lỗi Day 10:", error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 4. Tự động chạy khi vừa mở App
  // useEffect(() => {
  //   fetchGoals();
  // }, []);//Mảng phụ thuộc là một mảng rỗng thì hàm useEffect sẽ chỉ thực hiện một lần 
  useEffect(() => {
  // 1. Gọi lấy dữ liệu lần đầu tiên khi App vừa load
  fetchGoals();

  // 2. Thiết lập "thám tử" lắng nghe sự kiện 'focus'
  // 'focus' là sự kiện xảy ra mỗi khi người dùng nhìn thấy màn hình này
  const unsubscribe = navigation.addListener('focus', () => {
    console.log("Màn hình Home đã được focus - Đang làm mới dữ liệu...");
    fetchGoals(); 
  });

  // 3. Quan trọng: Dọn dẹp thám tử khi không dùng nữa để App không bị tốn RAM
  return unsubscribe;
}, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGoals();
  };//Mỗi khi onRefresh được gọi thì biến refresh sẽ được cập nhật thành true và gọi đến hàm fetchGoals()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hành trình Bambo 🎍</Text>
        <Text style={styles.subGreeting}>Dữ liệu thật từ Database của ông đây!</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2d5a27" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.goal_id.toString()} // MySQL dùng goal_id
          renderItem={({ item }) => (
            <GoalCard 
              title={item.title} 
              description={item.description} 
              progress={0} // Day 22 mình sẽ tính toán % sau
              coverImage={item.cover_image_url || 'leaf'} // phải dùng coverImage chứ k dùng iconName vì thẻ GoalCard được viết trong file GoalCard.js sử dụng thuộc tính coverImage(day14) chứ k còn dùng thuộc tính iconName(ngày 13) nữa
              color={item.color || '#2d5a27'} // Dùng màu sắc từ DB nếu có, nếu không thì mặc định
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có "mầm tre" nào trong DB. Hãy dùng Thunder Client thêm thử 1 cái!</Text>
          }
        />
        
        
      )}
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => navigation.navigate('NewGoal')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF8' },
  header: { padding: 25, paddingTop: 40, marginBottom: 10 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#2d5a27' },
  subGreeting: { fontSize: 16, color: '#666', marginTop: 5 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontStyle: 'italic' },
  fab: {
  position: 'absolute',
  bottom: 30,
  right: 30,
  backgroundColor: '#2d5a27',
  width: 65,
  height: 65,
  borderRadius: 33,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
},
fabText: { color: '#fff', fontSize: 35, fontWeight: '300' }
});