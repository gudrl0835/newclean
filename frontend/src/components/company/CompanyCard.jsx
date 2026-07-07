import { Link } from 'react-router-dom';
import { FiMapPin, FiMessageSquare } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import StarRating from '../common/StarRating';

export default function CompanyCard({ company }) {
  const {
    id, name, profileImage, avgRating, reviewCount,
    sido, sigungu, tags, priceMin, isVerified, description
  } = company;

  return (
    <Link to={`/company/${id}`} className="block">
      <div className="card hover:shadow-md hover:border-blue-100 transition-all duration-200 flex gap-4">

        {/* 업체 프로필 사진 */}
        <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-blue-50">
          {profileImage ? (
            <img src={profileImage} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">🧹</div>
          )}
        </div>

        {/* 업체 정보 */}
        <div className="flex-1 min-w-0">
          {/* 업체명 + 인증 뱃지 */}
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="font-bold text-gray-900 text-base truncate">{name}</h3>
            {isVerified && (
              <MdVerified size={18} className="text-brand flex-shrink-0" title="사업자 인증 완료" />
            )}
          </div>

          {/* 별점 + 리뷰 */}
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={avgRating} size={13} />
            <span className="text-gray-400 text-xs">리뷰 {reviewCount.toLocaleString()}개</span>
          </div>

          {/* 위치 */}
          <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
            <FiMapPin size={11} />
            <span>{sido} {sigungu}</span>
          </div>

          {/* 서비스 태그 */}
          <div className="flex flex-wrap gap-1 mb-2">
            {tags?.map(tag => (
              <span key={tag} className="text-xs bg-blue-50 text-brand px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          {/* 가격 */}
          <p className="text-brand font-semibold text-sm">
            {priceMin?.toLocaleString()}원~ 부터
          </p>
        </div>

        {/* 채팅 버튼 */}
        <div className="flex-shrink-0 self-center">
          <button
            className="p-2 rounded-xl border border-gray-200 hover:border-brand hover:text-brand text-gray-400 transition-colors"
            onClick={e => { e.preventDefault(); alert('로그인 후 이용 가능합니다.'); }}
          >
            <FiMessageSquare size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
}
