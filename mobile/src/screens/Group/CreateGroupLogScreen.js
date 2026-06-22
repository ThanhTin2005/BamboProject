import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../config'; 

export default function CreateGroupLogScreen({ route, navigation }) {
    const { groupId } = route.params; 
    const [caption, setCaption] = useState('');
    const [mood, setMood] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const pickFromCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Lỗi', 'Cần quyền Máy ảnh!');
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7
        });
        if (!result.canceled) setImageUri(result.assets[0].uri);
    };

    const pickFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Lỗi', 'Cần quyền Thư viện!');
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7
        });
        if (!result.canceled) setImageUri(result.assets[0].uri);
    };

    const submitLog = async () => {
        if (isSubmitting) return;
        if (!imageUri || !caption) return Alert.alert("Khoan đã!", "Cần ảnh và caption minh chứng!");
        
        setIsSubmitting(true); 
        const formData = new FormData();
        formData.append('caption', caption);
        formData.append('mood', mood || 'Quyết tâm');
        formData.append('image', { uri: imageUri, type: 'image/jpeg', name: `group_${Date.now()}.jpg` });

        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${BASE_URL}/groups/${groupId}/logs`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData
            });

            if (response.ok) {
                Alert.alert("Thành công!", "Đã nộp minh chứng! Chờ Leader duyệt.");
                navigation.goBack();
            } else {
                Alert.alert("Lỗi", "Up bài xịt rồi!");
            }
        } catch (error) {
            Alert.alert("Lỗi kết nối", "Không thể gọi API.");
        } finally {
            setIsSubmitting(false); 
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="close" size={28} color="#333" /></TouchableOpacity>
                    <Text style={styles.headerTitle}>Nộp Minh Chứng</Text>
                    <View style={{width: 28}} />
                </View>

                <View style={styles.imageBox}>
                    {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : (
                        <View style={{ alignItems: 'center' }}><Ionicons name="image-outline" size={50} color="#999" /><Text style={styles.placeholderText}>Chưa có ảnh</Text></View>
                    )}
                </View>

                <View style={styles.mediaActionsContainer}>
                    <TouchableOpacity style={[styles.mediaBtn, styles.cameraBtn]} onPress={pickFromCamera}>
                        <Ionicons name="camera" size={20} color="#fff" /><Text style={styles.mediaBtnText}>Chụp Ảnh</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.mediaBtn, styles.galleryBtn]} onPress={pickFromGallery}>
                        <Ionicons name="images" size={20} color="#4CAF50" /><Text style={[styles.mediaBtnText, { color: '#4CAF50' }]}>Thư Viện</Text>
                    </TouchableOpacity>
                </View>

                <TextInput placeholder="Ông đã hoàn thành mục tiêu thế nào?" value={caption} onChangeText={setCaption} style={[styles.input, { height: 80 }]} multiline />
                <TouchableOpacity style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} onPress={submitLog} disabled={isSubmitting}>
                    {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Gửi vào nhóm</Text>}
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF', paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
    imageBox: { height: 300, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', borderRadius: 15, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dashed', marginBottom: 15, overflow: 'hidden' },
    image: { width: '100%', height: '100%', resizeMode: 'cover' },
    placeholderText: { color: '#999', fontSize: 14, marginTop: 10, fontStyle: 'italic' },
    mediaActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    mediaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, flex: 0.48 },
    cameraBtn: { backgroundColor: '#4CAF50' }, galleryBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#4CAF50' },
    mediaBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },
    input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#E0E0E0', padding: 15, marginTop: 15, borderRadius: 10, fontSize: 15 },
    submitButton: { backgroundColor: '#212121', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
    submitButtonDisabled: { backgroundColor: '#999' },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});