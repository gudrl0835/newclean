import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiMapPin, FiArrowLeft } from 'react-icons/fi';
import CompanyCard from '../components/company/CompanyCard';
import { companyApi } from '../api/company';

const SORT_OPTIONS = [
  { value: 'rating', label: '⭐ 별점순' },
  { value: 'review', label: '💬 리뷰 많은순' },
  { value: 'price', label: '💰 가격 낮은순' },
];

export default function SearchResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sort, setSort] = useState('rating');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sido = searchParams.get('sido');
  const sigungu = searchParams.get('sigungu');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const isGPS = searchParams.get('type') === 'gps';

  const locationLabel = isGPS ? '현재 위치 주변' : `${sido || ''} ${sigungu || ''}`.trim();

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (isGPS && lat && lng) {
        res = await companyApi.searchNearby(parseFloat(lat), parseFloat(lng), 10, sort);
      } else if (sido) {
        res = await companyApi.searchByRegion(sido, sigungu || '', sort);
      } else {
        setCompanies([]);
        setLoading(false);
        return;
      }
      setCompanies(res.data || []);
    } catch (e) {
      setError('업체 목록을 불러오는 데 실패했어요. 잠시 후 다시 시도해주세요.');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [isGPS, lat, lng, sido, sigungu, sort]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const mappedCompanies = companies.map(c => ({
    id: c.id,
    name: c.companyName,
    avgRating: c.bayesianRating,
    reviewCount: c.reviewCount,
    sido: c.sido,
    sigungu: c.sigungu,
    tags: [],
    priceMin: c.basePrice,
    isVerified: c.verified,
    profileImage: c.profileImage,
  }));

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6">

      {/* 상단 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
          <FiArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-0.5">
            <FiMapPin size={13} />
            <span>{locationLabel}</span>
          </div>
          {loading ? (
            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
          ) : (
            <h2 className="font-bold text-gray-900 text-lg">
              청소 업체 {mappedCompanies.length}개
            </h2>
          )}
        </div>
      </div>

      {/* 정렬 탭 */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              sort === opt.value
                ? 'bg-brand text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-brand hover:text-brand'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 로딩 스켈레톤 */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card animate-pulse h-28 bg-gray-100" />
          ))}
        </div>
      )}

      {/* 에러 */}
      {!loading && error && (
        <div className="card text-center py-10">
          <p className="text-3xl mb-2">😥</p>
          <p className="text-gray-600 font-medium">{error}</p>
          <button
            onClick={fetchCompanies}
            className="mt-4 text-brand text-sm font-medium hover:underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 빈 결과 */}
      {!loading && !error && mappedCompanies.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🧹</p>
          <p className="font-bold text-gray-800 text-lg mb-1">
            {locationLabel} 지역에 업체가 없어요
          </p>
          <p className="text-gray-400 text-sm mb-5">
            다른 지역으로 검색하거나 범위를 넓혀보세요
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-brand text-sm font-semibold hover:underline"
          >
            홈으로 돌아가기
          </button>
        </div>
      )}

      {/* 업체 목록 */}
      {!loading && !error && mappedCompanies.length > 0 && (
        <div className="flex flex-col gap-3">
          {mappedCompanies.map((company, idx) => (
            <div key={company.id} className="relative">
              {idx < 3 && (
                <span className={`absolute -top-2 -left-1 z-10 text-xs font-bold px-2 py-0.5 rounded-full text-white ${
                  idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : 'bg-orange-400'
                }`}>
                  {idx + 1}위
                </span>
              )}
              <CompanyCard company={company} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
