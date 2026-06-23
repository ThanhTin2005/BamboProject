import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios'; // ⚡ THÊM IMPORT AXIOS
import { BASE_URL } from '../../config';

export default function CreateGroupScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const pickGroupImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Từ chối', 'Ông phải cấp quyền truy cập ảnh để chọn hình nhóm!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], 
            quality: 0.7,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    // ⚡ FIX: HÀM GỌI API ĐƯỢC CHUYỂN SANG AXIOS CHUẨN BÀI
    const handleCreate = async () => {
        if (!title.trim()) {
            Alert.alert('Lỗi', 'Cần đặt tên mục tiêu cho nhóm.');
            return;
        }
        
        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('userToken'); 
            
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            
            if (imageUri) {
                // ⚡ FIX: Xử lý đường dẫn file chuẩn xác cho Android/iOS
                formData.append('image', {
                    uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
                    type: 'image/jpeg',
                    name: `group_cover_${Date.now()}.jpg`
                });
            }

            // ⚡ FIX: Dùng axios giống y hệt màn HomeScreen
            const response = await axios.post(`${BASE_URL}/groups`, formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' // Bắt buộc phải có khi gửi ảnh
                }
            });

            if (response.status === 200 || response.status === 201) {
                Alert.alert('Thành công', 'Nhóm đã được tạo.');
                navigation.goBack();
            }
        } catch (error) {
            // ⚡ In ra terminal xem Backend đang mắng lỗi gì (rất quan trọng)
            console.error("Lỗi từ Backend trả về:", error.response?.data || error.message);
            
            // Lấy chính xác câu báo lỗi của Backend để hiện lên màn hình
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Mất kết nối đến máy chủ.';
            Alert.alert('Lỗi', errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.container}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#212121" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Tạo nhóm</Text>
                    <View style={{width: 24}} />
                </View>

                <View style={styles.formArea}>
                    
                    <TouchableOpacity onPress={pickGroupImage} style={styles.imageSelector} activeOpacity={0.8}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.selectedImg} />
                        ) : (
                            <View style={styles.placeholderContainer}>
                                <Ionicons name="camera-outline" size={32} color="#999" />
                                <Text style={styles.imagePlaceholderText}>Chọn ảnh mục tiêu</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.label}>Mục tiêu của nhóm</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="flag-outline" size={18} color="#999" style={styles.inputIcon} />
                        <TextInput 
                            style={styles.input} 
                            value={title} 
                            onChangeText={setTitle} 
                            placeholder="Ví dụ: Dậy 5 giờ mỗi ngày ..." 
                            placeholderTextColor="#999" 
                        />
                    </View>
                    
                    <Text style={styles.label}>Quy định chung </Text>
                    <View style={[styles.inputContainer, styles.textAreaContainer]}>
                        <Ionicons name="create-outline" size={18} color="#999" style={[styles.inputIcon, {marginTop: 15}]} />
                        <TextInput 
                            style={[styles.input, styles.textArea]} 
                            value={description} 
                            onChangeText={setDescription} 
                            placeholder="Ví dụ : Minh chứng hằng ngày. " 
                            placeholderTextColor="#999" 
                            multiline 
                            numberOfLines={4} 
                            textAlignVertical="top"
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
                                <Text style={styles.buttonText}>Tạo nhóm</Text>
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
    scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: StatusBar.currentHeight || 40, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, marginBottom: 20 },
    headerTitle: { color: '#212121', fontSize: 18, fontWeight: 'bold' },
    backBtn: { padding: 5 },
    formArea: { flex: 1, alignItems: 'center' },
    
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
    inputIcon: { marginLeft: 15 },
    input: { flex: 1, color: '#212121', padding: 15, fontSize: 15 },
    textAreaContainer: { alignItems: 'flex-start', height: 120 },
    textArea: { height: '100%', textAlignVertical: 'top' },
    button: { flexDirection: 'row', backgroundColor: '#4CAF50', padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 10, elevation: 2 },
    buttonDisabled: { backgroundColor: '#A5D6A7' },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});