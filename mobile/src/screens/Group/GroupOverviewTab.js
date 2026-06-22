import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { BASE_URL } from '../../config';

export default function GroupOverviewTab({ route }) {
    const groupId  = route?.params?.groupId;
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused();

    const fetchGallery = async () => {
        console.log("=== DEBUG GALLERY ===");
        console.log("GroupId nhận được từ Tab Cha:", groupId);

        if (!groupId) {
            console.log("LỖI: Không nhận được groupId từ MainScreen!");
            setLoading(false);
            return;
        }
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.get(`${BASE_URL}/groups/${groupId}/gallery`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGallery(response.data.data);
        } catch (error) {
            console.error('Lỗi tải gallery:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchGallery();
        }
    }, [isFocused]);

    // Render từng bức ảnh chuẩn style Locket (Bo góc sâu)
    const renderGalleryItem = ({ item }) => (
        <TouchableOpacity activeOpacity={0.9} style={styles.imageContainer}>
            <View style={styles.imageWrapper}>
                <Image source={{ uri: item.image_url }} style={styles.image} />
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#4CAF50" /></View>;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={gallery}
                keyExtractor={(item) => item.log_id.toString()}
                renderItem={renderGalleryItem}
                numColumns={3} // ⚡ ÉP FLATLIST CHIA 3 CỘT
                contentContainerStyle={styles.listPadding} 
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Phòng truyền thống đang trống</Text>
                        <Text style={styles.emptySubText}>Chưa có minh chứng nào được duyệt. Hãy kêu gọi anh em nộp bài ngay!</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // ⚡ Nền trắng sáng sủa
    container: { 
        flex: 1, 
        backgroundColor: '#FFFFFF' 
    }, 
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
    
    listPadding: {
        paddingHorizontal: 8,
        paddingTop: 16,
        paddingBottom: 40,
    },

    // --- CSS BO GÓC SÂU TRÊN NỀN TRẮNG ---
    imageContainer: {
        flex: 1/3,          
        aspectRatio: 1,     
        padding: 2,         // Khoảng hở giữa các ảnh
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F5F5F5', // Nền chờ ảnh màu xám nhạt cho đồng bộ nền trắng
        borderRadius: 12,   // ⚡ Đặc sản bo góc sâu như Locket
        overflow: 'hidden', 
        elevation: 2,       // Đổ bóng nhẹ nhàng thanh lịch
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    // ⚡ Đổi màu chữ thành màu tối để hiển thị rõ trên nền trắng
    emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyText: { color: '#212121', fontSize: 16, fontWeight: 'bold' },
    emptySubText: { color: '#757575', fontSize: 14, marginTop: 10, textAlign: 'center', lineHeight: 20 }
});