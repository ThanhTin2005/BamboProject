import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import GoalCard from '../components/GoalCard';

export default function HomeScreen() {
  // Dữ liệu mẫu để test giao diện Day 9
  const [goals, setGoals] = useState([
    { id: '1', title: 'Học Tiếng Anh IELTS', description: 'Luyện nghe 30p mỗi ngày', progress: 45 },
    { id: '2', title: 'Chạy bộ buổi sáng', description: 'Chạy 3km quanh hồ Tây', progress: 80 },
    { id: '3', title: 'Học React Native', description: 'Xây dựng xong dự án Bambo', progress: 20 },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Chào Tín! 🎋</Text>
        <Text style={styles.subGreeting}>Hôm nay ông đã gieo mầm gì chưa?</Text>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GoalCard 
            title={item.title} 
            description={item.description} 
            progress={item.progress} 
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF8' }, // Màu nền hơi xanh nhẹ
  header: { padding: 25, paddingTop: 40, marginBottom: 10 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#2d5a27' },
  subGreeting: { fontSize: 16, color: '#666', marginTop: 5 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
});