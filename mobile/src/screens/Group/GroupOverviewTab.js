import React from 'react';
import { View, Text } from 'react-native';

export default function GroupOverviewTab() {
    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#666666', fontStyle: 'italic', fontSize: 15 }}>
                [Tab Trái] Thư viện ảnh chung & Heatmap đang trống
            </Text>
        </View>
    );
}