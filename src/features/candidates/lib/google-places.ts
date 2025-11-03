import { Spot } from "@shared/types/spot";

// Google Places API のモックデータを返す関数（実装時は実際のAPIを呼び出す）
export async function searchSpots(region: string, genre: string): Promise<Spot[]> {
  // TODO: 実際のGoogle Places API統合時にここを実装
  // 現在はモックデータを返す
  
  await new Promise((resolve) => setTimeout(resolve, 1000)); // API呼び出しをシミュレート
  
  const mockSpots: Spot[] = [
    {
      id: "spot-1",
      name: `${region}の${genre}スポット A`,
      address: `${region} 1-1-1`,
      rating: 4.5,
      lat: 35.6812 + Math.random() * 0.01,
      lng: 139.7671 + Math.random() * 0.01,
      photoUrl: "https://via.placeholder.com/300x200?text=Spot+A",
    },
    {
      id: "spot-2",
      name: `${region}の${genre}スポット B`,
      address: `${region} 2-2-2`,
      rating: 4.2,
      lat: 35.6812 + Math.random() * 0.01,
      lng: 139.7671 + Math.random() * 0.01,
      photoUrl: "https://via.placeholder.com/300x200?text=Spot+B",
    },
    {
      id: "spot-3",
      name: `${region}の${genre}スポット C`,
      address: `${region} 3-3-3`,
      rating: 4.7,
      lat: 35.6812 + Math.random() * 0.01,
      lng: 139.7671 + Math.random() * 0.01,
      photoUrl: "https://via.placeholder.com/300x200?text=Spot+C",
    },
    {
      id: "spot-4",
      name: `${region}の${genre}スポット D`,
      address: `${region} 4-4-4`,
      rating: 4.0,
      lat: 35.6812 + Math.random() * 0.01,
      lng: 139.7671 + Math.random() * 0.01,
      photoUrl: "https://via.placeholder.com/300x200?text=Spot+D",
    },
    {
      id: "spot-5",
      name: `${region}の${genre}スポット E`,
      address: `${region} 5-5-5`,
      rating: 4.3,
      lat: 35.6812 + Math.random() * 0.01,
      lng: 139.7671 + Math.random() * 0.01,
      photoUrl: "https://via.placeholder.com/300x200?text=Spot+E",
    },
  ];

  return mockSpots;
}

