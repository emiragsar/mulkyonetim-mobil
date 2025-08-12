import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

const Settings = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(screens)/Login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const settingsItems = [
    {
      title: 'Profil',
      icon: 'person-outline',
      onPress: () => router.push('/(setting)/(profile)/ProfileSettings'),
    },
    {
      title: 'İletişim Ayarları',
      icon: 'call-outline',
      onPress: () => router.push('/(setting)/ContactSettings'),
    },
    {
      title: 'Dil Ayarları',
      icon: 'language-outline',
      onPress: () => router.push('/(setting)/LanguageSettings'),
    },
    {
      title: 'Geri Bildirim',
      icon: 'chatbubble-outline',
      onPress: () => router.push('/(setting)/(other)/Feedback'),
    },
    {
      title: 'Kullanıcı Sözleşmesi',
      icon: 'document-text-outline',
      onPress: () => router.push('/(setting)/(legal)/UserAgreement'),
    },
    {
      title: 'Gizlilik Politikası',
      icon: 'shield-checkmark-outline',
      onPress: () => router.push('/(setting)/(legal)/PrivacyAgreement'),
    },
    {
      title: 'KVKK',
      icon: 'lock-closed-outline',
      onPress: () => router.push('/(setting)/(legal)/kvkk'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* User Info Section */}
      <View style={styles.userSection}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={60} color="#09b2e5" />
        </View>
        <Text style={styles.userName}>
          {user?.ad} {user?.soyad}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.userRole}>
          {user?.admin ? 'Admin' : 
           user?.ev_sahibi ? 'Ev Sahibi' :
           user?.kiraci ? 'Kiracı' :
           user?.usta ? 'Usta' :
           user?.yatirimci ? 'Yatırımcı' : 'Kullanıcı'}
        </Text>
      </View>

      {/* Settings Items */}
      <View style={styles.settingsSection}>
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.settingItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <Ionicons name={item.icon} size={24} color="#2c3e50" />
              <Text style={styles.settingItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Section */}
      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.versionSection}>
        <Text style={styles.versionText}>Versiyon 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userSection: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 12,
    color: '#09b2e5',
    fontWeight: '500',
  },
  settingsSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    borderRadius: 10,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
  },
  logoutSection: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  logoutButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  logoutText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '500',
    marginLeft: 8,
  },
  versionSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#95a5a6',
  },
});

export default Settings;
