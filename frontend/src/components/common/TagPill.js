import React from 'react';
import { FiX } from 'react-icons/fi';

const TagPill = ({ tag, onRemove, onClick, size = 'sm' }) => {
  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        transition-all duration-150
        ${sizeClasses[size] || sizeClasses.sm}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
      `}
      style={{
        backgroundColor: tag.color ? `${tag.color}25` : '#6C63FF25',
        color: tag.color || '#6C63FF',
        border: `1px solid ${tag.color ? `${tag.color}50` : '#6C63FF50'}`,
      }}
      onClick={onClick}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: tag.color || '#6C63FF' }}
      />
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(tag); }}
          className="ml-0.5 rounded-full hover:opacity-70 transition-opacity"
        >
          <FiX size={10} />
        </button>
      )}
    </span>
  );
};

export default TagPill;
