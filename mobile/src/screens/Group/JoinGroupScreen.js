import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function JoinGroupScreen({ navigation }) {
    const [groupId, setGroupId] = useState('');
    const [isFocused, setFocused] = useState(false);

    const handleJoin = async () => {
        const cleanId = groupId.replace(/[^0-9]/g, '');
        if (!cleanId) {
            Alert.alert('Lỗi', 'Nhập mã ID nhóm bằng số.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('userToken'); 
            const response = await axios.post(`${BASE_URL}/groups/join`, { groupId: cleanId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Thành công', 'Đã gia nhập khế ước! Hãy bắt đầu sinh tồn.');
            navigation.replace('GroupMain', { group: response.data.group });
        } catch (error) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Gia nhập Bụi tre thất bại.');
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#212121" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Gia Nhập Khế Ước</Text>
                        <View style={{width: 24}} /> 
                    </View>

                    <View style={styles.content}>
                        <FontAwesome5 name="key" size={60} color="#4CAF50" style={styles.icon} />
                        <Text style={styles.title}>Nhập Mã Nhóm</Text>
                        <Text style={styles.subtitle}>Nhập mã Invite Code được Trưởng nhóm chia sẻ để cùng gia nhập khế ước.</Text>

                        <View style={[styles.inputWrapper, isFocused && styles.inputFocused]}>
                            <Text style={styles.hashTag}>#</Text>
                            <TextInput 
                                style={styles.input} 
                                value={groupId} 
                                onChangeText={setGroupId} 
                                placeholder="00" 
                                placeholderTextColor="#CCCCCC" 
                                keyboardType="numeric" 
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                                maxLength={5} 
                                autoFocus={true} 
                            />
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleJoin} activeOpacity={0.8}>
                            <Text style={styles.buttonText}>Tham gia nhóm</Text>
                            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={styles.btnIconEnd} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    inner: { flex: 1, paddingHorizontal: 20, paddingTop: StatusBar.currentHeight || 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, marginBottom: StatusBar.currentHeight ? 20 : 0 },
    headerTitle: { color: '#212121', fontSize: 18, fontWeight: 'bold' },
    backBtn: { padding: 5 },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 }, 
    icon: { marginBottom: 30 },
    title: { color: '#212121', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    subtitle: { color: '#666666', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 50, paddingHorizontal: 20 },
    
    inputWrapper: { flexDirection: 'row', backgroundColor: '#F9F9F9', borderRadius: 16, borderWidth: 2, borderColor: '#E0E0E0', paddingVertical: 15, paddingHorizontal: 25, alignItems: 'center', marginBottom: 40 },
    inputFocused: { borderColor: '#4CAF50', backgroundColor: '#FFFFFF' },
    hashTag: { color: '#999999', fontSize: 32, fontWeight: 'bold', marginRight: 10 },
    input: { color: '#4CAF50', fontSize: 40, fontWeight: 'bold', minWidth: 100, textAlign: 'center', letterSpacing: 2 },
    
    button: { flexDirection: 'row', backgroundColor: '#4CAF50', padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', width: '100%', elevation: 1 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    btnIconEnd: { marginLeft: 10 }
});