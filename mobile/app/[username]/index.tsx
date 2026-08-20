import { useLocalSearchParams } from 'expo-router';
import { ProfileScreen } from '../../src/screens/ProfileScreen';

export default function UserProfileRoute() {
  const { username } = useLocalSearchParams<{ username: string }>();
  return <ProfileScreen username={username} />;
}
