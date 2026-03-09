import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const GoalCard = ({ title, description, progress = 0 }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={1}>{description}</Text>
      </View>
      
      {/* Một vòng tròn hoặc icon đại diện cho tiến độ */}
      <View style={styles.progressCircle}>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Đổ bóng cho "xịn"
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  info: { flex: 1, marginRight: 10 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#2d5a27', marginBottom: 5 },
  description: { fontSize: 14, color: '#666' },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#2d5a27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: { fontSize: 12, fontWeight: 'bold', color: '#2d5a27' },
});

export default GoalCard;