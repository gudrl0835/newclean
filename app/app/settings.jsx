import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { authApi } from '../src/api/auth';
import { companyApi } from '../src/api/company';
import useAuthStore from '../src/store/authStore';
import { SIDO_LIST, SIGUNGU_MAP } from '../src/constants/regions';

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function Settings() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');

  // 업체 프로필은 지역 외 필드(설명/이미지/가격 등)도 있어서, 저장 시 전체를 다시 보내야
  // 기존 값이 null로 덮어써지지 않는다 - 조회한 원본을 들고 있다가 바뀐 필드만 얹어서 PUT
  const [companyProfile, setCompanyProfile] = useState(null);
  const [sido, setSido] = useState('');
  const [sigungu, setSigungu] = useState('');
  const [addressDetail, setAddressDetail] = useState('');

  const [changingPw, setChangingPw] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  useEffect(() => {
    authApi
      .getMe()
      .then(async (res) => {
        const me = res.data;
        setRole(me.role);
        setName(me.name || '');
        setPhone(me.phone || '');
        setNickname(me.nickname || '');

        if (me.role === 'COMPANY') {
          const profileRes = await companyApi.getMyProfile();
          setCompanyProfile(profileRes.data);
          setSido(profileRes.data.sido || '');
          setSigungu(profileRes.data.sigungu || '');
          setAddressDetail(profileRes.data.addressDetail || '');
        }
      })
      .catch(() => Alert.alert('개인설정을 불러오지 못했어요.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('이름을 입력해주세요.');
    if (role === 'CUSTOMER' && !nickname.trim()) return Alert.alert('닉네임을 입력해주세요.');
    setSaving(true);
    try {
      const meRes = await authApi.updateMe({ name, phone, nickname });
      if (role === 'COMPANY' && companyProfile) {
        if (!sido) return Alert.alert('시/도를 선택해주세요.');
        if (!sigungu.trim()) return Alert.alert('시/군/구를 입력해주세요.');
        await companyApi.updateProfile({
          description: companyProfile.description,
          profileImage: companyProfile.profileImage,
          serviceRadius: companyProfile.serviceRadius,
          basePrice: companyProfile.basePrice,
          latitude: companyProfile.latitude,
          longitude: companyProfile.longitude,
          sido,
          sigungu,
          addressDetail,
        });
      }
      updateUser({ name: meRes.data.name, phone: meRes.data.phone });
      Alert.alert('저장되었습니다.');
    } catch (err) {
      Alert.alert(err.response?.data?.message || '저장에 실패했어요.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) return Alert.alert('새 비밀번호는 8자 이상이어야 합니다.');
    if (newPassword !== newPasswordConfirm) return Alert.alert('새 비밀번호가 일치하지 않습니다.');
    setChangingPw(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
      Alert.alert('비밀번호가 변경되었습니다.');
    } catch (err) {
      Alert.alert(err.response?.data?.message || '비밀번호 변경에 실패했어요.');
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  const sigunguList = SIGUNGU_MAP[sido] || [];

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text className="text-lg font-bold text-gray-900 mb-4">기본 정보</Text>

      <Text className="text-sm font-semibold text-gray-700 mb-2">이름</Text>
      <TextInput value={name} onChangeText={setName} placeholder="이름" className="input-base mb-4" />

      {role === 'CUSTOMER' && (
        <>
          <Text className="text-sm font-semibold text-gray-700 mb-2">닉네임</Text>
          <Text className="text-xs text-gray-400 mb-2">리뷰/채팅에서 실명 대신 보여줄 이름이에요</Text>
          <TextInput value={nickname} onChangeText={setNickname} placeholder="닉네임" className="input-base mb-4" />
        </>
      )}

      <Text className="text-sm font-semibold text-gray-700 mb-2">전화번호</Text>
      <TextInput
        value={phone}
        onChangeText={(v) => setPhone(formatPhone(v))}
        placeholder="010-0000-0000"
        keyboardType="phone-pad"
        className="input-base mb-4"
      />

      {role === 'COMPANY' && (
        <View className="mb-2">
          <Text className="text-sm font-semibold text-gray-700 mb-2">활동 지역 (시/도)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {SIDO_LIST.map((s) => (
              <Pressable
                key={s}
                onPress={() => { setSido(s); setSigungu(''); }}
                className={`px-4 py-2 rounded-full mr-2 ${sido === s ? 'bg-blue-500' : 'bg-white border border-gray-200'}`}
              >
                <Text className={`text-sm font-medium ${sido === s ? 'text-white' : 'text-gray-600'}`}>{s}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text className="text-sm font-semibold text-gray-700 mb-2">시/군/구</Text>
          {sigunguList.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {sigunguList.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setSigungu(s)}
                  className={`px-4 py-2 rounded-full mr-2 ${sigungu === s ? 'bg-blue-500' : 'bg-white border border-gray-200'}`}
                >
                  <Text className={`text-sm font-medium ${sigungu === s ? 'text-white' : 'text-gray-600'}`}>{s}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <TextInput value={sigungu} onChangeText={setSigungu} placeholder="시/군/구 직접 입력" className="input-base mb-4" />
          )}

          <Text className="text-sm font-semibold text-gray-700 mb-2">상세 주소 (선택)</Text>
          <TextInput value={addressDetail} onChangeText={setAddressDetail} placeholder="상세 주소" className="input-base mb-4" />
        </View>
      )}

      <Pressable onPress={handleSave} disabled={saving} className="btn-primary mt-2" style={{ opacity: saving ? 0.6 : 1 }}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text className="btn-primary-text">정보 저장</Text>}
      </Pressable>

      <View className="h-8" />
      <Text className="text-lg font-bold text-gray-900 mb-4">비밀번호 변경</Text>

      <TextInput
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="현재 비밀번호"
        secureTextEntry
        className="input-base mb-3"
      />
      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="새 비밀번호 (8자 이상)"
        secureTextEntry
        className="input-base mb-3"
      />
      <TextInput
        value={newPasswordConfirm}
        onChangeText={setNewPasswordConfirm}
        placeholder="새 비밀번호 확인"
        secureTextEntry
        className="input-base mb-4"
      />

      <Pressable
        onPress={handleChangePassword}
        disabled={changingPw || !currentPassword || !newPassword}
        className="btn-outline"
        style={{ opacity: changingPw || !currentPassword || !newPassword ? 0.6 : 1 }}
      >
        {changingPw ? <ActivityIndicator color="#1E90FF" /> : <Text className="btn-outline-text">비밀번호 변경</Text>}
      </Pressable>
    </ScrollView>
  );
}
