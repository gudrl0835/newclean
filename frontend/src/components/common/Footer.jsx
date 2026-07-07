import { Link } from 'react-router-dom';
import { MdCleaningServices } from 'react-icons/md';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-screen-lg mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* 브랜드 */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <MdCleaningServices size={26} />
              <span>클린매칭</span>
            </div>
            <p className="text-sm leading-relaxed">
              투명한 청소 서비스 플랫폼.<br />
              믿을 수 있는 업체와 고객을 연결합니다.
            </p>
          </div>

          {/* 서비스 */}
          <div>
            <p className="text-white font-semibold mb-3 text-sm">서비스</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search" className="hover:text-white transition-colors">업체 찾기</Link></li>
              <li><Link to="/signup/customer" className="hover:text-white transition-colors">고객 회원가입</Link></li>
              <li><Link to="/signup/company" className="hover:text-white transition-colors">업체 등록</Link></li>
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <p className="text-white font-semibold mb-3 text-sm">고객지원</p>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">공지사항</a></li>
              <li><a href="#" className="hover:text-white transition-colors">자주 묻는 질문</a></li>
              <li><a href="#" className="hover:text-white transition-colors">1:1 문의</a></li>
            </ul>
          </div>

          {/* 정책 */}
          <div>
            <p className="text-white font-semibold mb-3 text-sm">정책</p>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">이용약관</a></li>
              <li><a href="#" className="hover:text-white transition-colors">개인정보처리방침</a></li>
              <li><a href="#" className="hover:text-white transition-colors">사업자 인증 안내</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs">© 2026 클린매칭. All rights reserved.</p>
          <p className="text-xs">사업자등록번호: 000-00-00000 | 대표: 홍길동</p>
        </div>
      </div>
    </footer>
  );
}
