import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { Ionicons } from '@expo/vector-icons';

export default function CreateGroupScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isTitleFocused, setTitleFocused] = useState(false);
    const [isDescFocused, setDescFocused] = useState(false);

    const handleCreate = async () => {
        if (!title.trim()) {
            Alert.alert('Lỗi', 'Cần đặt tên cho Bụi tre của ông.');
            return;
        }
        try {
            const token = await AsyncStorage.getItem('userToken'); 
            const response = await axios.post(`${BASE_URL}/groups`, { title, description }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Thành công', 'Khế ước đã được lập! Hãy mời đồng đội vào sinh tồn.');
            navigation.replace('GroupMain', { group: response.data.group });
        } catch (error) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Lập khế ước thất bại.');
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#212121" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lập Khế Ước Mới</Text>
                    <View style={{width: 24}} />
                </View>

                <View style={styles.formArea}>
                    <Ionicons name="leaf" size={60} color="#4CAF50" style={styles.formIcon} />
                    <Text style={styles.formSubtitle}>Khởi tạo một Bụi tre mới, nơi ông và 3 người anh em khác cùng sinh tồn, kỷ luật.</Text>

                    <Text style={styles.label}>Mục tiêu của Bụi tre</Text>
                    <View style={[styles.inputContainer, isTitleFocused && styles.inputFocused]}>
                        <Ionicons name="flag-outline" size={18} color={isTitleFocused ? "#4CAF50" : "#999"} style={styles.inputIcon} />
                        <TextInput 
                            style={styles.input} 
                            value={title} 
                            onChangeText={setTitle} 
                            placeholder="Ví dụ: Thức giấc 5AM, Code 2h mỗi ngày..." 
                            placeholderTextColor="#999" 
                            onFocus={() => setTitleFocused(true)}
                            onBlur={() => setTitleFocused(false)}
                        />
                    </View>
                    
                    <Text style={styles.label}>Mô tả khế ước (Quy định chung)</Text>
                    <View style={[styles.inputContainer, styles.textAreaContainer, isDescFocused && styles.inputFocused]}>
                        <Ionicons name="create-outline" size={18} color={isDescFocused ? "#4CAF50" : "#999"} style={[styles.inputIcon, {marginTop: 15}]} />
                        <TextInput 
                            style={[styles.input, styles.textArea]} 
                            value={description} 
                            onChangeText={setDescription} 
                            placeholder="Ghi lại các hình phạt nếu phạm lỗi..." 
                            placeholderTextColor="#999" 
                            multiline 
                            numberOfLines={4} 
                            textAlignVertical="top"
                            onFocus={() => setDescFocused(true)}
                            onBlur={() => setDescFocused(false)}
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleCreate} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Khởi tạo Khế ước</Text>
                        <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={styles.btnIconEnd} />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { paddingHorizontal: 20, paddingTop: StatusBar.currentHeight || 40, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, marginBottom: 30 },
    headerTitle: { color: '#212121', fontSize: 18, fontWeight: 'bold' },
    backBtn: { padding: 5 },
    formArea: { flex: 1, alignItems: 'center' },
    formIcon: { marginBottom: 20 },
    formSubtitle: { color: '#666666', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 40, paddingHorizontal: 10 },
    label: { color: '#212121', fontSize: 14, fontWeight: '600', marginBottom: 10, alignSelf: 'flex-start', letterSpacing: 0.5 },
    inputContainer: { flexDirection: 'row', backgroundColor: '#F9F9F9', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 25, width: '100%', alignItems: 'center' },
    inputFocused: { borderColor: '#4CAF50', backgroundColor: '#FFFFFF' },
    inputIcon: { marginLeft: 15 },
    input: { flex: 1, color: '#212121', padding: 15, fontSize: 15 },
    textAreaContainer: { alignItems: 'flex-start', height: 120 },
    textArea: { height: '100%', textAlignVertical: 'top' },
    button: { flexDirection: 'row', backgroundColor: '#4CAF50', padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 20, elevation: 1 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    btnIconEnd: { marginLeft: 10 }
});