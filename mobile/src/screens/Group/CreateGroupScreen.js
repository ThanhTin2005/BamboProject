import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator } from 'react-native';
// Đã dọn dẹp import bị lặp
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL } from '../../config';

export default function CreateGroupScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState(null);
    
    const [isTitleFocused, setTitleFocused] = useState(false);
    const [isDescFocused, setDescFocused] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ⚡ Hàm mở Thư viện chọn ảnh
    const pickGroupImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Từ chối', 'Ông phải cấp quyền truy cập ảnh để chọn hình nhóm!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Ép tỷ lệ 1:1 cho vuông vắn
            quality: 0.7,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleCreate = async () => {
        if (!title.trim()) {
            Alert.alert('Lỗi', 'Cần đặt tên mục tiêu cho Bụi tre của ông.');
            return;
        }
        
        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('userToken'); 
            
            // ⚡ Chuyển sang dùng FormData để gửi kèm ảnh
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('max_members', 4); // Cứng 4 người
            
            if (imageUri) {
                formData.append('image', {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: `group_cover_${Date.now()}.jpg`
                });
            }

            const response = await fetch(`${BASE_URL}/groups`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                    // Không set Content-Type, trình duyệt/RN sẽ tự xử lý multipart boundary
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Thành công', 'Khế ước đã được lập! Hãy mời đồng đội vào sinh tồn.');
                // Trở về màn hình Index để thấy nhóm mới xuất hiện
                navigation.goBack();
            } else {
                Alert.alert('Lỗi', data.message || 'Lập khế ước thất bại.');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Mất kết nối đến máy chủ.');
        } finally {
            setIsSubmitting(false);
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

                    {/* ⚡ KHUNG CHỌN ẢNH ĐẠI DIỆN NHÓM */}
                    <TouchableOpacity onPress={pickGroupImage} style={styles.imageSelector} activeOpacity={0.8}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.selectedImg} />
                        ) : (
                            <View style={styles.placeholderContainer}>
                                <Ionicons name="camera-outline" size={32} color="#999" />
                                <Text style={styles.imagePlaceholderText}>Chọn ảnh mục tiêu (Không bắt buộc)</Text>
                            </View>
                        )}
                    </TouchableOpacity>

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

                    <TouchableOpacity 
                        style={[styles.button, isSubmitting && styles.buttonDisabled]} 
                        onPress={handleCreate} 
                        activeOpacity={0.8}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Khởi tạo Khế ước</Text>
                                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={styles.btnIconEnd} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { paddingHorizontal: 20, paddingTop: StatusBar.currentHeight || 40, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, marginBottom: 20 },
    headerTitle: { color: '#212121', fontSize: 18, fontWeight: 'bold' },
    backBtn: { padding: 5 },
    formArea: { flex: 1, alignItems: 'center' },
    formIcon: { marginBottom: 15 },
    formSubtitle: { color: '#666666', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 25, paddingHorizontal: 10 },
    
    // --- CSS KHUNG CHỌN ẢNH ---
    imageSelector: {
        width: 120,
        height: 120,
        backgroundColor: '#F9F9F9',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        overflow: 'hidden',
    },
    selectedImg: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderContainer: {
        alignItems: 'center',
        padding: 10,
    },
    imagePlaceholderText: {
        fontSize: 11,
        color: '#999',
        textAlign: 'center',
        marginTop: 5,
        fontStyle: 'italic',
    },

    label: { color: '#212121', fontSize: 14, fontWeight: '600', marginBottom: 10, alignSelf: 'flex-start', letterSpacing: 0.5 },
    inputContainer: { flexDirection: 'row', backgroundColor: '#F9F9F9', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 25, width: '100%', alignItems: 'center' },
    inputFocused: { borderColor: '#4CAF50', backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    inputIcon: { marginLeft: 15 },
    input: { flex: 1, color: '#212121', padding: 15, fontSize: 15 },
    textAreaContainer: { alignItems: 'flex-start', height: 120 },
    textArea: { height: '100%', textAlignVertical: 'top' },
    button: { flexDirection: 'row', backgroundColor: '#4CAF50', padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 10, elevation: 2 },
    buttonDisabled: { backgroundColor: '#A5D6A7' },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    btnIconEnd: { marginLeft: 10 }
});