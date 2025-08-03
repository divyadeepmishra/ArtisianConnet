// import React from 'react';
// import { Text, View, TouchableOpacity, StyleSheet, Image } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useAuth, useUser } from '@clerk/clerk-expo';
// import { Link, LinkProps } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';

// type ProfileMenuItemProps = {
//   href: LinkProps['href'];
//   icon: React.ComponentProps<typeof Ionicons>['name'];
//   title: string;
//   subtitle: string;
// };

// const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ href, icon, title, subtitle }) => (
//   <Link href={href} asChild>
//     <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
//       <View style={styles.iconContainer}>
//         <Ionicons name={icon} size={22} color="#2563EB" />
//       </View>
//       <View style={styles.textContainer}>
//         <Text style={styles.menuTitle}>{title}</Text>
//         <Text style={styles.menuSubtitle}>{subtitle}</Text>
//       </View>
//       <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
//     </TouchableOpacity>
//   </Link>
// );

// export default function ProfileScreen() {
//   const { user } = useUser();
//   const { signOut } = useAuth();

//   return (
//     <SafeAreaView style={styles.safeArea} edges={['top']}>
//       <View style={styles.container}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Image source={{ uri: user?.imageUrl }} style={styles.avatar} />
//           <View>
//             <Text style={styles.greeting}>Hello, {user?.firstName}</Text>
//             <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>
//           </View>
//         </View>

//         {/* Menu */}
//         <View style={styles.menuSection}>
//           <ProfileMenuItem
//             href="/"
//             icon="cube-outline"
//             title="My Orders"
//             subtitle="Track your purchase history"
//           />
//           <ProfileMenuItem
//             href="/wishlist"
//             icon="heart-outline"
//             title="My Wishlist"
//             subtitle="View your saved items"
//           />
//           <ProfileMenuItem
//             href="/help"
//             icon="headset-outline"
//             title="Help Center"
//             subtitle="Support from our AI assistant"
//           />
//           <ProfileMenuItem
//             href="/ai"
//             icon="sparkles-outline"
//             title="GenAI Playground"
//             subtitle="Create with AI tools"
//           />
//         </View>

//         {/* Sign Out */}
//         <TouchableOpacity onPress={() => signOut()} style={styles.signOutButton} activeOpacity={0.8}>
//           <Ionicons name="log-out-outline" size={22} color="#EF4444" />
//           <Text style={styles.signOutText}>Sign Out</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 10,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 28,
//   },
//   avatar: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     marginRight: 16,
//     backgroundColor: '#E5E7EB',
//   },
//   greeting: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#1F2937',
//   },
//   email: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   menuSection: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F3F4F6',
//     backgroundColor: '#FFFFFF',
//   },
//   iconContainer: {
//     padding: 8,
//     borderRadius: 10,
//     backgroundColor: '#E0F2FE',
//     marginRight: 14,
//   },
//   textContainer: {
//     flex: 1,
//   },
//   menuTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1F2937',
//   },
//   menuSubtitle: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   signOutButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 30,
//     paddingVertical: 14,
//     backgroundColor: '#FDF2F2',
//     borderRadius: 16,
//     borderColor: '#FECACA',
//     borderWidth: 1,
//   },
//   signOutText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#DC2626',
//     marginLeft: 8,
//   },
// });


import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Link, LinkProps } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type ProfileMenuItemProps = {
  href: LinkProps['href'];
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  // Added a color prop for custom icon backgrounds
  color: string;
};

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ href, icon, title, subtitle, color }) => (
  <Link href={href} asChild>
    <TouchableOpacity style={styles.menuItem}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={22} color="#1F2937" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  </Link>
);

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Main Screen Title */}
        <Text style={styles.screenTitle}>Account</Text>

        {/* User Header Section */}
        <View style={styles.header}>
          <Image source={{ uri: user?.imageUrl }} style={styles.avatar} />
          <View>
            <Text style={styles.greeting}>Hello, {user?.firstName}</Text>
            <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <ProfileMenuItem
            href="/" ///
            icon="cube-outline"
            title="My Orders"
            subtitle="Check your order history"
            color="#E0E7FF" // Soft Indigo
          />
          <ProfileMenuItem
            href="/wishlist"
            icon="heart-outline"
            title="My Wishlist"
            subtitle="View your saved items"
            color="#FEE2E2" // Soft Red
          />
          <ProfileMenuItem
            href="/help"
            icon="headset-outline"
            title="Help Center"
            subtitle="Get support and assistance"
            color="#D1FAE5" // Soft Green
          />
           <ProfileMenuItem
            href="/ai"
            icon="sparkles-outline"
            title="GenAI Playground"
            subtitle="Get creative with AI"
            color="#FEF3C7" // Soft Amber
          />
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity onPress={() => signOut()} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { padding: 24 },
  screenTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 24,
  },
  header: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#E5E7EB',
  },
  greeting: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#111827' 
  },
  email: { 
    fontSize: 14, 
    color: '#6B7280', 
    marginTop: 4 
  },
  menuSection: { 
    backgroundColor: 'white', 
    borderRadius: 16, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    // Removed the bottom border for a cleaner look
  },
  iconContainer: {
    padding: 10,
    borderRadius: 12, // Softer corners
    marginRight: 16,
  },
  textContainer: { flex: 1 },
  menuTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1F2937' 
  },
  menuSubtitle: { 
    fontSize: 13, // Slightly larger subtitle
    color: '#6B7280', 
    marginTop: 2 
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 40,
    backgroundColor: '#FDF2F2',
    borderColor: '#FECACA',
    borderWidth: 0.2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
});