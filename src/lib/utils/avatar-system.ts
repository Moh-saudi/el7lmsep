/**
 * Avatar System Utilities
 * أدوات نظام الصور الشخصية
 */

/**
 * Get default avatar path based on account type
 * الحصول على مسار الصورة الشخصية الافتراضية حسب نوع الحساب
 */
export function getDefaultAvatarPath(accountType: string): string {
  const avatarMap: Record<string, string> = {
    admin: '/images/default-avatar-admin.png',
    player: '/images/default-avatar-player.png',
    club: '/images/default-avatar-club.png',
    academy: '/images/default-avatar-academy.png',
    trainer: '/images/default-avatar-trainer.png',
    agent: '/images/default-avatar-agent.png',
    default: '/images/default-avatar.png',
  };

  return avatarMap[accountType] || avatarMap.default;
}

/**
 * Get avatar URL with fallback
 * الحصول على رابط الصورة الشخصية مع البديل
 */
export function getAvatarUrl(
  avatarUrl: string | null | undefined,
  accountType: string = 'default'
): string {
  if (!avatarUrl || avatarUrl.trim() === '') {
    return getDefaultAvatarPath(accountType);
  }

  // If it's already a full URL, return as is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }

  // If it's a relative path, make it absolute
  if (avatarUrl.startsWith('/')) {
    return avatarUrl;
  }

  // Otherwise, assume it's a relative path and add leading slash
  return `/${avatarUrl}`;
}

/**
 * Get avatar display name
 * الحصول على اسم العرض للصورة الشخصية
 */
export function getAvatarDisplayName(
  name: string | null | undefined,
  accountType: string = 'default'
): string {
  if (!name || name.trim() === '') {
    const defaultNames: Record<string, string> = {
      admin: 'مدير',
      player: 'لاعب',
      club: 'نادي',
      academy: 'أكاديمية',
      trainer: 'مدرب',
      agent: 'وكيل',
      default: 'مستخدم',
    };

    return defaultNames[accountType] || defaultNames.default;
  }

  return name.trim();
}

/**
 * Get avatar initials
 * الحصول على الأحرف الأولى للصورة الشخصية
 */
export function getAvatarInitials(name: string | null | undefined): string {
  if (!name || name.trim() === '') {
    return '?';
  }

  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get avatar color based on account type
 * الحصول على لون الصورة الشخصية حسب نوع الحساب
 */
export function getAvatarColor(accountType: string): string {
  const colorMap: Record<string, string> = {
    admin: '#ef4444', // red
    player: '#3b82f6', // blue
    club: '#10b981', // green
    academy: '#8b5cf6', // purple
    trainer: '#f59e0b', // yellow
    agent: '#06b6d4', // cyan
    default: '#6b7280', // gray
  };

  return colorMap[accountType] || colorMap.default;
}

/**
 * Generate avatar placeholder
 * إنشاء صورة شخصية مؤقتة
 */
export function generateAvatarPlaceholder(
  name: string | null | undefined,
  accountType: string = 'default',
  size: number = 40
): string {
  const initials = getAvatarInitials(name);
  const color = getAvatarColor(accountType);
  
  // Create a simple SVG avatar
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" 
            fill="white" font-family="Arial, sans-serif" 
            font-size="${size * 0.4}" font-weight="bold">
        ${initials}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
