import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ActivityIndicator, FlatList, Alert 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm hỗ trợ format ngày chuẩn YYYY-MM-DD để dễ so sánh
const formatDate = (dateObj) => {
  let month = '' + (dateObj.getMonth() + 1);
  let day = '' + dateObj.getDate();
  const year = dateObj.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
};

const GoalOverviewScreen = ({ route, navigation }) => {
  // Lấy dữ liệu từ file Tabs truyền xuống
  const { goalId, goalName } = route.params; 
  
  const [gridData, setGridData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalLogs: 0, currentStreak: 0 });

  // THUẬT TOÁN DAY 23: Lấy dữ liệu và tạo bảng lưới
  const fetchAndProcessData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      // Đảm bảo IP chuẩn của ông
      const response = await axios.get(`http://192.168.0.106:3000/api/logs/${goalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const logs = response.data.data || response.data;
      
      // 1. Tạo một "Rổ" chứa các ngày ĐÃ CHECK-IN (chỉ lấy phần YYYY-MM-DD)
      const loggedDates = new Set(
        logs.map(log => log.created_at.split('T')[0])
      );

      // 2. Tạo mảng 30 ngày gần nhất
      const daysArray = [];
      const todayString = formatDate(new Date());
      let streakCount = 0;
      let isStreakBroken = false;

      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = formatDate(d);
        
        // 3. So khớp: Ngày này có nằm trong "Rổ" đã check-in không?
        const isCompleted = loggedDates.has(dateString);
        
        daysArray.push({
          id: dateString,
          date: dateString,
          displayDate: d.getDate(), // Lấy ngày mùng mấy để hiển thị
          isCompleted: isCompleted,
          isToday: dateString === todayString
        });

        // (Bonus) Tính toán Streak lùi từ hôm nay
        if (i === 0 && !isCompleted) {
          // Hôm nay chưa làm thì chưa gãy streak (còn thời gian trong ngày)
        } else if (isCompleted && !isStreakBroken) {
          streakCount++;
        } else {
          isStreakBroken = true; // Hụt 1 ngày là gãy
        }
      }

      setGridData(daysArray);
      setStats({ totalLogs: logs.length, currentStreak: streakCount });

    } catch (error) {
      console.error("Lỗi lấy dữ liệu Grid:", error);
    } finally {
      setLoading(false);
    }
  };

  // Dùng useFocusEffect để tự động gọi lại API mỗi khi ông từ màn Check-in quay về
  useFocusEffect(
    useCallback(() => {
      fetchAndProcessData();
    }, [goalId])
  );

  // Xử lý sự kiện khi bấm vào ô vuông
  const handlePressSquare = (item) => {
    if (item.isCompleted) {
      Alert.alert("Tuyệt vời!", "Ngày này ông đã gieo mầm rồi 🌱");
      return;
    }
    
    if (!item.isToday) {
      Alert.alert("Kỷ luật thép!", "Không thể check-in bù cho quá khứ. Hãy tập trung vào hôm nay!");
      return;
    }

    // Đúng là hôm nay và chưa làm -> Chuyển sang màn Check-in
    navigation.navigate('CreateLog', { goalId, goalName });
  };

  // DAY 24: Vẽ giao diện từng ô vuông
  const renderSquare = ({ item }) => {
    return (
      <TouchableOpacity 
        style={[
          styles.square,
          item.isCompleted ? styles.squareCompleted : styles.squareEmpty,
          item.isToday && !item.isCompleted ? styles.squareToday : null
        ]}
        activeOpacity={0.7}
        onPress={() => handlePressSquare(item)}
      >
        {item.isCompleted ? (
          <Text style={styles.iconText}>🎍</Text>
        ) : (
          <Text style={styles.dateText}>{item.displayDate}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Thông số */}
      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.currentStreak} 🔥</Text>
          <Text style={styles.statLabel}>Chuỗi ngày</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalLogs} 🌱</Text>
          <Text style={styles.statLabel}>Tổng mầm</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Bức tranh Kỷ luật (30 ngày)</Text>

      {/* Bảng lưới */}
      {loading ? (
        <ActivityIndicator size="large" color="#39FF14" style={{ marginTop: 50 }} />
      ) : (
        <View style={styles.gridContainer}>
          <FlatList
            data={gridData}
            renderItem={renderSquare}
            keyExtractor={(item) => item.id}
            numColumns={6} // Tự động dàn thành 6 cột
            columnWrapperStyle={styles.row}
            scrollEnabled={false} // Khóa cuộn vì 30 ô nằm vừa in
          />
        </View>
      )}

      {/* Hướng dẫn nhỏ */}
      <Text style={styles.hintText}>
        *Bấm vào ô của ngày hôm nay (viền xanh) để gieo mầm
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF8', padding: 20 },
  
  // Stats
  statsCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15,
    padding: 20, marginBottom: 25,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5
  },
  statBox: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: '#eee' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 13, color: '#888', marginTop: 4 },
  
  // Grid
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d5a27', marginBottom: 15 },
  gridContainer: { alignItems: 'center' },
  row: { justifyContent: 'flex-start', width: '100%', marginBottom: 10 },
  
  // Squares
  square: {
    width: '14.5%', // Chừa chút khoảng trống giữa 6 cột
    aspectRatio: 1, // Hình vuông tuyệt đối
    marginRight: '2%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareEmpty: {
    backgroundColor: '#EAEAEA',
  },
  squareCompleted: {
    backgroundColor: '#39FF14', // Xanh Neon rực rỡ
    elevation: 2, shadowColor: '#39FF14', shadowOpacity: 0.4, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }
  },
  squareToday: {
    borderWidth: 2,
    borderColor: '#2d5a27', // Viền xanh đậm nhấn mạnh ngày hôm nay
    backgroundColor: '#fff',
  },
  
  // Texts inside squares
  iconText: { fontSize: 16 },
  dateText: { fontSize: 12, color: '#999', fontWeight: 'bold' },
  
  hintText: { textAlign: 'center', color: '#888', fontStyle: 'italic', marginTop: 30, fontSize: 13 }
});

export default GoalOverviewScreen;