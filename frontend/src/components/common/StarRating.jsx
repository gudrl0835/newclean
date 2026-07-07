import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function StarRating({ rating, size = 16, showNumber = true }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center text-yellow-400">
        {Array(full).fill(0).map((_, i) => <FaStar key={`f${i}`} size={size} />)}
        {half && <FaStarHalfAlt size={size} />}
        {Array(empty).fill(0).map((_, i) => <FaRegStar key={`e${i}`} size={size} />)}
      </div>
      {showNumber && (
        <span className="text-gray-600 text-sm font-medium">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
