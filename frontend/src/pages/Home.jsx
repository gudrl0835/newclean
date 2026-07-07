import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import { MdMyLocation } from 'react-icons/md';
import CompanyCard from '../components/company/CompanyCard';
import { companyApi } from '../api/company';

const SIDO_LIST = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

const SIGUNGU_MAP = {
  '서울': ['강남구','강동구','강북구','강서구','관악구','광진구','구로구','금천구','노원구','도봉구','동대문구','동작구','마포구','서대문구','서초구','성동구','성북구','송파구','양천구','영등포구','용산구','은평구','종로구','중구','중랑구'],
  '경기': ['수원시','성남시','고양시','용인시','부천시','안산시','안양시','남양주시','화성시','평택시','의정부시','파주시','광명시','시흥시','군포시','하남시','오산시','이천시','안성시','김포시','양주시','구리시','포천시','의왕시','여주시'],
  '인천': ['계양구','남동구','동구','미추홀구','부평구','서구','연수구','중구'],
  '부산': ['강서구','금정구','남구','동구','동래구','부산진구','북구','사상구','사하구','서구','수영구','연제구','영도구','중구','해운대구'],
  '대구': ['남구','달서구','달성군','동구','북구','서구','수성구','중구'],
  '광주': ['광산구','남구','동구','북구','서구'],
  '대전': ['대덕구','동구','서구','유성구','중구'],
  '울산': ['남구','동구','북구','울주군','중구'],
};

export default function Home() {
  const navigate = useNavigate();
  const [sido, setSido] = useState('');
  const [sigungu, setSigungu] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMsg, setLocationMsg] = useState('');
  const [topCompanies, setTopCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const sigunguList = SIGUNGU_MAP[sido] || [];

  // 승인된 인기 업체 불러오기
  useEffect(() => {
    companyApi.getTopCompanies()
      .then(res => setTopCompanies(res.data))
      .catch(() => setTopCompanies([]))
      .finally(() => setLoadingCompanies(false));
  }, []);

  const getLocationByIP = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      const cityMap = {
        'Seoul':'서울','Busan':'부산','Incheon':'인천','Daegu':'대구',
        'Daejeon':'대전','Gwangju':'광주','Ulsan':'울산','Suwon':'경기',
        'Seongnam':'경기','Goyang':'경기','Yongin':'경기','Jeju':'제주',
      };
      const detected = cityMap[data.city] || cityMap[data.region] || '';
      if (detected) {
        setSido(detected);
        setLocationMsg(`📍 ${detected} 근처로 자동 설정했어요`);
      }
    } catch { /* 조용히 무시 */ }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) { getLocationByIP(); return; }
    setLocationLoading(true);
    setLocationMsg('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationLoading(false);
        navigate(`/search?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&type=gps`);
      },
      async () => { setLocationLoading(false); await getLocationByIP(); },
      { timeout: 5000, maximumAge: 60000, enableHighAccuracy: false }
    );
  };

  const handleSearch = () => {
    if (!sido) return alert('시/도를 선택해주세요.');
    navigate(`/search?sido=${sido}${sigungu ? `&sigungu=${sigungu}` : ''}`);
  };

  return (
    <div className="max-w-screen-lg mx-auto px-4">

      {/* 히어로 */}
      <section className="py-12 text-center">
        <p className="text-brand font-semibold text-sm mb-3 tracking-wide">투명한 청소 서비스 플랫폼</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-snug">
          믿을 수 있는 청소 업체를<br />
          <span className="text-brand">지금 바로 찾아보세요</span>
        </h1>
        <p className="text-gray-500 text-sm md:text-base mb-10">
          전/후 사진 공개 · 항목별 견적 · 실제 완료 리뷰만 표시
        </p>

        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <button
            onClick={handleGPS}
            disabled={locationLoading}
            className="w-full flex items-center justify-center gap-2 bg-brand text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-brand-dark transition-colors mb-4 disabled:opacity-60"
          >
            <MdMyLocation size={20} />
            {locationLoading ? '위치 가져오는 중...' : '📍 내 위치 사용하기'}
          </button>

          {locationMsg && (
            <p className="text-blue-500 text-xs mb-3 text-center">{locationMsg}</p>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">또는 직접 입력</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex flex-col gap-3 mb-4">
            <div className="relative">
              <select value={sido} onChange={e => { setSido(e.target.value); setSigungu(''); }} className="select-base pr-8">
                <option value="">시/도 선택</option>
                {SIDO_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={sigungu} onChange={e => setSigungu(e.target.value)} disabled={!sido} className="select-base pr-8 disabled:opacity-50">
                <option value="">시/군/구 선택</option>
                {sigunguList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button onClick={handleSearch} className="w-full flex items-center justify-center gap-2 border-2 border-brand text-brand font-semibold py-3 px-6 rounded-xl hover:bg-blue-50 transition-colors">
            <FiSearch size={18} />
            업체 검색
          </button>
        </div>
      </section>

      {/* 특징 배너 */}
      <section className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '📸', title: '청소 전/후 사진', desc: '업체가 직접 촬영한 사진을 확인하세요' },
            { icon: '🧾', title: '항목별 견적 공개', desc: '숨은 비용 없이 세부 금액을 투명하게 공개' },
            { icon: '✅', title: '완료 후 리뷰만', desc: '실제 서비스를 받은 고객만 리뷰 작성 가능' },
          ].map(item => (
            <div key={item.title} className="card text-center">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 인기 업체 TOP */}
      <section className="py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">⭐ 인기 업체 TOP</h2>
          <button onClick={() => navigate('/search')} className="text-brand text-sm font-medium hover:underline">전체 보기</button>
        </div>

        {loadingCompanies ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => (
              <div key={i} className="card animate-pulse h-28 bg-gray-100" />
            ))}
          </div>
        ) : topCompanies.length === 0 ? (
          <div className="card text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">🧹</p>
            <p className="font-medium">아직 등록된 업체가 없어요</p>
            <p className="text-sm mt-1">첫 번째 업체를 등록해보세요!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {topCompanies.map(company => (
              <CompanyCard key={company.id} company={{
                id: company.id,
                name: company.companyName,
                avgRating: company.bayesianRating,
                reviewCount: company.reviewCount,
                sido: company.sido,
                sigungu: company.sigungu,
                tags: [],
                priceMin: company.basePrice,
                isVerified: company.verified,
                profileImage: company.profileImage,
              }} />
            ))}
          </div>
        )}
      </section>

      {/* 업체 등록 유도 */}
      <section className="py-8">
        <div className="bg-gradient-to-r from-brand to-blue-700 rounded-2xl p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-2">청소 업체를 운영하고 계신가요?</h3>
          <p className="text-blue-100 text-sm mb-6">지금 바로 등록하고 더 많은 고객을 만나보세요</p>
          <button onClick={() => navigate('/signup/company')} className="bg-white text-brand font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors">
            업체 등록하기
          </button>
        </div>
      </section>

      <div className="h-8" />
    </div>
  );
}
