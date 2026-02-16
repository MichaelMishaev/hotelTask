import type { TFunction } from 'i18next';
import type { Room } from '../types';

export interface RoomDetail {
  title: string;
  image: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  amenities: { icon: string; label: string }[];
}

export function getRoomDetails(t: TFunction): Record<Room['roomType'], RoomDetail> {
  return {
    Standard: {
      title: t('enum.roomType.Standard'),
      image: '/rooms/standard-room.png',
      location: t('roomData.standardLocation'),
      rating: 4.5,
      reviewCount: 89,
      description: t('roomData.standardDesc'),
      amenities: [
        { icon: 'wifi', label: t('roomData.highSpeedWifi') },
        { icon: 'tv', label: t('roomData.smartTv') },
        { icon: 'ac_unit', label: t('roomData.climateControl') },
        { icon: 'coffee', label: t('roomData.coffeeMaker') },
      ],
    },
    Deluxe: {
      title: t('enum.roomType.Deluxe'),
      image: '/rooms/deluxe-room.png',
      location: t('roomData.deluxeLocation'),
      rating: 4.7,
      reviewCount: 112,
      description: t('roomData.deluxeDesc'),
      amenities: [
        { icon: 'wifi', label: t('roomData.highSpeedWifi') },
        { icon: 'liquor', label: t('roomData.premiumMinibar') },
        { icon: 'waves', label: t('roomData.oceanView') },
        { icon: 'restaurant', label: t('roomData.breakfastIncl') },
      ],
    },
    Suite: {
      title: t('enum.roomType.Suite'),
      image: '/rooms/suite-room.png',
      location: t('roomData.suiteLocation'),
      rating: 4.9,
      reviewCount: 124,
      description: t('roomData.suiteDesc'),
      amenities: [
        { icon: 'wifi', label: t('roomData.highSpeedWifi') },
        { icon: 'liquor', label: t('roomData.premiumMinibar') },
        { icon: 'deck', label: t('roomData.privateTerrace') },
        { icon: 'waves', label: t('roomData.oceanView') },
      ],
    },
  };
}

// Keep backward-compatible static export for non-i18n contexts
export const ROOM_DETAILS: Record<Room['roomType'], RoomDetail> = {
  Standard: {
    title: 'Standard Room',
    image: '/rooms/standard-room.png',
    location: 'East Wing, Floor 3 \u2022 Garden View',
    rating: 4.5,
    reviewCount: 89,
    description: 'A comfortable retreat designed for the modern traveler. Our Standard Room features a plush queen bed with premium linens, a spacious work desk, and a modern en-suite bathroom. Enjoy complimentary high-speed Wi-Fi and a curated view of our landscaped gardens.',
    amenities: [
      { icon: 'wifi', label: 'High-speed Wi-Fi' },
      { icon: 'tv', label: 'Smart TV' },
      { icon: 'ac_unit', label: 'Climate Control' },
      { icon: 'coffee', label: 'Coffee Maker' },
    ],
  },
  Deluxe: {
    title: 'Deluxe Room',
    image: '/rooms/deluxe-room.png',
    location: 'West Wing, Floor 8 \u2022 Ocean View',
    rating: 4.7,
    reviewCount: 112,
    description: 'Elevate your stay in our Deluxe Room, offering stunning ocean views and upgraded amenities. The king-size bed with Egyptian cotton sheets ensures restful nights, while the breakfast-inclusive package starts your mornings right. Features a rain shower and premium toiletries.',
    amenities: [
      { icon: 'wifi', label: 'High-speed Wi-Fi' },
      { icon: 'liquor', label: 'Premium Minibar' },
      { icon: 'waves', label: 'Ocean View' },
      { icon: 'restaurant', label: 'Breakfast Incl.' },
    ],
  },
  Suite: {
    title: 'Executive Suite',
    image: '/rooms/suite-room.png',
    location: 'South Wing, Floor 12 \u2022 Ocean Front',
    rating: 4.9,
    reviewCount: 124,
    description: 'Experience unparalleled luxury in our Executive Suite. Spanning 850 square feet, this meticulously designed space offers a seamless blend of contemporary elegance and residential comfort. Wake up to floor-to-ceiling panoramic views of the Pacific Ocean, or unwind in your private terrace as the sun sets. The suite features a separate living area, a marble-clad master bathroom with a deep soaking tub, and custom-made Italian linens.',
    amenities: [
      { icon: 'wifi', label: 'High-speed Wi-Fi' },
      { icon: 'liquor', label: 'Premium Minibar' },
      { icon: 'deck', label: 'Private Terrace' },
      { icon: 'waves', label: 'Ocean View' },
    ],
  },
};
