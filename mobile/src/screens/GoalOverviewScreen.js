import React, { useState, useCallback, useRef } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, Alert 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars'; 
import { BASE_URL } from '../config';

const formatDate = (dateObj) => {
  let month = '' + (dateObj.getMonth() + 1);
  let day = '' + dateObj.getDate();
  const year = dateObj.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
};

const GoalOverviewScreen = ({ route, navigation }) => {
  const { goalId, goalName } = route.params; 
  
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalLogs: 0, currentStreak: 0 });
  
  // ⚡ SỬA LỖI 1: Dùng useRef thay vì useState để thoát khỏi bẫy Stale Closure
  const isFirstLoad = useRef(true);

  const fetchAndProcessData = async () => {
    try {
      if (isFirstLoad.current) {
        setLoading(true);
      }
      
      const token = await AsyncStorage.getItem('userToken');
      
      // ⚡ SỬA LỖI 2: Thêm "?t=..." để đập tan bộ nhớ Cache của điện thoại, ép lấy data mới nhất
      const timestamp = new Date().getTime();
      const response = await axios.get(`${BASE_URL}/logs/${goalId}?t=${timestamp}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const logs = response.data.data || response.data;
      
      // 1. Lọc ra danh sách các ngày đã check-in (Đã fix lệch múi giờ UTC -> Local)
      const loggedDatesSet = new Set(logs.map(log => {
        // Biến chuỗi thời gian của Server thành Object Date theo múi giờ điện thoại (VN)
        const localDate = new Date(log.created_at);
        // Dùng luôn hàm formatDate ông viết ở trên để lấy ra chuẩn YYYY-MM-DD
        return formatDate(localDate); 
      }));
      
      let marks = {};
      loggedDatesSet.forEach(date => {
        marks[date] = {
          customStyles: {
            container: { 
              backgroundColor: '#39FF14', 
              elevation: 2, 
              shadowColor: '#39FF14', 
              shadowOpacity: 0.4, 
              shadowRadius: 4, 
              shadowOffset: { width: 0, height: 2 }, 
              borderRadius: 8 
            },
            text: { color: '#000', fontWeight: 'bold' }
          }
        };
      });

      const todayString = formatDate(new Date());
      if (!marks[todayString]) {
        marks[todayString] = {
          customStyles: {
            container: { borderWidth: 2, borderColor: '#2d5a27', borderRadius: 8 },
            text: { color: '#2d5a27', fontWeight: 'bold' }
          }
        };
      }

      let streakCount = 0;
      let checkDate = new Date();
      const hasToday = loggedDatesSet.has(todayString);
      
      if (!hasToday) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (true) {
        const dateStr = formatDate(checkDate);
        if (loggedDatesSet.has(dateStr)) {
          streakCount++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      setMarkedDates({ ...marks });
      setStats({ totalLogs: logs.length, currentStreak: streakCount });
      
      // Đánh dấu đã tải xong lần đầu
      isFirstLoad.current = false;

    } catch (error) {
      console.error("Lỗi lấy dữ liệu Lịch:", error);
    } finally {
      // ⚡ Tắt loading (Vì loading đang false sẵn ở các lần sau nên gọi hàm này cũng không gây giật màn hình)
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAndProcessData();
    }, [goalId])
  );

  const handleDayPress = (day) => {
    const todayString = formatDate(new Date());

    if (markedDates[day.dateString] && markedDates[day.dateString].customStyles?.container?.backgroundColor === '#39FF14') {
      Alert.alert("Tuyệt vời!", "Ngày này ông đã gieo mầm rồi 🌱");
      return;
    }
    
    if (day.dateString !== todayString) {
      Alert.alert("Kỷ luật thép!", "Không thể check-in bù cho quá khứ. Hãy tập trung vào hôm nay!");
      return;
    }

    navigation.navigate('CreateLog', { goalId, goalName });
  };

  return (
    <View style={styles.container}>
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

      <Text style={styles.sectionTitle}>Hành trình Gieo mầm</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#39FF14" style={{ marginTop: 50 }} />
      ) : (
        <View style={styles.calendarWrapper}>
          <Calendar
            key={`calendar-${stats.totalLogs}`} // ⚡ CHÌA KHÓA VÀNG: Ép Lịch vẽ lại khi tổng số mầm tăng lên
            markingType={'custom'}
            markedDates={markedDates}
            onDayPress={handleDayPress}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#39FF14',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#2d5a27',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              arrowColor: '#2d5a27',
              monthTextColor: '#2d5a27',
              textMonthFontWeight: 'bold',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13
            }}
          />
        </View>
      )}

      <Text style={styles.hintText}>
        Bấm vào ô của ngày hôm nay để check-in
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF8', padding: 20 },
  
  statsCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15,
    padding: 20, marginBottom: 25,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5
  },
  statBox: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: '#eee' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 13, color: '#888', marginTop: 4 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d5a27', marginBottom: 15 },
  
  calendarWrapper: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    backgroundColor: '#fff',
    paddingBottom: 10,
  },
  
  hintText: { textAlign: 'center', color: '#888', fontStyle: 'italic', marginTop: 30, fontSize: 13 }
});

export default GoalOverviewScreen;